# Nexus AI Server

Self-hosted **RAG backend** for the Nexus Lead Suite WordPress plugin.
Runs on your own VPS with **Ollama** (free, local LLM) + **ChromaDB** (vector
"memory") + **FastAPI**. The WordPress plugin pushes your site content here to
train, then proxies visitor questions here to get grounded answers.

> **Cost: $0 per message.** No OpenAI/Anthropic bills. Your data stays on your server.

```
WordPress plugin ──HTTPS (Bearer key)──►  FastAPI  ──►  Ollama (embeddings + chat)
                                              └────────►  ChromaDB (vectors on disk)
```

---

## 1. Requirements

- A Linux VPS (Ubuntu 22.04+ recommended), **≥ 8 GB RAM** for an 8B model
  (4 GB works for smaller 3B/`phi3` models).
- Python 3.10+.
- Outbound HTTPS reachable **from your WordPress server** (the plugin calls this
  service; this service never has to reach back into WordPress).

---

## 2. Install Ollama + pull models

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull nomic-embed-text     # embeddings (~275 MB)
ollama pull llama3.1:8b          # chat model  (~4.7 GB)
ollama pull llava                # VISION model — reads screenshots/images (~4.7 GB)
# lighter alternatives if RAM is tight:
# ollama pull mistral:7b   |   ollama pull phi3:mini   |   ollama pull llava:7b
```

Ollama now runs as a background service on `http://localhost:11434`.

## 3. Install the API service

```bash
sudo mkdir -p /opt/nexus-ai && cd /opt/nexus-ai
# copy this ai-server/ folder here (git clone / scp / rsync)
cd ai-server
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

cp .env.example .env
# edit .env — set a strong API_KEY:
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Run (dev)

```bash
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Run (production, systemd)

```bash
sudo useradd --system --home /opt/nexus-ai nexusai || true
sudo chown -R nexusai:nexusai /opt/nexus-ai
sudo cp systemd/nexus-ai.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now nexus-ai
sudo systemctl status nexus-ai
```

## 4. Put it behind HTTPS (nginx)

The app listens on `127.0.0.1:8000`. Terminate TLS with nginx + certbot:

```nginx
server {
    server_name ai.your-domain.com;
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_read_timeout 180s;    # chat/ingest can be slow on first run
        client_max_body_size 25m;   # large ingest batches
    }
}
```

```bash
sudo certbot --nginx -d ai.your-domain.com
```

## 5. Connect the WordPress plugin

In WP admin → **Nexus → Settings → AI Chatbot**:

- **Server URL:** `https://ai.your-domain.com`
- **API Key:** the `API_KEY` from your `.env`
- Click **Test Connection** → then **Train Now**.

---

## Docker (alternative to steps 2–3)

```bash
cp .env.example .env   # set API_KEY
docker compose up -d
docker compose exec ollama ollama pull nomic-embed-text
docker compose exec ollama ollama pull llama3.1:8b
```

---

## API (all endpoints require `Authorization: Bearer <API_KEY>`)

| Method | Path      | Purpose |
|--------|-----------|---------|
| GET    | `/health` | Ollama reachability + installed models (Test Connection) |
| POST   | `/ingest` | `{ site_id, reset, documents[] }` → chunk, embed, store |
| POST   | `/chat`   | `{ site_id, message, history, system_prompt }` → `{ answer, sources }` |
| POST   | `/reset`  | `{ site_id }` → wipe that site's memory |

### Quick smoke test

```bash
KEY=your-api-key
BASE=http://127.0.0.1:8000

curl -s $BASE/health -H "Authorization: Bearer $KEY"

curl -s $BASE/ingest -H "Authorization: Bearer $KEY" -H 'Content-Type: application/json' -d '{
  "site_id":"testsite","reset":true,
  "documents":[{"id":"doc-1","source_type":"qa","title":"Refunds",
    "text":"We offer a 30-day money-back guarantee on all annual plans."}]
}'

curl -s $BASE/chat -H "Authorization: Bearer $KEY" -H 'Content-Type: application/json' -d '{
  "site_id":"testsite","message":"What is your refund policy?"
}'
```

## Notes

- **Concurrency:** one VPS + one model has limited parallelism. Under heavy load,
  use a smaller/faster model or add a queue/GPU. This is the main scaling limit.
- **`site_id`** is sent by the plugin (`md5(home_url())[:16]`) → one isolated
  ChromaDB collection per site, so one server can serve many sites.
- **Security:** keep `API_KEY` secret, serve only over HTTPS, and do not expose
  Ollama's port publicly.
