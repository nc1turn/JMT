import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_JANGAN_DIPUBLIKASIKAN";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Email tidak ditemukan" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    // Log aktivitas SIGNIN
    await prisma.userLogin.create({
      data: {
        userId: user.id,
        activity: "SIGNIN",
      },
    });

    // Buat JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" }); // 1 jam

    // Siapkan data user yang akan dikirim ke frontend
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      profilePic: user.profilePicture || "",
      // tambahkan field lain jika perlu
    };

    // Simpan token di HttpOnly cookie dan kirim data user ke frontend
    const response = NextResponse.json({ success: true, user: userData });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 jam
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}