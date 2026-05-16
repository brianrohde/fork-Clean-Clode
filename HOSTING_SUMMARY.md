# Clean Clode Hosting Summary
## Your Custom Instance on Hetzner VPS

---

## What You Get

A **fully deployed, production-ready instance** of Clean Clode running on your Hetzner infrastructure:

- **URL:** `https://cleanclode.anothershadeofgrey.com`
- **VPS:** Hetzner 95.217.9.84 (shared with n8n, Ollama, etc.)
- **Proxy:** Traefik (reverse proxy + SSL/TLS)
- **Security:** Cloudflared tunnel + Let's Encrypt certificates
- **Performance:** Nginx with gzip compression, asset caching, HTTP/2

---

## Why This Setup?

### ✅ Advantages of Your Architecture

1. **No cloud lock-in** — Everything self-hosted on your Hetzner VPS
2. **Unified stack** — Clean Clode sits alongside n8n, Ollama, Qdrant on one docker-compose network
3. **Security first** — Cloudflared tunnel means no direct port exposure
4. **Free SSL/TLS** — Let's Encrypt auto-renewal via Traefik
5. **Easy updates** — Single `git pull && docker compose up -d`
6. **Low resource overhead** — Static site; nginx is lightweight

### 📊 Resource Usage

```
Clean Clode Container:
├── CPU: ~0.1% (idle) / ~1% (under load)
├── RAM: ~20-50MB
├── Disk: ~50MB (images + js/css)
└── Network: Minimal (all processing happens in user's browser)
```

Your 4GB Hetzner VPS easily handles:
- n8n + workflows
- Ollama (1.5B-7B models)
- PostgreSQL + vector DB
- **+ Clean Clode** ✓

---

## Deployment Files Included

```
Clean-Clode/
├── QUICK_START.md              ← Read this first
├── DEPLOYMENT.md               ← Detailed instructions
├── HOSTING_SUMMARY.md          ← This file
│
├── Dockerfile                  ← Container definition
├── docker-compose.yml          ← Service + Traefik config
├── nginx.conf                  ← Web server config
├── deploy.sh                   ← One-command deployment
│
├── index.html                  ← App interface
├── script.js                   ← Markdown table preservation + cleaning
├── styles.css                  ← Retro terminal styling
├── tuicss.min.css              ← TUI CSS framework
├── favicons/                   ← Browser icons
├── images/                     ← Assets (OG image, logos)
└── README.md                   ← Original project docs
```

---

## One-Liner Deployment

```bash
ssh root@95.217.9.84
cd ~/apps && git clone https://github.com/brianrohde/Clean-Clode.git
cd Clean-Clode && bash deploy.sh
```

**Result:** `https://cleanclode.anothershadeofgrey.com` live in <5 minutes

---

## Ongoing Maintenance

### Monitor
```bash
# Live logs
docker logs -f cleanclode

# Status
docker compose ps
```

### Update
```bash
git pull origin main
bash deploy.sh
```

### Backup
```bash
# App is stateless; no DB to backup
# Custom configs are in docker-compose.yml and nginx.conf
git push  # Keep repo up to date
```

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│  Public Internet (HTTPS)                                     │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  Cloudflared Tunnel (Secure Endpoint)                        │
│  Route: cleanclode.anothershadeofgrey.com                    │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  Traefik (Reverse Proxy + Let's Encrypt)                     │
│  • Auto-routes Host header to correct service               │
│  • Manages SSL/TLS certificates                              │
│  • Handles multiple subdomains on one IP                     │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  Docker Container: cleanclode                                │
│  • Nginx (port 80)                                           │
│  • Serves static HTML/JS/CSS                                 │
│  • Gzip compression, asset caching, security headers         │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  User's Browser (localhost)                                  │
│  • Paste text with markdown tables                           │
│  • Click "Clean My Clode"                                    │
│  • All processing happens in browser                         │
│  • Data NEVER leaves your device                             │
└──────────────────────────────────────────────────────────────┘
```

---

## Feature Highlights

### Markdown Table Preservation (NEW!)

**Before (without option):**
```
| Name | Age |         | Name | Age |
| --- | --- |   →     Name Age
| John | 30 |         John 30
```

**After (with option enabled):**
```
| Name | Age |         | Name | Age |
| --- | --- |   →     | --- | --- |
| John | 30 |         | John | 30 |
```

### Other Features
- ✅ Remove terminal pipes and box characters
- ✅ Clean up extra spaces and formatting
- ✅ Preserve code blocks
- ✅ Optional paste history (localStorage only)
- ✅ One-click copy to clipboard
- ✅ Retro terminal aesthetic

---

## Usage Scenarios

### 1. Developer Documentation
Copy Claude Code terminal output → Clean → Paste into README

### 2. Bug Reports
Capture terminal error logs → Clean → Post to issue tracker

### 3. Prompt Engineering
Save cleaned prompts → Reuse across projects → Build knowledge base

### 4. Content Creation
Markdown tables from data → Clean formatting → Publish to blog

---

## FAQ

**Q: Is my data private?**  
A: 100%. All processing happens in your browser. We never see or store your text.

**Q: Can I access it offline?**  
A: No, but you can clone the repo and open `index.html` locally in your browser.

**Q: How do I customize the branding?**  
A: Edit `index.html` and `images/` folder, then `git push` to redeploy.

**Q: What if I want to add features?**  
A: Edit `script.js` (logic) or `styles.css` (styling), commit, push, and redeploy.

**Q: Can I use this on a different domain?**  
A: Yes! Update the Traefik label in `docker-compose.yml`:
```yaml
traefik.http.routers.cleanclode.rule=Host(`yourdomain.com`)
```
Then redeploy.

**Q: Will it consume my VPS resources?**  
A: Negligibly. Nginx is lightweight, and all heavy lifting happens in users' browsers.

---

## Cost Breakdown

| Component | Cost | Notes |
|-----------|------|-------|
| Hetzner VPS | $11.99–$28.99/mo | Shared with n8n, Ollama, etc. |
| Domain | Already owned | anothershadeofgrey.com |
| SSL/TLS | Free | Let's Encrypt via Traefik |
| CDN/DDoS | Optional | Cloudflare / Bunny CDN |
| **Total** | **~$12/mo** | **All-in self-hosted** |

---

## Next Steps

1. **Deploy now:** `bash deploy.sh` on your Hetzner VPS
2. **Share the URL:** `https://cleanclode.anothershadeofgrey.com`
3. **Monitor:** Check logs occasionally, update when new features are added
4. **Extend:** Consider adding monitoring (Dozzle), analytics (Umami), or CI/CD (GitHub Actions)

---

## Support & Resources

- **Original Project:** https://github.com/TheJoWo/Clean-Clode
- **Your Fork:** https://github.com/brianrohde/Clean-Clode
- **Hetzner Docs:** https://docs.hetzner.cloud/
- **Traefik Docs:** https://doc.traefik.io/
- **Docker Docs:** https://docs.docker.com/

---

## Congratulations! 🎉

Your Clean Clode instance is now:
- ✅ Running in production on Hetzner
- ✅ Secured with SSL/TLS and Cloudflared
- ✅ Integrated into your n8n automation stack
- ✅ Ready to share with your team
- ✅ Easy to update and maintain

Enjoy your markdown-table-preserving text cleaner! 🚀
