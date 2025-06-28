import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    if (!name || name.trim() === "") {
      return NextResponse.json([]);
    }

    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: name.trim(),
        },
      },
      take: 10, // Limit to 10 results
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/product/search error:", error);
    return NextResponse.json({ error: "Gagal mencari produk" }, { status: 500 });
  }
} 