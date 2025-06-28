"use client";

import React, { useEffect, useState } from "react";
import "@/app/globals.css";
import { useRouter } from "next/navigation";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description?: string;
  createdAt?: string;
}

export default function LandingPage() {
  const router = useRouter();
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Cek login saat mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLoggedInSession = sessionStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(isLoggedInSession);
    }
  }, []);

  // Ambil produk terbaru dari database
  useEffect(() => {
    async function fetchLatestProducts() {
      setLoading(true);
      try {
        const res = await fetch("/api/product");
        const data = await res.json();
        // Urutkan dari yang terbaru (createdAt DESC), ambil 3 teratas
        const sorted = [...data]
          .sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
          )
          .slice(0, 3);
        setLatestProducts(sorted);
      } catch {
        setLatestProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLatestProducts();
  }, []);

  useEffect(() => {
    const checkLogin = () => {
      if (typeof window !== "undefined") {
        setIsLoggedIn(sessionStorage.getItem("isLoggedIn") === "true");
      }
    };
    checkLogin();
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  const goToShop = () => router.push("/frontend/marketplace");
  const goToLogin = () => router.push("/frontend/login");
  const goToProfile = () => {
    if (
      typeof window !== "undefined" &&
      (!sessionStorage.getItem("isLoggedIn") ||
        sessionStorage.getItem("isLoggedIn") !== "true")
    ) {
      sessionStorage.setItem("redirectAfterLogin", "/frontend/user_profile");
      router.push("/frontend/login");
    } else {
      router.push("/frontend/user_profile");
    }
  };

  // Fungsi navigasi
  const goToDetailedProduct = (id?: number) => {
    if (!isLoggedIn) {
      if (typeof window !== "undefined" && id)
        sessionStorage.setItem(
          "redirectAfterLogin",
          `/frontend/detail_product/${id}`
        );
      router.push("/frontend/login");
    } else if (id) {
      router.push(`/frontend/detail_product/${id}`);
    } else {
      router.push("/frontend/detail_product");
    }
  };

  const goToArticle = () => router.push("/frontend/article");
  const goToReview = () => router.push("/frontend/reviews");

      return (
    <div className="font-san min-h-screen w-full text-lg md:text-xl"> {/* Tambahkan text-lg md:text-xl */}
      <Navbar />
      {/* Hero */}
      <div className="pt-20 pb-24">
        <section className="p-6">
          <h1 className="text-3xl font-bold">JMT Archery</h1>
          <p className="text-base md:text-lg mb-2">Lorem ipsum dolor sit amet</p>
          <button
            className="bg-black text-white px-6 py-2 rounded text-lg md:text-xl"
            onClick={goToShop}
          >
            Shop
          </button>
        </section>

        {/* Banner */}
        <div className="p-6">
          <div
            className="w-full h-125 bg-gray-200 rounded flex items-center justify-center cursor-pointer relative overflow-hidden"
            onClick={() => goToDetailedProduct()}
          >
            {/* Slider sederhana */}
            {["/banner1.jpg", "/banner2.jpg", "/banner3.jpg"].map(
              (img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Banner ${idx + 1}`}
                  className={`absolute w-full h-full object-cover transition-opacity duration-500 ${
                    idx === 0 ? "opacity-100" : "opacity-0"
                  }`}
                />
              )
            )}
            <span className="z-10 text-3xl font-bold text-white drop-shadow">
              Banner Slider
            </span>
          </div>
        </div>

        {/* Produk Terbaru */}
        <section className="p-6">
          <h2 className="text-3xl font-bold mb-6">Produk Terbaru</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              <p className="text-xl">Loading...</p>
            ) : latestProducts.length === 0 ? (
              <p className="text-xl">Tidak ada produk terbaru.</p>
            ) : (
              latestProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-100 p-6 rounded-xl cursor-pointer hover:bg-gray-200 transition flex flex-col shadow-md"
                  onClick={goToShop}
                  style={{ minHeight: 280 }}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover mb-4 rounded-lg border"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-300 mb-4 rounded-lg" />
                  )}
                  <h3 className="text-2xl font-semibold mb-1">{product.name}</h3>
                  <p className="text-lg text-gray-700 mb-2">
                    {product.description
                      ? product.description.split("\n")[0]
                      : "Deskripsi produk tidak tersedia"}
                  </p>
                  <p className="text-xl font-bold text-green-700 mt-auto">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(product.price)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Kelebihan */}
        <section className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="text-2xl font-semibold mb-2">
              Kelebihan JMT Archery
            </h2>
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-3">
                <p className="font-bold text-lg">Point {i}</p>
                <p className="text-lg text-gray-600">
                  Lorem ipsum dolor sit amet
                </p>
              </div>
            ))}
          </div>
          <div className="w-full h-64 bg-gray-200 rounded" />
        </section>

        {/* User Review */}
        <section className="p-6">
          <h2 className="text-2xl font-semibold mb-4">User Review</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border p-4 rounded cursor-pointer hover:bg-gray-100 transition"
                onClick={goToReview}
              >
                <p className="text-lg italic mb-2">
                  "A sample review testimonial {i}"
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-400 rounded-full" />
                  <div className="text-base">
                    <p>Nama</p>
                    <p className="text-gray-500">Description</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}