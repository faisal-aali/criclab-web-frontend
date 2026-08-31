# Deploy frontend (self-hosted runner)

Push to `main`. The workflow:

1. `git pull` in `/var/www/criclab-web-frontend`
2. `npm ci`
3. `npm run lint`
4. `npm run build`
5. `pm2 restart criclab-frontend` if that process exists

`.env` / `.env.local` stay on the instance.
