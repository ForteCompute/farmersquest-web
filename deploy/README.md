# Containerized dev deploy

Runs the FarmersQuest web app on the VM as a static single-page app served by nginx, mirroring how
the API ships and the existing sparq-web pattern. The browser calls the API directly, so the API base
URL is baked into the bundle at build time, not read at runtime.

## Image

- Name: `ghcr.io/fortecompute/fq-web`, tagged `:dev` and the commit SHA on every deploy.
- Built from the repo-root `Dockerfile`: a Node alpine build stage runs `npm ci` and `npm run build`,
  then an `nginx:alpine` runtime stage serves the `dist` output. No secrets are in the image.

## Build argument

The only build input is the API base URL. Nothing operational is hardcoded.

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://farmquest-api.dev.fortecompute.com \
  -t ghcr.io/fortecompute/fq-web:dev .
```

`VITE_API_BASE_URL` is set as an environment variable in the build stage so Vite bakes it into the
bundle. The app reads it through `src/services/config.ts` and fails fast at startup if it is missing.

## nginx

`deploy/nginx.conf` (copied into the runtime image) listens on 80 and:

- Serves the SPA with `try_files $uri $uri/ /index.html`, so deep links survive a refresh.
- Caches hashed assets under `/assets/` for a year and never caches `index.html`, so a new deploy is
  picked up immediately.
- Sets the same security headers as the API: `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`.

## How the deploy runs

`.github/workflows/deploy-dev.yml` triggers on a push to `develop` and on manual dispatch. It:

1. Runs the full CI gate (build, lint, secret scan, dependency scan) and only proceeds if it passes.
2. Builds the image with `--build-arg VITE_API_BASE_URL=https://farmquest-api.dev.fortecompute.com`
   and pushes `:dev` plus the commit SHA to GHCR using the built-in `GITHUB_TOKEN`.
3. SSHes to the VM (`DEV_SSH_HOST`, `DEV_SSH_USER`, `DEV_SSH_KEY` secrets) and, in `~/farmquest-dev`:

   ```bash
   docker compose -f docker-compose.dev.yml pull fq-web
   docker compose -f docker-compose.dev.yml up -d fq-web
   ```

## Host port and compose service

The `fq-web` service lives in the shared `~/farmquest-dev/docker-compose.dev.yml` on the VM, the same
project as `fq-api`. It publishes container port 80 on host port `3002`, and the VM nginx fronts it at
`farmquest.dev`. The service block is:

```yaml
fq-web:
  image: ghcr.io/fortecompute/fq-web:dev
  container_name: fq-web
  restart: unless-stopped
  ports:
    - '3002:80'
  networks: [fq-net]
```
