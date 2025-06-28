import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_JANGAN_DIPUBLIKASIKAN";

// Ambil data user dari JWT di cookie
async function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const userSession = await getUserFromRequest(req);
  if (!userSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ambil data user dari database
  const user = await prisma.user.findUnique({
    where: { id: userSession.id },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      phone: true,
      profilePicture: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: user.name,
    email: user.email,
    address: user.address,
    phone: user.phone,
    image: user.profilePicture ?? "", // Pastikan selalu string
  });
}

// Untuk update data user (termasuk foto profile)
export async function PUT(req: NextRequest) {
  const userSession = await getUserFromRequest(req);
  if (!userSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, email, address, phone, image } = body;

    // Validasi minimal
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      !name.trim() ||
      !email.trim()
    ) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    // Pastikan image selalu string (bukan null/undefined)
    const safeImage = typeof image === "string" ? image : "";

    const updated = await prisma.user.update({
      where: { id: userSession.id },
      data: {
        name: name.trim(),
        email: email.trim(),
        address: typeof address === "string" ? address : "",
        phone: typeof phone === "string" ? phone : "",
        profilePicture: safeImage,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        phone: true,
        profilePicture: true,
      },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      address: updated.address,
      phone: updated.phone,
      image: updated.profilePicture ?? "",
    });
  } catch (error) {
    // Log error detail ke server untuk debugging
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Gagal update data user" }, { status: 500 });
  }
}