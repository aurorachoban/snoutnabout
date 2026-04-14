"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const { items, subtotal, dispatch } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-7xl mb-4">🛒</p>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Add some items to get started!</p>
        <Link
          href="/products"
          className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-3 rounded-full transition-colors"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  const shipping = subtotal >= 50 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden relative shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🐾</div>
                )}
              </div>

              <div className="flex-1">
                <Link href={`/products/${item.id}`} className="font-semibold text-gray-900 hover:text-pink-600 transition-colors">
                  {item.name}
                </Link>
                <p className="text-pink-500 font-bold mt-0.5">${item.price?.toFixed(2)}</p>

                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-gray-200 rounded-full overflow-hidden text-sm">
                    <button
                      onClick={() => dispatch({ type: "UPDATE_QTY", id: item.id, quantity: item.quantity - 1 })}
                      className="px-3 py-1.5 hover:bg-gray-100 transition-colors"
                    >-</button>
                    <span className="px-3 font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => dispatch({ type: "UPDATE_QTY", id: item.id, quantity: item.quantity + 1 })}
                      className="px-3 py-1.5 hover:bg-gray-100 transition-colors"
                    >+</button>
                  </div>
                  <button
                    onClick={() => dispatch({ type: "REMOVE", id: item.id })}
                    className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24 space-y-4">
            <h2 className="text-xl font-black text-gray-900">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600 font-semibold">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-pink-500">Add ${(50 - subtotal).toFixed(2)} more for free shipping!</p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between font-black text-lg text-gray-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <Link
              href="/checkout"
              className="block w-full text-center bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-full transition-colors shadow-lg shadow-pink-200"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/products"
              className="block w-full text-center text-sm text-gray-500 hover:text-pink-500 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
