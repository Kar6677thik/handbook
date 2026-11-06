# Stage 1: build the static site.
# .git is copied in on purpose: Starlight's "Last updated" dates come from git history.
FROM node:22-alpine@sha256:0e1754758c2df4cfa3e68d59e2e1b7374bb7fd9ea6328eaaacf15cc934af8202 AS build
RUN apk add --no-cache git
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN git config --global --add safe.directory /app && npm run build

# Stage 2: serve dist/ with nginx.
# Orbit's catalog runs the container as non-root with a read-only root filesystem;
# only /tmp is writable. deploy/nginx.conf keeps the pid file and every temp dir in /tmp.
FROM nginxinc/nginx-unprivileged:1.29-alpine@sha256:0c79d56aee561a1d81c63f00eee5fb5fe29279560cdc55e91425133104c7fbe6
COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
USER 101
EXPOSE 8080
