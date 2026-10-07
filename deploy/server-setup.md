# Raspberry Pi server setup

The Pi is set up from [guilpejon/pi-infra](https://github.com/guilpejon/pi-infra), not by hand.
That repo owns everything on the host that is not this app's image:

- OS hardening, firewall, Docker, the Cloudflare Tunnel (`pianotriads.com`, `www.`, `ssh.`)
- **This app's production compose file**: `apps/piano-triads/docker-compose.prod.yml` in pi-infra,
  installed to `/var/www/piano-triads/docker-compose.prod.yml` by its `bootstrap.sh`.
  Change ports, memory limits or environment there, not here.

## What this repo still owns

- The image: `Dockerfile`, built for `linux/arm64` by `.github/workflows/deploy.yml` and pushed to
  `ghcr.io/guilpejon/piano-triads` (`latest` + commit SHA). The package is public, so the Pi pulls
  it without logging in.
- The deploy: on push to `main`, the workflow SSHes to the Pi through the tunnel
  (`SSH_HOSTNAME` secret = `ssh.pianotriads.com`) and runs, in `/var/www/piano-triads`:
  `docker compose -f docker-compose.prod.yml down && docker compose -f docker-compose.prod.yml up -d`.
- `deploy/deploy.sh`: the same deploy by hand.

## GitHub secrets

| Secret | Value |
| --- | --- |
| `SSH_PRIVATE_KEY` | Private half of the `github-actions-deploy` key (its public half is in pi-infra's `secrets/authorized_keys`) |
| `SSH_HOSTNAME` | `ssh.pianotriads.com` |

## Troubleshooting on the Pi

```bash
cd /var/www/piano-triads
docker compose -f docker-compose.prod.yml logs -f    # app logs
sudo journalctl -u cloudflared -f                    # tunnel logs
```
