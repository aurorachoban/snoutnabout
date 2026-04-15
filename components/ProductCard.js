"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";
import { Dog, Cat } from "@/components/Icons";

// Renders 5 star icons, filling up to the rounded rating value
function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductCard({ product }) {
  const { dispatch } = useCart();
  const { user } = useAuth();

  // Initialise wishlist state from the user's Firestore profile loaded in AuthContext
  const [wishlisted, setWishlisted] = useState(
    user?.profile?.wishlist?.includes(product.id) ?? false
  );
  // Briefly shows "Added!" feedback after adding to cart
  const [added, setAdded] = useState(false);

  // Adds the base product (no variant) to the cart with a short visual confirmation
  function handleAddToCart() {
    dispatch({ type: "ADD", item: { id: product.id, name: product.name, price: product.price, image: product.image } });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  // Toggles the product in/out of the user's wishlist array in Firestore
  // Uses setDoc + merge so it works even if the user doc doesn't exist yet
  async function handleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    try {
      const ref = doc(db, "users", user.uid);
      if (wishlisted) {
        await setDoc(ref, { wishlist: arrayRemove(product.id) }, { merge: true });
      } else {
        await setDoc(ref, { wishlist: arrayUnion(product.id) }, { merge: true });
      }
      setWishlisted(!wishlisted);
    } catch (err) {
      console.error("Wishlist error:", err.message);
    }
  }

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Wishlist heart — only visible when the user is signed in */}
      {user && (
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:scale-110 transition-transform"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg className={`w-5 h-5 ${wishlisted ? "text-pink-500 fill-current" : "text-gray-400"}`} fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      )}

      {/* Product image — falls back to an emoji if no image URL is set */}
      <Link href={`/products/${product.id}`} className="block aspect-square relative overflow-hidden bg-gray-50">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {product.category === "cat" ? <Cat className="w-16 h-16 text-gray-300" /> : <Dog className="w-16 h-16 text-gray-300" />}
          </div>
        )}
      </Link>

      {/* Card body: category label, name, rating, price, add-to-cart */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link href={`/products/${product.id}`}>
          <p className="text-xs text-pink-500 font-semibold uppercase tracking-wide">{product.category}</p>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug hover:text-pink-600 transition-colors line-clamp-2">{product.name}</h3>
        </Link>

        <div className="flex items-center gap-1.5">
          <StarRating rating={product.rating ?? 0} />
          <span className="text-xs text-gray-500">({product.reviewCount ?? 0})</span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-lg font-bold text-gray-900">${product.price?.toFixed(2)}</span>
          <button
            onClick={handleAddToCart}
            className={`text-xs font-semibold px-3 py-2 rounded-full transition-all ${
              added
                ? "bg-green-500 text-white"
                : "bg-pink-500 text-white hover:bg-pink-600"
            }`}
          >
            {added ? "Added!" : "+ Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
