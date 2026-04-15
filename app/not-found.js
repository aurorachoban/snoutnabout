import Link from "next/link";
import { PawPrint } from "@/components/Icons";

export const metadata = {
  title: "Page Not Found — Snout & About",
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <PawPrint className="w-24 h-24 mx-auto mb-4 text-pink-300" />
        <h1 className="text-6xl font-black text-gray-900 mb-3">404</h1>
        <p className="text-xl font-bold text-gray-700 mb-2">Oops! This page ran away.</p>
        <p className="text-gray-500 mb-8">
          Looks like this page went off chasing its tail. Let&apos;s get you back on track!
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full transition-colors shadow-lg shadow-pink-200"
          >
            Go Home
          </Link>
          <Link
            href="/products"
            className="px-6 py-3 border-2 border-gray-200 hover:border-pink-300 text-gray-700 font-semibold rounded-full transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
