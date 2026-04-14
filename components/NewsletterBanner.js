"use client";

import { useState } from "react";

export default function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    // In production: send to Firebase / email service
    setSubmitted(true);
  }

  return (
    <section className="bg-linear-to-br from-pink-500 to-pink-600 text-white py-16 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-4xl mb-3 select-none">🐾</p>
        <h2 className="text-3xl font-black tracking-tight mb-2">Stay in Touch</h2>
        <p className="text-pink-100 mb-8 text-base">
          Sign up for new arrivals, exclusive promos, and pet care tips — and get{" "}
          <span className="font-bold text-white underline decoration-dotted">
            20% off
          </span>{" "}
          your first order!
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 font-semibold">
            <span>✓</span> You&apos;re on the list — check your inbox!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="flex-1 rounded-full px-5 py-3 text-gray-900 text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-full text-sm transition-colors whitespace-nowrap"
            >
              Sign me up!
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
