# 🛠️ Environment Setup Guide

## 📋 Prerequisites Installation

### 1. Install Node.js & npm

**Windows:**
1. Download dari [nodejs.org](https://nodejs.org)
2. Install Node.js LTS version
3. Restart terminal/PowerShell
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

**Alternative (Windows):**
```bash
# Install via Chocolatey
choco install nodejs

# Install via Winget
winget install OpenJS.NodeJS
```

### 2. Install Git

**Windows:**
1. Download dari [git-scm.com](https://git-scm.com)
2. Install dengan default settings
3. Verify installation:
   ```bash
   git --version
   ```

**Alternative (Windows):**
```bash
# Install via Chocolatey
choco install git

# Install via Winget
winget install Git.Git
```

### 3. Install Code Editor (Optional)

**VS Code (Recommended):**
1. Download dari [code.visualstudio.com](https://code.visualstudio.com)
2. Install dengan default settings
3. Install extensions:
   - TypeScript and JavaScript Language Features
   - Tailwind CSS IntelliSense
   - Prisma
   - GitLens

## 🔧 Project Setup

### 1. Clone/Setup Project

```bash
# Jika sudah ada project
cd "D:\Kuliah\RPL\jmt_archery - Copy"

# Initialize git (jika belum)
git init

# Add files
git add .

# Commit
git commit -m "Initial commit"
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Prisma CLI globally (optional)
npm install -g prisma
```

### 3. Setup Environment

```bash
# Copy environment template
copy env.example .env.local

# Edit .env.local dengan credentials Anda
notepad .env.local
```

### 4. Test Local Build

```bash
# Generate Prisma client
npx prisma generate

# Build project
npm run build

# Test production build
npm start
```

## 🚨 Troubleshooting

### Node.js not found
```bash
# Check if Node.js is in PATH
echo $env:PATH

# Add Node.js to PATH manually if needed
# Usually: C:\Program Files\nodejs\
```

### npm not found
```bash
# Reinstall Node.js
# Node.js installer includes npm
```

### Permission errors
```bash
# Run PowerShell as Administrator
# Or use:
npm install --no-optional
```

### Build errors
```bash
# Clear cache
npm cache clean --force

# Delete node_modules and reinstall
rmdir /s node_modules
del package-lock.json
npm install
```

## ✅ Verification Checklist

- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] Dependencies installed (`npm install` successful)
- [ ] Environment file created (`.env.local`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Build successful (`npm run build`)
- [ ] Local server running (`npm run dev`)

## 🎯 Next Steps

Setelah environment setup selesai:

1. **Setup Accounts:**
   - [setup.md](./setup.md) - Setup akun hosting dan database

2. **Deploy:**
   - [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - Deployment cepat
   - [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Panduan lengkap

## 📞 Support

Jika ada masalah dengan setup:

1. **Check Node.js version compatibility**
   - Next.js 15 requires Node.js 18.17+
   - Check: `node --version`

2. **Check Windows compatibility**
   - Use PowerShell or Command Prompt
   - Run as Administrator if needed

3. **Common Windows issues:**
   - PATH environment variable
   - Antivirus blocking npm
   - Windows Defender blocking scripts 