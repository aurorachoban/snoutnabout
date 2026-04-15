"use client";

import { useState } from "react";
import Image from "next/image";
import { Dog, Cat } from "@/components/Icons";

export default function ImageGallery({ images = [], name = "", category = "" }) {
  const [selected, setSelected] = useState(0);

  const allImages = images.length > 0 ? images : [null];

  function prev() {
    setSelected((i) => (i === 0 ? allImages.length - 1 : i - 1));
  }

  function next() {
    setSelected((i) => (i === allImages.length - 1 ? 0 : i + 1));
  }

  const FallbackIcon = category === "cat" ? Cat : Dog;

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50 group">
        {allImages[selected] ? (
          <Image
            src={allImages[selected]}
            alt={name}
            fill
            className="object-cover transition-opacity duration-200"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FallbackIcon className="w-32 h-32 text-gray-300" />
          </div>
        )}

        {/* Prev/Next arrows — only if multiple images */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                selected === i
                  ? "border-pink-500 scale-105"
                  : "border-transparent hover:border-pink-200"
              }`}
            >
              {img ? (
                <Image
                  src={img}
                  alt={`${name} view ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <FallbackIcon className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
