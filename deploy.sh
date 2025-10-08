#!/bin/bash

# Deployment script for InvestPro website

echo "Starting InvestPro website deployment..."

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Start the server
echo "Starting the server..."
node server.js &

# Wait a moment for the server to start
sleep 2

# Check if the server is running
if lsof -i :3000 > /dev/null; then
    echo "✅ Server is running successfully on http://localhost:3000"
    echo "📊 Admin Panel: http://localhost:3000/admin-dashboard.html"
    echo "🔐 Login: http://localhost:3000/login.html"
    echo ""
    echo "Admin Credentials:"
    echo "  Username: admin"
    echo "  Phone: 9999999999"
    echo "  Password: admin123"
    echo ""
    echo "To stop the server, run: pkill -f server.js"
else
    echo "❌ Server failed to start. Check for errors above."
    exit 1
fi