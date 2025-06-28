"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Navbar";

const AuthCard = () => {
  const router = useRouter();
  const [isSignIn, setIsSignIn] = useState(true);
  const [fade, setFade] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [isReset, setIsReset] = useState(false);

  // Sign In state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Sign Up state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [signUpSuccess, setSignUpSuccess] = useState("");

  // Forgot Password state
  const [forgotInput, setForgotInput] = useState(""); // email or phone
  const [forgotError, setForgotError] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [contactInfo, setContactInfo] = useState(""); // email/no hp yang terdaftar

  // Inisialisasi Remember Me hanya di client
  useEffect(() => {
    if (typeof window !== "undefined") {
      setEmail(localStorage.getItem("rememberEmail") || "");
      setPassword(localStorage.getItem("rememberPassword") || "");
      setRememberMe(localStorage.getItem("rememberMe") === "true");
    }
  }, []);

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSignInError(data.error || "Login gagal");
        return;
      }
      const data = await res.json();

      // Remember Me logic (hanya simpan email, jangan password)
      if (rememberMe) {
        localStorage.setItem("rememberEmail", email);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberEmail");
        localStorage.setItem("rememberMe", "false");
      }

      // Set session login & waktu login & userId dari backend
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("loginTime", Date.now().toString());
      if (data.user && data.user.id) {
        sessionStorage.setItem("userId", String(data.user.id));
      }
      if (data.user && data.user.profilePic) {
        sessionStorage.setItem("profilePic", data.user.profilePic);
      }
      // Simpan data user ke database jika belum ada (opsional, tergantung backend)
      // Jika backend sudah otomatis menyimpan user saat login, bagian ini bisa diabaikan

      // Simpan data user ke sessionStorage (opsional)
      sessionStorage.setItem("userData", JSON.stringify(data.user));

      // Redirect ke halaman marketplace atau redirectAfterLogin jika ada
      const redirect = sessionStorage.getItem("redirectAfterLogin");
      if (redirect) {
        sessionStorage.removeItem("redirectAfterLogin");
        router.push(redirect);
      } else {
        router.push("/frontend/marketplace");
      }
    } catch {
      setSignInError("Terjadi kesalahan saat login.");
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError("");
    setSignUpSuccess("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          name: signupName,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSignUpError(data.error || "Registrasi gagal");
        return;
      }
      setSignUpSuccess("Registrasi berhasil! Silakan login.");
      setTimeout(() => {
        setFade(true);
        setTimeout(() => {
          setIsSignIn(true);
          setFade(false);
        }, 300);
      }, 1000);
    } catch {
      setSignUpError("Terjadi kesalahan saat registrasi.");
    }
  };

  // Transisi ke Sign Up
  const handleSwitchToSignUp = () => {
    setFade(true);
    setTimeout(() => {
      setIsSignIn(false);
      setFade(false);
    }, 300);
  };

  // Transisi ke Sign In
  const handleSwitchToSignIn = () => {
    setFade(true);
    setTimeout(() => {
      setIsSignIn(true);
      setFade(false);
      setIsForgot(false);
      setIsReset(false);
      setForgotInput("");
      setForgotError("");
      setResetCode("");
      setResetPassword("");
      setResetError("");
      setResetSuccess("");
    }, 300);
  };

  // Handle forgot password request
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setContactInfo("");
    try {
      const res = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: forgotInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || "Gagal mengirim kode reset.");
        return;
      }
      setContactInfo(data.contact || forgotInput);
      setIsReset(true);
    } catch {
      setForgotError("Terjadi kesalahan saat mengirim kode reset.");
    }
  };

  // Handle reset password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: forgotInput,
          code: resetCode,
          newPassword: resetPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetError(data.error || "Reset password gagal.");
        return;
      }
      setResetSuccess("Password berhasil direset! Silakan login.");
      setTimeout(() => {
        handleSwitchToSignIn();
      }, 1500);
    } catch {
      setResetError("Terjadi kesalahan saat reset password.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans text-gray-900 w-full max-w-none bg-gray-50">
      <Header />

      <main className="flex flex-col items-center justify-center flex-1 p-4">
        <div
          className={`w-full max-w-sm p-6 border rounded bg-white shadow transition-opacity duration-300 ${
            fade ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* SIGN IN */}
          {isSignIn && !isForgot && (
            <>
              <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
              <form onSubmit={handleSignIn}>
                <label className="block mb-2 text-sm font-medium">Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full mb-4 p-2 border rounded"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label className="block mb-2 text-sm font-medium">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full mb-4 p-2 border rounded"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="flex items-center mb-4">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="rememberMe" className="text-sm select-none">
                    Remember Me
                  </label>
                </div>
                {signInError && (
                  <div className="text-red-600 mb-2">{signInError}</div>
                )}
                <button
                  type="submit"
                  className="w-full bg-black text-white py-2 rounded mb-2"
                >
                  Sign In
                </button>
              </form>
              <div className="flex justify-between mt-2">
                <button
                  className="text-blue-600 hover:underline text-sm"
                  type="button"
                  onClick={() => setIsForgot(true)}
                >
                  Forgot password?
                </button>
                <div>
                  <span className="text-sm">Belum punya akun?</span>
                  <button
                    className="ml-2 text-blue-600 hover:underline text-sm"
                    type="button"
                    onClick={handleSwitchToSignUp}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </>
          )}

          {/* SIGN UP */}
          {!isSignIn && !isForgot && (
            <>
              <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
              <form onSubmit={handleSignUp}>
                <label className="block mb-2 text-sm font-medium">Nama</label>
                <input
                  type="text"
                  placeholder="Nama"
                  className="w-full mb-4 p-2 border rounded"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                />
                <label className="block mb-2 text-sm font-medium">Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full mb-4 p-2 border rounded"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
                <label className="block mb-2 text-sm font-medium">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full mb-4 p-2 border rounded"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
                {signUpError && (
                  <div className="text-red-600 mb-2">{signUpError}</div>
                )}
                {signUpSuccess && (
                  <div className="text-green-600 mb-2">{signUpSuccess}</div>
                )}
                <button
                  type="submit"
                  className="w-full bg-black text-white py-2 rounded mb-2"
                >
                  Sign Up
                </button>
              </form>
              <div className="text-center mt-2">
                <span className="text-sm">Sudah punya akun?</span>
                <button
                  className="ml-2 text-blue-600 hover:underline text-sm"
                  type="button"
                  onClick={handleSwitchToSignIn}
                >
                  Sign In
                </button>
              </div>
            </>
          )}

          {/* FORGOT PASSWORD - STEP 1 */}
          {isForgot && !isReset && (
            <>
              <h1 className="text-2xl font-bold mb-6 text-center">
                Lupa Password
              </h1>
              <form onSubmit={handleForgotSubmit}>
                <label className="block mb-2 text-sm font-medium">
                  Masukkan Email atau No HP yang terdaftar
                </label>
                <input
                  type="text"
                  placeholder="Email atau No HP"
                  className="w-full mb-4 p-2 border rounded"
                  value={forgotInput}
                  onChange={(e) => setForgotInput(e.target.value)}
                  required
                />
                {forgotError && (
                  <div className="text-red-600 mb-2">{forgotError}</div>
                )}
                <button
                  type="submit"
                  className="w-full bg-black text-white py-2 rounded mb-2"
                >
                  Kirim Kode Reset
                </button>
              </form>
              <div className="text-center mt-2">
                <button
                  className="text-blue-600 hover:underline text-sm"
                  type="button"
                  onClick={handleSwitchToSignIn}
                >
                  Kembali ke Login
                </button>
              </div>
            </>
          )}

          {/* FORGOT PASSWORD - STEP 2 */}
          {isForgot && isReset && (
            <>
              <h1 className="text-2xl font-bold mb-6 text-center">
                Reset Password
              </h1>
              <p className="mb-2 text-sm text-gray-700">
                Masukkan kode reset yang dikirim ke <b>{contactInfo}</b>
              </p>
              <form onSubmit={handleResetSubmit}>
                <label className="block mb-2 text-sm font-medium">
                  Kode Reset
                </label>
                <input
                  type="text"
                  placeholder="Kode Reset"
                  className="w-full mb-4 p-2 border rounded"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  required
                />
                <label className="block mb-2 text-sm font-medium">
                  Password Baru
                </label>
                <input
                  type="password"
                  placeholder="Password Baru"
                  className="w-full mb-4 p-2 border rounded"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  required
                />
                {resetError && (
                  <div className="text-red-600 mb-2">{resetError}</div>
                )}
                {resetSuccess && (
                  <div className="text-green-600 mb-2">{resetSuccess}</div>
                )}
                <button
                  type="submit"
                  className="w-full bg-black text-white py-2 rounded mb-2"
                >
                  Reset Password
                </button>
              </form>
              <div className="text-center mt-2">
                <button
                  className="text-blue-600 hover:underline text-sm"
                  type="button"
                  onClick={handleSwitchToSignIn}
                >
                  Kembali ke Login
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuthCard;
