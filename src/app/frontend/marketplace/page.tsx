"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description?: string;
  stock: number;
}

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
}

const Marketplace = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const router = useRouter();

  // Ambil userId dari session
  const userId =
    typeof window !== "undefined"
      ? Number(sessionStorage.getItem("userId") || "")
      : undefined;

  // Cek session login dan timeout
  useEffect(() => {
    const checkSession = () => {
      const loginTime = sessionStorage.getItem("loginTime");
      const isLoggedInSession = sessionStorage.getItem("isLoggedIn") === "true";
      if (isLoggedInSession && loginTime) {
        const now = Date.now();
        const loginTimestamp = parseInt(loginTime, 10);
        if (now - loginTimestamp > 3600000) {
          sessionStorage.removeItem("isLoggedIn");
          sessionStorage.removeItem("loginTime");
          setIsLoggedIn(false);
        } else {
          setIsLoggedIn(true);
        }
      } else {
        setIsLoggedIn(false);
      }
    };
    checkSession();
    const interval = setInterval(checkSession, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch produk
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/product");
        if (!res.ok) throw new Error("Gagal mengambil produk");
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message || "Error saat fetch produk");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Fetch cart dari backend, hanya jika userId ada
  useEffect(() => {
    async function fetchCart() {
      if (!userId) {
        setCart([]);
        return;
      }
      try {
        const res = await fetch(`/api/cart/${userId}`);
        if (!res.ok) throw new Error("Gagal mengambil cart");
        const data = await res.json();
        setCart(data);
      } catch {
        setCart([]);
      }
    }
    fetchCart();
  }, [userId, isLoggedIn]);

  // Fetch profile picture jika sudah login
  useEffect(() => {
    if (!isLoggedIn || !userId) {
      setProfilePic(null);
      return;
    }
    const userData = sessionStorage.getItem("userData");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        if (parsed.profilePicture) {
          setProfilePic(parsed.profilePicture);
        } else if (parsed.image) {
          setProfilePic(parsed.image);
        } else {
          setProfilePic(null);
        }
      } catch {
        setProfilePic(null);
      }
    } else {
      // Optional: fetch dari backend jika ingin selalu update
      setProfilePic(null);
    }
  }, [isLoggedIn, userId]);

  // Handler ke detail produk
  const goToDetailedProduct = (id?: number) => {
    const loggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    const loginTime = sessionStorage.getItem("loginTime");
    const now = Date.now();
    if (!loggedIn || !loginTime || now - parseInt(loginTime, 10) > 3600000) {
      sessionStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("loginTime");
      if (id)
        sessionStorage.setItem(
          "redirectAfterLogin",
          `/frontend/detail_product/${id}`
        );
      window.location.href = "/frontend/login";
    } else if (id) {
      window.location.href = `/frontend/detail_product/${id}`;
    } else {
      window.location.href = "/frontend/detail_product";
    }
  };

  // Tambahkan ke cart (langsung ke backend)
  const addToCart = async (product: Product) => {
    if (!isLoggedIn || !userId) {
      router.push("/frontend/login");
      return;
    }
    if (product.stock <= 0) {
      alert("Stok produk habis!");
      return;
    }
    try {
      // Cek apakah produk sudah ada di cart
      const exist = cart.find((item) => item.productId === product.id);
      if (exist) {
        // Update quantity jika belum melebihi stok
        if (exist.quantity < product.stock) {
          const res = await fetch(`/api/cart/${exist.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: exist.quantity + 1 }),
          });
          if (!res.ok) throw new Error("Gagal update keranjang");
        } else {
          alert("Jumlah melebihi stok tersedia!");
          return;
        }
      } else {
        // Tambah baru ke cart
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            productId: product.id,
            quantity: 1,
          }),
        });
        if (!res.ok) throw new Error("Gagal menambah ke keranjang");
      }
      // Refresh cart
      const res = await fetch(`/api/cart/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
      alert("Produk berhasil ditambahkan ke keranjang!");
    } catch (err: any) {
      alert(err.message || "Gagal menambah ke keranjang.");
    }
  };

  // Hitung total item di cart (hanya jika user login)
  const cartCount =
    isLoggedIn && userId
      ? cart.reduce((sum, item) => sum + item.quantity, 0)
      : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  return (
    <div className="font-sans text-gray-900 w-full max-w-none">
      {/* Navbar dengan logo cart dan user/login */}
      <Navbar />
      {/* Hero Section */}
      <section
        className="relative text-center py-16 bg-gray-100 w-full flex items-center justify-center min-h-[260px] md:min-h-[340px]"
        style={{
          backgroundImage: "url('/banner/banner1.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
      </section>

      {/* Produk lainnya - dinamis dari API */}
      <section className="p-6 w-full">
        <h2 className="text-xl font-bold mb-4">Produk</h2>

        {loading && <p>Loading produk...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="grid md:grid-cols-3 gap-4">
            {products.length === 0 && (
              <div className="col-span-3 text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📦</div>
                <p className="text-gray-600">Tidak ada produk tersedia.</p>
              </div>
            )}
            {products.map((product) => (
              <div key={product.id} className="border p-2 rounded">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover mb-2"
                />
                <div className="text-base font-semibold mb-1">
                  {product.name}
                </div>{" "}
                {/* Tambahkan nama produk di atas stok */}
                <div className="text-xs text-gray-500 mb-1">
                  Stok: {product.stock}
                </div>
                <p
                  className="text-xs whitespace-pre-line overflow-hidden"
                  style={{
                    display: "block",
                    lineHeight: "1.5",
                    maxHeight: "7.5em", // 5 baris x 1.5em
                  }}
                  title={product.description}
                >
                  {product.description
                    ? (() => {
                        const lines = product.description.split("\n");
                        const limited = lines.slice(0, 5);
                        return (
                          limited.join("\n") + (lines.length > 5 ? "\n..." : "")
                        );
                      })()
                    : "Deskripsi produk tidak tersedia"}
                </p>
                <p className="text-sm font-bold">
                  {formatCurrency(product.price)}
                </p>
                <button
                  className="bg-gray-300 text-black px-4 py-1 rounded mt-2 w-full"
                  onClick={() => goToDetailedProduct(product.id)}
                >
                  Detail
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Marketplace;
