import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 bg-brand-900 text-brand-100">
      <div className="container-app py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🌶️</span>
            <span className="text-lg font-extrabold text-white">spicer</span>
          </div>
          <p className="text-sm text-brand-200 leading-relaxed">
            Authentic, premium quality spices and dry fruits — bringing the true
            taste of tradition to your kitchen.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">
            Quick Links
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/products" className="hover:text-white transition-colors">Products</Link></li>
            <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
            <li><Link href="/blogs" className="hover:text-white transition-colors">Blog</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">
            Customer Care
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/cart" className="hover:text-white transition-colors">My Cart</Link></li>
            <li><Link href="/checkout" className="hover:text-white transition-colors">Checkout</Link></li>
            <li><span className="text-brand-300">Cash on Delivery only</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">
            Get in Touch
          </h4>
          <ul className="space-y-2 text-sm text-brand-200">
            <li>📍 123 Spice Market Road, Lahore, Pakistan</li>
            <li>📞 +92 300 1234567</li>
            <li>✉️ support@spicer.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-800">
        <div className="container-app py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-brand-300">
          <p>&copy; {new Date().getFullYear()} spicer. All rights reserved.</p>
          <Link href="/admin/login" className="hover:text-white transition-colors">
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
