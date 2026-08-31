# Lightsail — self-hosted runner (frontend)

GitHub sends jobs to `/var/www/actions-runner-frontend`. This repo is **Vite**. Production is the `dist/` folder served by nginx, not PM2.

## On the instance (once), as `admin`

```bash
# Node 20+ (the runner uses this to npm ci / npm run build)
node --version
npm --version

# App dir writable by the runner user
sudo mkdir -p /var/www/criclab-web-frontend
sudo chown -R admin:admin /var/www/criclab-web-frontend

# Confirm the runner is up
sudo systemctl status actions.runner.Techlio-Pvt-Ltd-criclab-web-frontend.ip-172-26-12-222.service
```

Nginx (after the backend workflow has synced `deploy/nginx-criclab.conf`, or copy from this repo’s `deploy/`):

```bash
sudo cp /var/www/criclab-web-backend/deploy/nginx-criclab.conf /etc/nginx/sites-available/criclab
sudo sed -i 's/SERVER_NAME/YOUR_IP_OR_DOMAIN/' /etc/nginx/sites-available/criclab
sudo ln -sf /etc/nginx/sites-available/criclab /etc/nginx/sites-enabled/criclab
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Do **not** `pm2 reload` the frontend. Updating files in `/var/www/criclab-web-frontend` is enough.

## From your laptop

Commit `.github/workflows/deploy.yml` and push `main`. Then GitHub → Actions → **Deploy Frontend**.

Watch the runner:

```bash
sudo journalctl -u actions.runner.Techlio-Pvt-Ltd-criclab-web-frontend.ip-172-26-12-222.service -f
```
