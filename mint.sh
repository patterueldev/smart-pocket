#!/bin/bash
# mint.sh - Deploys server as docker container to Mint server

set -e

# Load .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "🚀 Building Docker image..."
docker build -t $APP_NAME:latest .

echo "📦 Compressing and streaming image to Mint server..."
docker save $APP_NAME:latest | bzip2 | ssh $SERVER_USER@$SERVER_HOST "bunzip2 | docker load"

echo "🛑 Stopping old container..."
ssh $SERVER_USER@$SERVER_HOST "docker stop $APP_NAME || true && docker rm $APP_NAME || true"

echo "🚢 Starting new container..."
ssh $SERVER_USER@$SERVER_HOST "docker run -d --name $APP_NAME -p $PORT:8080 $APP_NAME:latest"

echo "✅ Deployment complete! Server is running at http://$SERVER_HOST:$PORT"