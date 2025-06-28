# 🚀 Panduan Deployment JMT Archery Website

## Opsi Deployment yang Direkomendasikan

### 1. Vercel + PlanetScale (Rekomendasi Utama)

#### Langkah 1: Persiapan Database
1. **Daftar di PlanetScale**
   - Kunjungi [planetscale.com](https://planetscale.com)
   - Buat akun gratis
   - Buat database baru

2. **Setup Database**
   ```bash
   # Install PlanetScale CLI
   npm install -g pscale
   
   # Login ke PlanetScale
   pscale auth login
   
   # Buat database
   pscale database create jmt-archery-db
   
   # Dapatkan connection string
   pscale connect jmt-archery-db --port 3309
   ```

3. **Update Environment Variables**
   Buat file `.env.local`:
   ```env
   DATABASE_URL="mysql://username:password@host:port/database"
   JWT_SECRET="your-secret-key-here"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-password"
   ```

#### Langkah 2: Deploy ke Vercel
1. **Push ke GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Setup Vercel**
   - Daftar di [vercel.com](https://vercel.com)
   - Import proyek dari GitHub
   - Setup environment variables di dashboard Vercel

3. **Environment Variables di Vercel**
   - `DATABASE_URL`: Connection string dari PlanetScale
   - `JWT_SECRET`: Secret key untuk JWT
   - `EMAIL_USER`: Email untuk nodemailer
   - `EMAIL_PASS`: Password email

4. **Deploy**
   - Vercel akan otomatis deploy setiap push ke main branch
   - Tunggu build selesai (biasanya 2-3 menit)

### 2. Railway (Alternatif Mudah)

#### Langkah 1: Setup Railway
1. Daftar di [railway.app](https://railway.app)
2. Buat proyek baru
3. Connect GitHub repository

#### Langkah 2: Setup Database
1. Tambahkan MySQL service
2. Railway akan otomatis generate connection string
3. Copy connection string ke environment variables

#### Langkah 3: Deploy
1. Railway akan otomatis detect Next.js
2. Setup environment variables
3. Deploy otomatis

## 🔧 Konfigurasi yang Diperlukan

### 1. Update next.config.ts
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Untuk deployment
  images: {
    domains: ['your-domain.com'], // Domain untuk upload gambar
  },
}

module.exports = nextConfig
```

### 2. Setup Prisma untuk Production
```bash
# Generate Prisma client
npx prisma generate

# Push schema ke database
npx prisma db push
```

### 3. Environment Variables yang Diperlukan
```env
# Database
DATABASE_URL="mysql://..."

# JWT
JWT_SECRET="your-secret-key"

# Email (untuk reset password)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Payment Gateway (jika ada)
PAYMENT_SECRET="payment-secret"
```

## 📁 File Upload Configuration

### Untuk Vercel
Karena Vercel tidak mendukung file upload permanen, gunakan:
1. **Cloudinary** - untuk image hosting
2. **AWS S3** - untuk file storage
3. **Upload.io** - untuk file upload service

### Setup Cloudinary
1. Daftar di [cloudinary.com](https://cloudinary.com)
2. Install package: `npm install cloudinary`
3. Update upload API untuk menggunakan Cloudinary

## 🔒 Security Considerations

### 1. Environment Variables
- Jangan commit `.env` files ke Git
- Gunakan environment variables di platform hosting

### 2. Database Security
- Gunakan connection pooling
- Setup proper database permissions
- Regular backups

### 3. API Security
- Rate limiting
- Input validation
- CORS configuration

## 📊 Monitoring & Analytics

### 1. Vercel Analytics
- Built-in analytics di Vercel
- Performance monitoring
- Error tracking

### 2. Database Monitoring
- PlanetScale: Built-in monitoring
- Railway: Built-in metrics

## 🚨 Troubleshooting

### Common Issues:
1. **Database Connection Error**
   - Cek DATABASE_URL format
   - Pastikan database accessible dari hosting

2. **Build Error**
   - Cek TypeScript errors
   - Pastikan semua dependencies terinstall

3. **Image Upload Error**
   - Setup proper image domains
   - Gunakan external image hosting

### Debug Commands:
```bash
# Test database connection
npx prisma db pull

# Check build locally
npm run build

# Test production build
npm start
```

## 📈 Scaling Considerations

### 1. Database Scaling
- PlanetScale: Auto-scaling
- Connection pooling
- Read replicas

### 2. Application Scaling
- Vercel: Auto-scaling
- Edge functions untuk global performance
- CDN untuk static assets

## 💰 Cost Estimation

### Vercel + PlanetScale (Monthly):
- Vercel Hobby: $0 (100GB bandwidth)
- PlanetScale Hobby: $0 (1GB storage)
- **Total: $0** (untuk traffic kecil)

### Railway (Monthly):
- Railway: $5 (basic plan)
- **Total: $5**

## 🎯 Next Steps

1. **Setup Domain** (Opsional)
   - Beli domain di Namecheap/GoDaddy
   - Setup DNS ke Vercel/Railway

2. **SSL Certificate**
   - Otomatis di Vercel/Railway
   - HTTPS enabled by default

3. **Backup Strategy**
   - Database backup otomatis
   - Code backup di GitHub

4. **Monitoring Setup**
   - Uptime monitoring
   - Error tracking
   - Performance monitoring 