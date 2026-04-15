"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { collection, getDocs, query, where, doc, getDoc, setDoc, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Package, Heart } from "@/components/Icons";

// Compact order summary card — truncates item list to 2 with "+N more" overflow
function OrderCard({ order }) {
  const date = order.createdAt?.toDate?.()?.toLocaleDateString("en-CA") ?? "—";
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          {/* Display first 8 chars of Firestore doc ID as a short order reference */}
          <p className="font-mono text-xs text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-sm text-gray-500 mt-0.5">{date}</p>
        </div>
        <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full capitalize">
          {order.status ?? "confirmed"}
        </span>
      </div>
      <div className="text-sm text-gray-600 space-y-0.5">
        {order.items?.slice(0, 2).map((item) => (
          <p key={item.id}>{item.name} × {item.quantity}</p>
        ))}
        {order.items?.length > 2 && <p className="text-gray-400">+{order.items.length - 2} more items</p>}
      </div>
      <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
        <span className="text-gray-500">Total</span>
        <span className="font-bold text-gray-900">${order.total?.toFixed(2)}</span>
      </div>
    </div>
  );
}

function ProfileContent() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [tab, setTab] = useState("orders");
  const [loading, setLoading] = useState(true);

  // Fetch the user's order history on mount, sorted newest first
  useEffect(() => {
    if (!user) return;
    async function fetchOrders() {
      try {
        // No orderBy here — avoids needing a Firestore composite index
        // Sort newest-first client-side using the createdAt timestamp instead
        const ordersSnap = await getDocs(
          query(collection(db, "orders"), where("uid", "==", user.uid))
        );
        const fetched = ordersSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        setOrders(fetched);
      } catch (err) {
        console.error("Orders fetch error:", err.code, err.message);
      } finally { setLoading(false); }
    }

    // Load wishlist count immediately so the tab badge is correct on first render
    async function fetchWishlistCount() {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        setWishlistCount(userDoc.data()?.wishlist?.length ?? 0);
      } catch {}
    }

    fetchOrders();
    fetchWishlistCount();
  }, [user]);

  // Lazy-load wishlist products only when the wishlist tab is opened
  // Fetches each saved product ID individually since Firestore has no "IN array" server join
  useEffect(() => {
    if (!user || tab !== "wishlist") return;
    async function fetchWishlist() {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const wishlistIds = userDoc.data()?.wishlist ?? [];
        if (wishlistIds.length > 0) {
          const products = await Promise.all(
            wishlistIds.map((id) => getDoc(doc(db, "products", id)))
          );
          const loaded = products.filter((d) => d.exists()).map((d) => ({ id: d.id, ...d.data() }));
          setWishlist(loaded);
          setWishlistCount(loaded.length);
        } else {
          setWishlist([]);
          setWishlistCount(0);
        }
      } catch {}
    }
    fetchWishlist();
  }, [user, tab]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Profile header with avatar, name, email, and sign-out */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-black text-2xl">
            {user?.displayName?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{user?.displayName}</h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors font-medium border border-gray-200 hover:border-red-200 px-4 py-2 rounded-full"
        >
          Sign out
        </button>
      </div>

      {/* Tab switcher: Orders / Wishlist — counts update as data loads */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 max-w-xs">
        {["orders", "wishlist"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              tab === t ? "bg-white shadow text-pink-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "orders" ? `Orders (${orders.length})` : `Wishlist (${wishlistCount})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
        </div>
      ) : tab === "orders" ? (
        orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No orders yet</p>
            <Link href="/products" className="text-pink-500 text-sm font-semibold hover:underline mt-2 inline-block">Start shopping</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {orders.map((order) => <OrderCard key={order.id} order={order} />)}
          </div>
        )
      ) : (
        wishlist.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Your wishlist is empty</p>
            <Link href="/products" className="text-pink-500 text-sm font-semibold hover:underline mt-2 inline-block">Browse products</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlist.map((product) => (
              <div key={product.id} className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                {/* Remove from wishlist — uses merge write to avoid overwriting other profile fields */}
                <button
                  onClick={async () => {
                    await setDoc(doc(db, "users", user.uid), { wishlist: arrayRemove(product.id) }, { merge: true });
                    setWishlist((prev) => {
                      const updated = prev.filter((p) => p.id !== product.id);
                      setWishlistCount(updated.length);
                      return updated;
                    });
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-pink-50 transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
                <Link href={`/products/${product.id}`}>
                  <p className="text-xs text-pink-500 font-semibold uppercase tracking-wide">{product.category}</p>
                  <p className="font-semibold text-gray-900 mt-1 pr-6">{product.name}</p>
                  <p className="text-pink-500 font-bold mt-1">${product.price?.toFixed(2)}</p>
                </Link>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// Wraps content in ProtectedRoute so unauthenticated users are redirected to /auth
export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
