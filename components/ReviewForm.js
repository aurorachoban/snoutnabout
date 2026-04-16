"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function ReviewForm({ productId, onSubmitted }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) { setError("Please select a star rating."); return; }
    if (!text.trim()) { setError("Please write a review."); return; }
    setError("");
    setLoading(true);
    try {
      const reviewData = {
        uid: user.uid,
        displayName: user.displayName || "Anonymous",
        rating,
        text: text.trim(),
        createdAt: serverTimestamp(),
      };

      // Write the review document
      const reviewRef = await addDoc(
        collection(db, "products", productId, "reviews"),
        reviewData
      );

      // Recalculate and update the product's denormalised rating + reviewCount
      try {
        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const { rating: oldRating = 0, reviewCount: oldCount = 0 } = productSnap.data();
          const newCount = oldCount + 1;
          const newRating = Math.round(((oldRating * oldCount) + rating) / newCount * 10) / 10;
          await updateDoc(productRef, { rating: newRating, reviewCount: newCount });
        }
      } catch {
        // Non-fatal — review was saved, stat update failed silently
      }

      setRating(0);
      setText("");
      // Pass the new review back so the parent can add it to the list immediately
      onSubmitted?.({
        id: reviewRef.id,
        uid: user.uid,
        displayName: user.displayName || "Anonymous",
        rating,
        text: text.trim(),
        createdAt: new Date(),
      });
    } catch {
      setError("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <p className="text-sm text-gray-500">
        <a href="/auth" className="text-pink-500 font-semibold hover:underline">Sign in</a> to leave a review.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Your rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="text-2xl transition-transform hover:scale-110"
              aria-label={`${star} star`}
            >
              <svg
                className={`w-7 h-7 ${star <= (hovered || rating) ? "text-yellow-400" : "text-gray-200"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Share your experience with this product..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
