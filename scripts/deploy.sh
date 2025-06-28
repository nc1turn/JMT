#!/bin/bash

echo "🚀 Starting deployment process..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "   Please create .env.local with your environment variables"
    echo "   Copy from env.example and update the values"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build the application
echo "🏗️  Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Push to GitHub: git push origin main"
    echo "2. Deploy to Vercel:"
    echo "   - Go to vercel.com"
    echo "   - Import your repository"
    echo "   - Add environment variables"
    echo "3. Or deploy to Railway:"
    echo "   - Go to railway.app"
    echo "   - Connect your repository"
    echo "   - Add MySQL service"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi 