#!/bin/bash
# Mepco Retail Hub - 100% Offline Local Runner
# Zero Cloud Server Dependencies - Local MongoDB

echo "==================================================="
echo "  MEPCO RETAIL HUB - 100% OFFLINE LOCAL RUNNER"
echo "  Zero Cloud Server Dependencies - Local MongoDB"
echo "==================================================="
echo ""

export MONGODB_URI="mongodb://127.0.0.1:27017/smart_inventory"
export PORT="3000"
export NODE_ENV="development"

echo "[1/3] Target Database: $MONGODB_URI (Local MongoDB Compass)"
echo "[2/3] Checking dependencies..."

if [ ! -d "node_modules" ]; then
  echo "Installing local packages..."
  npm install
fi

echo ""
echo "[3/3] Starting local offline server on http://localhost:3000..."
echo "All tasks operate 100% offline with zero cloud server requirements."
echo "Open your browser at: http://localhost:3000"
echo "In MongoDB Compass, connect to: mongodb://localhost:27017"
echo ""

npm run offline
