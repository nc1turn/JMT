"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  stock: number;
  description?: string;
}

const ProductPage: React.FC = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedQty, setSelectedQty] = useState<number | string>(1);
  const [userId, setUserId] = useState<number | null>(null);
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Ambil userId dari sessionStorage secara reaktif
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
      const loginTime = sessionStorage.getItem("loginTime");
      const now = Date.now();
      if (
        !isLoggedIn ||
        !loginTime ||
        now - parseInt(loginTime, 10) > 3600000
      ) {
        // Jangan hapus session di sini, cukup redirect jika memang expired
        setUserId(null);
      } else {
        const uid = Number(sessionStorage.getItem("userId") || "");
        setUserId(isNaN(uid) ? null : uid);
      }
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    // Fetch produk utama
    fetch(`/api/product/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .finally(() => setLoading(false));

    // Fetch produk lain untuk related
    fetch("/api/product")
      .then((res) => res.json())
      .then((data) =>
        setRelated(data.filter((p: Product) => String(p.id) !== id))
      );
  }, [id]);

  // Handler untuk tombol utama
  const handleShowPopup = () => {
    // Cek ulang session hanya saat tombol ditekan
    if (typeof window !== "undefined") {
      const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
      const loginTime = sessionStorage.getItem("loginTime");
      const now = Date.now();
      if (
        !isLoggedIn ||
        !loginTime ||
        now - parseInt(loginTime, 10) > 3600000
      ) {
        alert("Sesi login Anda sudah habis, silakan login ulang.");
        // Jangan hapus session, cukup redirect
        return router.push("/frontend/login");
      }
    }
    setSelectedQty(1);
    setShowPopup(true);
  };

  // Handler untuk input jumlah
  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Izinkan input kosong agar user bisa hapus angka
    const val = e.target.value;
    if (val === "") {
      setSelectedQty("");
      return;
    }
    const num = Number(val);
    if (isNaN(num)) {
      setSelectedQty(1);
      return;
    }
    setSelectedQty(num);
  };

  // Handler untuk submit dari popup
  const handleAddToCartPopup = async () => {
    const qty = Number(selectedQty);
    if (
      !product ||
      !userId ||
      isNaN(qty) ||
      qty < 1 ||
      qty > Number(product.stock)
    ) {
      alert("Data tidak valid.");
      return;
    }
    setAdding(true);
    try {
      // Ambil cart user
      const res = await fetch(`/api/cart/${userId}`);
      let cart = [];
      if (res.ok) {
        cart = await res.json();
      }
      const existing = cart.find((item: any) => item.productId === product.id);

      if (existing) {
        // Jika sudah ada, update quantity menjadi qty (bukan ditambah)
        const updateRes = await fetch(`/api/cart/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: Number(product.id),
            quantity: qty, // set langsung ke qty yang baru
          }),
        });
        if (!updateRes.ok) throw new Error("Gagal mengedit keranjang");
      } else {
        // Tambah baru ke cart
        const addRes = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            productId: product.id,
            quantity: qty,
          }),
        });
        if (!addRes.ok) throw new Error("Gagal menambah ke keranjang");
      }
      setShowPopup(false);
      alert("Produk berhasil dimasukkan ke keranjang!");
      router.push("/frontend/cart");
    } catch (error: any) {
      alert(error.message || "Gagal menambah ke keranjang.");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-900 w-full max-w-none">
      {/* Navbar dengan logo cart dan user/login */}
      <Navbar />

      {/* Product Section */}
      {product ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          <div className="bg-gray-200 aspect-square flex items-center justify-center w-80">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-gray-400">[Image]</span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
            <p className="text-gray-500 mb-2">Kategori</p>
            <p className="text-lg font-bold mb-4">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(product.price)}
            </p>
            <p className="text-sm text-gray-700 mb-4 whitespace-pre-line">
              {product.description ||
                "Body text for describing what this product is and why this product is simply a must-buy."}
            </p>
            <button
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
              onClick={handleShowPopup}
              disabled={adding}
            >
              Add to cart
            </button>
            <p className="text-xs text-gray-400 mt-2">
              Text box for additional details or fine print
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">Produk tidak ditemukan.</div>
      )}

      {/* Pop Up Add To Cart */}
      {showPopup && product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-black"
              onClick={() => setShowPopup(false)}
              aria-label="Tutup"
            >
              ×
            </button>
            <div className="flex flex-col items-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-32 h-32 object-cover rounded mb-2"
              />
              <div className="font-semibold mb-1">{product.name}</div>
              <div className="text-sm text-gray-600 mb-2">
                Stok tersedia:{" "}
                <span className="font-bold">{product.stock}</span>
              </div>
              <div className="mb-4 w-full">
                <label className="block text-xs mb-1">Jumlah:</label>
                <input
                  type="number"
                  min={1}
                  max={product.stock}
                  value={
                    selectedQty === 0 || selectedQty === "" ? "" : selectedQty
                  }
                  onChange={(e) => {
                    // Izinkan kosong, jika kosong set ke 0 (sementara)
                    if (e.target.value === "") {
                      setSelectedQty("");
                    } else {
                      let val = Number(e.target.value);
                      // Jika input melebihi stok, set ke stok maksimal
                      if (val > product.stock) {
                        val = product.stock;
                      }
                      if (val >= 1) setSelectedQty(val);
                    }
                  }}
                  className="border rounded px-2 py-1 w-full"
                  onBlur={() => {
                    // Jika kosong atau tidak valid, set ke 1
                    if (
                      !selectedQty ||
                      isNaN(Number(selectedQty)) ||
                      Number(selectedQty) < 1
                    ) {
                      setSelectedQty(1);
                    }
                    // Jika lebih dari stok, set ke stok maksimal
                    else if (Number(selectedQty) > product.stock) {
                      setSelectedQty(product.stock);
                    }
                  }}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Stok tersedia:{" "}
                  <span className="font-semibold">{product.stock}</span>
                </div>
              </div>
              <button
                className="bg-black text-white px-4 py-2 rounded w-full hover:bg-gray-800"
                onClick={handleAddToCartPopup}
                disabled={
                  adding ||
                  selectedQty === "" ||
                  Number(selectedQty) < 1 ||
                  Number(selectedQty) > product.stock
                }
              >
                {adding ? "Menambahkan..." : "Add to cart"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Related Products */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Related products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {related.slice(0, 6).map((prod) => (
            <div key={prod.id} className="space-y-2">
              <div className="bg-gray-200 aspect-square flex items-center justify-center">
                {prod.image ? (
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-gray-400">[Image]</span>
                )}
              </div>
              <p className="font-medium">{prod.name}</p>
              <p className="text-sm text-gray-600">{prod.description}</p>
              <p className="text-sm font-semibold">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(prod.price)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
export default ProductPage;
