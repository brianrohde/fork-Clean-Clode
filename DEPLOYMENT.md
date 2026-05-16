# Clean Clode Deployment Guide
## Hetzner VPS + Traefik Setup

### Prerequisites
- Hetzner VPS with Docker & Docker Compose installed (you have this at `95.217.9.84`)
- Your n8n Docker network configured as `n8n_network` (external)
- Traefik reverse proxy already running with Cloudflared tunnel
- Domain: `anothershadeofgrey.com`

---

## Step 1: Clone Clean Clode Repository

```bash
# SSH into your Hetzner VPS
ssh root@95.217.9.84

# Navigate to your selfhosting directory (or create a new one)
cd ~/selfhosting-n8n-example
# or
mkdir -p ~/apps && cd ~/apps

# Clone the Clean Clode fork
git clone https://github.com/brianrohde/Clean-Clode.git
cd Clean-Clode
```

---

## Step 2: Verify Traefik Network

Make sure the `n8n_network` exists and is properly configured:

```bash
docker network ls | grep n8n_network
# Output should show: n8n_network
```

If the network doesn't exist, create it:

```bash
docker network create n8n_network
```

---

## Step 3: Build & Deploy Clean Clode

```bash
# From within the Clean-Clode directory
docker compose build
docker compose up -d

# Verify it's running
docker compose ps
# Output should show: cleanclode | Up | 3000/80
```

---

## Step 4: Verify Traefik Routing

Check that Traefik recognizes the service:

```bash
# View Traefik logs
docker logs traefik

# You should see something like:
# cleanclode@docker | Detecting routing configuration...
# cleanclode@docker | Configuration reloaded on version: ...
```

---

## Step 5: Test Access

Open your browser and navigate to:

```
https://cleanclode.anothershadeofgrey.com
```

If you get a connection error:
- Check that Cloudflared tunnel is running: `docker logs cloudflared`
- Verify DNS propagation: `nslookup cleanclode.anothershadeofgrey.com`
- Check Traefik routing: Access Traefik dashboard (if exposed) to confirm the route

---

## Step 6: Monitor & Maintain

### View Logs
```bash
docker logs -f cleanclode
```

### Restart Container
```bash
docker restart cleanclode
```

### Update Clean Clode
```bash
# Pull latest changes
git pull origin main

# Rebuild & restart
docker compose build
docker compose up -d
```

### Remove Container
```bash
docker compose down
```

---

## Docker Architecture

```
┌─ cleanclode (nginx:alpine) ──┐
│  Port 80 → Nginx             │
│  Serves: index.html, assets  │
├─────────────────────────────┤
│  Traefik (reverse proxy)     │
│  Routes: cleanclode.*.com    │
├─────────────────────────────┤
│  Cloudflared (secure tunnel) │
│  Public HTTPS access         │
└─────────────────────────────┘
```

---

## File Structure for Deployment

```
Clean-Clode/
├── Dockerfile              (nginx container definition)
├── docker-compose.yml      (service config + Traefik labels)
├── nginx.conf              (webserver config)
├── index.html              (main page)
├── script.js               (cleaned + table preservation logic)
├── styles.css              (retro terminal styling)
├── tuicss.min.css          (TUI framework)
├── favicons/               (browser icons)
├── images/                 (og-image, logos, etc.)
└── DEPLOYMENT.md           (this file)
```

---

## Traefik Label Explanation

```yaml
labels:
  - "traefik.enable=true"
  # Enable this service for Traefik routing
  
  - "traefik.http.routers.cleanclode.rule=Host(`cleanclode.anothershadeofgrey.com`)"
  # Route incoming requests with Host header matching the domain
  
  - "traefik.http.routers.cleanclode.entrypoints=web,websecure"
  # Listen on both HTTP and HTTPS (web=80, websecure=443)
  
  - "traefik.http.routers.cleanclode.tls.certresolver=letsencrypt"
  # Use Let's Encrypt for automatic SSL/TLS certificates
  
  - "traefik.http.services.cleanclode.loadbalancer.server.port=80"
  # Forward traffic to the nginx container on port 80
```

---

## Environment Notes

- **Network:** `n8n_network` allows Clean Clode to communicate with n8n, Ollama, etc. if needed
- **Port Mapping:** `3000:80` is internal; Traefik handles external HTTPS routing
- **Restart Policy:** `unless-stopped` ensures the container comes back up after reboot
- **DNS:** Point `cleanclode.anothershadeofgrey.com` A record to your Hetzner VPS IP (95.217.9.84)

---

## Troubleshooting

### Clean Clode container won't start
```bash
docker logs cleanclode
# Check for missing files or nginx config errors
```

### Traefik doesn't route to cleanclode
```bash
# Verify the container is running and connected to n8n_network
docker network inspect n8n_network
# Look for "cleanclode" in the containers list
```

### HTTPS/Certificate issues
```bash
# Check Traefik logs for Let's Encrypt errors
docker logs traefik | grep -i certificate

# Ensure DNS is resolving:
nslookup cleanclode.anothershadeofgrey.com
```

### Can't reach the site
1. Verify Cloudflared tunnel is active: `docker logs cloudflared`
2. Check firewall rules on Hetzner VPS
3. Verify domain DNS points to your VPS IP
4. Check Traefik dashboard for route status

---

## Next Steps

1. **Custom domain:** Already set to `cleanclode.anothershadeofgrey.com` ✓
2. **SSL/TLS:** Automatic via Traefik + Let's Encrypt ✓
3. **Updates:** Use `git pull && docker compose build && docker compose up -d`
4. **Monitoring:** Consider adding container to your existing monitoring stack (Dozzle, Prometheus, etc.)

---

## Support & Issues

For updates or bug reports: https://github.com/TheJoWo/Clean-Clode

For deployment issues on your VPS, refer to your n8n setup notes or contact Hetzner support.
