import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

// Simpan kode reset sementara di memory (untuk demo, gunakan Redis/DB di production)
const resetCodes = new Map<string, string>();

// Fungsi kirim email kode reset
async function sendResetCodeEmail(to: string, code: string) {
  // Gunakan App Password Gmail, simpan di .env sebagai GMAIL_APP_PASSWORD
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "rafaputra1012@gmail.com",
      pass: process.env.GMAIL_APP_PASSWORD,
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
  try {
    const { contact } = await req.json();

    if (!contact) {
      return NextResponse.json({ error: "Email atau No HP wajib diisi" }, { status: 400 });
    }

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

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    resetCodes.set(contact, resetCode);

    // Kirim kode ke email jika contact adalah email
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
      message: "Kode reset dikirim ke email/no hp yang terdaftar",
      contact,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}