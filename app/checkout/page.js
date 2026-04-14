"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

// Defined outside CheckoutPage so React doesn't recreate it on every keystroke
// (defining components inside a render function causes remount on each state change)
function Field({ label, name, type = "text", placeholder, required = true, pattern, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        pattern={pattern}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400 transition-colors"
      />
    </div>
  );
}

export default function CheckoutPage() {
  const { items, subtotal, dispatch } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: user?.email ?? "",
    address: "", city: "", province: "", postalCode: "", country: "Canada",
    cardNumber: "", cardExpiry: "", cardCvc: "",
  });

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <Link href="/products" className="text-pink-500 font-semibold hover:underline">Shop Now</Link>
      </div>
    );
  }

  const shipping = subtotal >= 50 ? 0 : 9.99;
  const total = subtotal + shipping;

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const orderRef = await addDoc(collection(db, "orders"), {
        uid: user?.uid ?? null,
        email: form.email,
        shipping: {
          firstName: form.firstName,
          lastName: form.lastName,
          address: form.address,
          city: form.city,
          province: form.province,
          postalCode: form.postalCode,
          country: form.country,
        },
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        subtotal,
        shippingCost: shipping,
        total,
        status: "confirmed",
        createdAt: serverTimestamp(),
      });
      dispatch({ type: "CLEAR" });
      router.push(`/checkout/confirmation?order=${orderRef.id}`);
    } catch {
      setError("Something went wrong placing your order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="font-black text-gray-900 text-lg">Contact Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="First Name" name="firstName" placeholder="Jane" value={form.firstName} onChange={handleChange} />
                <Field label="Last Name" name="lastName" placeholder="Smith" value={form.lastName} onChange={handleChange} />
              </div>
              <Field label="Email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />
            </section>

            {/* Shipping */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="font-black text-gray-900 text-lg">Shipping Address</h2>
              <Field label="Street Address" name="address" placeholder="123 Main Street" value={form.address} onChange={handleChange} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="City" name="city" placeholder="Calgary" value={form.city} onChange={handleChange} />
                <Field label="Province / State" name="province" placeholder="AB" value={form.province} onChange={handleChange} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Postal Code" name="postalCode" placeholder="T2P 0A1" value={form.postalCode} onChange={handleChange} />
                <Field label="Country" name="country" placeholder="Canada" value={form.country} onChange={handleChange} />
              </div>
            </section>

            {/* Payment */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="font-black text-gray-900 text-lg">Payment</h2>
              <p className="text-xs text-gray-400 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2">
                Demo only — do not enter real card details.
              </p>
              <Field label="Card Number" name="cardNumber" placeholder="4242 4242 4242 4242" pattern=".{13,19}" value={form.cardNumber} onChange={handleChange} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Expiry (MM/YY)" name="cardExpiry" placeholder="08/27" pattern="\d{2}/\d{2}" value={form.cardExpiry} onChange={handleChange} />
                <Field label="CVC" name="cardCvc" placeholder="123" pattern="\d{3,4}" value={form.cardCvc} onChange={handleChange} />
              </div>
            </section>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24 space-y-4">
              <h2 className="font-black text-gray-900 text-lg">Order Summary</h2>
              <div className="space-y-2 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-gray-600">
                    <span className="truncate max-w-[70%]">{item.name} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-black text-gray-900 text-base">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-bold py-3 rounded-full transition-colors shadow-lg shadow-pink-200"
              >
                {loading ? "Placing Order..." : `Pay $${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
