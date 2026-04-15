import Link from "next/link";
import { PartyPopper } from "@/components/Icons";

export const metadata = {
  title: "Order Confirmed — Snout & About",
};

export default async function ConfirmationPage({ searchParams }) {
  const { order } = await searchParams;

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10">
        <PartyPopper className="w-20 h-20 mx-auto mb-4 text-pink-500" />
        <h1 className="text-3xl font-black text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-6">
          Thank you for shopping with Snout &amp; About. Your furry friend is going to love it!
        </p>

        {order && (
          <div className="bg-pink-50 border border-pink-200 rounded-2xl px-6 py-4 mb-6">
            <p className="text-xs text-pink-500 font-bold uppercase tracking-widest mb-1">Order Number</p>
            <p className="font-mono text-sm text-gray-800 break-all">{order}</p>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-8">
          A confirmation has been saved to your account. You can view your order history in your profile.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/profile"
            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full transition-colors"
          >
            View My Orders
          </Link>
          <Link
            href="/products"
            className="px-6 py-3 border-2 border-gray-200 hover:border-pink-300 text-gray-700 font-semibold rounded-full transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
