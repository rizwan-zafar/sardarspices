import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/common/SiteChrome";
import { CartProvider } from "@/components/cart/CartContext";
import { ToastProvider } from "@/components/common/ToastContext";

const heading = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sardar Spices | Premium Spices & Dry Fruits",
  description:
    "Shop authentic, premium quality spices, masala blends, and dry fruits online from Sardar Spices. Cash on delivery available across Pakistan.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <ToastProvider>
          <CartProvider>
            <SiteChrome>{children}</SiteChrome>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
