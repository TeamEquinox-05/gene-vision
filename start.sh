#!/bin/bash

# GeneVision - Start All Services Script
# This script starts RAG API, Image Backend, and Frontend in parallel

set -e  # Exit on error

PROJECT_ROOT="/home/uday0/code/gene-vision"
cd "$PROJECT_ROOT"

echo "=========================================="
echo "🚀 Starting GeneVision Services"
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
        echo -e "${YELLOW}⚠️  Port $port already in use. Killing existing process...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Kill existing services
echo -e "${BLUE}🧹 Cleaning up existing services...${NC}"
kill_port 8000 "RAG API"
kill_port 3001 "Image Backend"
kill_port 5173 "Frontend"
echo ""

# Start RAG API
echo -e "${BLUE}1️⃣  Starting RAG API (port 8000)...${NC}"
cd "$PROJECT_ROOT/rag-system"
nohup python3 -m uvicorn api.main:app --port 8000 > /tmp/rag-api.log 2>&1 &
RAG_PID=$!
echo -e "${GREEN}   ✅ RAG API started (PID: $RAG_PID)${NC}"
echo ""

# Start Image Backend
echo -e "${BLUE}2️⃣  Starting Image Backend (port 3001)...${NC}"
cd "$PROJECT_ROOT/backend"
nohup node server.js > server.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}   ✅ Image Backend started (PID: $BACKEND_PID)${NC}"
echo ""

# Start Frontend
echo -e "${BLUE}3️⃣  Starting Frontend (port 5173)...${NC}"
cd "$PROJECT_ROOT/frontend"
nohup npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}   ✅ Frontend started (PID: $FRONTEND_PID)${NC}"
echo ""

# Wait for services to start
echo -e "${BLUE}⏳ Waiting for services to initialize...${NC}"
sleep 5

# Health checks
echo ""
echo -e "${BLUE}🏥 Running health checks...${NC}"

# Check RAG API
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ RAG API is healthy${NC}"
else
    echo -e "${RED}   ❌ RAG API failed to start${NC}"
    echo -e "      Check logs: tail -f /tmp/rag-api.log"
fi

# Check Image Backend
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Image Backend is healthy${NC}"
else
    echo -e "${RED}   ❌ Image Backend failed to start${NC}"
    echo -e "      Check logs: tail -f $PROJECT_ROOT/backend/server.log"
fi

# Check Frontend
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Frontend is healthy${NC}"
else
    echo -e "${RED}   ❌ Frontend failed to start${NC}"
    echo -e "      Check logs: tail -f /tmp/frontend.log"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✨ GeneVision is ready!${NC}"
echo "=========================================="
echo ""
echo "📍 Service URLs:"
echo "   🌐 Frontend:      http://localhost:5173"
echo "   🧬 RAG API:       http://localhost:8000"
echo "   🎨 Image Backend: http://localhost:3001"
echo ""
echo "📊 API Docs:"
echo "   http://localhost:8000/docs (Swagger UI)"
echo ""
echo "📝 View Logs:"
echo "   RAG API:       tail -f /tmp/rag-api.log"
echo "   Image Backend: tail -f $PROJECT_ROOT/backend/server.log"
echo "   Frontend:      tail -f /tmp/frontend.log"
echo ""
echo "🛑 Stop All Services:"
echo "   bash $PROJECT_ROOT/stop.sh"
echo ""
echo "=========================================="
