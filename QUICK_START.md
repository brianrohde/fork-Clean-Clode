# Quick Start: Deploy Clean Clode to Hetzner VPS

## TL;DR (5 minutes)

```bash
# SSH into Hetzner VPS
ssh root@95.217.9.84

# Clone the repo
cd ~/apps && git clone https://github.com/brianrohde/Clean-Clode.git
cd Clean-Clode

# Deploy
bash deploy.sh

# Done! Access at: https://cleanclode.anothershadeofgrey.com
```

---

## What Just Happened?

1. ✅ Docker container built with nginx
2. ✅ Traefik automatically routed `cleanclode.anothershadeofgrey.com` to it
3. ✅ SSL/TLS certificate auto-generated via Let's Encrypt
4. ✅ Cloudflared tunnel provides secure public access
5. ✅ All files served via HTTP/2 with gzip compression

---

## Verify It Works

```bash
# Check container status
docker compose ps

# View logs (live)
docker logs -f cleanclode

# Test endpoint
curl https://cleanclode.anothershadeofgrey.com
# Should return HTML of the Clean Clode app
```

---

## Update/Redeploy

```bash
cd ~/apps/Clean-Clode
git pull origin main
bash deploy.sh
```

---

## Stop/Remove

```bash
cd ~/apps/Clean-Clode
docker compose down
# (Logs and data are ephemeral; app state lives in localStorage on user's device)
```

---

## Architecture at a Glance

```
User Browser
     ↓
Cloudflared Tunnel (HTTPS)
     ↓
Traefik (Reverse Proxy + Let's Encrypt)
     ↓
cleanclode (Nginx Container)
     ↓
Static Assets (HTML, CSS, JS, Favicons, Images)
```

---

## Files Deployed

| File | Purpose |
|------|---------|
| `index.html` | Main app interface |
| `script.js` | Markdown table preservation + cleaning logic |
| `styles.css` | Retro terminal styling |
| `tuicss.min.css` | TUI CSS framework |
| `favicons/` | Browser icons |
| `images/` | OG image, logos, etc. |

---

## Network Details

- **Domain:** `cleanclode.anothershadeofgrey.com`
- **VPS IP:** `95.217.9.84`
- **Internal Port:** `3000` (container port 80)
- **External Port:** `443` (via Traefik/Cloudflared)
- **Docker Network:** `n8n_network` (shared with n8n stack)

---

## Features Already Live

✅ Remove terminal formatting (pipes, box characters)  
✅ Preserve markdown table formatting (new!)  
✅ Auto-copy to clipboard  
✅ Local paste history (optional)  
✅ 100% private (no data ever leaves your device)  
✅ Retro terminal aesthetic  

---

## Next Steps

1. Share the URL: `https://cleanclode.anothershadeofgrey.com`
2. Add custom favicon/branding if desired
3. Monitor access logs: `docker logs -f cleanclode`
4. Consider adding to monitoring stack (Dozzle, Prometheus)

---

## Troubleshooting

**Can't reach the site?**
```bash
# Check if running
docker compose ps

# Check Traefik routing
docker logs traefik | grep cleanclode

# Check network
docker network inspect n8n_network | grep cleanclode
```

**Want to see detailed logs?**
```bash
docker logs -f cleanclode
```

**Need to rebuild?**
```bash
docker compose build --no-cache
docker compose up -d
```

---

For full deployment details, see `DEPLOYMENT.md`
