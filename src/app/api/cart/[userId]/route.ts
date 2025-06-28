import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Handler GET
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  const cartItems = await prisma.cart.findMany({
    where: { userId: Number(userId) },
    include: { product: true },
  });
  return NextResponse.json(cartItems);
}

// Handler PUT (update quantity)
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  const data = await req.json();

  if (
    typeof data.productId !== "number" ||
    typeof data.quantity !== "number" ||
    isNaN(data.productId) ||
    isNaN(data.quantity) ||
    data.quantity < 1
  ) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  try {
    const updated = await prisma.cart.updateMany({
      where: { userId: Number(userId), productId: data.productId },
      data: { quantity: data.quantity },
    });
    return NextResponse.json({ success: true, updated });
  } catch (error) {
    return NextResponse.json({ error: "Gagal update cart" }, { status: 500 });
  }
}

// Handler DELETE (hapus produk dari cart)
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  let productId: number | undefined;

  // Coba ambil productId dari query param atau body
  if (req.method === "DELETE") {
    // Cek query param
    const url = new URL(req.url);
    const pid = url.searchParams.get("productId");
    if (pid) {
      productId = Number(pid);
    } else {
      // Jika tidak ada di query, coba dari body
      try {
        const data = await req.json();
        if (typeof data.productId === "number") {
          productId = data.productId;
        }
      } catch {
        // ignore
      }
    }
  }

  if (!productId || isNaN(productId)) {
    return NextResponse.json({ error: "productId tidak valid" }, { status: 400 });
  }

  try {
    const deleted = await prisma.cart.deleteMany({
      where: { userId: Number(userId), productId: productId },
    });
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    return NextResponse.json({ error: "Gagal hapus produk dari cart" }, { status: 500 });
  }
}