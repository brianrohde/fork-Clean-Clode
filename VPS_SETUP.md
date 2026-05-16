# VPS Setup Guide: Creating the Apps Folder

This guide walks you through setting up your Hetzner VPS directory structure for hosting Clean Clode.

---

## Prerequisites

- SSH access to your Hetzner VPS (95.217.9.84)
- Root or sudo access
- Git installed on your VPS
- Docker & Docker Compose installed on your VPS

---

## Step 1: SSH Into Your VPS

```bash
ssh root@95.217.9.84
```

**Expected output:**
```
Welcome to Ubuntu 22.04.1 LTS (GNU/Linux 5.15.0-56-generic x86_64)
root@vps:~#
```

---

## Step 2: Check Current Directory Structure

View what's currently on your VPS:

```bash
pwd
# Output: /root

ls -la
# Output should show:
# drwxr-xr-x  selfhosting-n8n-example  (your existing n8n folder)
# drwxr-xr-x  .ssh
# etc.
```

---

## Step 3: Create the Apps Folder

### Option A: Create Fresh Apps Folder (Recommended)

If you want to keep Clean Clode separate from your n8n setup:

```bash
# Create the apps directory
mkdir -p ~/apps

# Verify it was created
ls -la ~/apps

# Change to the apps folder
cd ~/apps

# Verify you're in the right location
pwd
# Output: /root/apps
```

### Option B: Use Existing selfhosting-n8n-example Folder

If you want to add Clean Clode alongside your existing n8n setup:

```bash
# Navigate to existing folder
cd ~/selfhosting-n8n-example

# Create a subdirectory for Clean Clode
mkdir -p clean-clode

# Verify
ls -la
cd clean-clode
pwd
```

---

## Step 4: Set Proper Permissions

Make sure the folder has correct permissions:

```bash
# From ~/apps folder
cd ~/apps

# Check current permissions
ls -la ../ | grep apps

# Set owner to current user (optional, usually already correct)
chown -R root:root ~/apps

# Make folder readable and writable
chmod 755 ~/apps
```

---

## Step 5: Clone Clean Clode Repository

```bash
# Navigate to apps folder
cd ~/apps

# Clone the Clean Clode repository
git clone https://github.com/brianrohde/Clean-Clode.git

# Verify the clone worked
ls -la

# Output should show:
# drwxr-xr-x  Clean-Clode
```

---

## Step 6: Navigate to Clean Clode Directory

```bash
cd ~/apps/Clean-Clode

# Verify you're in the right place
pwd
# Output: /root/apps/Clean-Clode

# List files
ls -la
# Should show: Dockerfile, docker-compose.yml, index.html, script.js, etc.
```

---

## Step 7: Verify Docker Setup

Before deploying, ensure Docker and Docker Compose are available:

```bash
# Check Docker version
docker --version
# Output: Docker version 20.10.x or higher ✅

# Check Docker Compose version
docker compose version
# Output: Docker Compose version 2.x or higher ✅

# Check if Traefik is running (from n8n setup)
docker ps | grep traefik
# Should show traefik container running
```

---

## Step 8: Verify n8n Network Exists

Clean Clode connects to your existing n8n Docker network:

```bash
# List all Docker networks
docker network ls

# Look for: n8n_network (should be there from your n8n setup)
# Output example:
# NETWORK ID     NAME                DRIVER    SCOPE
# abc123def456   n8n_network         bridge    local
# xyz789uvw012   bridge              bridge    local
```

**If n8n_network doesn't exist, create it:**

```bash
docker network create n8n_network
```

---

## Step 9: Check Disk Space

Ensure you have enough disk space for the deployment:

```bash
# Check disk usage
df -h

# Should show something like:
# Filesystem      Size  Used Avail Use% Mounted on
# /dev/sda1       100G   50G   50G  50% /

# At least 20GB free is ideal (you'll be fine at 50GB free)
```

---

## Step 10: Ready to Deploy!

Now you can deploy Clean Clode:

```bash
# You should be in ~/apps/Clean-Clode
pwd
# Output: /root/apps/Clean-Clode

# Run the deployment script
bash deploy.sh

# Or manually:
docker compose build
docker compose up -d

# Verify it's running
docker compose ps
# Should show: cleanclode-v2 | Up
```

---

## Directory Structure After Setup

```
/root/
├── apps/                          ← NEW FOLDER
│   └── Clean-Clode/               ← YOUR REPO
│       ├── Dockerfile
│       ├── docker-compose.yml
│       ├── index.html
│       ├── script.js
│       ├── styles.css
│       ├── deploy.sh
│       ├── QUICK_START.md
│       ├── DEPLOYMENT.md
│       └── ... (other files)
│
└── selfhosting-n8n-example/       ← YOUR EXISTING SETUP
    ├── docker-compose.yml
    ├── n8n (running)
    ├── ollama (running)
    ├── postgres (running)
    └── ... (other services)
```

---

## Troubleshooting Setup

### mkdir Permission Denied

```bash
# If you get "Permission denied" creating ~/apps
# Check if you're using the right user
whoami
# Output: root (you should be root)

# Try with sudo
sudo mkdir -p ~/apps
```

### Folder Already Exists

```bash
# If ~/apps already exists, that's fine!
cd ~/apps
ls -la
# Just proceed with cloning
```

### Clone Failed

```bash
# Check Git is installed
git --version
# If not installed: apt-get install git

# Check internet connection
ping github.com
# Should get responses

# Try cloning again
git clone https://github.com/brianrohde/Clean-Clode.git
```

### Docker Not Found

```bash
# If docker command not found, install Docker:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verify installation
docker --version
```

---

## Quick Reference Commands

```bash
# Navigate to apps folder
cd ~/apps

# Create if doesn't exist
mkdir -p ~/apps

# Clone Clean Clode
git clone https://github.com/brianrohde/Clean-Clode.git

# Enter Clean Clode folder
cd Clean-Clode

# Deploy (one command)
bash deploy.sh

# Check status
docker compose ps

# View logs
docker logs -f cleanclode-v2

# Stop deployment
docker compose down
```

---

## Next Steps

Once your apps folder is created and Clean Clode is cloned:

1. ✅ Created ~/apps folder
2. ✅ Cloned Clean-Clode repo
3. → Run `bash deploy.sh`
4. → Test at `https://cleanclode.anothershadeofgrey.com`

---

## Support

If you encounter issues:

1. **Check SSH connection:** `ssh root@95.217.9.84`
2. **Verify Docker:** `docker --version`
3. **Check permissions:** `ls -la ~/apps`
4. **View logs:** `docker logs -f cleanclode-v2`

For deployment questions, refer to `QUICK_START.md` or `DEPLOYMENT.md`.
