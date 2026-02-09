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
from fastapi.responses import RedirectResponse, JSONResponse, Response
from pydantic import BaseModel
from dotenv import load_dotenv

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request as GoogleRequest
from googleapiclient.discovery import build

import asyncio
import subprocess
import shutil

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

    # Parse expiry time
    expiry = None
    if tokens.get("expiry"):
        try:
            expiry = datetime.fromisoformat(tokens["expiry"])
        except ValueError:
            pass

    creds = Credentials(
        token=tokens.get("access_token"),
        refresh_token=tokens.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        scopes=SCOPES,
        expiry=expiry,
    )

    # Refresh if expired or no expiry set
    if (creds.expired or expiry is None) and creds.refresh_token:
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


# ============ PDF Report ============

import uuid

# Temporary storage for report data (token → summary)
_report_store: dict = {}


class ReportRequest(BaseModel):
    summary: dict


@app.post("/api/report/prepare")
async def prepare_report(req: ReportRequest):
    """Store summary data and return a download token"""
    token = str(uuid.uuid4())
    _report_store[token] = req.summary
    return {"token": token}


@app.get("/api/report/pdf/{token}")
async def download_report_pdf(token: str):
    """Generate and download PDF report by token"""
    summary = _report_store.pop(token, None)
    if not summary:
        raise HTTPException(status_code=404, detail="Report token expired or invalid")
    return _generate_pdf(summary)


def _generate_pdf(summary: dict) -> Response:
    """Generate PDF report from dashboard summary"""
    from fpdf import FPDF

    date_str = datetime.now().strftime("%Y년 %m월 %d일")

    font_dir = os.path.join(os.path.dirname(__file__), "fonts")
    font_regular = os.path.join(font_dir, "NanumGothic-Regular.ttf")
    font_bold = os.path.join(font_dir, "NanumGothic-Bold.ttf")

    if not os.path.exists(font_regular):
        raise HTTPException(status_code=500, detail="Korean font not found")

    pdf = FPDF()
    pdf.add_page()
    pdf.add_font("NanumGothic", "", font_regular)
    pdf.add_font("NanumGothic", "B", font_bold)

    # Header
    pdf.set_font("NanumGothic", "B", 22)
    pdf.set_text_color(30, 64, 175)
    pdf.cell(0, 12, "미래계획 보고서", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("NanumGothic", "", 10)
    pdf.set_text_color(107, 114, 128)
    pdf.cell(0, 6, f"최대열 | {date_str} 기준", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(30, 64, 175)
    pdf.set_line_width(0.8)
    pdf.line(10, pdf.get_y() + 2, 200, pdf.get_y() + 2)
    pdf.ln(8)

    # Goals section
    _section_title(pdf, "목표 및 방향")
    pdf.set_fill_color(239, 246, 255)
    pdf.set_font("NanumGothic", "B", 11)
    pdf.set_text_color(30, 64, 175)
    pdf.cell(0, 8, "  최종 목표: 공공기관/준정부기관 전산직 정규직 입사", fill=True, new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("NanumGothic", "", 9)
    pdf.set_text_color(75, 85, 99)
    pdf.cell(0, 6, "  광주/전남 소재 | 경력 1년 3개월 (Java/Spring Boot, React) | 정보처리기사 보유", fill=True, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)

    # Goals table
    goals = summary.get("goals", [])
    _table_header(pdf, ["분야", "세부 목표", "목표 시점"], [25, 120, 45])
    for g in goals:
        _table_row(pdf, [g.get("category", ""), g.get("goal", ""), g.get("deadline", "")], [25, 120, 45])
    pdf.ln(4)

    # Current status section
    _section_title(pdf, "현재 진행 상황")
    js = summary.get("jobSearch", {})
    spec = summary.get("spec", {})
    routine = summary.get("routine", {})
    finance = summary.get("finance", {})

    y_start = pdf.get_y()
    # Left column - Job Search
    _status_box(pdf, 10, y_start, 93, "구직활동", [
        (f'{js.get("totalApplied", 0)}건 지원', (37, 99, 235)),
        (f'{js.get("inProgress", 0)}건 진행', (124, 58, 237)),
        (f'{js.get("offers", 0)}건 합격', (22, 163, 74)),
    ])
    # Right column - Spec
    _status_box(pdf, 107, y_start, 93, "스펙/자격증", [
        (f'{spec.get("passed", 0)}개 취득', (22, 163, 74)),
        (f'{spec.get("registered", 0)}개 접수', (37, 99, 235)),
        (f'{spec.get("notStarted", 0)}개 미시작', (156, 163, 175)),
    ])
    pdf.set_y(y_start + 24)

    y_start2 = pdf.get_y()
    pct = routine.get("percentage", 0)
    pct_color = (22, 163, 74) if pct >= 80 else (245, 158, 11) if pct >= 50 else (220, 38, 38)
    _status_box(pdf, 10, y_start2, 93, "일상 루틴", [
        (f'완료율 {pct}%', pct_color),
        (f'할일 {routine.get("taskCompleted", 0)}/{routine.get("taskTotal", 0)}', (55, 65, 81)),
    ])
    _status_box(pdf, 107, y_start2, 93, "재테크", [
        (f'순자산 {finance.get("netAsset", "-")}', (55, 65, 81)),
        (f'월저축 {finance.get("monthlySaving", "-")}', (37, 99, 235)),
    ])
    pdf.set_y(y_start2 + 24)
    pdf.ln(2)

    # Spec items inline
    items = spec.get("items", [])
    if items:
        pdf.set_font("NanumGothic", "", 8)
        pdf.set_fill_color(249, 250, 251)
        line = "  ".join(
            f'{"✓" if i.get("status") == "passed" else "□"} {i.get("name", "")}'
            for i in items
        )
        pdf.cell(0, 6, line, fill=True, new_x="LMARGIN", new_y="NEXT")
        pdf.ln(4)

    # Roadmap section
    _section_title(pdf, "월별 실행 계획")
    roadmap = summary.get("roadmap", [])
    _table_header(pdf, ["시기", "실행 항목"], [35, 155])
    for rm in roadmap:
        items_text = " / ".join(rm.get("items", []))
        _table_row(pdf, [rm.get("month", ""), items_text], [35, 155])

    # Footer
    pdf.ln(6)
    pdf.set_font("NanumGothic", "", 8)
    pdf.set_text_color(156, 163, 175)
    pdf.cell(0, 5, f"LifeOps Panel에서 자동 생성 | {date_str}", align="C")

    pdf_bytes = pdf.output()
    return Response(
        content=bytes(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="LifeOps_Report.pdf"'},
    )


def _section_title(pdf, title: str):
    pdf.set_font("NanumGothic", "B", 13)
    pdf.set_text_color(30, 64, 175)
    pdf.cell(0, 9, title, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1)


def _table_header(pdf, headers: list, widths: list):
    pdf.set_font("NanumGothic", "B", 9)
    pdf.set_fill_color(243, 244, 246)
    pdf.set_text_color(107, 114, 128)
    for i, h in enumerate(headers):
        pdf.cell(widths[i], 7, f"  {h}", fill=True)
    pdf.ln()


def _table_row(pdf, cells: list, widths: list):
    pdf.set_font("NanumGothic", "", 9)
    pdf.set_text_color(55, 65, 81)
    for i, c in enumerate(cells):
        pdf.cell(widths[i], 7, f"  {c}")
    pdf.ln()


def _status_box(pdf, x: float, y: float, w: float, title: str, items: list):
    pdf.set_xy(x, y)
    pdf.set_draw_color(229, 231, 235)
    pdf.set_line_width(0.3)
    pdf.rect(x, y, w, 22)
    pdf.set_xy(x + 3, y + 2)
    pdf.set_font("NanumGothic", "B", 9)
    pdf.set_text_color(55, 65, 81)
    pdf.cell(w - 6, 5, title)
    pdf.set_xy(x + 3, y + 9)
    pdf.set_font("NanumGothic", "", 8)
    for j, (text, color) in enumerate(items):
        pdf.set_text_color(*color)
        tw = pdf.get_string_width(text) + 4
        pdf.cell(tw, 5, text)


# ============ AI Evaluation ============


class EvaluateRequest(BaseModel):
    summary: dict


def find_claude_cli() -> Optional[str]:
    """Find claude CLI binary path"""
    # 1) shutil.which with current PATH
    path = shutil.which("claude")
    if path:
        return path
    # 2) Check common nvm / global node paths
    home = os.path.expanduser("~")
    candidates = [
        os.path.join(home, ".nvm/versions/node", d, "bin/claude")
        for d in (os.listdir(os.path.join(home, ".nvm/versions/node")) if os.path.isdir(os.path.join(home, ".nvm/versions/node")) else [])
    ] + [
        "/usr/local/bin/claude",
        os.path.join(home, ".local/bin/claude"),
    ]
    for c in candidates:
        if os.path.isfile(c) and os.access(c, os.X_OK):
            return c
    return None


@app.post("/api/evaluate")
async def evaluate_status(req: EvaluateRequest):
    """Evaluate current life status using Claude Code CLI subprocess"""
    claude_path = find_claude_cli()
    if not claude_path:
        raise HTTPException(status_code=500, detail="Claude Code CLI가 설치되어 있지 않습니다")

    summary = req.summary

    prompt = f"""당신은 취업 준비생의 현재 상태를 평가하는 커리어 코치입니다.

아래 데이터를 분석하고, 반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 순수 JSON만 반환하세요.

## 현재 상태 데이터
{json.dumps(summary, ensure_ascii=False, indent=2)}

## 프로필
- 이름: 최대열
- 경력: 1년 3개월 (Java/Spring Boot, PHP, JSP, React)
- 목표: 공공기관/준정부기관 전산직 정규직 또는 광주/전남 소재 IT기업

## 응답 JSON 형식
{{
  "overallScore": 0-100 숫자,
  "categories": [
    {{
      "name": "구직활동",
      "score": 0-100 숫자,
      "analysis": "현재 상태 분석 (2-3문장)",
      "suggestion": "개선 제안 (1-2문장)"
    }},
    {{
      "name": "스펙/자격증",
      "score": 0-100 숫자,
      "analysis": "현재 상태 분석 (2-3문장)",
      "suggestion": "개선 제안 (1-2문장)"
    }},
    {{
      "name": "일상관리",
      "score": 0-100 숫자,
      "analysis": "현재 상태 분석 (2-3문장)",
      "suggestion": "개선 제안 (1-2문장)"
    }},
    {{
      "name": "재테크",
      "score": 0-100 숫자,
      "analysis": "현재 상태 분석 (2-3문장)",
      "suggestion": "개선 제안 (1-2문장)"
    }}
  ],
  "strengths": ["강점1", "강점2", "강점3"],
  "improvements": ["개선점1", "개선점2", "개선점3"],
  "actionItems": ["액션아이템1", "액션아이템2", "액션아이템3"]
}}"""

    try:
        # Ensure node/nvm paths are in PATH for the subprocess
        env = os.environ.copy()
        home = os.path.expanduser("~")
        nvm_dir = os.path.join(home, ".nvm/versions/node")
        if os.path.isdir(nvm_dir):
            for d in sorted(os.listdir(nvm_dir), reverse=True):
                bin_dir = os.path.join(nvm_dir, d, "bin")
                if os.path.isdir(bin_dir) and bin_dir not in env.get("PATH", ""):
                    env["PATH"] = bin_dir + ":" + env.get("PATH", "")
                    break
        # Remove ANTHROPIC_API_KEY so claude CLI uses its own subscription auth
        env.pop("ANTHROPIC_API_KEY", None)

        process = await asyncio.create_subprocess_exec(
            claude_path, "-p", "--output-format", "text",
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env,
        )
        stdout, stderr = await asyncio.wait_for(
            process.communicate(input=prompt.encode("utf-8")),
            timeout=120,
        )

        if process.returncode != 0:
            err_msg = stderr.decode("utf-8", errors="replace").strip()
            out_msg = stdout.decode("utf-8", errors="replace").strip()[:500]
            print(f"[Evaluate] Claude CLI failed (code={process.returncode})")
            print(f"[Evaluate] stderr: {err_msg}")
            print(f"[Evaluate] stdout: {out_msg}")
            raise HTTPException(status_code=500, detail=f"Claude CLI 오류 (code={process.returncode}): {err_msg or out_msg}")

        response_text = stdout.decode("utf-8").strip()

        # JSON 파싱 (마크다운 코드블록 제거)
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            response_text = "\n".join(lines[1:-1])
        if response_text.endswith("```"):
            response_text = response_text[:-3].strip()

        result = json.loads(response_text)
        return JSONResponse(content=result)

    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Claude CLI 응답 시간 초과 (120초)")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"AI 응답 파싱 실패: {str(e)}\n원본: {response_text[:500]}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"평가 실패: {str(e)}")


# ============ Health Check ============


@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
