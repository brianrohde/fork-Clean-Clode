# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Clean Clode is a client-side web utility that cleans up messy terminal text (from Claude Code, OpenAI, etc.). It detects the type of formatting artifact and applies the appropriate cleaning method. The app is 100% client-side—no server-side processing or data collection.

**Key Characteristics:**
- Pure HTML/CSS/JavaScript (no build tools or dependencies)
- Deployed as Docker + Nginx container to Hetzner VPS
- Uses TUI CSS framework for retro terminal styling
- Client-side state persisted in localStorage
- Live at: https://cleanclode.anothershadeofgrey.com

## Codebase Structure

### Files
- **index.html** - Single-page app structure; contains UI forms, output areas, history/about panels
- **script.js** - All application logic; DOMContentLoaded initializes on page load
  - DOM element references at top
  - localStorage constants and helpers for user preferences
  - Core cleaning functions (detectAndClean, cleanGitDiff, cleanClaudeDump, cleanLLMText)
  - Markdown table detection/extraction (when preserve-tables checkbox enabled)
  - Event listeners for clean, copy, history, about buttons
  - Debug console logging for troubleshooting
- **styles.css** - Custom styling on top of TUI CSS
- **tuicss.min.css** - TUI CSS framework (retro terminal look; minified, do not edit)
- **nginx.conf** - Web server config; handles caching, security headers, gzip
- **Dockerfile** - Alpine nginx image with static files copied in
- **docker-compose.yml** - Service definition; runs on port 3000, connects to n8n_network (Caddy reverse proxy)

### Documentation
- **README.md** - Public-facing project description
- **QUICK_START.md** - 5-minute deployment overview
- **DEPLOYMENT.md** - Detailed step-by-step setup guide
- **HOSTING_SUMMARY.md** - Architecture diagram, FAQ, troubleshooting
- **DEPLOYMENT_READY.md** - Status and deployment checklist
- **DUAL_VERSION_DEPLOY.md** - Guide for running v1 and v2 side-by-side
- **VPS_SETUP.md** - Initial VPS directory structure setup

## Deployment Pipeline

**Development → Testing → Deployment to VPS:**

1. **Local changes**: Edit files in `/dev/fork-Clean-Clode`
2. **Git commit & push**: Commit to `main` branch, push to GitHub
3. **VPS pull & rebuild**:
   ```bash
   cd ~/apps/fork-Clean-Clode
   git pull
   docker compose build
   docker compose up -d
   docker network connect n8n_network cleanclode-v2
   ```
4. **Reverse proxy routing**: Caddy (running independently in `/root/docker-compose.caddy.yml`) routes `cleanclode.anothershadeofgrey.com` traffic to the container
5. **Live at**: https://cleanclode.anothershadeofgrey.com

**Important**: After any `docker compose up -d`, manually run `docker network connect n8n_network cleanclode-v2` to connect the container to the shared network with Caddy. This is needed because docker-compose recreates the container on its local network.

## Core Logic: Text Cleaning

### detectAndClean(input)
Main entry point that:
1. Checks if preserve-tables is enabled and detects markdown tables (lines starting with 2+ spaces + pipe)
2. Extracts tables via `extractMarkdownTables()`, stores separately
3. Cleans remaining content based on type detection:
   - **Git diff**: Lines matching `\d+\s*[+-]\s` → `cleanGitDiff()`
   - **Claude Code dumps**: Box characters `│┃╏╎▌` or pipes `|` → `cleanClaudeDump()`
   - **Code**: High ratio of `{}();=` characters → pass through (minimal cleaning)
   - **LLM text**: Default → `cleanLLMText()` (fixes line wrapping)
4. If tables were extracted, appends them to cleaned content with `\n\n` separator
5. Returns final output

### Markdown Table Preservation
- **Detection**: `isMarkdownTable(text)` checks for pattern `/^\s{2,}\|/m` (line starting with 2+ whitespace + pipe)
- **Extraction**: `extractMarkdownTables(input)` separates table lines from content:
  - Lines matching `/^\s{2,}\|/` → stored in tables array, leading whitespace stripped
  - Other lines → stored in contentLines array
  - Returns `{tables, contentLines}` separately
- **Output**: When preserve-tables enabled and tables found, concatenates cleaned content + tables with blank lines between

**Debug logging** (in script.js):
- `PRESERVE_TABLES_ENABLED:` boolean
- `MARKDOWN_TABLE_DETECTED:` boolean
- `TABLES_FOUND:` count
- `OUTPUT_WITH_TABLES:` or `OUTPUT_WITHOUT_TABLES:` preview

Check browser console (F12 → Console tab) to see these logs when testing.

## VPS Infrastructure

**Host**: Hetzner VPS (95.217.9.84)  
**OS**: Ubuntu 22.04  
**Services**:
- Caddy reverse proxy (independent setup in `/root/docker-compose.caddy.yml`)
- n8n + PostgreSQL + Ollama (in `~/selfhosting-n8n-example/`)
- Clean Clode (in `~/apps/fork-Clean-Clode/`)

**Networks**:
- `n8n_network`: Bridge network shared by Caddy, n8n, and Clean Clode
- Caddyfile at `/root/selfhosting-n8n-example/conf/Caddyfile`: Routes both `cleanclode.anothershadeofgrey.com` and `n8n.anothershadeofgrey.com`

**DNS**: Cloudflare handles DNS; A records point both subdomains to 95.217.9.84

## Common Operations

### Pull latest from GitHub
```bash
cd ~/apps/fork-Clean-Clode && git pull
```

### Build and deploy
```bash
docker compose build && docker compose up -d
docker network connect n8n_network cleanclode-v2
```

### View logs
```bash
docker logs -f cleanclode-v2
```

### Check deployed version
```bash
git log --oneline -1
curl https://cleanclode.anothershadeofgrey.com/ | grep -o "Version=v[0-9]"
```

### Test locally
Open `index.html` directly in browser (works without server). For testing with server: `python3 -m http.server 8000` then visit `http://localhost:8000/`.

## User Preferences (localStorage)

Stored on client side, never sent to server:
- `clean-clode-preserve-tables`: Boolean (enable markdown table preservation)
- `clean-clode-history-enabled`: Boolean (enable paste history)
- `clean-clode-history`: JSON array of objects `{id, timestamp, cleaned, original, preview}`
- `clean-clode-about-visible`: Boolean (show/hide about section on load)
- `clean-clode-first-use`: Boolean (show welcome message on first visit)

## Branches

- `main`: Current production (v2 with markdown table preservation)
- `v1-original`: Original version (no table feature; available for comparison)

## Known Issues & Workarounds

1. **Container loses network connectivity after rebuild**: Run `docker network connect n8n_network cleanclode-v2` after each deploy
2. **Caddy certificate not issued for new domain**: Caddyfile changes require `docker restart caddy`
3. **Table preservation not detecting tables**: Check browser console for debug logs starting with `MARKDOWN_TABLE_DETECTED:`. If false, the regex `/^\s{2,}\|/m` may not match the input format.

## User Communication Preference

When working with the user: Provide concise, direct commands only. Avoid long guides or documentation unless explicitly requested. The user prefers terminal commands over written walkthroughs.
