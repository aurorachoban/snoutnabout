"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

// Category nav icons live in /public/icons/
// Product card images stay in /public/products/
const topCategories = [
  { label: "All",         href: "/products",                  img: "/products/home-pic.jpg" },
  { label: "Dogs",        href: "/products?category=dog",     img: "/icons/all-dog.jpg", objectPosition: "center 20%" },
  { label: "Cats",        href: "/products?category=cat",     img: "/icons/all-cat.jpg" },
  { label: "Food",        href: "/products?type=food",        img: "/icons/food-dog.jpg" },
  { label: "Toys",        href: "/products?type=toys",        img: "/icons/dog-toy.jpg" },
  { label: "Treats",      href: "/products?type=treats",      img: "/icons/all-treats.jpg" },
  { label: "Accessories", href: "/products?type=accessories", img: "/icons/all-accessories.webp" },
];

// Dog-specific sub-type images
const dogTypeCategories = [
  { label: "Food",        type: "food",        img: "/icons/dog-foods.jpg" },
  { label: "Toys",        type: "toys",        img: "/icons/dog-toy.jpg" },
  { label: "Treats",      type: "treats",      img: "/icons/treats-dog.jpg" },
  { label: "Accessories", type: "accessories", img: "/icons/dog-accessories.jpg" },
];

// Cat-specific sub-type images
const catTypeCategories = [
  { label: "Food",        type: "food",        img: "/icons/cat-food.jpg" },
  { label: "Toys",        type: "toys",        img: "/icons/cat-toy.jpg" },
  { label: "Treats",      type: "treats",      img: "/icons/cat-treat.jpg" },
  { label: "Accessories", type: "accessories", img: "/icons/cat-accessories.jpg" },
];

// Round photo card with label underneath
// objectPosition overrides the crop anchor (e.g. "center 70%" to push the subject down)
function CategoryCard({ label, href, img, active, objectPosition = "center" }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 group">
      <div className={`relative w-20 h-20 rounded-full overflow-hidden border-4 transition-all ${
        active ? "border-pink-500 scale-105" : "border-transparent group-hover:border-pink-300 group-hover:scale-105"
      }`}>
        <Image
          src={img}
          alt={label}
          fill
          className="object-cover"
          style={{ objectPosition }}
        />
      </div>
      <span className={`text-xs font-semibold ${active ? "text-pink-500" : "text-gray-600 group-hover:text-pink-500"} transition-colors`}>
        {label}
      </span>
    </Link>
  );
}

function NavRow({ items, activeHref }) {
  return (
    <nav className="w-full overflow-x-auto py-4">
      <div className="flex gap-6 min-w-max px-4 sm:px-0 justify-center">
        {items.map((cat) => (
          <CategoryCard key={cat.label} {...cat} active={cat.href === activeHref} />
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
    const isDog = category === "dog";
    const allCard = {
      label: isDog ? "All Dogs" : "All Cats",
      href: `/products?category=${category}`,
      img: isDog ? "/icons/all-dog.jpg" : "/icons/all-cat.jpg",
      objectPosition: isDog ? "center 20%" : "center",
    };
    const subTypes = isDog ? dogTypeCategories : catTypeCategories;
    const items = [
      allCard,
      ...subTypes.map((t) => ({ ...t, href: `/products?category=${category}&type=${t.type}` })),
    ];
    const activeHref = type ? `/products?category=${category}&type=${type}` : `/products?category=${category}`;
    return <NavRow items={items} activeHref={activeHref} />;
  }

  // Inside a type — show All + Dogs + Cats for that type
  if (type) {
    const items = [
      { label: "All",  href: `/products?type=${type}`,              img: "/products/home-pic.jpg" },
      { label: "Dogs", href: `/products?category=dog&type=${type}`, img: "/icons/all-dog.jpg", objectPosition: "center 20%" },
      { label: "Cats", href: `/products?category=cat&type=${type}`, img: "/icons/all-cat.jpg" },
    ];
    return <NavRow items={items} activeHref={`/products?type=${type}`} />;
  }

  // Default — all top-level categories
  return <NavRow items={topCategories} activeHref="/products" />;
}
