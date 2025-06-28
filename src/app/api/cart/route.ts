import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, productId, quantity } = await req.json();

    // Pastikan semua data bertipe number dan valid
    if (
      typeof userId !== "number" ||
      typeof productId !== "number" ||
      typeof quantity !== "number" ||
      isNaN(userId) ||
      isNaN(productId) ||
      isNaN(quantity) ||
      quantity < 1
    ) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    // Cek apakah sudah ada di cart
    const existing = await prisma.cart.findFirst({
      where: { userId, productId },
    });

    let cartItem;
    if (existing) {
      cartItem = await prisma.cart.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      cartItem = await prisma.cart.create({
        data: { userId, productId, quantity },
      });
    }

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json({ error: "Gagal menambah ke cart" }, { status: 500 });
  }
}