# Deploy Piano Triads to Raspberry Pi with Docker and Cloudflare Tunnel

This guide will help you deploy your Piano Triads application to a Raspberry Pi using Docker, GitHub Container Registry, and Cloudflare Tunnel.

## Overview

- **Docker image** is built on GitHub Actions and pushed to GHCR
- **Deployments** happen automatically when pushing to the `main` branch
- **Cloudflared** runs outside Docker to route traffic to multiple services on the Pi

## Step 1: Initial System Setup

SSH into your Raspberry Pi:

```bash
ssh guilpejon@raspberrypi
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
    ufw \
    vim

# Clean up
sudo apt autoremove -y
```

On the Pi, disable password authentication for better security:

```bash
sudo vim /etc/ssh/sshd_config
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

# Check status
sudo ufw status
```

Note: With Cloudflare Tunnel, you don't need to open ports 80 or 443 on the firewall.

## Step 2: Install Docker

Install Docker using the official convenience script:

```bash
# Download and run the Docker install script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to the docker group (to run docker without sudo)
sudo usermod -aG docker $USER

# Log out and back in for the group change to take effect
exit
```

SSH back in and verify Docker installation:

```bash
ssh guilpejon@raspberrypi

# Verify Docker is running
docker --version
docker compose version

# Test Docker works without sudo
docker run hello-world
```

## Step 3: Install and Configure Cloudflare Tunnel

Cloudflared runs outside Docker so it can route traffic to multiple services on the Pi.

### Install cloudflared

```bash
# For Raspberry Pi (ARM64)
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

### Create a Tunnel

```bash
# Create a new tunnel
cloudflared tunnel create raspberrypi

# Note the tunnel ID that's generated
```

### Configure the Tunnel

Create a configuration file:

```bash
sudo mkdir -p /etc/cloudflared
sudo vim /etc/cloudflared/config.yml
```

Add the following content (replace YOUR_TUNNEL_ID with your actual tunnel ID):

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/guilpejon/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: pianotriads.com
    service: http://localhost:3000
  - hostname: www.pianotriads.com
    service: http://localhost:3000
  # Add more hostnames for other services here
  - service: http_status:404
```

### Set Up DNS

In your Cloudflare dashboard:

1. Go to DNS settings for your domain
2. Add a CNAME record:
   - Name: `@` (or subdomain)
   - Target: `YOUR_TUNNEL_ID.cfargotunnel.com`
   - Proxy status: Proxied (orange cloud)

### Create Systemd Service for Cloudflared

```bash
sudo vim /etc/systemd/system/cloudflared.service
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

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
sudo systemctl status cloudflared
```

## Step 4: Configure SSH Access via Cloudflare

To allow GitHub Actions to deploy via SSH through Cloudflare Tunnel:

### Add SSH to the Tunnel Config

Update `/etc/cloudflared/config.yml` to include SSH:

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/guilpejon/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: pianotriads.com
    service: http://localhost:3000
  - hostname: www.pianotriads.com
    service: http://localhost:3000
  - hostname: ssh.pianotriads.com
    service: ssh://localhost:22
  - service: http_status:404
```

Add DNS record for SSH:

- Name: `ssh`
- Target: `YOUR_TUNNEL_ID.cfargotunnel.com`
- Proxy status: Proxied

Restart cloudflared:

```bash
sudo systemctl restart cloudflared
```

### Configure Cloudflare Access (Optional but Recommended)

In Cloudflare Zero Trust dashboard:

1. Go to **Access** > **Applications**
2. Create an application for `ssh.pianotriads.com`
3. Set up a service token for GitHub Actions

## Step 5: Set Up GitHub Repository

### Configure GitHub Secrets

In your GitHub repository, go to **Settings** > **Secrets and variables** > **Actions** and add:

- `SSH_PRIVATE_KEY`: Your private SSH key that can access the Pi
- `SSH_HOSTNAME`: Your SSH tunnel hostname (e.g., `ssh.pianotriads.com`)

### Make GHCR Package Public (Optional)

After the first deployment, go to your GitHub profile > **Packages** > **piano-triads** > **Package settings** and change visibility to public if you want the Pi to pull without authentication.

Otherwise, log in to GHCR on the Pi:

```bash
echo "YOUR_GITHUB_PAT" | docker login ghcr.io -u guilpejon --password-stdin
```

## Step 6: Initial Deployment

### Create Application Directory

```bash
ssh guilpejon@raspberrypi

# Create directory for the app
sudo mkdir -p /var/www/piano-triads
sudo chown guilpejon:guilpejon /var/www/piano-triads
```

### Copy Production Compose File

From your development machine:

```bash
scp docker-compose.prod.yml guilpejon@raspberrypi:/var/www/piano-triads/
```

### First Deploy

Push to the `main` branch to trigger the GitHub Actions workflow, or manually pull and start:

```bash
ssh guilpejon@raspberrypi
cd /var/www/piano-triads

# Pull the image
docker pull ghcr.io/guilpejon/piano-triads:latest

# Start the container
docker compose -f docker-compose.prod.yml up -d
```

## Automatic Deployments

After initial setup, deployments happen automatically:

1. Push code to `main` branch
2. GitHub Actions builds the Docker image for ARM64
3. Image is pushed to GitHub Container Registry
4. GitHub Actions SSHs into the Pi via Cloudflare Tunnel
5. Pi pulls the new image and restarts the container

## Troubleshooting

### Check App Logs

```bash
ssh guilpejon@raspberrypi
cd /var/www/piano-triads
docker compose -f docker-compose.prod.yml logs -f
```

### Check Cloudflare Tunnel Logs

```bash
sudo journalctl -u cloudflared -f
```

### Manually Pull and Restart

```bash
cd /var/www/piano-triads
docker pull ghcr.io/guilpejon/piano-triads:latest
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

### Check GitHub Actions

View the workflow runs at: `https://github.com/guilpejon/piano-triads/actions`

## Local Development

For local development and testing, use the regular `docker-compose.yml` which builds locally:

```bash
# Build and run locally
docker compose up --build

# Or use npm directly
npm run dev
```
