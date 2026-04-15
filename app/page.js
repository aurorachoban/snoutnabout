import Link from "next/link";
import { Suspense } from "react";
import CategoryNav from "@/components/CategoryNav";
import { collection, getDocs, query, limit, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";



// Force dynamic rendering — prevents Next.js from trying to statically
// prerender this page at build time (Firestore can't be called during build)
export const dynamic = "force-dynamic";

// Fetches products marked as featured for the homepage grid
async function getFeaturedProducts() {
  try {
    const q = query(collection(db, "products"), where("featured", "==", true), limit(8));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? null,
    }));
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Snout & About — Pet Supplies for Happy Pets",
  description: "Shop premium pet supplies for dogs and cats. Food, toys, treats, and accessories delivered to your door.",
};

export default async function Home() {
  const featured = await getFeaturedProducts();

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-linear-to-br from-pink-50 via-white to-lime-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-1 text-center sm:text-left">
              <p className="text-pink-500 font-bold text-sm uppercase tracking-widest mb-3">
                For dogs, cats &amp; the humans who love them
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                Spoil your<br />
                <span className="text-pink-500">furry family</span>
              </h1>
              <p className="mt-5 text-lg text-gray-600 max-w-md">
                Premium pet supplies curated with love — from gourmet treats to cosy beds. Free shipping on orders over $50.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center sm:justify-start">
                <Link
                  href="/products?category=dog"
                  className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full transition-colors shadow-lg shadow-pink-200"
                >
                  🐶 Shop for Dogs
                </Link>
                <Link
                  href="/products?category=cat"
                  className="px-6 py-3 bg-white border-2 border-pink-200 hover:border-pink-400 text-gray-800 font-bold rounded-full transition-colors"
                >
                  🐱 Shop for Cats
                </Link>
              </div>
            </div>
            {/* Hero image — hidden on mobile */}
            <div className="shrink-0 hidden sm:block w-72 h-72 rounded-3xl overflow-hidden shadow-2xl shadow-pink-200">
              <img
                src="/products/home-pic.jpg"
                alt="Happy pets"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
        {/* Decorative background blobs */}
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-lime-200/30 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Category navigation cards */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-black text-gray-900 text-center mb-4">Browse by Category</h2>
        <Suspense fallback={<div className="h-24" />}>
          <CategoryNav />
        </Suspense>
      </section>

      {/* Featured products grid */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-900">Featured Products</h2>
          <Link href="/products" className="text-pink-500 font-semibold text-sm hover:underline">View all →</Link>
        </div>
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          // Empty state shown before seeding Firestore
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🐾</p>
            <p className="font-medium">Products coming soon!</p>
            <p className="text-sm mt-1">Check back after you&apos;ve seeded Firestore with products.</p>
          </div>
        )}
      </section>

      {/* Dog / Cat promo banners */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="relative rounded-3xl overflow-hidden bg-linear-to-br from-amber-100 to-orange-200 p-8 flex flex-col justify-between min-h-45">
            <div>
              <p className="font-black text-2xl text-amber-900">Dog Lovers</p>
              <p className="text-amber-700 mt-1">Everything your pup needs</p>
            </div>
            <Link href="/products?category=dog" className="self-start mt-4 px-4 py-2 bg-amber-800 text-white rounded-full text-sm font-semibold hover:bg-amber-900 transition-colors">
              Shop Dogs →
            </Link>
            <span className="absolute right-6 bottom-4 text-7xl opacity-40 select-none">🐶</span>
          </div>
          <div className="relative rounded-3xl overflow-hidden bg-linear-to-br from-purple-100 to-pink-200 p-8 flex flex-col justify-between min-h-45">
            <div>
              <p className="font-black text-2xl text-purple-900">Cat Lovers</p>
              <p className="text-purple-700 mt-1">Spoil your feline friend</p>
            </div>
            <Link href="/products?category=cat" className="self-start mt-4 px-4 py-2 bg-purple-800 text-white rounded-full text-sm font-semibold hover:bg-purple-900 transition-colors">
              Shop Cats →
            </Link>
            <span className="absolute right-6 bottom-4 text-7xl opacity-40 select-none">🐱</span>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-3 gap-6 text-center">
          {[
            { icon: "🚚", title: "Free Shipping", desc: "On all orders over $50" },
            { icon: "❤️", title: "Made with Love", desc: "Curated for happy, healthy pets" },
            { icon: "🔄", title: "Easy Returns", desc: "30-day hassle-free returns" },
          ].map((prop) => (
            <div key={prop.title} className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-pink-50">
              <span className="text-3xl">{prop.icon}</span>
              <p className="font-bold text-gray-900">{prop.title}</p>
              <p className="text-sm text-gray-500">{prop.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
