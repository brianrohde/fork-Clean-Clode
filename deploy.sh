#!/bin/bash
# Quick deployment script for Clean Clode on Hetzner VPS

set -e

echo "╔════════════════════════════════════════════════╗"
echo "║   Clean Clode Deployment Script                ║"
echo "║   Hetzner VPS + Traefik + Cloudflared         ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="cleanclode.anothershadeofgrey.com"
SERVICE_NAME="cleanclode"
NETWORK="n8n_network"

echo -e "${BLUE}[1/5]${NC} Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi
echo "✓ Docker found"

if ! docker network ls | grep -q $NETWORK; then
    echo "⚠ Network $NETWORK not found. Creating..."
    docker network create $NETWORK
fi
echo "✓ Network $NETWORK exists"

echo ""
echo -e "${BLUE}[2/5]${NC} Building Docker image..."
docker compose build
echo "✓ Build complete"

echo ""
echo -e "${BLUE}[3/5]${NC} Deploying container..."
docker compose up -d
echo "✓ Container deployed"

echo ""
echo -e "${BLUE}[4/5]${NC} Verifying deployment..."
sleep 2

if docker compose ps | grep -q "Up"; then
    echo "✓ Container is running"
else
    echo "❌ Container failed to start"
    docker compose logs
    exit 1
fi

echo ""
echo -e "${BLUE}[5/5]${NC} Checking Traefik routing..."
if docker logs traefik 2>/dev/null | grep -q "cleanclode"; then
    echo "✓ Traefik recognizes the service"
else
    echo "⚠ Traefik may still be configuring (check in 10 seconds)"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Deployment Complete! 🎉                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Access your app at:"
echo -e "${YELLOW}https://${DOMAIN}${NC}"
echo ""
echo "Useful commands:"
echo "  View logs:    docker logs -f $SERVICE_NAME"
echo "  Restart:      docker restart $SERVICE_NAME"
echo "  Status:       docker compose ps"
echo "  Down:         docker compose down"
echo ""
