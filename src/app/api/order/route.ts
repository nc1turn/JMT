import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Ambil semua order beserta user dan produk (untuk admin) atau filter by userId
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const whereClause = userId ? { userId: Number(userId) } : {};

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Order GET error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data transaksi" },
      { status: 500 }
    );
  }
}

// POST: Buat order baru
export async function POST(req: Request) {
  try {
    const { userId, items, totalAmount } = await req.json();

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Data order tidak lengkap" },
        { status: 400 }
      );
    }

    // Buat order baru
    const order = await prisma.order.create({
      data: {
        userId: Number(userId),
        totalAmount: Number(totalAmount),
        status: "pending",
        items: {
          create: items.map((item: any) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity),
            price: Number(item.price),
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    // Kurangi stok produk
    for (const item of items) {
      await prisma.product.update({
        where: { id: Number(item.productId) },
        data: {
          stock: {
            decrement: Number(item.quantity),
          },
        },
      });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Order POST error:", error);
    return NextResponse.json(
      { error: "Gagal memproses order" },
      { status: 500 }
    );
  }
}