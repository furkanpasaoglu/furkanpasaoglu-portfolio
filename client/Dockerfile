# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/dist /seed/
COPY nginx.conf /etc/nginx/conf.d/default.conf

# On every startup, refresh the built static bundle from the image into the
# shared volume. We wipe /assets and index.html so new build hashes fully
# replace old ones (previous behaviour only seeded on first boot, leaving
# stale CSS/JS in the volume after rebuilds). Server-rendered files like
# sitemap.xml live at the volume root and are preserved.
RUN printf '#!/bin/sh\nset -e\nrm -rf /usr/share/nginx/html/assets\nrm -f /usr/share/nginx/html/index.html /usr/share/nginx/html/50x.html\ncp -a /seed/. /usr/share/nginx/html/\nexec nginx -g "daemon off;"\n' > /docker-entrypoint-seed.sh \
    && chmod +x /docker-entrypoint-seed.sh

EXPOSE 80

CMD ["/docker-entrypoint-seed.sh"]
