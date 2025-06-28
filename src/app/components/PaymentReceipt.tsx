"use client";

import React from "react";

interface PaymentReceiptProps {
  payment: {
    id: number;
    transactionId: string;
    amount: number;
    method: string;
    bank?: string;
    status: string;
    paidAt?: string;
    createdAt: string;
  };
  order: {
    id: number;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: Array<{
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
    }>;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function PaymentReceipt({ payment, order, user }: PaymentReceiptProps) {
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptContent = `
      JMT ARCHERY - PAYMENT RECEIPT
      
      Receipt No: ${payment.transactionId}
      Date: ${formatDate(payment.paidAt || payment.createdAt)}
      
      Customer: ${user?.name || "Guest"}
      Email: ${user?.email || "N/A"}
      
      Order Details:
      Order ID: ${order.id}
      Total Amount: ${formatCurrency(order.totalAmount)}
      
      Items:
      ${order.items.map(item => 
        `${item.product.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}`
      ).join('\n')}
      
      Payment Details:
      Method: ${payment.method}${payment.bank ? ` - ${payment.bank.toUpperCase()}` : ''}
      Status: ${payment.status}
      Transaction ID: ${payment.transactionId}
      ${['dana', 'gopay', 'shopeepay', 'linkaja'].includes(payment.method) ? `Payment Number: +62 895-6013-77400` : ''}
      
      Thank you for your purchase!
    `;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${payment.transactionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto print:shadow-none">
      {/* Header */}
      <div className="text-center border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">JMT ARCHERY</h1>
        <p className="text-gray-600">Payment Receipt</p>
        <p className="text-sm text-gray-500 mt-1">
          {formatDate(payment.paidAt || payment.createdAt)}
        </p>
      </div>

      {/* Receipt Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Receipt Information</h3>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-600">Receipt No:</span> {payment.transactionId}</p>
            <p><span className="text-gray-600">Order ID:</span> #{order.id}</p>
            <p><span className="text-gray-600">Status:</span> 
              <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                payment.status === "success" || payment.status === "paid" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {payment.status === "success" || payment.status === "paid" ? "PAID" : payment.status.toUpperCase()}
              </span>
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-600">Name:</span> {user?.name || "Guest"}</p>
            <p><span className="text-gray-600">Email:</span> {user?.email || "N/A"}</p>
            <p><span className="text-gray-600">Payment Method:</span> {payment.method}{payment.bank ? ` - ${payment.bank.toUpperCase()}` : ""}</p>
            {['dana', 'gopay', 'shopeepay', 'linkaja'].includes(payment.method) && (
              <p><span className="text-gray-600">Payment Number:</span> +62 895-6013-77400</p>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Item</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Qty</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Price</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-t border-gray-200">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.image || "/no-image.png"}
                        alt={item.product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <span className="font-medium text-gray-900">{item.product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.price)}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
          <span className="text-2xl font-bold text-green-700">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-600 text-sm border-t border-gray-200 pt-4">
        <p>Thank you for your purchase!</p>
        <p className="mt-1">For any questions, please contact our support team.</p>
      </div>

      {/* Action Buttons - Hidden on print */}
      <div className="flex gap-3 mt-6 print:hidden">
        <button
          onClick={handlePrint}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Print Receipt
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition font-medium"
        >
          Download Receipt
        </button>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
} 