# Development Dockerfile for Smart Pocket Frontend (Web)
# Runs the Vite frontend development server with hot reload support

FROM node:24-alpine

WORKDIR /app/frontend

# Copy package files
COPY apps/smart-pocket-web/package*.json ./
COPY apps/smart-pocket-web/tsconfig*.json ./
COPY apps/smart-pocket-web/.eslintrc.json ./
COPY apps/smart-pocket-web/.prettierrc ./
COPY apps/smart-pocket-web/vite.config.ts ./
COPY apps/smart-pocket-web/jest.config.cjs ./
COPY apps/smart-pocket-web/index.html ./

# Copy source code
COPY apps/smart-pocket-web/src ./src
COPY apps/smart-pocket-web/public ./public

# Install dependencies
RUN npm ci

# Expose frontend port
EXPOSE 5173

# Start frontend with hot reload
ENV NODE_ENV=development
ENV VITE_BASE_URL=/
CMD ["npm", "run", "dev"]
