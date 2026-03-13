# Deployment Guide — Show Me the Model

## Infrastructure Overview

| Service | Purpose | Account |
|---------|---------|---------|
| **DigitalOcean** | VPS hosting (Ubuntu 24.04 Droplet) | digitalocean.com |
| **Cloudflare** | Domain registrar + DNS | cloudflare.com |
| **Resend** | Transactional email (HTTP API) | resend.com |
| **GitHub** | Source code | github.com/joesteinberg/show-me-the-model |

## Server Details

- **Domain**: `showmethemodel.io`
- **IP Address**: `64.225.18.170`
- **Droplet size**: Basic $6/mo (1 GB RAM, 1 vCPU, 25 GB disk)
- **OS**: Ubuntu 24.04 LTS
- **SSH access**: `ssh root@64.225.18.170`

## Directory Layout on Server

```
/opt/show-me-the-model/          # Git repo
├── backend/                     # FastAPI app
├── frontend/
│   └── dist/                    # Built static files (served by Nginx)
├── prompts/                     # LLM prompt YAML files
├── results/                     # Saved analysis JSON files
├── venv/                        # Python virtual environment
└── .env                         # Environment variables (Resend API key, CORS)
```

## Key Config Files on Server

| File | Purpose |
|------|---------|
| `/opt/show-me-the-model/.env` | Environment variables (Resend API key, CORS) |
| `/etc/systemd/system/smtm.service` | Backend service definition |
| `/etc/nginx/sites-available/showmethemodel` | Nginx config (frontend + API proxy) |

## DNS Records (Cloudflare)

| Type | Name | Content |
|------|------|---------|
| A | `@` | `64.225.18.170` |
| A | `www` | `64.225.18.170` |
| TXT | `resend._domainkey` | *(DKIM key for Resend)* |
| MX | `send` | `feedback-smtp.us-east-1.amazonses.com` (priority 10) |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` |
| TXT | `_dmarc` | `v=DMARC1; p=none;` |

## How to Deploy Changes

SSH into the server and run:

```bash
ssh root@64.225.18.170
cd /opt/show-me-the-model
git pull
```

### If you changed backend code (Python):

```bash
systemctl restart smtm
```

### If you changed frontend code (React/CSS/HTML):

```bash
cd frontend
npm install        # only if you added new packages
npx vite build
```

No restart needed — Nginx serves the static files directly from `frontend/dist/`.

### If you changed both:

```bash
cd /opt/show-me-the-model
git pull
cd frontend && npx vite build && cd ..
systemctl restart smtm
```

## Service Management

### Backend (FastAPI via uvicorn)

```bash
systemctl status smtm        # Check if running
systemctl restart smtm        # Restart after code changes
systemctl stop smtm           # Stop the backend
systemctl start smtm          # Start the backend
journalctl -u smtm -f         # Tail live logs
journalctl -u smtm --since "1 hour ago"   # Recent logs
```

### Nginx (web server)

```bash
systemctl status nginx        # Check if running
nginx -t                      # Test config for syntax errors
systemctl restart nginx        # Restart after config changes
```

### SSL Certificate (Let's Encrypt)

Auto-renews via certbot. To manually renew:

```bash
certbot renew
```

To check expiry:

```bash
certbot certificates
```

## Environment Variables (.env)

Located at `/opt/show-me-the-model/.env`:

```
ALLOWED_ORIGINS=https://showmethemodel.io,https://www.showmethemodel.io
RESEND_API_KEY=re_xxxxxxxx
SMTP_FROM=noreply@showmethemodel.io
```

Note: DigitalOcean blocks outbound SMTP ports (465/587), so email is sent via
Resend's HTTP API (`https://api.resend.com/emails`), not SMTP.

After editing `.env`, restart the backend: `systemctl restart smtm`

## Nginx Config

Located at `/etc/nginx/sites-available/showmethemodel`:

- Serves frontend from `/opt/show-me-the-model/frontend/dist/`
- Proxies `/api/*` requests to `http://127.0.0.1:8000/`
- SSE streaming enabled (proxy buffering off, 600s read timeout)
- HTTPS configured via certbot

## Systemd Service Config

Located at `/etc/systemd/system/smtm.service`:

```ini
[Unit]
Description=Show Me the Model API
After=network.target

[Service]
WorkingDirectory=/opt/show-me-the-model
ExecStart=/opt/show-me-the-model/venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port 8000
EnvironmentFile=/opt/show-me-the-model/.env
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

After editing, run `systemctl daemon-reload` before restarting.

## Troubleshooting

### Backend won't start
```bash
journalctl -u smtm -n 50      # Check recent logs for errors
```

### 502 Bad Gateway
Backend is probably down. Check:
```bash
systemctl status smtm
```

### Frontend changes not showing
Make sure you built:
```bash
cd /opt/show-me-the-model/frontend && npx vite build
```
Then hard-refresh browser (Ctrl+Shift+R) to bust cache.

### Email not sending
Check logs for email errors:
```bash
journalctl -u smtm | grep -i email
```
Verify `.env` has correct `RESEND_API_KEY` and restart backend.
Note: Python's urllib default User-Agent is blocked by Resend's WAF — the code
includes a custom `User-Agent: ShowMeTheModel/1.0` header to work around this.

### SSH connection refused
Droplet may need reboot from DigitalOcean dashboard (Power → Power Cycle).

### Disk space
```bash
df -h                          # Check disk usage
du -sh /opt/show-me-the-model/results/   # Check results storage
```

## Useful Commands

```bash
# Check what's running
systemctl status smtm
systemctl status nginx

# Watch logs in real time
journalctl -u smtm -f

# Check server resources
htop
df -h

# Reboot server
reboot
```
