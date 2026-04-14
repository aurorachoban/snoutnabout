"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Sub-type categories shared by both dogs and cats
const typeCategories = [
  { label: "Food",        emoji: "🍖", type: "food",        bg: "bg-pink-100",   border: "border-pink-300",   text: "text-pink-800"   },
  { label: "Toys",        emoji: "🎾", type: "toys",        bg: "bg-lime-100",   border: "border-lime-300",   text: "text-lime-800"   },
  { label: "Treats",      emoji: "🦴", type: "treats",      bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-800" },
  { label: "Accessories", emoji: "🎀", type: "accessories", bg: "bg-blue-100",   border: "border-blue-300",   text: "text-blue-800"   },
];

// Default top-level categories shown when no filter is active
const topCategories = [
  { label: "All",         emoji: "🐾", href: "/products",              bg: "bg-gray-100",   border: "border-gray-300",   text: "text-gray-800"   },
  { label: "Dogs",        emoji: "🐶", href: "/products?category=dog", bg: "bg-amber-100",  border: "border-amber-300",  text: "text-amber-800"  },
  { label: "Cats",        emoji: "🐱", href: "/products?category=cat", bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-800" },
  { label: "Food",        emoji: "🍖", href: "/products?type=food",        bg: "bg-pink-100",   border: "border-pink-300",   text: "text-pink-800"   },
  { label: "Toys",        emoji: "🎾", href: "/products?type=toys",        bg: "bg-lime-100",   border: "border-lime-300",   text: "text-lime-800"   },
  { label: "Treats",      emoji: "🦴", href: "/products?type=treats",      bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-800" },
  { label: "Accessories", emoji: "🎀", href: "/products?type=accessories", bg: "bg-blue-100",   border: "border-blue-300",   text: "text-blue-800"   },
];

// Shared pill card used in all three states
function CategoryPill({ cat, active }) {
  return (
    <Link
      href={cat.href}
      className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl border-2 ${cat.bg} ${cat.border} ${cat.text} font-semibold text-sm hover:scale-105 transition-transform ${active ? "ring-2 ring-offset-1 ring-current" : ""}`}
    >
      <span className="text-2xl">{cat.emoji}</span>
      <span>{cat.label}</span>
    </Link>
  );
}

function NavRow({ items, activeHref }) {
  return (
    <nav className="w-full overflow-x-auto py-4">
      <div className="flex gap-3 min-w-max px-4 sm:px-0 justify-center">
        {items.map((cat) => (
          <CategoryPill key={cat.label} cat={cat} active={cat.href === activeHref} />
        ))}
      </div>
    </nav>
  );
}

export default function CategoryNav() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const type = searchParams.get("type");

  // Inside Dogs or Cats — show sub-type cards filtered to that animal
  if (category === "dog" || category === "cat") {
    const allCard = {
      label: category === "dog" ? "All Dogs" : "All Cats",
      emoji: category === "dog" ? "🐶" : "🐱",
      href: `/products?category=${category}`,
      bg:     category === "dog" ? "bg-amber-100"  : "bg-purple-100",
      border: category === "dog" ? "border-amber-300"  : "border-purple-300",
      text:   category === "dog" ? "text-amber-800" : "text-purple-800",
    };
    const items = [
      allCard,
      ...typeCategories.map((t) => ({ ...t, href: `/products?category=${category}&type=${t.type}` })),
    ];
    return <NavRow items={items} activeHref={type ? `/products?category=${category}&type=${type}` : `/products?category=${category}`} />;
  }

  // Inside a type (food / toys / etc.) — show All + Dogs + Cats for that type
  if (type) {
    const items = [
      { label: "All",  emoji: "🐾", href: `/products?type=${type}`,              bg: "bg-gray-100",   border: "border-gray-300",   text: "text-gray-800"   },
      { label: "Dogs", emoji: "🐶", href: `/products?category=dog&type=${type}`, bg: "bg-amber-100",  border: "border-amber-300",  text: "text-amber-800"  },
      { label: "Cats", emoji: "🐱", href: `/products?category=cat&type=${type}`, bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-800" },
    ];
    return <NavRow items={items} activeHref={`/products?type=${type}`} />;
  }

  // Default — show all top-level categories
  return <NavRow items={topCategories} activeHref="/products" />;
}
