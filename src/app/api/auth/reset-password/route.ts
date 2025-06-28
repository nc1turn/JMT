import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// Simpan kode reset sementara di memory (untuk demo, gunakan Redis/DB di production)
const resetCodes = new Map<string, string>();

// Fungsi kirim email kode reset
async function sendResetCodeEmail(to: string, code: string) {
  // Buat transporter Gmail (aktifkan "App Password" di akun Google untuk keamanan)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "rafaputra1012@gmail.com",
      pass: process.env.GMAIL_APP_PASSWORD, // simpan app password di .env
    },
  });

  await transporter.sendMail({
    from: '"JMT Archery" <rafaputra1012@gmail.com>',
    to,
    subject: "Kode Reset Password JMT Archery",
    text: `Kode reset password Anda: ${code}`,
    html: `<p>Kode reset password Anda: <b>${code}</b></p>`,
  });
}

export async function POST(req: Request) {
  const { contact, code, newPassword } = await req.json();

  // Step 1: Kirim kode reset ke email/no hp
  if (contact && !code && !newPassword) {
    // Cari user berdasarkan email atau no hp
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: contact },
          { phone: contact },
        ],
      },
    });
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // Generate kode reset 6 digit
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    resetCodes.set(contact, resetCode);

    // Kirim kode ke email (hanya jika contact adalah email)
    if (user.email === contact) {
      try {
        await sendResetCodeEmail(user.email, resetCode);
      } catch (err) {
        console.error("Gagal mengirim email:", err);
        return NextResponse.json({ error: "Gagal mengirim email reset" }, { status: 500 });
      }
    }

    // Untuk no hp, tambahkan integrasi SMS jika perlu

    return NextResponse.json({
      message: "Kode reset dikirim",
      // code: resetCode, // Jangan tampilkan kode di production!
      contact,
    });
  }

  // Step 2: Reset password dengan kode
  if (contact && code && newPassword) {
    const savedCode = resetCodes.get(contact);
    if (!savedCode || savedCode !== code) {
      return NextResponse.json({ error: "Kode reset salah atau kadaluarsa" }, { status: 400 });
    }

    // Hash password baru
    const hashed = await bcrypt.hash(newPassword, 10);

    // Update password user
    await prisma.user.updateMany({
      where: {
        OR: [
          { email: contact },
          { phone: contact },
        ],
      },
      data: { password: hashed },
    });

    // Hapus kode reset
    resetCodes.delete(contact);

    return NextResponse.json({ message: "Password berhasil direset" });
  }

  return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
}