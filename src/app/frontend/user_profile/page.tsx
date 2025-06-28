"use client";

import React, { useEffect, useRef, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const UserProfile: React.FC = () => {
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    profilePicture: "",
  });
  const [preview, setPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Ambil userId dari sessionStorage
  const userId =
    typeof window !== "undefined"
      ? Number(sessionStorage.getItem("userId") || "")
      : undefined;

  // Fetch user profile saat mount
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    const loginTime = sessionStorage.getItem("loginTime");
    const now = Date.now();
    if (!isLoggedIn || !loginTime || now - parseInt(loginTime, 10) > 3600000) {
      sessionStorage.clear();
      setLoading(false);
      window.location.href = "/frontend/login";
      return;
    }
    const fetchUserProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) throw new Error("Gagal mengambil data dari server");
        const data = await res.json();
        setUser({
          name: data.name || "",
          email: data.email || "",
          address: data.address || "",
          phone: data.phone || "",
          profilePicture: data.profilePicture || data.image || "",
        });
        setPreview(data.profilePicture || data.image || "");
        sessionStorage.setItem("userData", JSON.stringify(data));
      } catch {
        const userData = sessionStorage.getItem("userData");
        if (userData) {
          const parsed = JSON.parse(userData);
          setUser({
            name: parsed.name || "",
            email: parsed.email || "",
            address: parsed.address || "",
            phone: parsed.phone || "",
            profilePicture: parsed.profilePicture || parsed.image || "",
          });
          setPreview(parsed.profilePicture || parsed.image || "");
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [userId]);

  // Handler upload gambar
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const upload = async () => {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Gagal upload gambar");
        const data = await res.json();
        setPreview(data.url);
        setUser((prev) => ({ ...prev, profilePicture: data.url }));
      } catch {
        setError("Gagal upload gambar.");
      }
    };
    upload();
  };

  // Handler input data
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Handler simpan perubahan
  const handleSave = async () => {
    setSaveLoading(true);
    setError(null);
    setSuccess(null);

    const updatedUser = {
      name: user.name,
      email: user.email,
      address: user.address,
      phone: user.phone,
      profilePicture: preview || user.profilePicture,
    };

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });
      if (!res.ok) throw new Error("Gagal menyimpan data ke server.");
      const data = await res.json();
      setUser({
        name: data.name || "",
        email: data.email || "",
        address: data.address || "",
        phone: data.phone || "",
        profilePicture: data.profilePicture || data.image || "",
      });
      setPreview(data.profilePicture || data.image || "");
      sessionStorage.setItem("userData", JSON.stringify(data));
      setSuccess("Data berhasil disimpan.");
      setEditMode(false);
    } catch {
      setError("Gagal menyimpan data ke server.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.replace("/frontend/login");
  };

  const handleBack = () => {
    window.location.href = "/frontend/marketplace";
  };

  return (
    <div className="min-h-screen font-sans bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-32 max-w-2xl mx-auto px-4">
        <main className="bg-white rounded-lg shadow p-10 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full">
            <div className="bg-gray-200 flex items-center justify-center rounded-full w-56 h-56 mb-6 overflow-hidden">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile"
                  className="object-cover w-56 h-56"
                />
              ) : (
                <span className="text-gray-400 text-5xl">[Image]</span>
              )}
            </div>
            {editMode && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageChange}
                />
                <div className="flex gap-2 mb-2">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    Upload Image
                  </button>
                  {preview && (
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition"
                      onClick={() => {
                        setPreview("");
                        setUser({ ...user, profilePicture: "" });
                      }}
                      type="button"
                    >
                      Hapus Gambar
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* User Data */}
          <div className="space-y-6 w-full mt-8">
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            {success && (
              <div className="text-green-600 text-sm mb-2">{success}</div>
            )}
            <div className="mb-4">
              <span className="font-medium">Name :</span>{" "}
              {editMode ? (
                <input
                  className="border rounded px-2 py-1 w-full mt-1"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                />
              ) : (
                <span className="ml-2">{user.name}</span>
              )}
            </div>
            <div className="mb-4">
              <span className="font-medium">Email :</span>{" "}
              {editMode ? (
                <input
                  className="border rounded px-2 py-1 w-full mt-1"
                  name="email"
                  type="email"
                  value={user.email}
                  onChange={handleChange}
                />
              ) : (
                <span className="ml-2 text-gray-500">{user.email}</span>
              )}
            </div>
            <div className="mb-4">
              <span className="font-medium">Address :</span>{" "}
              {editMode ? (
                <input
                  className="border rounded px-2 py-1 w-full mt-1"
                  name="address"
                  value={user.address}
                  onChange={handleChange}
                />
              ) : (
                <span className="ml-2">{user.address}</span>
              )}
            </div>
            <div className="mb-4">
              <span className="font-medium">Phone Number :</span>{" "}
              {editMode ? (
                <input
                  className="border rounded px-2 py-1 w-full mt-1"
                  name="phone"
                  value={user.phone}
                  onChange={handleChange}
                />
              ) : (
                <span className="ml-2">{user.phone}</span>
              )}
            </div>

            {editMode ? (
              <div className="flex gap-2 mt-4">
                <button
                  className="px-4 py-2 rounded bg-green-600 text-white text-sm hover:bg-green-700 transition"
                  onClick={handleSave}
                  disabled={saveLoading}
                  type="button"
                >
                  {saveLoading ? "Saving..." : "Save"}
                </button>
                <button
                  className="px-4 py-2 rounded bg-gray-300 text-gray-700 text-sm hover:bg-gray-400 transition"
                  onClick={() => {
                    setEditMode(false);
                    setPreview(user.profilePicture || "");
                    setError(null);
                    setSuccess(null);
                  }}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  className="mt-8 px-4 py-2 rounded bg-black text-white text-sm hover:bg-gray-800 transition w-full"
                  onClick={() => setEditMode(true)}
                  type="button"
                  disabled={loading}
                >
                  Edit
                </button>
                <button
                  className="mt-4 px-4 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700 transition w-full"
                  onClick={handleLogout}
                  type="button"
                  disabled={loading}
                >
                  Log Out
                </button>
                <button
                  className="mt-4 px-4 py-2 rounded bg-gray-400 text-black text-sm hover:bg-gray-500 transition w-full"
                  onClick={handleBack}
                  type="button"
                  disabled={loading}
                >
                  Back to Marketplace
                </button>
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default UserProfile;