#!/bin/bash

# Piano Triads Update Script for Raspberry Pi
# Usage: ./deploy.sh <raspberry-pi-host>
# Example: ./deploy.sh raspberrypi.local
# Example: ./deploy.sh guilpejon@raspberrypi.local

set -e

PI_HOST=$1

if [ -z "$PI_HOST" ]; then
    echo "Usage: ./deploy.sh <raspberry-pi-host>"
    echo "Example: ./deploy.sh raspberrypi.local"
    echo "Example: ./deploy.sh guilpejon@raspberrypi.local"
    exit 1
fi

# Parse the host to handle both formats: "raspberrypi.local" and "user@raspberrypi.local"
if [[ "$PI_HOST" == *"@"* ]]; then
    # Already includes username
    SSH_TARGET="$PI_HOST"
else
    # Add default username
    SSH_TARGET="guilpejon@$PI_HOST"
fi

echo "🎹 Updating Piano Triads on Raspberry Pi..."
echo "📍 Target: $SSH_TARGET"

# Build the application locally
echo "🔨 Building latest version..."
npm run build    # Build with @sveltejs/adapter-node

# Transfer updated build to Raspberry Pi
echo "🚀 Transferring updated build..."
scp -r build/ $SSH_TARGET:/var/www/piano-triads/

# SSH into Pi and restart the service
echo "🔄 Restarting service on Raspberry Pi..."
ssh $SSH_TARGET << EOF
    # Restart the piano-triads service
    sudo systemctl restart piano-triads
    
    # Check if service started successfully
    sleep 2
    if sudo systemctl is-active piano-triads > /dev/null; then
        echo "✅ Service restarted successfully"
    else
        echo "❌ Service failed to start"
        sudo systemctl status piano-triads --no-pager
        exit 1
    fi
EOF

echo ""
echo "🎉 Update completed!"
echo "🌐 Your app should now be running with the latest changes"
echo ""
echo "📋 To check status:"
echo "   ssh $SSH_TARGET 'sudo systemctl status piano-triads'"