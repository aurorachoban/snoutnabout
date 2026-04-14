"use client";

import { useState } from "react";
import ReviewForm from "@/components/ReviewForm";

export default function ReviewsSection({ productId, initialReviews }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-green-700 font-semibold text-sm">Thanks for your review!</p>
        </div>
      ) : (
        <ReviewForm productId={productId} onSubmitted={() => setSubmitted(true)} />
      )}
    </div>
  );
}
