"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, orderBy, query, updateDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import { Package, Dog, Cat, Star } from "@/components/Icons";

export default function ProductList({ refreshKey }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState("");

  async function fetchProducts() {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      // fallback without orderBy if index not yet created
      const snap = await getDocs(collection(db, "products"));
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProducts(); }, [refreshKey]);

  async function handleDelete(product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(product.id);
    try {
      // Delete images from Storage
      const images = product.images ?? (product.image ? [product.image] : []);
      for (const url of images) {
        try {
          await deleteObject(ref(storage, url));
        } catch {
          // ignore — file may already be gone
        }
      }
      await deleteDoc(doc(db, "products", product.id));
      setProducts((p) => p.filter((x) => x.id !== product.id));
    } catch {
      alert("Failed to delete product.");
    } finally {
      setDeleting(null);
    }
  }

  async function toggleFeatured(product) {
    await updateDoc(doc(db, "products", product.id), { featured: !product.featured });
    setProducts((p) => p.map((x) => x.id === product.id ? { ...x, featured: !x.featured } : x));
  }

  async function toggleStock(product) {
    await updateDoc(doc(db, "products", product.id), { inStock: !product.inStock });
    setProducts((p) => p.map((x) => x.id === product.id ? { ...x, inStock: !x.inStock } : x));
  }

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.type?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400 transition-colors"
        />
        <span className="text-sm text-gray-400 shrink-0">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">{products.length === 0 ? "No products yet — add one above!" : "No results found."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => (
            <div key={product.id} className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-xl bg-gray-50 overflow-hidden shrink-0 relative">
                {product.image ? (
                  <Image src={product.image} alt={product.name} fill className="object-cover" sizes="56px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    {product.category === "cat" ? <Cat className="w-7 h-7 text-gray-300" /> : <Dog className="w-7 h-7 text-gray-300" />}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-900 text-sm truncate">{product.name}</p>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">{product.category}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">{product.type}</span>
                </div>
                <p className="text-pink-500 font-bold text-sm mt-0.5">${product.price?.toFixed(2)}</p>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
                <button
                  onClick={() => toggleFeatured(product)}
                  title="Toggle featured"
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold border transition-colors ${
                    product.featured
                      ? "bg-yellow-100 border-yellow-300 text-yellow-700"
                      : "bg-gray-100 border-gray-200 text-gray-400 hover:border-yellow-300"
                  }`}
                >
                  <Star className="w-3.5 h-3.5 inline mr-0.5" />{product.featured ? "Featured" : "Feature"}
                </button>
                <button
                  onClick={() => toggleStock(product)}
                  title="Toggle stock"
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold border transition-colors ${
                    product.inStock !== false
                      ? "bg-green-100 border-green-300 text-green-700"
                      : "bg-red-100 border-red-300 text-red-600"
                  }`}
                >
                  {product.inStock !== false ? "In Stock" : "Out of Stock"}
                </button>
                <Link
                  href={`/products/${product.id}`}
                  target="_blank"
                  className="text-xs text-gray-400 hover:text-pink-500 transition-colors font-medium"
                >
                  View ↗
                </Link>
                <button
                  onClick={() => handleDelete(product)}
                  disabled={deleting === product.id}
                  className="text-xs text-gray-300 hover:text-red-500 transition-colors font-medium disabled:opacity-50"
                >
                  {deleting === product.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
