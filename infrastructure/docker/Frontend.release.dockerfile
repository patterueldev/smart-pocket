# Release Dockerfile for Smart Pocket Frontend
# Optimized production build with nginx static server

FROM node:24-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# Runtime stage with nginx
FROM nginx:latest-alpine

# Copy built frontend from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Configure nginx for SPA routing
# All requests go to index.html (SPA routing), except static assets
RUN printf '%s\n' \
  'server {' \
  '    listen 80 default_server;' \
  '    server_name _;' \
  '    root /usr/share/nginx/html;' \
  '    index index.html;' \
  '    client_max_body_size 10M;' \
  '    ' \
  '    # SPA routing: route all requests to index.html except static assets' \
  '    location / {' \
  '        try_files $uri $uri/ /index.html;' \
  '    }' \
  '    ' \
  '    # Cache static assets with long TTL' \
  '    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {' \
  '        expires 1y;' \
  '        add_header Cache-Control "public, immutable";' \
  '    }' \
  '    ' \
  '    # Never cache index.html' \
  '    location = /index.html {' \
  '        add_header Cache-Control "no-cache, no-store, must-revalidate";' \
  '    }' \
  '}' > /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
