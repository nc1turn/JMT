import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_JANGAN_DIPUBLIKASIKAN";

export async function GET(req: Request) {
  const token = req.headers.get("cookie")?.split(";")
    .find(c => c.trim().startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    return NextResponse.json({ isLoggedIn: false }, { status: 401 });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    return NextResponse.json({ isLoggedIn: true, user });
  } catch (err) {
    return NextResponse.json({ isLoggedIn: false }, { status: 401 });
  }
}
