import { Suspense } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";
import CategoryNav from "@/components/CategoryNav";
import ProductFilters from "./ProductFilters";
import { Search } from "@/components/Icons";

export const dynamic = "force-dynamic";

// Fetches products from Firestore, applying category/type filters server-side
// and keyword search + sorting client-side (Firestore doesn't support full-text search)
async function getProducts({ category, type, q, sort }) {
  try {
    let constraints = [];
    if (category) constraints.push(where("category", "==", category));
    if (type) constraints.push(where("type", "==", type));

    const snap = await getDocs(query(collection(db, "products"), ...constraints));
    let products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Client-side keyword filter across name and description fields
    if (q) {
      const lower = q.toLowerCase();
      products = products.filter(
        (p) =>
          p.name?.toLowerCase().includes(lower) ||
          p.description?.toLowerCase().includes(lower)
      );
    }

    // Client-side sort — defaults to popularity when no sort param is provided
    if (sort === "price_asc") products.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") products.sort((a, b) => b.price - a.price);
    else if (sort === "rating") products.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else products.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));

    return products;
  } catch {
    return [];
  }
}

// Generates a dynamic <title> based on the active search or category filter
export async function generateMetadata({ searchParams }) {
  const { category, q } = await searchParams;
  const title = q
    ? `Search: "${q}" — Snout & About`
    : category
    ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products — Snout & About`
    : "All Products — Snout & About";
  return { title };
}

export default async function ProductsPage({ searchParams }) {
  const { category, type, q, sort, minPrice, maxPrice } = await searchParams;
  let products = await getProducts({ category, type, q, sort });

  // Price range filter applied after fetching (avoids composite Firestore index requirements)
  if (minPrice) products = products.filter((p) => p.price >= Number(minPrice));
  if (maxPrice) products = products.filter((p) => p.price <= Number(maxPrice));

  // Human-readable page heading derived from active filters
  const heading = q
    ? `Results for "${q}"`
    : category
    ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products`
    : "All Products";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={<div className="h-24" />}>
        <CategoryNav />
      </Suspense>

      <div className="mt-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar with sort and price-range filters */}
        <aside className="lg:w-56 shrink-0">
          <ProductFilters currentSort={sort} currentMin={minPrice} currentMax={maxPrice} />
        </aside>

        {/* Product grid */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-black text-gray-900">{heading}</h1>
            <span className="text-sm text-gray-500">{products.length} product{products.length !== 1 ? "s" : ""}</span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="font-semibold text-lg">No products found</p>
              <p className="text-sm mt-1">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
