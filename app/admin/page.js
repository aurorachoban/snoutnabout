"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AddProductForm from "./AddProductForm";
import ProductList from "./ProductList";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("list");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
    if (!loading && user && !user.isAdmin) router.push("/");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-pink-500 font-bold text-xs uppercase tracking-widest mb-1">Admin Panel</p>
        <h1 className="text-3xl font-black text-gray-900">Product Manager</h1>
        <p className="text-gray-400 text-sm mt-1">Add products, upload images, manage your store inventory.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 max-w-xs">
        {["list", "add"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              tab === t ? "bg-white shadow text-pink-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "list" ? "All Products" : "Add Product"}
          </button>
        ))}
      </div>

      {tab === "add" ? (
        <AddProductForm
          onAdded={() => {
            setRefreshKey((k) => k + 1);
            setTab("list");
          }}
        />
      ) : (
        <ProductList refreshKey={refreshKey} />
      )}
    </div>
  );
}
