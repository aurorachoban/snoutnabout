"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import CartDrawer from "./CartDrawer";

export default function NavBar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Redirect to filtered products page on search submit
  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  }

  // Sign out and redirect to home
  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-pink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="text-2xl">🐾</span>
              <span className="font-black text-xl tracking-tight text-gray-900">
                Snout <span className="text-pink-500">&amp;</span> About
              </span>
            </Link>

            {/* Search — hidden on mobile, shown on sm+ */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden sm:flex">
              <div className="flex w-full rounded-full border border-gray-200 overflow-hidden focus-within:border-pink-400 transition-colors">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search treats, toys, food..."
                  className="flex-1 px-4 py-2 text-sm outline-none bg-white"
                />
                <button
                  type="submit"
                  className="px-4 bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Right-side actions: cart icon + auth */}
            <div className="flex items-center gap-3">
              {/* Cart button with badge showing total item count */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-full hover:bg-pink-50 transition-colors"
                aria-label="Open cart"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>

              {/* Auth: avatar dropdown when logged in, sign-in link otherwise */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-pink-500 transition-colors"
                  >
                    {/* Avatar shows first letter of display name */}
                    <span className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-sm">
                      {user.displayName?.[0]?.toUpperCase() || "U"}
                    </span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50" onClick={() => setMenuOpen(false)}>Profile</Link>
                      <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50">Sign out</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="text-sm font-semibold text-white bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-full transition-colors"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>

          {/* Mobile search — visible only below sm breakpoint */}
          <form onSubmit={handleSearch} className="flex sm:hidden pb-3">
            <div className="flex w-full rounded-full border border-gray-200 overflow-hidden focus-within:border-pink-400 transition-colors">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search treats, toys, food..."
                className="flex-1 px-4 py-2 text-sm outline-none bg-white"
              />
              <button type="submit" className="px-4 bg-pink-500 text-white text-sm font-medium hover:bg-pink-600">
                Search
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* Slide-in cart drawer — rendered outside the header to avoid z-index stacking issues */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
