import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/user/login-history?userId=1
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = Number(searchParams.get("userId"));
    if (!userId) {
      return NextResponse.json({ error: "userId diperlukan" }, { status: 400 });
    }

    const history = await prisma.userLogin.findMany({
      where: { userId },
      orderBy: { loginTime: "desc" },
      take: 20,
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("GET /api/user/login-history error:", error);
    return NextResponse.json({ error: "Gagal mengambil riwayat login" }, { status: 500 });
  }
}