# Deploy Piano Triads to Raspberry Pi with Cloudflare Tunnel

This guide will help you deploy your Piano Triads application to a Raspberry Pi using Cloudflare Tunnel.

### Initial System Setup

SSH into your Raspberry Pi:

```bash
ssh guilpejon@raspberrypi.local
```

Update the system and install essential packages:

```bash
# Update package lists and upgrade system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y \
    curl \
    wget \
    git \
    ufw 

# Clean up
sudo apt autoremove -y
```

On the Pi, disable password authentication for better security:

```bash
sudo vi /etc/ssh/sshd_config
```

Find and modify these lines:

```
PasswordAuthentication no
PubkeyAuthentication yes
```

Restart SSH service:

```bash
sudo systemctl restart ssh
```

### Configure Basic Firewall

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS (for Cloudflare Tunnel)
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status
```

### Install Node.js

Install Node.js using NodeSource repository:

```bash
# Add NodeSource repository for latest LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -

# Install Node.js
sudo apt-get install nodejs -y

# Verify installation
node --version
npm --version
```

### Create Application Directory

```bash
# Create directory for the app
sudo mkdir -p /var/www/piano-triads
sudo chown guilpejon:guilpejon /var/www/piano-triads
```

## Step 3: Build Locally and Deploy to Pi

### Build on Your Development Machine

```bash
# On your development machine (where Vite works)
npm run build    # Build with @sveltejs/adapter-node

# This creates the production server in the build/ directory:
# - build/index.js (standalone server)
# - build/handler.js (for custom servers) 
# - build/client/ (static assets)
# - build/server/ (server components)
```

### Transfer Built Files to Pi

```bash
# Transfer the built application to Pi
scp -r build/ guilpejon@raspberrypi.local:/var/www/piano-triads/
```

### Set Up Dependencies on Pi

```bash
# SSH into your Pi
ssh guilpejon@raspberrypi.local

# Navigate to app directory
cd /var/www/piano-triads
```

### Testing the build locally (optional)

Before deploying, you can test the production build on your Raspberry Pi:

```bash
# Set environment variables (optional - defaults work fine)
export PORT=3000
export NODE_ENV=production
export HOST=0.0.0.0

# Temporary allow connections to por 3000
sudo ufw allow 3000

# Run the production server (adapter-node way)
node build
 
# Remember to block port 3000 again after the test
sudo ufw deny 3000
```

Visit `http://raspberrypi.local:3000` to verify everything works correctly.

## Step 4: Install and Configure Cloudflare Tunnel

### Install cloudflared

```bash
# For Pi 4 (ARM64):
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared-linux-arm64.deb

# Verify installation
cloudflared --version
```

### Authenticate with Cloudflare

```bash
# This will open a browser window for authentication
cloudflared tunnel login
```

### Create a tunnel

```bash
# Create a new tunnel (replace 'piano-triads' with your preferred name)
cloudflared tunnel create piano-triads

# Note the tunnel ID that's generated - you'll need it
```

### Configure the tunnel

Create a configuration file:

```bash
sudo mkdir -p /etc/cloudflared
sudo vi /etc/cloudflared/config.yml
```

Add the following content (replace values with your actual details):

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/guilpejon/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: pianotriads.com
    service: http://localhost:3000
  - hostname: www.pianotriads.com
    service: http://localhost:3000
  - service: http_status:404
```

## Step 5: Set up DNS

In your Cloudflare dashboard:

1. Go to DNS settings for your domain
2. Add a CNAME record:
   - Name: `piano-triads`
   - Target: `YOUR_TUNNEL_ID.cfargotunnel.com`
   - Proxy status: Proxied (orange cloud)
3. Repeat for more subdomains like www.piano-triads

## Step 6: Create Application Start Script

Create a script to start your SvelteKit app:

```bash
vi /var/www/piano-triads/start-app.sh
```

Add the following content:

```bash
#!/bin/bash
cd /var/www/piano-triads
export NODE_ENV=production
export PORT=3000
export HOST=0.0.0.0
node build
```

Make it executable:

```bash
chmod +x /var/www/piano-triads/start-app.sh
```

## Step 7: Create Systemd Services

### Create service for the app

```bash
sudo vi /etc/systemd/system/piano-triads.service
```

Add:

```ini
[Unit]
Description=Piano Triads Web Application
After=network.target

[Service]
Type=simple
User=guilpejon
WorkingDirectory=/var/www/piano-triads
ExecStart=/var/www/piano-triads/start-app.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Create service for Cloudflare Tunnel

```bash
sudo vi /etc/systemd/system/cloudflared.service
```

Add:

```ini
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=guilpejon
ExecStart=/usr/local/bin/cloudflared tunnel --config /etc/cloudflared/config.yml run
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## Step 8: Enable and Start Services

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable services to start on boot
sudo systemctl enable piano-triads
sudo systemctl enable cloudflared

# Start services
sudo systemctl start piano-triads
sudo systemctl start cloudflared

# Check status
sudo systemctl status piano-triads
sudo systemctl status cloudflared
```

## Troubleshooting

### Check logs

```bash
# App logs
sudo journalctl -u piano-triads -f

# Cloudflare tunnel logs
sudo journalctl -u cloudflared -f
```
## Updating Your Application

### Method 1: Build Locally and Transfer (Recommended)

```bash
# On your development machine
git pull  # Get latest code
npm run build  # Build new version with adapter-node

# Transfer updated files to Pi
scp -r build/ guilpejon@raspberrypi.local:/var/www/piano-triads/

# On Pi, restart the service
ssh guilpejon@raspberrypi.local << 'EOF'
sudo systemctl restart piano-triads
EOF
```

### Method 2: Using Deploy Script (Easiest)

```bash
# On your development machine
./deploy.sh raspberrypi.local piano-triads.com
```

This automatically builds locally and deploys to your Pi.