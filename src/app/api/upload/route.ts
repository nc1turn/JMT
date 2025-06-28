import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic"; // agar Next.js tidak cache respons

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
  }

  // Batasi ukuran file (misal 2MB)
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Ukuran file maksimal 2MB" }, { status: 400 });
  }

  // Batasi ekstensi yang diizinkan
  const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!allowedExtensions.includes(ext)) {
    return NextResponse.json({ error: "Ekstensi gambar tidak didukung" }, { status: 400 });
  }

  // Buat direktori upload jika belum ada
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const fileName = `${uuidv4()}.${ext}`;
  const filePath = path.join(uploadDir, fileName);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await fs.writeFile(filePath, buffer);

  // Return url yang bisa dipakai di frontend
  const url = `/uploads/${fileName}`;
  return NextResponse.json({ url });
}