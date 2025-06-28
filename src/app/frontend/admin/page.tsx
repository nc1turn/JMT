"use client";

import React, { useEffect, useRef, useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  stock: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Transaction {
  id: number;
  userId: number;
  totalAmount: number;
  createdAt: string;
  user?: User;
  items: {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    product: Product;
  }[];
}

export default function AdminPage() {
  const [product, setProduct] = useState<Product[]>([]);
  const [form, setForm] = useState<Partial<Product>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"product" | "transaction">(
    "product"
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showStockModal, setShowStockModal] = useState<null | Product>(null);
  const [addStockValue, setAddStockValue] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchProduct = async () => {
    try {
      const res = await fetch("/api/product");
      if (!res.ok) throw new Error("Gagal mengambil data produk");
      const data: Product[] = await res.json();
      setProduct(data);
    } catch (error) {
      console.error(error);
      alert("Gagal memuat data produk.");
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/order");
      if (!res.ok) throw new Error("Gagal mengambil data transaksi");
      const data: Transaction[] = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error(error);
      alert("Gagal memuat data transaksi.");
    }
  };
  useEffect(() => {
    if (activeMenu === "product") fetchProduct();
    if (activeMenu === "transaction") fetchTransactions();
  }, [activeMenu]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (
      e.target.name === "image" &&
      e.target instanceof HTMLInputElement &&
      e.target.files
    ) {
      const file = e.target.files[0];
      if (file && file.size > 2 * 1024 * 1024) {
        alert("File terlalu besar! Maksimal 2MB.");
        return;
      }
      setImageFile(file);
    } else {
      const { name, value } = e.target;
      setForm((prev) => ({
        ...prev,
        [name]:
          name === "price" || name === "stock"
            ? value === ""
              ? ""
              : Number(value)
            : value,
      }));
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload gambar gagal");
      const data = await res.json();
      return data.url;
    } catch (error) {
      console.error(error);
      alert("Gagal mengunggah gambar.");
      return "";
    }
  };
  
  const handleAddStock = async (productId: number) => {
    if (addStockValue < 1) {
      alert("Jumlah stok yang ditambahkan minimal 1");
      return;
    }
    try {
      const res = await fetch(`/api/product/${productId}/add-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addStock: addStockValue }),
      });
      if (!res.ok) {
        const errMsg = await res.json();
        throw new Error(errMsg.error || "Gagal menambah stok");
      }
      setShowStockModal(null);
      setAddStockValue(0);
      fetchProduct();
      alert("Stok berhasil ditambahkan!");
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan saat menambah stok.");
    }
  };

  const resetForm = () => {
    setForm({});
    setEditingId(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.name ||
      form.price === undefined ||
      form.price === null ||
      isNaN(Number(form.price)) ||
      form.stock === undefined ||
      form.stock === null ||
      isNaN(Number(form.stock)) ||
      (!form.image && !imageFile)
    ) {
      alert("Semua field wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = (form.image as string) || "";
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          setIsLoading(false);
          return;
        }
      }

      const payload = {
        name: String(form.name),
        price: Number(form.price),
        description: form.description || "",
        image: imageUrl,
        stock: Number(form.stock),
      };

      const res = await fetch(
        editingId ? `/api/product/${editingId}` : "/api/product",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errMsg = await res.json();
        throw new Error(
          "Gagal menyimpan produk: " + (errMsg.error || res.statusText)
        );
      }

      resetForm();
      fetchProduct();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (p: Product) => {
    setForm({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      description: p.description,
      stock: p.stock,
    });
    setEditingId(p.id);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Yakin ingin menghapus produk ini?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/product/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus produk");
      fetchProduct();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menghapus produk.");
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen font-sans bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white shadow h-screen p-6 flex flex-col gap-4 fixed left-0 top-0">
        <h2 className="text-xl font-bold mb-6">JMT Archery</h2>
        <button
          className={`text-left px-4 py-2 rounded transition font-semibold ${
            activeMenu === "product"
              ? "bg-black text-white"
              : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveMenu("product")}
        >
          Tambah Product
        </button>
        <button
          className={`text-left px-4 py-2 rounded transition font-semibold ${
            activeMenu === "transaction"
              ? "bg-black text-white"
              : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveMenu("transaction")}
        >
          Transaksi
        </button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 ml-60 p-8">
        {activeMenu === "product" && (
          <>
            <h1 className="text-2xl font-bold mb-6">Product Management</h1>
            <form
              onSubmit={handleSubmit}
              className="space-y-4 mb-8 bg-gray-50 p-4 rounded"
            >
              <input
                name="name"
                placeholder="Product Name"
                value={form.name || ""}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                name="price"
                type="number"
                placeholder="Price"
                value={form.price ?? ""}
                onChange={handleChange}
                min={0}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                name="stock"
                type="number"
                placeholder="Stock"
                value={form.stock ?? ""}
                onChange={handleChange}
                min={0}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                name="image"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                ref={fileInputRef}
              />
              <textarea
                name="description"
                placeholder="Description"
                value={form.description || ""}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading
                  ? editingId
                    ? "Updating..."
                    : "Adding..."
                  : editingId
                  ? "Update"
                  : "Add"}{" "}
                Product
              </button>
              {editingId && (
                <button
                  type="button"
                  className="ml-2 px-4 py-2 rounded border"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </form>

            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Price</th>
                  <th className="p-2 border">Stock</th>
                  <th className="p-2 border">Image</th>
                  <th className="p-2 border">Description</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {product.map((p) => (
                  <tr key={p.id}>
                    <td className="p-2 border">{p.name}</td>
                    <td className="p-2 border">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(p.price)}
                    </td>
                    <td className="p-2 border">{p.stock}</td>
                    <td className="p-2 border">
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-16 h-16 object-cover"
                        />
                      )}
                    </td>
                    <td className="p-2 border">
                      {p.description && (
                        <div className="whitespace-pre-line">
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td className="p-2 border">
                      <button
                        className="px-2 py-1 bg-blue-500 text-white rounded mr-2"
                        onClick={() => handleEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 bg-green-600 text-white rounded mr-2"
                        onClick={() => {
                          setShowStockModal(p);
                          setAddStockValue(0);
                        }}
                      >
                        + Stok
                      </button>
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded"
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Modal tambah stok */}
            {showStockModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs relative">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-black"
                    onClick={() => setShowStockModal(null)}
                    aria-label="Tutup"
                  >
                    ×
                  </button>
                  <h2 className="text-lg font-bold mb-2">
                    Tambah Stok: {showStockModal.name}
                  </h2>
                  <div className="mb-2 text-sm">
                    Stok sekarang:{" "}
                    <span className="font-semibold">
                      {showStockModal.stock}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={addStockValue === 0 ? "" : addStockValue}
                    onChange={(e) => setAddStockValue(Number(e.target.value))}
                    className="border rounded px-2 py-1 w-full mb-4"
                    placeholder="Jumlah stok yang ditambah"
                  />
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded w-full font-semibold"
                    onClick={() => handleAddStock(showStockModal.id)}
                  >
                    Tambah Stok
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeMenu === "transaction" && (
          <>
            <h1 className="text-2xl font-bold mb-6">Daftar Transaksi</h1>
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">ID</th>
                    <th className="p-2 border">User ID</th>
                    <th className="p-2 border">Nama User</th>
                    <th className="p-2 border">Tanggal</th>
                    <th className="p-2 border">Total</th>
                    <th className="p-2 border">Produk</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-4 text-gray-500">
                        Tidak ada transaksi.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((trx) => (
                      <tr key={trx.id}>
                        <td className="p-2 border">{trx.id}</td>
                        <td className="p-2 border">{trx.userId}</td>
                        <td className="p-2 border">{trx.user?.name || "-"}</td>
                        <td className="p-2 border">
                          {new Date(trx.createdAt).toLocaleString("id-ID")}
                        </td>
                        <td className="p-2 border">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(trx.totalAmount)}
                        </td>
                        <td className="p-2 border">
                          <ul className="list-disc pl-4">
                            {trx.items.map((item) => (
                              <li
                                key={item.id}
                                className="flex items-center gap-2 mb-2"
                              >
                                {item.product?.image && (
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="w-10 h-10 object-cover rounded border"
                                  />
                                )}
                                <span>
                                  {item.product?.name || "-"} x {item.quantity}{" "}
                                  (
                                  {new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                  }).format(item.price)}
                                  )
                                </span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
