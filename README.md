# Show Me the Model

**Show Me the Model** is an AI-powered tool that checks whether the economic reasoning in an essay actually holds up. Give it a URL, paste in text, or upload a PDF — it runs a multi-stage analysis pipeline and returns a structured critique: assumptions, logical gaps, internal contradictions, and a synthesis.

Live at **[showmethemodel.io](https://showmethemodel.io)**

---

## How It Works

The analysis runs in four stages:

1. **Decomposition** — breaks the essay into thesis, claims, and causal chains
2. **Analysis Passes** — six parallel passes examine different dimensions (assumptions, general equilibrium effects, exogenous vs. endogenous variables, quantitative claims, internal consistency, and a steelman)
3. **Dedup & Merge** — consolidates overlapping findings from the six passes
4. **Synthesis** — generates the final report integrating all prior stages

The pipeline supports both **Anthropic Claude** and **OpenAI** models. Your API key is passed from the browser directly to the backend per-request — it is never stored server-side.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Backend | FastAPI, Python 3.11+ |
| LLM APIs | Anthropic (`anthropic>=0.40`) · OpenAI (`openai>=1.55`) |
| Text extraction | trafilatura (URLs) · pymupdf (PDFs) |
| Email | Resend HTTP API |
| Hosting | DigitalOcean VPS + Nginx + Cloudflare |

---

## Project Structure

```
show-me-the-model/
├── backend/
│   ├── main.py            # FastAPI routes & job management
│   ├── pipeline.py        # 4-stage analysis orchestration
│   ├── jobs.py            # In-memory job store with SSE queues
│   ├── prompt_loader.py   # YAML prompt loading & templating
│   ├── text_extract.py    # URL, PDF, and raw text extraction
│   └── email_notify.py    # Resend email notifications
├── frontend/
│   └── src/
│       ├── App.jsx            # Main app & state machine
│       ├── api.js             # Backend API client
│       └── components/        # UI components
├── prompts/
│   ├── stage1_decomposition.yaml
│   ├── stage2_*.yaml          # 6 analysis passes
│   ├── stage2_5_dedup.yaml
│   ├── stage3_synthesis.yaml
│   └── shared/                # Persona, taxonomy, field examples
├── eval/                      # Gold-standard evaluation data
├── results/                   # Saved analysis JSON files (generated)
├── requirements.txt
└── .env.example
```

---

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- An Anthropic or OpenAI API key

### Setup

```bash
git clone https://github.com/joesteinberg/show-me-the-model.git
cd show-me-the-model

# Backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy and fill in environment variables
cp .env.example .env
# Edit .env and add your API keys

# Frontend
cd frontend
npm install
```

### Running

Open two terminals:

```bash
# Terminal 1 — backend (from repo root)
uvicorn backend.main:app --reload
# Runs on http://localhost:8000

# Terminal 2 — frontend
cd frontend
npm run dev
# Runs on http://localhost:5173, proxies /api → :8000
```

Open `http://localhost:5173`. Enter your API key in the form, paste a URL or text, and submit.

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | For Claude models | Anthropic API key |
| `OPENAI_API_KEY` | For OpenAI models | OpenAI API key |
| `ALLOWED_ORIGINS` | Production only | Comma-separated CORS origins |
| `RESEND_API_KEY` | Optional | Email notification service key |
| `SMTP_FROM` | Optional | Sender address for email notifications |

Server-side keys (in `.env`) are used for running the pipeline locally or on the server. In the live app, users supply their own keys through the browser UI — they are sent per-request and never persisted.

---

## Contributing

Contributions are welcome. If you have something specific in mind, open an issue first to discuss it.

### Workflow

**1. Fork and clone** the repository, or create a branch directly if you have write access:

```bash
git checkout -b feature/your-changes
```

**2. Make your changes** and commit with a clear message:

```bash
git add <files>
git commit -m "Describe your changes clearly"
```

**3. Push your branch:**

```bash
git push origin feature/your-changes
```

**4. Open a pull request** on GitHub. Add a descriptive title and explain what you changed and why.

**5. Review and iterate** — maintainers may request changes. Push additional commits to your branch and the PR will update automatically.

### Good First Areas

- Improving prompt quality in `prompts/`
- Adding type hints to backend Python code
- Frontend component cleanup / accessibility
- Evaluation tooling in `eval/`
- Documentation

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full server setup, Nginx config, and systemd service.
