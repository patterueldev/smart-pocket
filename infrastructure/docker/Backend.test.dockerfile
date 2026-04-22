FROM node:24-alpine
WORKDIR /app

# Set API keys for testing
ENV API_KEYS=test-api-key-12345,another-test-key-67890

# Copy configuration and package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY jest.config.js ./
COPY .env.example ./.env

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src
COPY __tests__ ./__tests__

# Run tests
CMD ["npm", "test"]

