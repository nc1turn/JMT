# ⚡ Quick Deployment Guide

## 🚀 Deploy dalam 5 Menit

### Opsi 1: Vercel (Paling Mudah)

1. **Push ke GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy ke Vercel**
   - Buka [vercel.com](https://vercel.com)
   - Klik "New Project"
   - Import repository dari GitHub
   - Klik "Deploy"

3. **Setup Database (PlanetScale)**
   - Buka [planetscale.com](https://planetscale.com)
   - Buat database baru
   - Copy connection string
   - Paste ke Environment Variables di Vercel

4. **Setup Environment Variables di Vercel**
   ```
   DATABASE_URL=mysql://...
   JWT_SECRET=your-secret-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

### Opsi 2: Railway (All-in-One)

1. **Deploy ke Railway**
   - Buka [railway.app](https://railway.app)
   - Klik "New Project"
   - Connect GitHub repository
   - Railway akan auto-detect Next.js

2. **Add MySQL Database**
   - Klik "New Service"
   - Pilih "Database" → "MySQL"
   - Railway akan auto-setup connection

3. **Setup Environment Variables**
   - Railway akan auto-generate DATABASE_URL
   - Tambahkan JWT_SECRET dan EMAIL variables

## 🔧 Setup Database

### PlanetScale (Rekomendasi)
```bash
# Install CLI
npm install -g pscale

# Login
pscale auth login

# Create database
pscale database create jmt-archery

# Get connection string
pscale connect jmt-archery --port 3309
```

### Railway MySQL
- Otomatis setup saat add MySQL service
- Connection string tersedia di Environment Variables

## 📝 Environment Variables

Buat file `.env.local` dengan:
```env
DATABASE_URL="mysql://username:password@host:port/database"
JWT_SECRET="your-super-secret-key"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

## 🎯 Checklist Deployment

- [ ] Code pushed ke GitHub
- [ ] Database setup (PlanetScale/Railway)
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Domain accessible
- [ ] Database migrations run
- [ ] Test login/register
- [ ] Test upload image
- [ ] Test payment (jika ada)

## 🚨 Troubleshooting

### Build Error
```bash
npm run build
# Check error messages
```

### Database Connection Error
```bash
npx prisma db pull
# Check DATABASE_URL format
```

### Image Upload Error
- Setup Cloudinary atau AWS S3
- Update image domains di next.config.ts

## 📞 Support

Jika ada masalah:
1. Check error logs di platform hosting
2. Test locally dengan `npm run dev`
3. Verify environment variables
4. Check database connection

## 🎉 Success!

Setelah deploy berhasil:
- Website akan live di URL yang diberikan
- Auto-deploy setiap push ke main branch
- SSL certificate otomatis
- CDN global untuk performa 