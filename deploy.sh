#!/bin/bash

# Frontend Deployment Script for Render
echo "🚀 Starting frontend deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend_vite directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed. dist directory not found."
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Build output is in the 'dist' directory"
echo ""
echo "🌐 To deploy to Render:"
echo "1. Go to https://dashboard.render.com"
echo "2. Click 'New +' → 'Static Site'"
echo "3. Connect your GitHub repository"
echo "4. Set Root Directory to: apps/frontend_vite"
echo "5. Set Build Command to: npm install && npm run build"
echo "6. Set Publish Directory to: dist"
echo "7. Add environment variables from RENDER_DEPLOYMENT.md"
echo "8. Click 'Create Static Site'"
echo ""
echo "📋 Environment variables needed:"
echo "VITE_API_URL=http://localhost:4000"
echo "VITE_JWT_SECRET=dev-secret"
echo "VITE_DEMO_TENANT_ID=tenant_demo"
echo "VITE_DEMO_COMPANY_ID=seed-company-1"
