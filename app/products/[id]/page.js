import { doc, getDoc, collection, getDocs, orderBy, query, limit, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { notFound } from "next/navigation";
import Link from "next/link";
import ImageGallery from "@/components/ImageGallery";
import ProductTabs from "@/components/ProductTabs";
import ReviewsSection from "./ReviewsSection";
import AddToCartSection from "./AddToCartSection";

// Fetches a single product document; returns null if it doesn't exist
async function getProduct(id) {
  const snap = await getDoc(doc(db, "products", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// Fetches the reviews sub-collection for a product, newest first
async function getReviews(id) {
  try {
    const snap = await getDocs(
      query(collection(db, "products", id, "reviews"), orderBy("createdAt", "desc"))
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

// Fetches up to 4 products in the same category, excluding the current product
async function getRelatedProducts(category, currentId) {
  try {
    const snap = await getDocs(
      query(collection(db, "products"), where("category", "==", category), limit(5))
    );
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p) => p.id !== currentId)
      .slice(0, 4);
  } catch {
    return [];
  }
}

// Generates per-product <title> and <meta description> for SEO
export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product Not Found — Snout & About" };
  return {
    title: `${product.name} — Snout & About`,
    description: product.description,
  };
}

// Star rating row used in the product info panel
function StarRow({ rating, count }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg key={s} className={`w-5 h-5 ${s <= Math.round(rating) ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm text-gray-500 font-medium">
        {rating.toFixed(1)} <span className="text-gray-300">·</span> {count} review{count !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

// Individual review card shown in the reviews grid
function ReviewCard({ review }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar shows first letter of reviewer's display name */}
        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-sm shrink-0">
          {review.displayName?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{review.displayName}</p>
          <div className="flex gap-0.5 mt-0.5">
            {[1,2,3,4,5].map((s) => (
              <svg key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
    </div>
  );
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;

  // Fetch product and reviews in parallel; related products require the category
  // from the product result so they are fetched sequentially after
  const [product, reviews] = await Promise.all([
    getProduct(id),
    getReviews(id),
  ]);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product.category, id);

  // Average rating calculated from the fetched reviews (not the denormalised field)
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // Normalise images: support both a single `image` string and an `images` array
  const images = product.images ?? (product.image ? [product.image] : []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb trail */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 flex-wrap">
        <Link href="/" className="hover:text-pink-500 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-pink-500 transition-colors">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category}`} className="hover:text-pink-500 transition-colors capitalize">
          {product.category}
        </Link>
        {product.type && (
          <>
            <span>/</span>
            <Link href={`/products?type=${product.type}`} className="hover:text-pink-500 transition-colors capitalize">
              {product.type}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-600 font-medium truncate max-w-50">{product.name}</span>
      </nav>

      {/* Main two-column layout: image gallery left, product info right */}
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">

        {/* Left — image gallery (client component handles thumbnail switching) */}
        <ImageGallery images={images} name={product.name} category={product.category} />

        {/* Right — product metadata and purchase controls */}
        <div className="flex flex-col gap-5">

          {/* Category / type label above title */}
          <div>
            <p className="text-pink-500 font-bold text-xs uppercase tracking-widest mb-1">
              {product.category} · {product.type}
            </p>
            <h1 className="text-3xl font-black text-gray-900 leading-tight">{product.name}</h1>
          </div>

          {/* Aggregate star rating — only shown when reviews exist */}
          {reviews.length > 0 && (
            <StarRow rating={avgRating} count={reviews.length} />
          )}

          {/* Feature highlight badges */}
          {product.features && product.features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.features.map((f) => (
                <span key={f} className="inline-flex items-center gap-1 bg-pink-50 border border-pink-100 text-pink-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <span className="text-base">✓</span> {f}
                </span>
              ))}
            </div>
          )}

          {/* Out-of-stock banner or interactive add-to-cart controls */}
          {product.inStock === false ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
              <p className="text-red-600 font-bold">Out of Stock</p>
              <p className="text-red-400 text-sm mt-0.5">Check back soon!</p>
            </div>
          ) : (
            <AddToCartSection product={product} />
          )}

          {/* Free delivery nudge */}
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-lg">🚚</span>
            <span>Free delivery on orders over <span className="font-semibold text-gray-700">$50</span></span>
          </div>
        </div>
      </div>

      {/* Tabbed content: Description, Ingredients, Delivery info */}
      <ProductTabs
        description={product.description}
        ingredients={product.ingredients}
        details={product.details}
      />

      {/* Reviews section: existing reviews + write-a-review form side by side */}
      <section className="mt-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-gray-900">
            {reviews.length > 0 ? `Reviews (${reviews.length})` : "Reviews"}
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="text-yellow-400 text-lg">★</span>
              <span className="font-bold text-gray-900">{avgRating.toFixed(1)}</span>
              <span>out of 5</span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left column: existing review cards */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400">
                <p className="text-3xl mb-2">💬</p>
                <p className="font-medium">No reviews yet</p>
                <p className="text-sm mt-1">Be the first to share your experience!</p>
              </div>
            ) : (
              reviews.map((r) => <ReviewCard key={r.id} review={r} />)
            )}
          </div>

          {/* Right column: review submission form (client component) */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-black text-gray-900 text-lg mb-5">Write a Review</h3>
            <ReviewsSection productId={id} initialReviews={reviews} />
          </div>
        </div>
      </section>

      {/* Related products carousel — only shown when results exist */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-gray-100 pt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900">You Might Also Like</h2>
            <Link href={`/products?category=${product.category}`} className="text-pink-500 text-sm font-semibold hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {p.category === "cat" ? "🐱" : "🐶"}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-pink-500 font-semibold uppercase tracking-wide">{p.category}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5 leading-snug line-clamp-2 group-hover:text-pink-600 transition-colors">{p.name}</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">${p.price?.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
