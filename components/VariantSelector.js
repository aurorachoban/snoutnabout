"use client";

import { useState } from "react";

// Renders a row of pill buttons for selecting a product variant (size, pack, etc.)
// Calls onVariantChange with the selected variant object whenever the selection changes
export default function VariantSelector({ variants = [], onVariantChange }) {
  const [selected, setSelected] = useState(0);

  if (!variants || variants.length === 0) return null;

  function handleSelect(i) {
    setSelected(i);
    onVariantChange?.(variants[i]);
  }

  // Heuristic: if the first variant label contains a digit it's a quantity/size, otherwise a generic "Option"
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-2">
        {variants[0]?.label?.match(/\d/) ? "Pack size" : "Option"}
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((v, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
              selected === i
                ? "bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-200"
                : "bg-white border-gray-200 text-gray-700 hover:border-pink-300"
            }`}
          >
            {v.label}
            {/* Show price on unselected variants as a soft hint */}
            {v.price && selected !== i && (
              <span className="ml-1 text-gray-400 font-normal">${v.price.toFixed(2)}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
