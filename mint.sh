#!/bin/bash
# mint.sh - Deploys server as docker container to Mint server

set -e

# Check for --dry-run argument
DRY_RUN=false
for arg in "$@"; do
  if [ "$arg" == "--dry-run" ]; then
    DRY_RUN=true
  fi
done

# Load .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "🚀 Building fat JAR..."
if [ "$DRY_RUN" = true ]; then
  echo "[DRY RUN] ./gradlew :server:shadowJar"
else
  ./gradlew :server:shadowJar
fi

echo "🐳 Building Docker image..."
if [ "$DRY_RUN" = true ]; then
  echo "[DRY RUN] docker buildx build --platform linux/amd64 -t $APP_NAME:latest ./server"
else
  docker buildx build --platform linux/amd64 -t $APP_NAME:latest ./server
fi

echo "🏷️  Tagging image for local registry..."
if [ "$DRY_RUN" = true ]; then
  echo "[DRY RUN] docker tag $APP_NAME:latest saturday.local:5000/$APP_NAME:latest"
else
  docker tag $APP_NAME:latest saturday.local:5000/$APP_NAME:latest
fi

echo "📤 Pushing image to local registry..."
if [ "$DRY_RUN" = true ]; then
  echo "[DRY RUN] docker push saturday.local:5000/$APP_NAME:latest"
else
  docker push saturday.local:5000/$APP_NAME:latest
fi

echo "🚀 Deploying on Mint server via registry-based workflow..."
SSH_CMD="ssh $SERVER_USER@$SERVER_HOST"
PULL_CMD="docker pull saturday.local:5000/$APP_NAME:latest"
STOP_RM_CMD="docker stop $APP_NAME || true && docker rm $APP_NAME || true"
RUN_CMD="docker run -d --network homeserver -p $PORT:8080 --name $APP_NAME saturday.local:5000/$APP_NAME:latest"

if [ "$DRY_RUN" = true ]; then
  echo "[DRY RUN] $SSH_CMD \"$PULL_CMD\""
  echo "[DRY RUN] $SSH_CMD \"$STOP_RM_CMD\""
  echo "[DRY RUN] $SSH_CMD \"$RUN_CMD\""
else
  $SSH_CMD "$PULL_CMD"
  $SSH_CMD "$STOP_RM_CMD"
  $SSH_CMD "$RUN_CMD"
fi

echo "✅ Deployed successfully! Running at http://$SERVER_HOST:$PORT"