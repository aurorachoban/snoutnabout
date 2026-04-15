// Snout & About — Firestore seed script
// Run with: node scripts/seed.js
// Requires NEXT_PUBLIC_FIREBASE_* variables in .env.local

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";

// Firebase is initialised directly here (not via lib/firebase) so this script
// can run standalone with Node without the Next.js build pipeline
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Product images are served from /public/products/ — no external CDN required
const products = [
  // ── DOGS ──────────────────────────────────────────────────────────────
  {
    name: "Chicken & Brown Rice Dry Dog Food",
    category: "dog",
    type: "food",
    price: 34.99,
    description: "A wholesome, balanced dry food made with real chicken as the #1 ingredient. Supports healthy digestion and a shiny coat.",
    image: "/products/dog-food.jpg",
    images: ["/products/dog-food.jpg"],
    featured: true,
    inStock: true,
    rating: 4.7,
    reviewCount: 42,
    popularity: 95,
    features: ["Grain inclusive", "No artificial preservatives", "Vet approved"],
    variants: [
      { label: "2 kg", price: 19.99 },
      { label: "5 kg", price: 34.99 },
      { label: "12 kg", price: 69.99 },
    ],
    ingredients: {
      breakdown: { Chicken: "31%", "Brown Rice": "24%", "Sweet Potato": "18%" },
      highlights: [
        { name: "Real Chicken", emoji: "🍗", benefit: "High-quality protein for strong muscles" },
        { name: "Brown Rice", emoji: "🌾", benefit: "Easily digestible energy source" },
        { name: "Sweet Potato", emoji: "🍠", benefit: "Rich in fibre and antioxidants" },
        { name: "Omega-3", emoji: "🐟", benefit: "Supports a healthy, shiny coat" },
      ],
      full: "Chicken, Brown Rice, Sweet Potato, Chicken Fat, Flaxseed, Salmon Oil, Vitamins & Minerals.",
    },
  },
  {
    name: "Peanut Butter Biscuit Dog Treats",
    category: "dog",
    type: "treats",
    price: 9.99,
    description: "Crunchy, oven-baked biscuits packed with real peanut butter. The perfect reward for a good pup.",
    image: "/products/dog-treats.jpg",
    images: ["/products/dog-treats.jpg"],
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 87,
    popularity: 99,
    features: ["No added sugar", "Wheat free", "Made in Canada"],
    variants: [
      { label: "200g", price: 9.99 },
      { label: "500g", price: 19.99 },
    ],
  },
  {
    name: "Rope Tug & Fetch Toy",
    category: "dog",
    type: "toys",
    price: 14.99,
    description: "Durable braided rope toy for tug-of-war and fetch. Helps clean teeth and massage gums during play.",
    image: "/products/rope-toy.jpg",
    images: ["/products/rope-toy.jpg"],
    featured: true,
    inStock: true,
    rating: 4.5,
    reviewCount: 33,
    popularity: 80,
    features: ["Dental cleaning", "Non-toxic cotton", "Floats in water"],
  },
  {
    name: "Orthopedic Memory Foam Dog Bed",
    category: "dog",
    type: "accessories",
    price: 79.99,
    description: "Premium memory foam bed with a waterproof lining and washable sherpa cover. Perfect for older dogs or those with joint issues.",
    image: "/products/dog-bed.png",
    images: ["/products/dog-bed.png"],
    featured: false,
    inStock: true,
    rating: 4.8,
    reviewCount: 56,
    popularity: 88,
    features: ["Memory foam", "Waterproof liner", "Machine washable cover"],
    variants: [
      { label: "Small", price: 59.99 },
      { label: "Medium", price: 79.99 },
      { label: "Large", price: 99.99 },
    ],
  },
  {
    name: "Adjustable Comfort Dog Harness",
    category: "dog",
    type: "accessories",
    price: 29.99,
    description: "No-pull harness with padded chest plate and reflective stitching. Safe for evening walks.",
    image: "/products/harness.jpg",
    images: ["/products/harness.jpg"],
    featured: false,
    inStock: true,
    rating: 4.6,
    reviewCount: 29,
    popularity: 75,
    features: ["No-pull design", "Reflective stitching", "Easy clip buckles"],
    variants: [
      { label: "XS", price: 24.99 },
      { label: "S", price: 24.99 },
      { label: "M", price: 29.99 },
      { label: "L", price: 29.99 },
      { label: "XL", price: 34.99 },
    ],
  },
  {
    name: "Beef & Sweet Potato Dog Jerky",
    category: "dog",
    type: "treats",
    price: 12.99,
    description: "Slow-dried beef jerky strips with sweet potato. Single-ingredient protein source, great for training.",
    image: "/products/jerky.jpg",
    images: ["/products/jerky.jpg"],
    featured: false,
    inStock: true,
    rating: 4.4,
    reviewCount: 19,
    popularity: 65,
    features: ["Single protein source", "No preservatives", "Grain free"],
  },

  // ── CATS ──────────────────────────────────────────────────────────────
  {
    name: "Salmon Pâté Wet Cat Food",
    category: "cat",
    type: "food",
    price: 24.99,
    description: "Silky smooth salmon pâté made with 70% real fish. High moisture content to keep your cat hydrated.",
    image: "/products/salmon-pate.jpg",
    images: ["/products/salmon-pate.jpg"],
    featured: true,
    inStock: true,
    rating: 4.8,
    reviewCount: 64,
    popularity: 92,
    features: ["70% real salmon", "Grain free", "High moisture"],
    variants: [
      { label: "12 × 85g", price: 24.99 },
      { label: "24 × 85g", price: 44.99 },
    ],
    ingredients: {
      breakdown: { Salmon: "70%", Broth: "20%", "Potato Starch": "5%" },
      highlights: [
        { name: "Wild Salmon", emoji: "🐟", benefit: "Omega-3 for coat and brain health" },
        { name: "Taurine", emoji: "💊", benefit: "Essential for heart and eye health" },
        { name: "Natural Broth", emoji: "🍵", benefit: "Extra hydration for urinary health" },
      ],
      full: "Salmon (70%), Water, Potato Starch, Sunflower Oil, Taurine, Vitamins & Minerals.",
    },
  },
  {
    name: "Wild-Caught Salmon Dry Cat Food",
    category: "cat",
    type: "food",
    price: 29.99,
    description: "Crunchy kibble made with wild-caught salmon as the #1 ingredient. Rich in Omega-3s for a healthy coat and urinary tract support.",
    image: "/products/salmon-dry.jpg",
    images: ["/products/salmon-dry.jpg"],
    featured: false,
    inStock: true,
    rating: 4.5,
    reviewCount: 38,
    popularity: 78,
    features: ["Wild-caught salmon", "Omega-3 rich", "No corn or soy"],
    variants: [
      { label: "1.5 kg", price: 18.99 },
      { label: "4 kg", price: 29.99 },
    ],
  },
  {
    name: "Feather Wand Interactive Cat Toy",
    category: "cat",
    type: "toys",
    price: 11.99,
    description: "Telescoping wand with crinkle feather attachment. Triggers natural hunting instincts and keeps cats active.",
    image: "/products/feather-wand.jpg",
    images: ["/products/feather-wand.jpg"],
    featured: true,
    inStock: true,
    rating: 4.7,
    reviewCount: 51,
    popularity: 90,
    features: ["Telescoping handle", "Replaceable feather", "Silent crinkle"],
  },
  {
    name: "Catnip Mice 3-Pack",
    category: "cat",
    type: "toys",
    price: 7.99,
    description: "Set of three plush mice stuffed with premium Canadian catnip. Crinkles and rustles for extra excitement.",
    image: "/products/catnip-mice.jpg",
    images: ["/products/catnip-mice.jpg"],
    featured: false,
    inStock: true,
    rating: 4.3,
    reviewCount: 22,
    popularity: 60,
    features: ["Premium catnip", "Crinkle fill", "Pack of 3"],
  },
  {
    name: "Self-Warming Cosy Cat Cave",
    category: "cat",
    type: "accessories",
    price: 44.99,
    description: "Hooded cave bed with self-warming thermal lining. Cats love the enclosed, secure feeling.",
    image: "/products/cat-cave.jpg",
    images: ["/products/cat-cave.jpg"],
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 73,
    popularity: 97,
    features: ["Self-warming liner", "Removable cushion", "Machine washable"],
    variants: [
      { label: "Small", price: 44.99 },
      { label: "Large", price: 54.99 },
    ],
  },
  {
    name: "Freeze-Dried Chicken Cat Treats",
    category: "cat",
    type: "treats",
    price: 10.99,
    description: "100% freeze-dried chicken breast with no additives. Lock in all the nutrients cats crave.",
    image: "/products/cat-treats.jpg",
    images: ["/products/cat-treats.jpg"],
    featured: false,
    inStock: true,
    rating: 4.6,
    reviewCount: 44,
    popularity: 82,
    features: ["1 ingredient", "Freeze-dried raw", "No fillers"],
    variants: [
      { label: "50g", price: 10.99 },
      { label: "150g", price: 24.99 },
    ],
  },
];

// Deletes all existing documents in the products collection before re-seeding
async function clearCollection() {
  console.log("🗑  Clearing existing products...");
  const snap = await getDocs(collection(db, "products"));
  const deletes = snap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletes);
  console.log(`   Deleted ${snap.docs.length} existing product(s).`);
}

async function seed() {
  console.log("\n🐾 Snout & About — Seed Script\n");

  try {
    await clearCollection();

    console.log("\n✨ Adding products...");
    for (const product of products) {
      const ref = await addDoc(collection(db, "products"), {
        ...product,
        createdAt: new Date().toISOString(),
      });
      console.log(`   ✓ ${product.name} (${product.category}) — ${ref.id}`);
    }

    console.log(`\n✅ Done! ${products.length} products added to Firestore.`);
    console.log("   Visit http://localhost:3000 to see them live.\n");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Seed failed:", err.message);
    console.error("   Make sure your .env.local has the correct Firebase config.\n");
    process.exit(1);
  }
}

seed();
