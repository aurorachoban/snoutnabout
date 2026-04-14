import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import NavBar from "@/components/NavBar";
import NewsletterBanner from "@/components/NewsletterBanner";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata = {
  title: "Snout & About — Pet Supplies for Happy Pets",
  description: "Shop premium pet supplies for dogs and cats. Food, toys, treats, and accessories.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-gray-50 antialiased font-sans">
        <AuthProvider>
          <CartProvider>
            <NavBar />
            <main className="flex-1">{children}</main>
            <NewsletterBanner />
            <footer className="border-t border-gray-100 bg-white py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span>🐾</span>
                  <span className="font-bold text-gray-600">Snout <span className="text-pink-500">&amp;</span> About</span>
                </div>
                <p>&copy; {new Date().getFullYear()} Snout &amp; About. Made with ❤️ for pets.</p>
              </div>
            </footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
