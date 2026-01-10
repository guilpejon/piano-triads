#!/bin/bash

# Piano Triads Manual Deploy Script
# Usage: ./deploy.sh [raspberry-pi-host]
# Example: ./deploy.sh
# Example: ./deploy.sh raspberrypi
# Example: ./deploy.sh guilpejon@raspberrypi
#
# Note: Deployments happen automatically via GitHub Actions when pushing to main.
# This script is for manual deployments when needed.

set -e

PI_HOST=${1:-raspberrypi}

# Parse the host to handle both formats
if [[ "$PI_HOST" == *"@"* ]]; then
    SSH_TARGET="$PI_HOST"
else
    SSH_TARGET="guilpejon@$PI_HOST"
fi

echo "Deploying Piano Triads to Raspberry Pi..."
echo "Target: $SSH_TARGET"

ssh "$SSH_TARGET" << 'EOF'
    cd /var/www/piano-triads

    echo "Pulling latest image from GHCR..."
    docker pull ghcr.io/guilpejon/piano-triads:latest

    echo "Restarting container..."
    docker compose -f docker-compose.prod.yml down
    docker compose -f docker-compose.prod.yml up -d

    echo "Cleaning up old images..."
    docker image prune -f

    sleep 3
    if docker compose -f docker-compose.prod.yml ps | grep -q "running"; then
        echo "Deployment successful!"
        docker compose -f docker-compose.prod.yml ps
    else
        echo "Deployment failed!"
        docker compose -f docker-compose.prod.yml logs --tail=50
        exit 1
    fi
EOF

echo ""
echo "Done! Your app should now be running with the latest image."
