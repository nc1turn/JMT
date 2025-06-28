import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentGateway, PaymentRequest } from "@/lib/payment-gateway";

// POST: Process payment
export async function POST(req: Request) {
  try {
    const { orderId, amount, method, bank, userId } = await req.json();

    if (
      !orderId ||
      !amount ||
      typeof amount !== "number" ||
      amount <= 0 ||
      !method ||
      !userId
    ) {
      return NextResponse.json(
        { error: "Data pembayaran tidak lengkap atau tidak valid" },
        { status: 400 }
      );
    }

    // Check if order exists and status is still pending
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }
    
    if (order.status !== "pending") {
      return NextResponse.json({ error: "Order sudah dibayar atau dibatalkan" }, { status: 400 });
    }

    // Check if payment already exists for this order
    const existingPayment = await prisma.payment.findFirst({
      where: { orderId: Number(orderId) },
    });

    if (existingPayment) {
      return NextResponse.json({ error: "Pembayaran untuk order ini sudah ada" }, { status: 400 });
    }

    // Process payment through gateway
    const paymentRequest: PaymentRequest = {
      orderId: Number(orderId),
      amount: Number(amount),
      method,
      bank,
      userId: Number(userId),
    };

    const gatewayResponse = await paymentGateway.processPayment(paymentRequest);

    // Save payment to database
    const payment = await prisma.payment.create({
      data: {
        orderId: Number(orderId),
        amount: Number(amount),
        method,
        bank,
        status: gatewayResponse.status,
        transactionId: gatewayResponse.transactionId,
        gatewayResponse: JSON.stringify(gatewayResponse.gatewayResponse),
        verificationCode: gatewayResponse.verificationCode,
        expiresAt: gatewayResponse.expiresAt,
      },
    });

    // Update order status based on payment status
    if (gatewayResponse.status === "success") {
      await prisma.order.update({
        where: { id: Number(orderId) },
        data: { status: "paid" },
      });
    }

    return NextResponse.json({
      success: gatewayResponse.success,
      message: gatewayResponse.message,
      payment: {
        ...payment,
        gatewayResponse: gatewayResponse.gatewayResponse,
      },
      order: {
        id: order.id,
        totalAmount: order.totalAmount,
        status: order.status,
        items: order.items,
      },
    });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json({ error: "Gagal memproses pembayaran" }, { status: 500 });
  }
}

// GET: Get payment status
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("transactionId");
    const orderId = searchParams.get("orderId");

    if (!transactionId && !orderId) {
      return NextResponse.json({ error: "transactionId atau orderId diperlukan" }, { status: 400 });
    }

    let payment;
    if (transactionId) {
      payment = await prisma.payment.findUnique({
        where: { transactionId },
        include: {
          order: {
            include: {
              user: true,
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });
    } else {
      payment = await prisma.payment.findFirst({
        where: { orderId: Number(orderId) },
        include: {
          order: {
            include: {
              user: true,
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });
    }

    if (!payment) {
      return NextResponse.json({ error: "Pembayaran tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      payment: {
        ...payment,
        gatewayResponse: payment.gatewayResponse ? JSON.parse(payment.gatewayResponse) : null,
      },
    });
  } catch (error) {
    console.error("Payment status error:", error);
    return NextResponse.json({ error: "Gagal mengambil status pembayaran" }, { status: 500 });
  }
}