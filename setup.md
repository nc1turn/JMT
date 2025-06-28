# 🛠️ Setup Awal untuk Deployment

## 📋 Prerequisites

Sebelum deploy, pastikan Anda memiliki:

- [ ] Akun GitHub
- [ ] Akun Vercel atau Railway
- [ ] Akun PlanetScale (untuk database)
- [ ] Akun Cloudinary (untuk image upload)
- [ ] Email Gmail (untuk nodemailer)

## 🚀 Langkah-langkah Setup

### 1. Setup GitHub Repository

```bash
# Initialize git (jika belum)
git init

# Add semua file
git add .

# Commit pertama
git commit -m "Initial commit"

# Buat repository di GitHub
# Kemudian push
git remote add origin https://github.com/username/jmt-archery.git
git push -u origin main
```

### 2. Setup Database (PlanetScale)

1. **Daftar di PlanetScale**
   - Buka [planetscale.com](https://planetscale.com)
   - Buat akun gratis
   - Buat database baru dengan nama `jmt-archery`

2. **Dapatkan Connection String**
   - Klik database yang dibuat
   - Klik "Connect"
   - Copy connection string
   - Format: `mysql://username:password@host:port/database`

### 3. Setup Cloudinary

1. **Daftar di Cloudinary**
   - Buka [cloudinary.com](https://cloudinary.com)
   - Buat akun gratis
   - Dapatkan credentials dari Dashboard

2. **Credentials yang diperlukan:**
   - Cloud Name
   - API Key
   - API Secret

### 4. Setup Email (Gmail)

1. **Enable 2-Factor Authentication**
   - Buka Google Account Settings
   - Enable 2FA

2. **Generate App Password**
   - Buka Security Settings
   - Generate App Password untuk "Mail"
   - Gunakan password ini di EMAIL_PASS

### 5. Generate JWT Secret

```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🔧 Environment Variables

Buat file `.env.local` dengan:

```env
# Database
DATABASE_URL="mysql://username:password@host:port/database"

# JWT
JWT_SECRET="generated-secret-key"

# Email
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## 🧪 Test Local

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Run development server
npm run dev
```

## ✅ Checklist Setup

- [ ] GitHub repository created
- [ ] Code pushed ke GitHub
- [ ] PlanetScale database setup
- [ ] Cloudinary account created
- [ ] Gmail app password generated
- [ ] JWT secret generated
- [ ] Environment variables configured
- [ ] Local test successful
- [ ] Database schema pushed

## 🎯 Next: Deploy

Setelah setup selesai, lanjut ke:
- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) untuk deployment cepat
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) untuk panduan lengkap 