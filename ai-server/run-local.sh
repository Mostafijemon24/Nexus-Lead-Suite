#!/usr/bin/env bash
# Start the Nexus AI server locally (dev). Ollama must already be running.
# Usage:  ./run-local.sh
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -d venv ]; then
	echo "→ Creating venv + installing dependencies (first run only)…"
	python3 -m venv venv
	./venv/bin/pip install --upgrade pip
	./venv/bin/pip install -r requirements.txt
fi

if [ ! -f .env ]; then
	echo "!! .env is missing. Copy .env.example to .env and set API_KEY."
	exit 1
fi

echo "→ Ollama models installed:"
ollama list || echo "   (could not reach Ollama — is it running on :11434?)"

echo "→ Starting FastAPI on http://localhost:8000  (Ctrl+C to stop)"
exec ./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
