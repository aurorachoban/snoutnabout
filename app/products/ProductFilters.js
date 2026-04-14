"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const sortOptions = [
  { label: "Popular", value: "" },
  { label: "Highest Rated", value: "rating" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export default function ProductFilters({ currentSort, currentMin, currentMax }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  function handlePriceSubmit(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    const params = new URLSearchParams(searchParams.toString());
    const min = data.get("min");
    const max = data.get("max");
    if (min) params.set("minPrice", min); else params.delete("minPrice");
    if (max) params.set("maxPrice", max); else params.delete("maxPrice");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Sort By</h3>
        <div className="space-y-1.5">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setParam("sort", opt.value)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                (currentSort ?? "") === opt.value
                  ? "bg-pink-100 text-pink-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Price Range</h3>
        <form onSubmit={handlePriceSubmit} className="space-y-2">
          <div className="flex gap-2 items-center">
            <input
              type="number"
              name="min"
              defaultValue={currentMin ?? ""}
              placeholder="Min"
              min="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
            />
            <span className="text-gray-400 text-sm">–</span>
            <input
              type="number"
              name="max"
              defaultValue={currentMax ?? ""}
              placeholder="Max"
              min="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
          >
            Apply
          </button>
        </form>
      </div>
    </div>
  );
}
