"""
LifeOps Backend - Google OAuth with refresh token support
"""

import os
import json
from datetime import datetime
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request as GoogleRequest
from googleapiclient.discovery import build

load_dotenv()

# Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
TOKEN_PATH = os.getenv("TOKEN_PATH", "./tokens.json")
PORT = int(os.getenv("PORT", 8000))

SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/tasks",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/userinfo.email",
]

# In-memory token storage (loaded from file)
tokens: dict = {}


def load_tokens():
    """Load tokens from file"""
    global tokens
    if os.path.exists(TOKEN_PATH):
        with open(TOKEN_PATH, "r") as f:
            tokens = json.load(f)
    return tokens


def save_tokens():
    """Save tokens to file"""
    with open(TOKEN_PATH, "w") as f:
        json.dump(tokens, f, indent=2)


def get_credentials() -> Optional[Credentials]:
    """Get valid credentials, refreshing if necessary"""
    if not tokens:
        return None

    creds = Credentials(
        token=tokens.get("access_token"),
        refresh_token=tokens.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        scopes=SCOPES,
    )

    # Refresh if expired
    if creds.expired and creds.refresh_token:
        try:
            creds.refresh(GoogleRequest())
            tokens["access_token"] = creds.token
            tokens["expiry"] = creds.expiry.isoformat() if creds.expiry else None
            save_tokens()
        except Exception as e:
            print(f"[Auth] Token refresh failed: {e}")
            return None

    return creds


def create_oauth_flow(redirect_uri: str) -> Flow:
    """Create OAuth flow"""
    client_config = {
        "web": {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [redirect_uri],
        }
    }
    return Flow.from_client_config(
        client_config,
        scopes=SCOPES,
        redirect_uri=redirect_uri,
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    load_tokens()
    print(f"[LifeOps] Backend started on port {PORT}")
    print(f"[LifeOps] Tokens loaded: {'Yes' if tokens else 'No'}")
    yield
    print("[LifeOps] Backend shutting down")


app = FastAPI(title="LifeOps Backend", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ Auth Endpoints ============


@app.get("/auth/status")
async def auth_status():
    """Check authentication status"""
    creds = get_credentials()
    if creds and creds.valid:
        return {
            "authenticated": True,
            "email": tokens.get("email"),
            "expiry": tokens.get("expiry"),
            "access_token": creds.token,  # For backward compatibility
        }
    return {"authenticated": False}


@app.get("/auth/login")
async def auth_login(request: Request):
    """Start OAuth flow"""
    redirect_uri = str(request.url_for("auth_callback"))
    flow = create_oauth_flow(redirect_uri)

    auth_url, state = flow.authorization_url(
        access_type="offline",  # This requests refresh_token
        prompt="consent",  # Force consent to get refresh_token
    )

    return {"auth_url": auth_url}


@app.get("/auth/callback")
async def auth_callback(request: Request, code: str = None, error: str = None):
    """OAuth callback"""
    if error:
        return RedirectResponse(f"{FRONTEND_URL}?auth_error={error}")

    if not code:
        return RedirectResponse(f"{FRONTEND_URL}?auth_error=no_code")

    try:
        redirect_uri = str(request.url_for("auth_callback"))
        flow = create_oauth_flow(redirect_uri)
        flow.fetch_token(code=code)

        creds = flow.credentials

        # Get user email
        service = build("oauth2", "v2", credentials=creds)
        user_info = service.userinfo().get().execute()

        # Save tokens
        global tokens
        tokens = {
            "access_token": creds.token,
            "refresh_token": creds.refresh_token,
            "expiry": creds.expiry.isoformat() if creds.expiry else None,
            "email": user_info.get("email"),
            "updated_at": datetime.now().isoformat(),
        }
        save_tokens()

        print(f"[Auth] Logged in as {tokens['email']}")

        return RedirectResponse(f"{FRONTEND_URL}?auth_success=true")

    except Exception as e:
        print(f"[Auth] Callback error: {e}")
        return RedirectResponse(f"{FRONTEND_URL}?auth_error={str(e)}")


@app.post("/auth/logout")
async def auth_logout():
    """Clear tokens"""
    global tokens
    tokens = {}
    save_tokens()
    return {"success": True}


# ============ Google API Proxy ============


@app.get("/api/calendar/events")
async def get_calendar_events(
    calendar_id: str = "primary",
    time_min: str = None,
    time_max: str = None,
    max_results: int = 100,
):
    """Get calendar events"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("calendar", "v3", credentials=creds)
        events_result = (
            service.events()
            .list(
                calendarId=calendar_id,
                timeMin=time_min,
                timeMax=time_max,
                maxResults=max_results,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )
        return events_result.get("items", [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tasks/lists")
async def get_task_lists():
    """Get task lists"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("tasks", "v1", credentials=creds)
        results = service.tasklists().list().execute()
        return results.get("items", [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tasks/{tasklist_id}")
async def get_tasks(tasklist_id: str):
    """Get tasks from a list"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("tasks", "v1", credentials=creds)
        results = service.tasks().list(
            tasklist=tasklist_id,
            showCompleted=True,
            showHidden=True,
            maxResults=100
        ).execute()
        return results.get("items", [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ Calendar CRUD ============


class CalendarEventCreate(BaseModel):
    summary: str
    start: dict  # {"date": "YYYY-MM-DD"} or {"dateTime": "...", "timeZone": "..."}
    end: dict


class CalendarEventUpdate(BaseModel):
    summary: Optional[str] = None
    start: Optional[dict] = None
    end: Optional[dict] = None


@app.post("/api/calendar/events")
async def create_calendar_event(event: CalendarEventCreate, calendar_id: str = "primary"):
    """Create a calendar event"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("calendar", "v3", credentials=creds)
        result = service.events().insert(
            calendarId=calendar_id,
            body=event.model_dump(exclude_none=True)
        ).execute()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/calendar/events/{event_id}")
async def update_calendar_event(
    event_id: str,
    event: CalendarEventUpdate,
    calendar_id: str = "primary"
):
    """Update a calendar event"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("calendar", "v3", credentials=creds)
        result = service.events().patch(
            calendarId=calendar_id,
            eventId=event_id,
            body=event.model_dump(exclude_none=True)
        ).execute()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/calendar/events/{event_id}")
async def delete_calendar_event(event_id: str, calendar_id: str = "primary"):
    """Delete a calendar event"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("calendar", "v3", credentials=creds)
        service.events().delete(calendarId=calendar_id, eventId=event_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ Tasks CRUD ============


class TaskCreate(BaseModel):
    title: str
    notes: Optional[str] = None
    due: Optional[str] = None  # ISO format


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    notes: Optional[str] = None
    due: Optional[str] = None
    status: Optional[str] = None  # "needsAction" or "completed"
    completed: Optional[str] = None  # ISO format


@app.post("/api/tasks/{tasklist_id}")
async def create_task(tasklist_id: str, task: TaskCreate):
    """Create a task"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("tasks", "v1", credentials=creds)
        result = service.tasks().insert(
            tasklist=tasklist_id,
            body=task.model_dump(exclude_none=True)
        ).execute()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/tasks/{tasklist_id}/{task_id}")
async def update_task(tasklist_id: str, task_id: str, task: TaskUpdate):
    """Update a task"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("tasks", "v1", credentials=creds)
        result = service.tasks().patch(
            tasklist=tasklist_id,
            task=task_id,
            body=task.model_dump(exclude_none=True)
        ).execute()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/tasks/{tasklist_id}/{task_id}")
async def delete_task(tasklist_id: str, task_id: str):
    """Delete a task"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("tasks", "v1", credentials=creds)
        service.tasks().delete(tasklist=tasklist_id, task=task_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ Google Sheets API ============


@app.get("/api/sheets/{spreadsheet_id}")
async def get_spreadsheet(spreadsheet_id: str, fields: str = "sheets.properties.title"):
    """Get spreadsheet metadata"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("sheets", "v4", credentials=creds)
        result = service.spreadsheets().get(
            spreadsheetId=spreadsheet_id,
            fields=fields
        ).execute()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/sheets")
async def create_spreadsheet(body: dict = Body(...)):
    """Create a new spreadsheet"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("sheets", "v4", credentials=creds)
        result = service.spreadsheets().create(body=body).execute()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/sheets/{spreadsheet_id}/values/{range}")
async def get_sheet_values(spreadsheet_id: str, range: str):
    """Get values from a sheet range"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("sheets", "v4", credentials=creds)
        result = service.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id,
            range=range
        ).execute()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/sheets/{spreadsheet_id}/values/{range}")
async def update_sheet_values(
    spreadsheet_id: str,
    range: str,
    body: dict = Body(...),
    value_input_option: str = "RAW"
):
    """Update values in a sheet range"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("sheets", "v4", credentials=creds)
        result = service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=range,
            valueInputOption=value_input_option,
            body=body
        ).execute()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/sheets/{spreadsheet_id}/values/{range}:append")
async def append_sheet_values(
    spreadsheet_id: str,
    range: str,
    body: dict = Body(...),
    value_input_option: str = "RAW",
    insert_data_option: str = "INSERT_ROWS"
):
    """Append values to a sheet"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("sheets", "v4", credentials=creds)
        result = service.spreadsheets().values().append(
            spreadsheetId=spreadsheet_id,
            range=range,
            valueInputOption=value_input_option,
            insertDataOption=insert_data_option,
            body=body
        ).execute()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ Google Drive API ============


@app.get("/api/drive/files")
async def list_drive_files(
    q: str = None,
    page_size: int = 100,
    order_by: str = "modifiedTime desc",
    fields: str = "files(id,name,mimeType,modifiedTime,webViewLink,parents)"
):
    """List files in Google Drive"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("drive", "v3", credentials=creds)
        result = service.files().list(
            q=q,
            pageSize=page_size,
            orderBy=order_by,
            fields=fields
        ).execute()
        return result.get("files", [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/drive/files/{file_id}")
async def get_drive_file(file_id: str, fields: str = "id,name,mimeType,modifiedTime,webViewLink"):
    """Get a file's metadata from Google Drive"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("drive", "v3", credentials=creds)
        result = service.files().get(fileId=file_id, fields=fields).execute()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/drive/files")
async def create_drive_file(body: dict = Body(...)):
    """Create a file in Google Drive"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("drive", "v3", credentials=creds)
        result = service.files().create(body=body, fields="id,name,webViewLink").execute()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/drive/files/{file_id}")
async def delete_drive_file(file_id: str):
    """Delete a file from Google Drive"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("drive", "v3", credentials=creds)
        service.files().delete(fileId=file_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/drive/files/{file_id}")
async def update_drive_file(file_id: str, body: dict = Body(...)):
    """Update a file's metadata in Google Drive"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("drive", "v3", credentials=creds)
        result = service.files().update(fileId=file_id, body=body).execute()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ Google Docs API ============


@app.get("/api/docs/{document_id}")
async def get_document(document_id: str):
    """Get a Google Doc"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("docs", "v1", credentials=creds)
        result = service.documents().get(documentId=document_id).execute()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/docs")
async def create_document(body: dict = Body(...)):
    """Create a new Google Doc"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("docs", "v1", credentials=creds)
        result = service.documents().create(body=body).execute()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/docs/{document_id}/batchUpdate")
async def batch_update_document(document_id: str, body: dict = Body(...)):
    """Batch update a Google Doc"""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = build("docs", "v1", credentials=creds)
        result = service.documents().batchUpdate(documentId=document_id, body=body).execute()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ Health Check ============


@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
