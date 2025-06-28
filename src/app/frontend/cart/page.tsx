"use client";

import React, { useEffect, useState, useRef } from "react";
import "@/app/globals.css";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  stock: number;
}

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [editQty, setEditQty] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);

  // Ganti userId sesuai session user login
  const userId =
    typeof window !== "undefined"
      ? Number(sessionStorage.getItem("userId") || 1)
      : 1;

  // Ambil cart dari backend
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/cart/${userId}`);
        if (!res.ok) throw new Error("Gagal mengambil cart");
        const data: CartItem[] = await res.json();
        // Urutkan dari terbaru ke terlama (asumsi id terbesar = terbaru)
        const sorted = [...data].sort((a, b) => b.id - a.id);
        setCart(sorted);

        // Default: pilih produk terakhir ditambahkan (id terbesar)
        if (sorted.length > 0) {
          setSelected([sorted[0].id]);
        }
      } catch (error) {
        alert("Gagal memuat data cart.");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [userId]);

  // Toggle pilih produk
  const handleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select All
  const handleSelectAll = () => {
    if (selected.length === cart.length) {
      setSelected([]);
    } else {
      setSelected(cart.map((item) => item.id));
    }
  };

  // Pop up edit qty
  const handleEdit = (item: CartItem) => {
    setEditingItem(item);
    setEditQty(item.quantity);
  };

  const handleEditQtyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    stock: number
  ) => {
    const val = Number(e.target.value);
    if (val >= 1 && val <= stock) setEditQty(val);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    if (editQty < 1 || editQty > editingItem.product.stock) {
      alert("Jumlah tidak valid.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/cart/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: editingItem.productId,
          quantity: editQty,
        }),
      });
      if (!res.ok) throw new Error("Gagal update cart");
      setCart((prev) =>
        prev.map((ci) =>
          ci.id === editingItem.id ? { ...ci, quantity: editQty } : ci
        )
      );
      setEditingItem(null);
    } catch {
      alert("Gagal update jumlah produk.");
    } finally {
      setLoading(false);
    }
  };

  // Hapus item dari cart
  const handleDelete = async (item: CartItem) => {
    if (!window.confirm(`Hapus ${item.product.name} dari keranjang?`)) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/cart/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.productId }), // pastikan productId
      });
      if (!res.ok) throw new Error("Gagal hapus produk");
      // Update state cart dan selected
      setCart((prev) => prev.filter((ci) => ci.id !== item.id));
      setSelected((prev) => prev.filter((id) => id !== item.id));
    } catch {
      alert("Gagal menghapus produk.");
    } finally {
      setLoading(false);
    }
  };

  // Hitung total harga produk yang dipilih
  const total = cart
    .filter((item) => selected.includes(item.id))
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Checkout & pembayaran produk yang dipilih
  const handlePayment = async () => {
    if (selected.length === 0) {
      alert("Pilih produk yang ingin dibayar.");
      return;
    }
    try {
      setLoading(true);
      // Kirim ke endpoint order
      const items = cart
        .filter((item) => selected.includes(item.id))
        .map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        }));

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          items,
          totalAmount: total,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Checkout gagal");
      }

      // Hapus item yang sudah di-checkout dari cart di frontend
      setCart((prev) => prev.filter((item) => !selected.includes(item.id)));
      setSelected([]);
      alert("Order berhasil! Silakan lanjut ke pembayaran.");
      const orderData = await res.json();
      sessionStorage.setItem("lastOrder", JSON.stringify(orderData.order));
      router.push("/frontend/payment");
    } catch (error: any) {
      alert(error.message || "Gagal pembayaran. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Scroll ke bawah agar tombol selalu terlihat saat cart berubah
  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [cart, selected]);

  return (
    <div className="relative min-h-screen pt-20 font-sans w-full">
      <Navbar />
      {/* Judul di tengah */}
      <div className="w-full flex flex-col justify-center items-center pt-6 pb-2">
        <h1 className="text-2xl font-bold text-center">Keranjang Belanja</h1>
        <button
          className="fixed top-24 left-6 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition z-50"
          onClick={() => router.push("/frontend/marketplace")}
          style={{ minWidth: 180 }}
        >
          ← Kembali ke Marketplace
        </button>
      </div>
      <div className="max-w-6xl mx-auto pt-4 pb-32 px-4">
        {cart.length === 0 ? (
          <div className="text-gray-500 text-center mt-24">
            Keranjang kosong.
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePayment();
            }}
            className="flex flex-col min-h-[60vh]"
          >
            <div className="overflow-x-auto rounded-xl shadow bg-white">
              <table className="w-full mb-0">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 border-b border-transparent">
                    <th className="p-2 border-b border-transparent w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          selected.length === cart.length && cart.length > 0
                        }
                        onChange={handleSelectAll}
                        aria-label="Pilih semua"
                      />
                    </th>
                    <th className="p-2 border-b border-transparent text-left">
                      Produk
                    </th>
                    <th className="p-2 border-b border-transparent text-center">
                      Harga
                    </th>
                    <th className="p-2 border-b border-transparent text-center">
                      Jumlah
                    </th>
                    <th className="p-2 border-b border-transparent text-center">
                      Harga Produk
                    </th>
                    <th className="p-2 border-b border-transparent text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-100 transition border-b border-transparent"
                    >
                      <td className="p-2 border-b border-transparent text-center">
                        <input
                          type="checkbox"
                          checked={selected.includes(item.id)}
                          onChange={() => handleSelect(item.id)}
                          aria-label={`Pilih ${item.product.name}`}
                        />
                      </td>
                      <td className="p-2 border-b border-transparent flex items-center gap-2">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded shadow"
                        />
                        <span className="font-medium">{item.product.name}</span>
                      </td>
                      <td className="p-2 border-b border-transparent text-center">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(item.product.price)}
                      </td>
                      <td className="p-2 border-b border-transparent text-center">
                        {item.quantity}
                      </td>
                      <td className="p-2 border-b border-transparent text-center">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(item.product.price * item.quantity)}
                      </td>
                      <td className="p-2 border-b border-transparent text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            type="button"
                            className="bg-blue-600 text-white px-4 py-1 rounded w-3/4 max-w-[120px] font-semibold shadow hover:bg-blue-700 transition"
                            onClick={() => handleEdit(item)}
                            disabled={loading}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="bg-red-600 text-white px-4 py-1 rounded w-3/4 max-w-[120px] font-semibold shadow hover:bg-red-700 transition"
                            onClick={() => handleDelete(item)}
                            disabled={loading}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Total & Tombol pembayaran */}
            <div
              ref={buttonRef}
              className="fixed left-0 bottom-12 w-full bg-white border-t border-transparent shadow-lg py-4 px-4 flex flex-col items-center z-50"
            >
              <div className="flex justify-between w-full max-w-2xl mb-2">
                <span className="font-semibold">Total Harga:</span>
                <span className="text-lg font-bold text-green-700">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(total)}
                </span>
              </div>
              <button
                type="submit"
                className={`bg-green-600 text-white px-6 py-2 rounded w-full max-w-2xl font-semibold shadow ${
                  selected.length === 0 || loading
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-green-700"
                }`}
                disabled={selected.length === 0 || loading}
              >
                {loading ? "Memproses..." : "Bayar Produk Terpilih"}
              </button>
            </div>
            {/* Pop Up Edit */}
            {editingItem && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs relative">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-black"
                    onClick={() => setEditingItem(null)}
                    aria-label="Tutup"
                  >
                    ×
                  </button>
                  <div className="flex flex-col items-center">
                    <img
                      src={editingItem.product.image}
                      alt={editingItem.product.name}
                      className="w-24 h-24 object-cover rounded mb-2"
                    />
                    <div className="font-semibold mb-1">
                      {editingItem.product.name}
                    </div>
                    <div className="mb-4 w-full">
                      <label className="block text-xs mb-1">Jumlah:</label>
                      <input
                        type="number"
                        min={1}
                        max={editingItem.product.stock}
                        value={editQty === 0 || editQty === null ? "" : editQty}
                        onChange={(e) => {
                          // Izinkan kosong, jika kosong set editQty ke 0 (sementara)
                          if (e.target.value === "") {
                            setEditQty(0);
                          } else {
                            let val = Number(e.target.value);
                            // Jika input melebihi stok, set ke stok maksimal
                            if (val > editingItem.product.stock) {
                              val = editingItem.product.stock;
                            }
                            if (val >= 1) setEditQty(val);
                          }
                        }}
                        className="border rounded px-2 py-1 w-full"
                        onBlur={() => {
                          // Jika kosong atau tidak valid, set ke 1
                          if (
                            !editQty ||
                            isNaN(Number(editQty)) ||
                            Number(editQty) < 1
                          ) {
                            setEditQty(1);
                          }
                          // Jika lebih dari stok, set ke stok maksimal
                          else if (editQty > editingItem.product.stock) {
                            setEditQty(editingItem.product.stock);
                          }
                        }}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Stok tersedia:{" "}
                        <span className="font-semibold">
                          {editingItem.product.stock}
                        </span>
                      </div>
                    </div>
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded w-full hover:bg-green-700"
                      onClick={handleSaveEdit}
                      disabled={loading}
                    >
                      {loading ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
}
