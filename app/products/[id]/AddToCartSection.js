"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import VariantSelector from "@/components/VariantSelector";

// Client component that handles variant selection, quantity picking,
// add-to-cart, and wishlist toggling for the product detail page
export default function AddToCartSection({ product }) {
  const { dispatch } = useCart();
  const { user } = useAuth();

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  // Default to the first variant if the product has variants
  const [activeVariant, setActiveVariant] = useState(product.variants?.[0] ?? null);
  // Initialise wishlist state from the user's Firestore profile loaded in AuthContext
  const [wishlisted, setWishlisted] = useState(
    user?.profile?.wishlist?.includes(product.id) ?? false
  );

  // Variant price takes precedence over the base product price
  const displayPrice = activeVariant?.price ?? product.price;

  // Dispatches qty ADD actions so the cart reducer correctly increments quantities
  function handleAdd() {
    for (let i = 0; i < qty; i++) {
      dispatch({
        type: "ADD",
        item: {
          id: product.id,
          // Include variant label in cart item name so users can distinguish variants
          name: activeVariant ? `${product.name} (${activeVariant.label})` : product.name,
          price: displayPrice,
          image: product.image ?? product.images?.[0] ?? null,
        },
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  // Adds or removes the product from the user's wishlist array in Firestore via merge write
  async function handleWishlist() {
    if (!user) return;
    try {
      const ref = doc(db, "users", user.uid);
      if (wishlisted) {
        await setDoc(ref, { wishlist: arrayRemove(product.id) }, { merge: true });
      } else {
        await setDoc(ref, { wishlist: arrayUnion(product.id) }, { merge: true });
      }
      setWishlisted((w) => !w);
    } catch (err) {
      console.error("Wishlist error:", err.message);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Live price — updates when a variant with a different price is selected */}
      <p className="text-4xl font-black text-gray-900">${displayPrice.toFixed(2)}</p>

      {/* Variant picker — hidden when product has no variants */}
      {product.variants && product.variants.length > 0 && (
        <VariantSelector
          variants={product.variants}
          onVariantChange={setActiveVariant}
        />
      )}

      {/* Quantity stepper and add-to-cart button */}
      <div className="flex items-center gap-3">
        {/* Qty stepper — minimum value is 1 */}
        <div className="flex items-center border-2 border-gray-200 rounded-full overflow-hidden">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-10 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-bold text-gray-900">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="w-10 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg"
          >
            +
          </button>
        </div>

        {/* Add to cart — shows total line price and flips to confirmation state briefly */}
        <button
          onClick={handleAdd}
          className={`flex-1 py-3 rounded-full font-bold text-white text-sm transition-all ${
            added
              ? "bg-green-500 shadow-lg shadow-green-200"
              : "bg-pink-500 hover:bg-pink-600 shadow-lg shadow-pink-200"
          }`}
        >
          {added ? "✓ Added to Cart!" : `Add to Cart — $${(displayPrice * qty).toFixed(2)}`}
        </button>

        {/* Wishlist heart — only rendered when signed in */}
        {user && (
          <button
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="p-3 rounded-full border-2 border-gray-200 hover:border-pink-300 transition-colors"
          >
            <svg
              className={`w-5 h-5 transition-colors ${wishlisted ? "text-pink-500" : "text-gray-300"}`}
              fill={wishlisted ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
