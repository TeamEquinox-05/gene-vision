#!/bin/bash

# GeneVision - Stop All Services Script
# This script cleanly shuts down RAG API, Image Backend, and Frontend

PROJECT_ROOT="/home/uday0/code/gene-vision"
cd "$PROJECT_ROOT"

echo "=========================================="
echo "🛑 Stopping GeneVision Services"
echo "=========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local service=$2
    if check_port $port; then
        echo -e "${YELLOW}🔧 Stopping $service on port $port...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
        
        # Verify it stopped
        if check_port $port; then
            echo -e "${RED}❌ Failed to stop $service on port $port${NC}"
        else
            echo -e "${GREEN}✅ $service stopped successfully${NC}"
        fi
    else
        echo -e "${BLUE}ℹ️  $service (port $port) is not running${NC}"
    fi
}

# Stop all services
echo -e "${BLUE}🧹 Shutting down services...${NC}"
echo ""

kill_port 8000 "RAG API"
kill_port 3001 "Image Backend"
kill_port 5173 "Frontend"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ All services stopped${NC}"
echo "=========================================="
echo ""
echo "To start services again, run: ./start.sh"
echo ""
