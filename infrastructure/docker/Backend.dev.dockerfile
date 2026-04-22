# Development Dockerfile for Smart Pocket Backend
# Runs the Express backend server with hot reload support via nodemon

FROM node:24-alpine

WORKDIR /app/backend

# Copy package files
COPY apps/smart-pocket-backend/package*.json ./
COPY apps/smart-pocket-backend/tsconfig.json ./
COPY apps/smart-pocket-backend/tsconfig.test.json ./
COPY apps/smart-pocket-backend/.prettierignore ./
COPY apps/smart-pocket-backend/.prettierrc.json ./
COPY apps/smart-pocket-backend/eslint.config.mjs ./
COPY apps/smart-pocket-backend/jest.config.js ./

# Copy source code
COPY apps/smart-pocket-backend/src ./src
COPY apps/smart-pocket-backend/__tests__ ./__tests__

# Install dependencies
RUN npm ci

# Expose backend port
EXPOSE 3000

# Start backend with hot reload
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]
