import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentGateway, PaymentVerification } from "@/lib/payment-gateway";

export async function POST(req: Request) {
  try {
    const { transactionId, verificationCode } = await req.json();

    if (!transactionId || !verificationCode) {
      return NextResponse.json(
        { error: "Transaction ID dan kode verifikasi diperlukan" },
        { status: 400 }
      );
    }

    // Find payment in database
    const payment = await prisma.payment.findUnique({
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

    if (!payment) {
      return NextResponse.json({ error: "Pembayaran tidak ditemukan" }, { status: 404 });
    }

    // Check if payment is already verified
    if (payment.status === "success") {
      return NextResponse.json({ 
        success: true, 
        message: "Pembayaran sudah diverifikasi sebelumnya",
        payment: {
          ...payment,
          gatewayResponse: payment.gatewayResponse ? JSON.parse(payment.gatewayResponse) : null,
        }
      });
    }

    // Check if payment has expired
    if (payment.expiresAt && new Date() > payment.expiresAt) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "expired" },
      });
      return NextResponse.json({ error: "Pembayaran sudah kadaluarsa" }, { status: 400 });
    }

    // Verify payment through gateway
    const verification: PaymentVerification = {
      transactionId,
      verificationCode,
    };

    const gatewayResponse = await paymentGateway.verifyPayment(verification);

    // Update payment status in database
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: gatewayResponse.status,
        gatewayResponse: JSON.stringify(gatewayResponse.gatewayResponse),
        paidAt: gatewayResponse.status === "success" ? new Date() : null,
      },
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

    // Update order status if payment is successful
    if (gatewayResponse.status === "success") {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "paid" },
      });
    }

    return NextResponse.json({
      success: gatewayResponse.success,
      message: gatewayResponse.message,
      payment: {
        ...updatedPayment,
        gatewayResponse: gatewayResponse.gatewayResponse,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Gagal memverifikasi pembayaran" }, { status: 500 });
  }
} 