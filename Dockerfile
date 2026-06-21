# syntax=docker/dockerfile:1

# Build stage: install dependencies and produce the static bundle with Vite. The browser talks to the
# API directly, so the API base URL is baked into the bundle here at build time from a build argument.
# Node alpine, matching the engines range (>=20) in package.json.
FROM node:20-alpine AS build
WORKDIR /app

# Copy the manifest and lockfile first so the dependency layer is cached until they change.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and build. The only build input is the API base URL; nothing else is
# environment specific and no secret is needed to build the client.
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Runtime stage: serve the static bundle with nginx. No build tools and no secrets in the image, just
# the dist output and the SPA nginx config.
FROM nginx:alpine AS runtime

# Replace the default site with the SPA config: client-side routing, asset caching, security headers.
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# The built static files.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
