import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Perbaikan: Gunakan async await pada context.params di semua handler agar konsisten
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    console.log("Params received:", params); // Debug log
    
    if (!params || !params.id) {
      return NextResponse.json({ error: "ID parameter tidak ditemukan" }, { status: 400 });
    }

    const { id } = params;
    
    // Validasi id
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID produk tidak valid" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("GET /api/product/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengambil produk" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    
    if (!params || !params.id) {
      return NextResponse.json({ error: "ID parameter tidak ditemukan" }, { status: 400 });
    }

    const { id } = params;
    
    // Validasi id
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID produk tidak valid" }, { status: 400 });
    }

    const data = await req.json();

    if (
      typeof data.name !== "string" ||
      typeof data.price !== "number" ||
      typeof data.stock !== "number" ||
      typeof data.image !== "string" ||
      !data.name.trim() ||
      data.price < 0 ||
      data.stock < 0 ||
      !data.image.trim()
    ) {
      return NextResponse.json({ error: "Field wajib tidak lengkap atau tidak valid" }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name: data.name.trim(),
        price: data.price,
        stock: data.stock,
        image: data.image.trim(),
        description: data.description ? String(data.description) : "",
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("PUT /api/product/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui produk" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    
    if (!params || !params.id) {
      return NextResponse.json({ error: "ID parameter tidak ditemukan" }, { status: 400 });
    }

    const { id } = params;
    
    // Validasi id
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID produk tidak valid" }, { status: 400 });
    }

    await prisma.product.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/product/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
}