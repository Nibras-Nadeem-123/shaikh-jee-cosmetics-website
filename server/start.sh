#!/bin/bash

echo "🚀 Starting Shaikh Jee Backend Server..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with MONGO_URI"
    exit 1
fi

# Start MongoDB (if using local MongoDB)
# Uncomment if you have local MongoDB
# echo "📦 Starting MongoDB..."
# sudo systemctl start mongod

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "🚀 Starting backend server..."
npm run dev
