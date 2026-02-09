#!/bin/bash
cd /Users/haneulhaneul/dev/lifeops-panel/backend
source venv/bin/activate
exec uvicorn main:app --host 0.0.0.0 --port 8000
