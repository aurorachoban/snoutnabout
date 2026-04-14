"use client";

import { useState } from "react";

const TABS = ["Description", "Ingredients", "Delivery"];

export default function ProductTabs({ description, ingredients, details }) {
  const [active, setActive] = useState("Description");

  return (
    <div className="mt-10">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 gap-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`pb-3 text-sm font-bold transition-all relative ${
              active === tab
                ? "text-pink-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-pink-500 after:rounded-full"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="pt-6">
        {active === "Description" && (
          <div className="text-gray-600 leading-relaxed text-sm">
            {description ? (
              <p>{description}</p>
            ) : (
              <p className="text-gray-400 italic">No description provided.</p>
            )}

            {/* Feature badges */}
            {details?.features && (
              <div className="flex flex-wrap gap-3 mt-5">
                {details.features.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1.5 bg-pink-50 border border-pink-100 text-pink-700 text-xs font-semibold px-3 py-1.5 rounded-full"
                  >
                    <span>✓</span> {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {active === "Ingredients" && (
          <div>
            {ingredients ? (
              <>
                {/* Ingredient percentage breakdown */}
                {ingredients.breakdown && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {Object.entries(ingredients.breakdown).map(([name, pct]) => (
                      <div key={name} className="bg-pink-50 rounded-2xl p-4 text-center">
                        <p className="text-2xl font-black text-pink-500">{pct}</p>
                        <p className="text-sm font-semibold text-gray-700 mt-1">{name}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Natural ingredients highlights */}
                {ingredients.highlights && (
                  <div className="mt-6">
                    <h3 className="text-base font-black text-gray-900 mb-4">Key Ingredients</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {ingredients.highlights.map((ing) => (
                        <div key={ing.name} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                          {ing.emoji && <span className="text-3xl block mb-2">{ing.emoji}</span>}
                          <p className="font-bold text-gray-900 text-sm">{ing.name}</p>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{ing.benefit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full ingredient list */}
                {ingredients.full && (
                  <div className="mt-6 text-xs text-gray-400 bg-gray-50 rounded-2xl p-4 leading-relaxed">
                    <span className="font-semibold text-gray-500">Full ingredients: </span>
                    {ingredients.full}
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-400 italic text-sm">No ingredient information available.</p>
            )}
          </div>
        )}

        {active === "Delivery" && (
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex gap-4 items-start p-4 bg-green-50 rounded-2xl border border-green-100">
              <span className="text-2xl shrink-0">🚚</span>
              <div>
                <p className="font-bold text-gray-900">Free Standard Delivery</p>
                <p>On all orders over $50. Delivered within 3–5 business days.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-4 bg-pink-50 rounded-2xl border border-pink-100">
              <span className="text-2xl shrink-0">⚡</span>
              <div>
                <p className="font-bold text-gray-900">Express Delivery — $9.99</p>
                <p>Next business day when ordered before 2pm.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-2xl shrink-0">🔄</span>
              <div>
                <p className="font-bold text-gray-900">Easy Returns</p>
                <p>Not happy? Return within 30 days for a full refund — no questions asked.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
