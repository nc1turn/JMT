import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    // Cek apakah user sudah ada
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Simpan user baru
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
      },
    });

    // Log aktivitas registrasi sebagai SIGNIN pertama kali
    await prisma.userLogin.create({
      data: {
        userId: user.id,
        activity: "SIGNIN",
        // ipAddress dan userAgent bisa diisi jika tersedia dari req.headers
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}