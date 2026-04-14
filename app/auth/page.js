"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthPage() {
  const { register, login, user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already authenticated — redirect away from auth page
  if (user) {
    router.replace("/");
    return null;
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  // Handles both login and registration in a single submit handler
  // Maps Firebase error codes to user-friendly messages
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        if (!form.name.trim()) { setError("Please enter your name."); setLoading(false); return; }
        await register(form.email, form.password, form.name.trim());
      } else {
        await login(form.email, form.password);
      }
      router.push("/");
    } catch (err) {
      const messages = {
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
      };
      setError(messages[err.code] || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {/* Branding */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-3xl">🐾</span>
              <span className="font-black text-xl text-gray-900">
                Snout <span className="text-pink-500">&amp;</span> About
              </span>
            </Link>
            <p className="mt-3 text-gray-500 text-sm">
              {mode === "login" ? "Welcome back! Sign in to continue." : "Create your account to start shopping."}
            </p>
          </div>

          {/* Mode toggle — switching clears any existing error */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === m ? "bg-white shadow text-pink-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field — only shown in register mode */}
            {mode === "register" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Jane Smith"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 transition-colors"
              />
            </div>

            {/* Inline error banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-bold py-3 rounded-full transition-colors mt-2 shadow-lg shadow-pink-200"
            >
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
