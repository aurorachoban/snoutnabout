"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";

// Slide-in cart panel rendered over the page from the right side
export default function CartDrawer({ open, onClose }) {
  const { items, subtotal, dispatch } = useCart();

  // Prevent background scrolling while the drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Semi-transparent backdrop — click to close */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer panel — slides in from the right via translate-x */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable item list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <span className="text-6xl">🛒</span>
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <Link
                href="/products"
                onClick={onClose}
                className="text-pink-500 font-semibold text-sm hover:underline"
              >
                Shop now
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 items-center">
                <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden shrink-0 relative">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🐾</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-sm text-pink-500 font-medium">${item.price?.toFixed(2)}</p>
                  {/* Quantity stepper — dispatches UPDATE_QTY; reducer removes item when qty reaches 0 */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() => dispatch({ type: "UPDATE_QTY", id: item.id, quantity: item.quantity - 1 })}
                      className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-pink-400 transition-colors text-sm"
                    >-</button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => dispatch({ type: "UPDATE_QTY", id: item.id, quantity: item.quantity + 1 })}
                      className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-pink-400 transition-colors text-sm"
                    >+</button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => dispatch({ type: "REMOVE", id: item.id })}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sticky footer with subtotal and checkout links — hidden when cart is empty */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full text-center bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-full transition-colors"
            >
              Checkout
            </Link>
            <Link
              href="/cart"
              onClick={onClose}
              className="block w-full text-center border border-gray-200 hover:border-pink-400 text-gray-700 font-medium py-3 rounded-full transition-colors text-sm"
            >
              View full cart
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
