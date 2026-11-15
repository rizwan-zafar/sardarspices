import { Roboto } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/common/SiteChrome";
import { CartProvider } from "@/components/cart/CartContext";
import { ToastProvider } from "@/components/common/ToastContext";
import { brandName } from "@/lib/brand";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

export const metadata = {
  title: `${brandName} | Premium Spices & Dry Fruits`,
  description:
    `Shop authentic, premium quality spices, masala blends, and dry fruits online from ${brandName}. Cash on delivery available across Pakistan.`,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={roboto.variable}>
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
