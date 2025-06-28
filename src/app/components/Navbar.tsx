"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaShoppingCart, FaUserCircle, FaSearch, FaHistory, FaCreditCard } from "react-icons/fa";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Check if we're on the landing page
  const isLandingPage = pathname === "/";

  useEffect(() => {
    const checkSession = () => {
      if (typeof window === "undefined") return;
      const loginTime = sessionStorage.getItem("loginTime");
      const isLoggedInSession = sessionStorage.getItem("isLoggedIn") === "true";
      const uid = sessionStorage.getItem("userId");
      if (isLoggedInSession && loginTime) {
        const now = Date.now();
        const loginTimestamp = parseInt(loginTime, 10);
        if (now - loginTimestamp > 3600000) {
          sessionStorage.removeItem("isLoggedIn");
          sessionStorage.removeItem("loginTime");
          setIsLoggedIn(false);
          setUserId(null);
        } else {
          setIsLoggedIn(true);
          setUserId(uid ? Number(uid) : null);
        }
      } else {
        setIsLoggedIn(false);
        setUserId(null);
      }
      // Ambil profilePic jika ada
      const pic = sessionStorage.getItem("profilePic");
      setProfilePic(pic || null);
    };
    checkSession();
    const interval = setInterval(checkSession, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch cart count
  useEffect(() => {
    const fetchCartCount = async () => {
      if (!isLoggedIn || !userId) {
        setCartCount(0);
        return;
      }
      try {
        const res = await fetch(`/api/cart/${userId}`);
        if (res.ok) {
          const data = await res.json();
          const count = data.reduce((sum: number, item: any) => sum + item.quantity, 0);
          setCartCount(count);
        } else {
          setCartCount(0);
        }
      } catch {
        setCartCount(0);
      }
    };
    fetchCartCount();
  }, [isLoggedIn, userId]);

  useEffect(() => {
    const fetchSearch = async () => {
      if (search.trim().length === 0) {
        setSearchResults([]);
        setShowDropdown(false);
        setIsSearching(false);
        return;
      }
      
      // Only search if search term is at least 2 characters
      if (search.trim().length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/product/search?name=${encodeURIComponent(search.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setShowDropdown(data.length > 0);
        } else {
          setSearchResults([]);
          setShowDropdown(false);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    };
    // Debounce search
    const timeout = setTimeout(fetchSearch, 400);
    return () => clearTimeout(timeout);
  }, [search]);

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

  const goToOrderHistory = () => {
    if (isLoggedIn) {
      router.push("/frontend/order-history");
    } else {
      router.push("/frontend/login");
    }
  };

  const goToPaymentStatus = () => {
    router.push("/frontend/payment-status");
  };

  const goToProductDetail = (id: number) => {
    setShowDropdown(false);
    setSearch("");
    router.push(`/frontend/detail_product/${id}`);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("loginTime");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("profilePic");
    setIsLoggedIn(false);
    setUserId(null);
    setShowUserMenu(false);
    router.push("/frontend/marketplace");
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white shadow fixed top-0 left-0 w-full z-50">
      <div className="text-2xl font-bold cursor-pointer" onClick={goToShop}>
        JMT Archery
      </div>
      {/* Search Box */}
      <div className="relative flex-1 mx-8 max-w-lg">
        <div className="flex items-center bg-gray-50 hover:bg-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 rounded-lg px-4 py-2 transition-all duration-200 border border-gray-200 hover:border-gray-300">
          <FaSearch className="text-gray-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            className="bg-transparent outline-none w-full py-1 text-base placeholder-gray-500"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          />
          {isSearching && (
            <div className="ml-2 flex-shrink-0">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
          {search && !isSearching && (
            <button
              onClick={() => {
                setSearch("");
                setShowDropdown(false);
              }}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors duration-150"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {showDropdown && (
          <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Mencari produk...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center">
                <div className="text-gray-400 text-2xl mb-2">🔍</div>
                <p className="text-gray-500 text-sm">Produk tidak ditemukan</p>
                <p className="text-gray-400 text-xs mt-1">Coba kata kunci lain</p>
              </div>
            ) : (
              <>
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-600 font-medium">
                    {searchResults.length} produk ditemukan
                  </p>
                </div>
                {searchResults.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                    onClick={() => goToProductDetail(prod.id)}
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={prod.image || "/no-image.png"}
                        alt={prod.name}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {prod.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-green-600">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(prod.price)}
                        </span>
                        <span className="text-xs text-gray-500">
                          • Stok: {prod.stock}
                        </span>
                      </div>
                      {prod.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {prod.description}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="p-3 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center">
                    Klik produk untuk melihat detail
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {/* Payment Status - Hidden on landing page */}
        {!isLandingPage && (
          <button
            onClick={goToPaymentStatus}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
            title="Daftar Pesanan"
          >
            <FaCreditCard size={16} />
            <span className="hidden md:inline">Daftar Pesanan</span>
          </button>
        )}

        {/* Cart Icon */}
        <div
          className="relative cursor-pointer"
          onClick={() =>
            isLoggedIn && userId
              ? router.push("/frontend/cart")
              : router.push("/frontend/login")
          }
        >
          <FaShoppingCart size={28} />
          {isLoggedIn && cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2">
              {cartCount}
            </span>
          )}
        </div>

        {/* User Icon / Login Button */}
        {isLoggedIn ? (
          <div className="relative">
            {profilePic ? (
              <img
                src={profilePic}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover cursor-pointer"
                onClick={() => setShowUserMenu(!showUserMenu)}
              />
            ) : (
              <FaUserCircle
                size={30}
                className="cursor-pointer"
                onClick={() => setShowUserMenu(!showUserMenu)}
              />
            )}
            
            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      goToProfile();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaUserCircle size={16} />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      goToOrderHistory();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaHistory size={16} />
                    Riwayat Order
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            className="border px-4 py-1 text-sm rounded hover:bg-gray-100"
            onClick={goToLogin}
          >
            Login
          </button>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
}
