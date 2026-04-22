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
Usage: $(basename "$0") [OPTIONS] [TARGET]

Build and push Smart Pocket release Docker images to GHCR.

TARGET (optional):
  backend     Build and push backend image only
  frontend    Build and push frontend image only
  all         Build and push both (default)

OPTIONS:
  -v, --version VERSION   Docker image version tag (default: latest)
  -r, --registry REGISTRY Container registry (default: ghcr.io)
  -o, --owner OWNER       Registry owner (default: patterueldev)
  -n, --repo REPO         Repository name (default: smart-pocket)
  --dry-run               Show commands without executing
  -h, --help              Show this help message

ENVIRONMENT VARIABLES:
  REGISTRY    Override default registry
  OWNER       Override default owner
  REPO        Override default repository name
  VERSION     Override default version tag

EXAMPLES:
  # Build and push both with custom version
  $(basename "$0") --version v1.0.0 all

  # Build only backend with default settings
  $(basename "$0") backend

  # Dry run to see what would be built
  $(basename "$0") --dry-run all

  # Using environment variables
  VERSION=v2.0.0 OWNER=myorg $(basename "$0") all

EOF
}

# Parse arguments
TARGET="all"
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
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        backend|frontend|all)
            TARGET="$1"
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Image names
BACKEND_IMAGE="${REGISTRY}/${OWNER}/smart-pocket/backend"
FRONTEND_IMAGE="${REGISTRY}/${OWNER}/smart-pocket/frontend"

# Print configuration
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Smart Pocket Release Image Builder${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Registry:     ${YELLOW}${REGISTRY}${NC}"
echo -e "Owner:        ${YELLOW}${OWNER}${NC}"
echo -e "Repository:   ${YELLOW}${REPO}${NC}"
echo -e "Version:      ${YELLOW}${VERSION}${NC}"
echo -e "Target:       ${YELLOW}${TARGET}${NC}"
echo -e "Build Date:   ${YELLOW}${BUILD_DATE}${NC}"
echo -e "Git SHA:      ${YELLOW}${GIT_SHA}${NC}"
if [ "$DRY_RUN" = true ]; then
    echo -e "Mode:         ${YELLOW}DRY RUN (no changes)${NC}"
fi
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Function to build and push image
build_and_push() {
    local service=$1
    local dockerfile=$2
    local context=$3
    local image=$4

    echo -e "${BLUE}Building ${service}...${NC}"
    echo -e "  Dockerfile: ${YELLOW}${dockerfile}${NC}"
    echo -e "  Context:    ${YELLOW}${context}${NC}"
    echo -e "  Image:      ${YELLOW}${image}:${VERSION}${NC}"
    echo ""

    # Build command
    local build_cmd="docker build \
      -f ${dockerfile} \
      -t ${image}:${VERSION} \
      -t ${image}:latest \
      --build-arg BUILD_DATE=${BUILD_DATE} \
      --build-arg GIT_SHA=${GIT_SHA} \
      ${context}"

    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY RUN]${NC} ${build_cmd}"
    else
        if eval "${build_cmd}"; then
            echo -e "${GREEN}✓ Built ${service} successfully${NC}"
        else
            echo -e "${RED}✗ Failed to build ${service}${NC}"
            return 1
        fi
    fi

    # Push commands
    local push_version_cmd="docker push ${image}:${VERSION}"
    local push_latest_cmd="docker push ${image}:latest"

    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY RUN]${NC} ${push_version_cmd}"
        echo -e "${YELLOW}[DRY RUN]${NC} ${push_latest_cmd}"
    else
        echo -e "${BLUE}Pushing ${service} to ${REGISTRY}...${NC}"
        if eval "${push_version_cmd}"; then
            echo -e "${GREEN}✓ Pushed ${image}:${VERSION}${NC}"
        else
            echo -e "${RED}✗ Failed to push ${image}:${VERSION}${NC}"
            return 1
        fi

        if eval "${push_latest_cmd}"; then
            echo -e "${GREEN}✓ Pushed ${image}:latest${NC}"
        else
            echo -e "${RED}✗ Failed to push ${image}:latest${NC}"
            return 1
        fi
    fi

    echo ""
    return 0
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: docker-compose.yml not found. Please run from project root.${NC}"
    exit 1
fi

# Build and push based on target
if [ "$TARGET" = "backend" ] || [ "$TARGET" = "all" ]; then
    if ! build_and_push "Backend" \
        "infrastructure/docker/Backend.release.dockerfile" \
        "apps/smart-pocket-backend" \
        "${BACKEND_IMAGE}"; then
        exit 1
    fi
fi

if [ "$TARGET" = "frontend" ] || [ "$TARGET" = "all" ]; then
    if ! build_and_push "Frontend" \
        "infrastructure/docker/Frontend.release.dockerfile" \
        "apps/smart-pocket-web" \
        "${FRONTEND_IMAGE}"; then
        exit 1
    fi
fi

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}DRY RUN COMPLETE${NC}"
    echo ""
    echo -e "To build and push for real, run:"
    if [ "$TARGET" = "backend" ] || [ "$TARGET" = "all" ]; then
        echo -e "  ${GREEN}$(basename "$0") --version ${VERSION} backend${NC}"
    fi
    if [ "$TARGET" = "frontend" ] || [ "$TARGET" = "all" ]; then
        echo -e "  ${GREEN}$(basename "$0") --version ${VERSION} frontend${NC}"
    fi
else
    echo -e "${GREEN}✓ Build and push complete!${NC}"
    echo ""
    echo "Images ready:"
    if [ "$TARGET" = "backend" ] || [ "$TARGET" = "all" ]; then
        echo -e "  ${GREEN}${BACKEND_IMAGE}:${VERSION}${NC}"
        echo -e "  ${GREEN}${BACKEND_IMAGE}:latest${NC}"
    fi
    if [ "$TARGET" = "frontend" ] || [ "$TARGET" = "all" ]; then
        echo -e "  ${GREEN}${FRONTEND_IMAGE}:${VERSION}${NC}"
        echo -e "  ${GREEN}${FRONTEND_IMAGE}:latest${NC}"
    fi
fi
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
