# Dual Version Deployment Guide
## Deploy Clean Clode v1 and v2 Side-by-Side

This guide shows how to deploy both versions of Clean Clode on your Hetzner VPS for direct visual comparison.

---

## Overview

| Version | Domain | Features | Branch |
|---------|--------|----------|--------|
| **v2** (Current) | `cleanclode.anothershadeofgrey.com` | Markdown table preservation | `main` |
| **v1** (Legacy) | `cleanclode-v1.anothershadeofgrey.com` | Original (no table feature) | `v1-original` |

---

## Setup: Two Approaches

### Approach A: Git Branches (Recommended)
Cleanest method; leverages git to manage versions.

### Approach B: Separate Clones
Simpler but duplicates disk space.

---

## Approach A: Git Branches (Recommended)

### Step 1: Clone Clean Clode

```bash
ssh root@95.217.9.84
cd ~/apps
git clone https://github.com/brianrohde/Clean-Clode.git cleanclode-main
cd cleanclode-main
```

### Step 2: Deploy v2 (main branch)

```bash
# Ensure we're on main
git checkout main

# Deploy
docker compose up -d
```

**Verify:**
```bash
docker compose ps
# Should show: cleanclode-v2 | Up
```

**Test:**
```
https://cleanclode.anothershadeofgrey.com
```

### Step 3: Clone for v1 Version

```bash
cd ~/apps
git clone https://github.com/brianrohde/Clean-Clode.git cleanclode-v1
cd cleanclode-v1

# Checkout v1 branch
git checkout v1-original
```

### Step 4: Modify docker-compose.yml for v1

```bash
nano docker-compose.yml
```

Edit the service name and domain:

```yaml
services:
  cleanclode-v1:  # Change from 'cleanclode'
    ...
    container_name: cleanclode-v1
    ports:
      - "3001:80"  # Change from 3000
    labels:
      - "traefik.http.routers.cleanclode-v1.rule=Host(`cleanclode-v1.anothershadeofgrey.com`)"
      # Update all traefik labels to use v1 subdomain
```

### Step 5: Deploy v1

```bash
# From cleanclode-v1 directory
docker compose up -d
```

**Verify:**
```bash
docker compose ps
# Should show: cleanclode-v1 | Up
```

**Test:**
```
https://cleanclode-v1.anothershadeofgrey.com
```

### Step 6: Verify Both Are Running

```bash
# From either directory, check all containers
docker ps | grep cleanclode

# Output should show both:
# cleanclode-v2
# cleanclode-v1
```

---

## Approach B: Separate Clones (Simpler)

If you don't want to manage branches, just clone twice and adjust paths:

```bash
cd ~/apps

# v2 (main)
git clone https://github.com/brianrohde/Clean-Clode.git cleanclode-main
cd cleanclode-main
# Edit docker-compose.yml to deploy to cleanclode.anothershadeofgrey.com
docker compose up -d

# v1 (original)
cd ..
git clone https://github.com/brianrohde/Clean-Clode.git cleanclode-v1
cd cleanclode-v1
git checkout v1-original
# Edit docker-compose.yml to deploy to cleanclode-v1.anothershadeofgrey.com
docker compose up -d
```

---

## Managing Both Versions

### View Status

```bash
# View all Clean Clode containers
docker ps | grep cleanclode

# View logs from v2
docker logs -f cleanclode-v2

# View logs from v1
docker logs -f cleanclode-v1
```

### Update v2 Only

```bash
cd ~/apps/cleanclode-main
git pull origin main
docker compose build
docker compose up -d
```

### Update v1 Only

```bash
cd ~/apps/cleanclode-v1
git pull origin v1-original
docker compose build
docker compose up -d
```

### Stop One Version

```bash
cd ~/apps/cleanclode-main
docker compose down  # Stops only v2

# Or stop specific container
docker stop cleanclode-v2
```

### Stop Both Versions

```bash
docker stop cleanclode-v2 cleanclode-v1
```

---

## Comparing v1 vs v2

### Test Case: Markdown Table

**Input (same for both):**
```
Here is a table:
| Header 1 | Header 2 |
| --- | --- |
| Cell 1 | Cell 2 |
```

**v1 Output (pipes removed):**
```
Here is a table:
Header 1 Header 2
--- ---
Cell 1 Cell 2
```

**v2 Output (with "Preserve Markdown Tables" enabled):**
```
Here is a table:
| Header 1 | Header 2 |
| --- | --- |
| Cell 1 | Cell 2 |
```

### Visual Comparison

Open both in browser tabs:
- **Left:** `cleanclode.anothershadeofgrey.com` (v2)
- **Right:** `cleanclode-v1.anothershadeofgrey.com` (v1)

Paste the same markdown table content and compare output side-by-side.

---

## Traefik Configuration

Both services are automatically recognized by Traefik via Docker labels:

```bash
docker logs traefik | grep -i cleanclode

# You should see:
# cleanclode@docker | Configuration reloaded
# cleanclode-v1@docker | Configuration reloaded
```

If routes don't appear, restart Traefik:

```bash
docker restart traefik
```

---

## DNS / Domain Setup

Ensure your domain has both subdomains:

```bash
# From your DNS provider, add:
cleanclode.anothershadeofgrey.com    A    95.217.9.84
cleanclode-v1.anothershadeofgrey.com A    95.217.9.84
```

Test DNS resolution:

```bash
nslookup cleanclode.anothershadeofgrey.com
nslookup cleanclode-v1.anothershadeofgrey.com

# Both should resolve to 95.217.9.84
```

---

## Troubleshooting

### Routes not showing in Traefik

```bash
# Check both containers are running
docker compose ps

# Verify they're on the correct network
docker network inspect n8n_network | grep cleanclode

# Check Traefik logs
docker logs traefik | tail -50
```

### Can't reach one subdomain

```bash
# Verify DNS
nslookup cleanclode-v1.anothershadeofgrey.com

# Check firewall
# Ensure Hetzner VPS firewall allows inbound 443

# Check Cloudflared tunnel
docker logs cloudflared | grep -i tunnel
```

### Port conflicts

If port 3001 is already in use:

```bash
# Find what's using it
netstat -tlnp | grep 3001

# Or use a different port in docker-compose.yml
ports:
  - "3002:80"  # Change 3001 to something else
```

---

## File Structure

```
~/apps/
├── cleanclode-main/          (v2 with table preservation)
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── index.html
│   ├── script.js              (WITH table preservation)
│   ├── styles.css
│   └── ...
│
└── cleanclode-v1/            (v1 original)
    ├── docker-compose.yml    (modified for v1 domain/port)
    ├── Dockerfile
    ├── index.html
    ├── script.js              (WITHOUT table preservation)
    ├── styles.css
    └── ...
```

---

## Cleanup

### Remove v1 (keep v2)

```bash
cd ~/apps/cleanclode-v1
docker compose down
cd ~/apps
rm -rf cleanclode-v1
```

### Remove Both

```bash
cd ~/apps/cleanclode-main
docker compose down
cd ~/apps/cleanclode-v1
docker compose down
cd ~/apps
rm -rf cleanclode-main cleanclode-v1
```

---

## Next Steps

1. ✅ Deploy v2 to main domain
2. ✅ Deploy v1 to v1 subdomain
3. ✅ Test markdown table preservation feature in v2
4. ✅ Compare with v1 output
5. Share both URLs with users for feedback
6. Once satisfied with v2, optionally remove v1

---

## Support

- **v1 Issues:** Branch `v1-original`
- **v2 Issues:** Branch `main`
- **Deployment Issues:** Check Docker logs and Traefik routes

For questions, refer to `DEPLOYMENT.md` or `QUICK_START.md` in the main branch.
