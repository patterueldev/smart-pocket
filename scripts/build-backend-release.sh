#!/bin/bash
set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="${REGISTRY:-ghcr.io}"
OWNER="${OWNER:-patterueldev}"
REPO="${REPO:-smart-pocket}"
VERSION="${VERSION:-latest}"
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Help message
show_help() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

Build and push Smart Pocket Backend release Docker image to GHCR.

OPTIONS:
  -v, --version VERSION   Docker image version tag (default: latest)
  -r, --registry REGISTRY Container registry (default: ghcr.io)
  -o, --owner OWNER       Registry owner (default: patterueldev)
  -n, --repo REPO         Repository name (default: smart-pocket)
  --no-push               Build only, don't push to registry
  --dry-run               Show commands without executing
  -h, --help              Show this help message

ENVIRONMENT VARIABLES:
  REGISTRY    Override default registry
  OWNER       Override default owner
  REPO        Override default repository name
  VERSION     Override default version tag

EXAMPLES:
  # Build and push with custom version
  $(basename "$0") --version v1.0.0

  # Build only without pushing
  $(basename "$0") --no-push

  # Dry run to see what would happen
  $(basename "$0") --dry-run

  # Using environment variables
  VERSION=v2.0.0 OWNER=myorg $(basename "$0")

EOF
}

# Parse arguments
NO_PUSH=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        -o|--owner)
            OWNER="$2"
            shift 2
            ;;
        -n|--repo)
            REPO="$2"
            shift 2
            ;;
        --no-push)
            NO_PUSH=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Image name
IMAGE="${REGISTRY}/${OWNER}/${REPO}-backend"

# Print configuration
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Smart Pocket Backend Release Builder${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Registry:     ${YELLOW}${REGISTRY}${NC}"
echo -e "Owner:        ${YELLOW}${OWNER}${NC}"
echo -e "Repository:   ${YELLOW}${REPO}${NC}"
echo -e "Service:      ${YELLOW}Backend${NC}"
echo -e "Version:      ${YELLOW}${VERSION}${NC}"
echo -e "Image:        ${YELLOW}${IMAGE}:${VERSION}${NC}"
echo -e "Build Date:   ${YELLOW}${BUILD_DATE}${NC}"
echo -e "Git SHA:      ${YELLOW}${GIT_SHA}${NC}"
if [ "$NO_PUSH" = true ]; then
    echo -e "Push:         ${YELLOW}Disabled${NC}"
fi
if [ "$DRY_RUN" = true ]; then
    echo -e "Mode:         ${YELLOW}DRY RUN${NC}"
fi
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: docker-compose.yml not found. Please run from project root.${NC}"
    exit 1
fi

# Build
echo -e "${BLUE}Building Backend image...${NC}"
BUILD_CMD="docker build \
  -f infrastructure/docker/Backend.release.dockerfile \
  -t ${IMAGE}:${VERSION} \
  -t ${IMAGE}:latest \
  --build-arg BUILD_DATE=${BUILD_DATE} \
  --build-arg GIT_SHA=${GIT_SHA} \
  apps/smart-pocket-backend"

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}[DRY RUN]${NC} ${BUILD_CMD}"
else
    if eval "${BUILD_CMD}"; then
        echo -e "${GREEN}✓ Built Backend successfully${NC}"
    else
        echo -e "${RED}✗ Failed to build Backend${NC}"
        exit 1
    fi
fi

echo ""

# Push
if [ "$NO_PUSH" = false ]; then
    echo -e "${BLUE}Pushing to ${REGISTRY}...${NC}"
    
    PUSH_VERSION_CMD="docker push ${IMAGE}:${VERSION}"
    PUSH_LATEST_CMD="docker push ${IMAGE}:latest"
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY RUN]${NC} ${PUSH_VERSION_CMD}"
        echo -e "${YELLOW}[DRY RUN]${NC} ${PUSH_LATEST_CMD}"
    else
        if eval "${PUSH_VERSION_CMD}"; then
            echo -e "${GREEN}✓ Pushed ${IMAGE}:${VERSION}${NC}"
        else
            echo -e "${RED}✗ Failed to push ${IMAGE}:${VERSION}${NC}"
            exit 1
        fi

        if eval "${PUSH_LATEST_CMD}"; then
            echo -e "${GREEN}✓ Pushed ${IMAGE}:latest${NC}"
        else
            echo -e "${RED}✗ Failed to push ${IMAGE}:latest${NC}"
            exit 1
        fi
    fi
    echo ""
fi

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}DRY RUN COMPLETE${NC}"
else
    if [ "$NO_PUSH" = true ]; then
        echo -e "${GREEN}✓ Build complete!${NC}"
        echo ""
        echo "To push the image to ${REGISTRY}, run:"
        echo -e "  ${GREEN}docker push ${IMAGE}:${VERSION}${NC}"
        echo -e "  ${GREEN}docker push ${IMAGE}:latest${NC}"
    else
        echo -e "${GREEN}✓ Build and push complete!${NC}"
        echo ""
        echo "Image available at:"
        echo -e "  ${GREEN}${IMAGE}:${VERSION}${NC}"
        echo -e "  ${GREEN}${IMAGE}:latest${NC}"
    fi
fi
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
