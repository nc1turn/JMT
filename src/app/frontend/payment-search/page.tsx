"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PaymentReceipt from "@/app/components/PaymentReceipt";

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
  order: {
    id: number;
    userId: number;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: any[];
  };
}

export default function PaymentSearchPage() {
  const [searchType, setSearchType] = useState<"transaction" | "order">("transaction");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginNotification, setShowLoginNotification] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const router = useRouter();

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

  const handleLoginRedirect = () => {
    // Set redirect URL for after login
    if (typeof window !== "undefined") {
      sessionStorage.setItem("redirectAfterLogin", "/frontend/payment-search");
    }
    router.push("/frontend/login");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      setError("Masukkan nilai pencarian");
      return;
    }

    setLoading(true);
    setError(null);
    setPayment(null);

    try {
      const response = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [searchType === "transaction" ? "transactionId" : "orderId"]: searchValue.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPayment(data.payment);
      } else {
        setError(data.error || "Pembayaran tidak ditemukan");
      }
    } catch (err: any) {
      setError("Gagal mencari pembayaran");
    } finally {
      setLoading(false);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
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
              Anda harus login terlebih dahulu untuk mencari status pembayaran.
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cek Status Pembayaran</h1>
          <p className="text-gray-600">Cari status pembayaran berdasarkan Transaction ID atau Order ID</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Pilih Jenis Pencarian:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="searchType"
                    value="transaction"
                    checked={searchType === "transaction"}
                    onChange={() => setSearchType("transaction")}
                    className="mr-2"
                  />
                  Transaction ID
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="searchType"
                    value="order"
                    checked={searchType === "order"}
                    onChange={() => setSearchType("order")}
                    className="mr-2"
                  />
                  Order ID
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {searchType === "transaction" ? "Transaction ID" : "Order ID"}:
              </label>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={`Masukkan ${searchType === "transaction" ? "Transaction ID" : "Order ID"}`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Mencari...
                </div>
              ) : (
                "Cari Pembayaran"
              )}
            </button>
          </form>
        </div>

        {payment && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b border-green-200">
              <h2 className="text-xl font-semibold text-green-900">Hasil Pencarian</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Informasi Pembayaran</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Transaction ID:</p>
                      <p className="font-mono text-sm font-semibold text-gray-900">
                        {payment.transactionId || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order ID:</p>
                      <p className="font-semibold text-gray-900">#{payment.orderId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Metode Pembayaran:</p>
                      <p className="font-medium text-gray-900">
                        {payment.method}
                        {payment.bank && ` - ${payment.bank.toUpperCase()}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Jumlah Pembayaran:</p>
                      <p className="font-semibold text-green-700">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status:</p>
                      <div className={`inline-flex px-2 py-1 rounded text-sm font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Informasi Order</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Total Order:</p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(payment.order.totalAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status Order:</p>
                      <div className={`inline-flex px-2 py-1 rounded text-sm font-medium ${getStatusColor(payment.order.status)}`}>
                        {getStatusText(payment.order.status)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Order:</p>
                      <p className="text-sm text-gray-900">{formatDate(payment.order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Pembayaran:</p>
                      <p className="text-sm text-gray-900">
                        {payment.paidAt ? formatDate(payment.paidAt) : "-"}
                      </p>
                    </div>
                    {payment.verificationCode && (
                      <div>
                        <p className="text-sm text-gray-600">Kode Verifikasi:</p>
                        <p className="font-mono text-sm font-semibold text-gray-900">
                          {payment.verificationCode}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowReceipt(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    Lihat Receipt
                  </button>
                  <button
                    onClick={() => router.push("/frontend/order-history")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    Lihat Riwayat Order
                  </button>
                  <button
                    onClick={() => {
                      setPayment(null);
                      setSearchValue("");
                      setError(null);
                    }}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition"
                  >
                    Cari Lagi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {showReceipt && payment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Payment Receipt</h3>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <PaymentReceipt
                  payment={payment}
                  order={payment.order}
                  user={payment.order.items[0].product.user}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 