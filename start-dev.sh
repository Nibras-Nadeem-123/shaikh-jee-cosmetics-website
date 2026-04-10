#!/bin/bash

# Shaikh Jee Cosmetics - Development Startup Script

echo "🚀 Starting Shaikh Jee Cosmetics Development Servers..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version:$(node --version)${NC}"

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Kill existing processes
echo "📋 Cleaning up existing processes..."
pkill -f "node.*server.js" 2>/dev/null
pkill -f "next.*dev" 2>/dev/null
sleep 1

# Start Backend
echo ""
echo "🔧 Starting Backend Server..."
cd "$(dirname "$0")/server"

if check_port 5000; then
    echo -e "${YELLOW}⚠️  Port 5000 is already in use${NC}"
else
    echo "📂 Working directory: $(pwd)"
    nohup node server.js > backend.log 2>&1 &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend started with PID: $BACKEND_PID${NC}"
    
    # Wait for backend to start
    echo "⏳ Waiting for backend to initialize..."
    for i in {1..10}; do
        if curl -s http://localhost:5000/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend is ready!${NC}"
            break
        fi
        if [ $i -eq 10 ]; then
            echo -e "${YELLOW}⚠️  Backend may not have started properly. Check server/backend.log${NC}"
        fi
        sleep 1
    done
fi

cd ..

# Start Frontend
echo ""
echo "🎨 Starting Frontend Server..."

if check_port 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use${NC}"
else
    npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend started with PID: $FRONTEND_PID${NC}"
    
    # Wait for frontend to start
    echo "⏳ Waiting for frontend to initialize..."
    for i in {1..15}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Frontend is ready!${NC}"
            break
        fi
        if [ $i -eq 15 ]; then
            echo -e "${YELLOW}⚠️  Frontend may not have started properly. Check frontend.log${NC}"
        fi
        sleep 1
    done
fi

echo ""
echo "========================================"
echo -e "${GREEN}✅ All servers started!${NC}"
echo ""
echo "📍 Backend API:  http://localhost:5000"
echo "📍 Frontend:     http://localhost:3000"
echo ""
echo "📝 Logs:"
echo "   Backend:  server/backend.log"
echo "   Frontend: frontend.log"
echo ""
echo "🛑 To stop servers:"
echo "   pkill -f 'node.*server.js'"
echo "   pkill -f 'next.*dev'"
echo "========================================"
echo ""

# Keep script running
wait
