"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

export default function AddToCartButton({ product }) {
  const { dispatch } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    for (let i = 0; i < qty; i++) {
      dispatch({
        type: "ADD",
        item: { id: product.id, name: product.name, price: product.price, image: product.image },
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors text-lg font-medium"
          >-</button>
          <span className="px-4 py-2 text-sm font-semibold w-10 text-center">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors text-lg font-medium"
          >+</button>
        </div>
        <button
          onClick={handleAdd}
          className={`flex-1 py-3 rounded-full font-bold text-white transition-all ${
            added ? "bg-green-500" : "bg-pink-500 hover:bg-pink-600 shadow-lg shadow-pink-200"
          }`}
        >
          {added ? "Added to Cart!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
