# Development Dockerfile for Smart Pocket Backend
# Supports hot reload with nodemon and ts-node

FROM node:24-alpine

WORKDIR /app

# Install dependencies with legacy peer deps to handle TypeScript version conflicts
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server with hot reload
CMD ["npm", "run", "dev"]
