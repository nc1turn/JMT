"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
}

interface Payment {
  id: number;
  orderId: number;
  amount: number;
  method: string;
  bank?: string;
  status: string;
  transactionId?: string;
  verificationCode?: string;
  paidAt?: string;
  expiresAt?: string;
  createdAt: string;
}

interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payments: Payment[];
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState<number | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginNotification, setShowLoginNotification] = useState(false);
  const router = useRouter();

  const userId = typeof window !== "undefined" ? Number(sessionStorage.getItem("userId") || 1) : 1;

  // Check login status on component mount
  useEffect(() => {
    const checkLoginStatus = () => {
      if (typeof window !== "undefined") {
        const isLoggedInSession = sessionStorage.getItem("isLoggedIn") === "true";
        const loginTime = sessionStorage.getItem("loginTime");
        
        if (isLoggedInSession && loginTime) {
          const now = Date.now();
          const loginTimestamp = parseInt(loginTime, 10);
          if (now - loginTimestamp > 3600000) {
            // Session expired
            sessionStorage.removeItem("isLoggedIn");
            sessionStorage.removeItem("loginTime");
            sessionStorage.removeItem("userId");
            setIsLoggedIn(false);
            setShowLoginNotification(true);
            return;
          }
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setShowLoginNotification(true);
        }
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/order?userId=${userId}`);
      if (!response.ok) {
        throw new Error("Gagal mengambil data order");
      }
      const data = await response.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    // Set redirect URL for after login
    if (typeof window !== "undefined") {
      sessionStorage.setItem("redirectAfterLogin", "/frontend/order-history");
    }
    router.push("/frontend/login");
  };

  const handleVerification = async (payment: Payment) => {
    if (!verificationCode.trim()) {
      setVerificationError("Masukkan kode verifikasi");
      return;
    }

    try {
      setVerifyingPayment(payment.id);
      setVerificationError(null);
      setVerificationSuccess(null);

      const response = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: payment.transactionId,
          verificationCode: verificationCode.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setVerificationSuccess(data.message);
        setVerificationCode("");
        setVerifyingPayment(null);
        // Refresh orders to get updated status
        setTimeout(() => {
          fetchOrders();
        }, 1000);
      } else {
        setVerificationError(data.error || "Verifikasi gagal");
      }
    } catch (err: any) {
      setVerificationError("Gagal memverifikasi pembayaran");
    } finally {
      setVerifyingPayment(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "processing":
        return "text-blue-600 bg-blue-100";
      case "paid":
      case "success":
        return "text-green-600 bg-green-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "expired":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Menunggu Pembayaran";
      case "processing":
        return "Sedang Diproses";
      case "paid":
      case "success":
        return "Lunas";
      case "failed":
        return "Gagal";
      case "expired":
        return "Kadaluarsa";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show login notification if not logged in
  if (showLoginNotification) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Diperlukan</h1>
            <p className="text-gray-600 mb-6">
              Anda harus login terlebih dahulu untuk melihat riwayat order Anda.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleLoginRedirect}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Login Sekarang
              </button>
              <button
                onClick={() => router.push("/frontend/marketplace")}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Kembali ke Marketplace
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat riwayat order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Riwayat Order</h1>
            <button
              onClick={() => router.push("/frontend/payment-search")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
            >
              Cek Status Pembayaran
            </button>
          </div>
          <p className="text-gray-600">Kelola dan pantau semua order Anda</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum ada order</h3>
            <p className="text-gray-600 mb-6">Mulai berbelanja untuk melihat riwayat order Anda</p>
            <button
              onClick={() => router.push("/frontend/marketplace")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </div>
                      <div className="text-lg font-bold text-green-700 mt-1">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(order.totalAmount)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Produk yang Dibeli:</h4>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.product.image || "/no-image.png"}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.product.name}</h5>
                          <p className="text-sm text-gray-600">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(item.price)} x {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Information */}
                {order.payments.length > 0 && (
                  <div className="px-6 pb-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Informasi Pembayaran:</h4>
                    {order.payments.map((payment) => (
                      <div key={payment.id} className="bg-blue-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Metode Pembayaran:</p>
                            <p className="font-medium text-gray-900">
                              {payment.method}
                              {payment.bank && ` - ${payment.bank.toUpperCase()}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Status Pembayaran:</p>
                            <div className={`inline-flex px-2 py-1 rounded text-sm font-medium ${getStatusColor(payment.status)}`}>
                              {getStatusText(payment.status)}
                            </div>
                          </div>
                          {payment.transactionId && (
                            <div>
                              <p className="text-sm text-gray-600">Transaction ID:</p>
                              <p className="font-mono text-sm text-gray-900">{payment.transactionId}</p>
                            </div>
                          )}
                          {payment.verificationCode && payment.status === "processing" && (
                            <div>
                              <p className="text-sm text-gray-600">Kode Verifikasi:</p>
                              <p className="font-mono text-sm text-gray-900">{payment.verificationCode}</p>
                            </div>
                          )}
                          {payment.paidAt && (
                            <div>
                              <p className="text-sm text-gray-600">Dibayar pada:</p>
                              <p className="text-sm text-gray-900">{formatDate(payment.paidAt)}</p>
                            </div>
                          )}
                        </div>

                        {/* Payment Verification */}
                        {payment.status === "processing" && payment.verificationCode && (
                          <div className="mt-4 pt-4 border-t border-blue-200">
                            <h5 className="font-medium text-gray-900 mb-3">Verifikasi Pembayaran:</h5>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Masukkan kode verifikasi"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                maxLength={6}
                              />
                              <button
                                onClick={() => handleVerification(payment)}
                                disabled={verifyingPayment === payment.id}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {verifyingPayment === payment.id ? "Memverifikasi..." : "Verifikasi"}
                              </button>
                            </div>
                            {verificationError && (
                              <p className="text-red-600 text-sm mt-2">{verificationError}</p>
                            )}
                            {verificationSuccess && (
                              <p className="text-green-600 text-sm mt-2">{verificationSuccess}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 