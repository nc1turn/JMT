import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        image: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetch product:", error);
    return NextResponse.json({ error: "Gagal mengambil produk" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, price, stock, image, description } = data;

    // Validasi lebih ketat dan pastikan price, stock bertipe number
    if (
      typeof name !== "string" ||
      typeof price !== "number" ||
      typeof stock !== "number" ||
      typeof image !== "string" ||
      !name.trim() ||
      isNaN(price) ||
      isNaN(stock) ||
      price < 0 ||
      stock < 0 ||
      !image.trim()
    ) {
      return NextResponse.json(
        { error: "Field 'name', 'price', 'stock', dan 'image' wajib diisi dengan benar." },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        price,
        stock,
        image: image.trim(),
        description: description ? String(description) : "",
      },
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (err) {
    console.error("POST /api/product error:", err);
    return NextResponse.json({ error: "Gagal menyimpan produk" }, { status: 500 });
  }
}