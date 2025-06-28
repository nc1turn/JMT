"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const PAYMENT_METHODS = [
  { value: "dana", label: "DANA", icon: "💳" },
  { value: "gopay", label: "GoPay", icon: "📱" },
  { value: "shopeepay", label: "ShopeePay", icon: "🛒" },
  { value: "linkaja", label: "LinkAja", icon: "🔗" },
  { value: "debit", label: "Debit", icon: "💳" },
  { value: "transfer_bank", label: "Transfer Bank", icon: "🏦" },
  { value: "credit_card", label: "Kartu Kredit", icon: "💳" },
  { value: "debit_card", label: "Kartu Debit", icon: "💳" },
];

const BANKS = [
  { value: "bca", label: "BCA" },
  { value: "mandiri", label: "Mandiri" },
  { value: "bri", label: "BRI" },
  { value: "bni", label: "BNI" },
  { value: "bsi", label: "BSI" },
];

interface PaymentResponse {
  success: boolean;
  message: string;
  payment: {
    id: number;
    transactionId: string;
    status: string;
    verificationCode?: string;
    expiresAt?: string;
  };
  order: {
    id: number;
    totalAmount: number;
    status: string;
    items: any[];
  };
}

export default function PaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const router = useRouter();

  // Ambil userId dari session
  const userId =
    typeof window !== "undefined"
      ? Number(sessionStorage.getItem("userId") || 1)
      : 1;

  // Ambil data order dari sessionStorage (hasil order dari cart)
  useEffect(() => {
    const orderData = sessionStorage.getItem("lastOrder");
    if (orderData) {
      const parsed = JSON.parse(orderData);
      setOrderId(parsed.id);
      setTotal(parsed.totalAmount);
      setOrderItems(parsed.items || []);
    } else {
      setError(
        "Data order tidak ditemukan. Silakan order ulang dari keranjang."
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setPaymentResponse(null);
    setShowPaymentDetails(false);

    if (!selectedMethod) {
      setError("Pilih metode pembayaran terlebih dahulu.");
      return;
    }
    if (selectedMethod === "transfer_bank" && !selectedBank) {
      setError("Pilih bank untuk transfer.");
      return;
    }
    if (!total || total <= 0 || !orderId) {
      setError("Data pembayaran tidak valid.");
      return;
    }

    setIsLoading(true);
    try {
      // Simpan pembayaran ke database (tabel Payment)
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amount: total,
          method: selectedMethod,
          bank: selectedMethod === "transfer_bank" ? selectedBank : undefined,
          userId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal memproses pembayaran");
      }

      const data: PaymentResponse = await res.json();
      setPaymentResponse(data);
      setShowPaymentDetails(true);

      if (data.success) {
        setSuccess(data.message);
        // Clear session storage after successful payment initiation
        sessionStorage.removeItem("lastOrder");
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || "Gagal memproses pembayaran.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToHistory = () => {
    router.push("/frontend/order-history");
  };

  const formatExpiryTime = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    return expiryDate.toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentInstructions = (method: string, bank?: string) => {
    const instructions: { [key: string]: string } = {
      dana: "1. Buka aplikasi DANA\n2. Pilih menu 'Bayar'\n3. Scan QR Code atau masukkan nomor tujuan: +62 895-6013-77400\n4. Masukkan jumlah pembayaran\n5. Konfirmasi pembayaran",
      gopay: "1. Buka aplikasi GoPay\n2. Pilih menu 'Bayar'\n3. Scan QR Code atau masukkan nomor tujuan: +62 895-6013-77400\n4. Masukkan jumlah pembayaran\n5. Konfirmasi pembayaran",
      shopeepay: "1. Buka aplikasi ShopeePay\n2. Pilih menu 'Bayar'\n3. Scan QR Code atau masukkan nomor tujuan: +62 895-6013-77400\n4. Masukkan jumlah pembayaran\n5. Konfirmasi pembayaran",
      linkaja: "1. Buka aplikasi LinkAja\n2. Pilih menu 'Bayar'\n3. Scan QR Code atau masukkan nomor tujuan: +62 895-6013-77400\n4. Masukkan jumlah pembayaran\n5. Konfirmasi pembayaran",
      transfer_bank: `1. Buka aplikasi m-banking ${bank?.toUpperCase()}\n2. Pilih menu 'Transfer'\n3. Masukkan nomor rekening tujuan\n4. Masukkan jumlah transfer\n5. Konfirmasi transfer`,
      debit: "1. Masukkan kartu debit ke mesin EDC\n2. Masukkan PIN kartu\n3. Konfirmasi jumlah pembayaran\n4. Ambil struk pembayaran",
      credit_card: "1. Masukkan kartu kredit ke mesin EDC\n2. Masukkan PIN atau tanda tangan\n3. Konfirmasi jumlah pembayaran\n4. Ambil struk pembayaran",
      debit_card: "1. Masukkan kartu debit ke mesin EDC\n2. Masukkan PIN kartu\n3. Konfirmasi jumlah pembayaran\n4. Ambil struk pembayaran",
    };
    return instructions[method] || "Ikuti instruksi pembayaran yang muncul di layar.";
  };

  const getPaymentInfo = (method: string) => {
    const paymentInfo: { [key: string]: { qrCode?: string; accountNumber?: string; accountName?: string } } = {
      dana: {
        qrCode: "QR Code DANA akan ditampilkan di sini",
        accountNumber: "+62 895-6013-77400",
        accountName: "JMT Archery"
      },
      gopay: {
        qrCode: "QR Code GoPay akan ditampilkan di sini",
        accountNumber: "+62 895-6013-77400",
        accountName: "JMT Archery"
      },
      shopeepay: {
        qrCode: "QR Code ShopeePay akan ditampilkan di sini",
        accountNumber: "+62 895-6013-77400",
        accountName: "JMT Archery"
      },
      linkaja: {
        qrCode: "QR Code LinkAja akan ditampilkan di sini",
        accountNumber: "+62 895-6013-77400",
        accountName: "JMT Archery"
      }
    };
    return paymentInfo[method];
  };

  if (showPaymentDetails && paymentResponse) {
    return (
      <div className="min-h-screen w-4xl flex flex-col items-center justify-center font-sans bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">💳</div>
            <h1 className="text-2xl font-bold mb-2">Pembayaran Diproses</h1>
            <p className="text-gray-600">{paymentResponse.message}</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h2 className="font-semibold text-lg mb-4">Detail Pembayaran:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Transaction ID:</p>
                <p className="font-mono text-sm font-semibold text-gray-900">
                  {paymentResponse.payment.transactionId}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status:</p>
                <span className="inline-flex px-2 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800">
                  {paymentResponse.payment.status === "processing" ? "Sedang Diproses" : paymentResponse.payment.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pembayaran:</p>
                <p className="font-semibold text-green-700">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(total)}
                </p>
              </div>
              {paymentResponse.payment.expiresAt && (
                <div>
                  <p className="text-sm text-gray-600">Berlaku hingga:</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatExpiryTime(paymentResponse.payment.expiresAt)}
                  </p>
                </div>
              )}
            </div>

            {paymentResponse.payment.verificationCode && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-gray-600 mb-2">Kode Verifikasi:</p>
                <div className="bg-white p-3 rounded border">
                  <p className="font-mono text-lg font-bold text-center text-gray-900">
                    {paymentResponse.payment.verificationCode}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Simpan kode ini untuk verifikasi pembayaran nanti
                </p>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg mb-6">
            <h3 className="font-semibold text-lg mb-3">Instruksi Pembayaran:</h3>
            <div className="whitespace-pre-line text-sm text-gray-700">
              {getPaymentInstructions(selectedMethod, selectedBank)}
            </div>
            
            {/* QR Code dan Informasi Pembayaran */}
            {['dana', 'gopay', 'shopeepay', 'linkaja'].includes(selectedMethod) && (
              <div className="mt-6 pt-6 border-t border-yellow-200">
                <h4 className="font-semibold text-base mb-4">Informasi Pembayaran:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* QR Code */}
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg border border-yellow-200 inline-block">
                      <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📱</div>
                          <p className="text-xs text-gray-500">QR Code</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">Scan QR Code di atas</p>
                    </div>
                  </div>
                  
                  {/* Informasi Akun */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Nama Penerima:</p>
                      <p className="font-semibold text-gray-900">JMT Archery</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nomor Tujuan:</p>
                      <p className="font-mono font-semibold text-gray-900">+62 895-6013-77400</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Jumlah Pembayaran:</p>
                      <p className="font-bold text-green-700 text-lg">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(total)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">
                    <strong>Catatan:</strong> Pastikan jumlah pembayaran sesuai dengan total order. 
                    Pembayaran akan diverifikasi dalam waktu 1x24 jam.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleContinueToHistory}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Lihat Riwayat Order
            </button>
            <button
              onClick={() => {
                setShowPaymentDetails(false);
                setPaymentResponse(null);
              }}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Pembayaran Baru
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-4xl flex flex-col items-center justify-center font-sans bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Pembayaran</h1>
        <div className="mb-4 text-center">
          <span className="font-semibold">Total Pembayaran: </span>
          <span className="text-lg font-bold text-green-700">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
            }).format(total)}
          </span>
        </div>
        
        {/* Tampilkan ringkasan produk yang dibayar */}
        {orderItems.length > 0 && (
          <div className="mb-4">
            <div className="font-semibold mb-1">Produk yang Dibayar:</div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {orderItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-xl py-2 bg-gray-50 p-3"
                >
                  <img
                    src={item.product?.image || "/no-image.png"}
                    alt={item.product?.name || "Produk"}
                    className="w-12 h-12 object-cover rounded shadow"
                  />
                  <div className="flex-1">
                    <div className="font-medium mb-1">
                      {item.product?.name || "-"}
                    </div>
                    <div className="text-sm text-gray-600 mb-0.5">
                      Harga:{" "}
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(item.product?.price ?? item.price)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Jumlah: {item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-3 font-medium">
              Pilih Metode Pembayaran:
            </label>
            <div className="grid grid-cols-1 gap-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={selectedMethod === method.value}
                    onChange={() => {
                      setSelectedMethod(method.value);
                      setSelectedBank("");
                    }}
                    className="accent-blue-600"
                  />
                  <span className="text-2xl">{method.icon}</span>
                  <span className="font-medium">{method.label}</span>
                </label>
              ))}
            </div>
            
            {/* Dropdown bank jika transfer bank */}
            {selectedMethod === "transfer_bank" && (
              <div className="mt-4">
                <label className="block mb-2 text-sm font-medium">
                  Pilih Bank:
                </label>
                <select
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                >
                  <option value="">-- Pilih Bank --</option>
                  {BANKS.map((bank) => (
                    <option key={bank.value} value={bank.value}>
                      {bank.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          {error && (
            <div className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          {success && (
            <div className="text-green-600 mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              {success}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Memproses Pembayaran...
              </div>
            ) : (
              "Bayar Sekarang"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
