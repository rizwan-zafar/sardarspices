// One-off script to generate simple, attractive SVG placeholder images
// for seeded categories, products, and blog posts (no external assets needed).
import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";

function svgCard({ label, from, to, icon }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}" />
      <stop offset="100%" stop-color="${to}" />
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#g)" />
  <circle cx="300" cy="230" r="120" fill="rgba(255,255,255,0.15)" />
  <text x="300" y="255" font-size="90" text-anchor="middle" font-family="Arial, sans-serif">${icon}</text>
  <foreignObject x="40" y="420" width="520" height="140">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial, sans-serif; color:#ffffff; font-size:34px; font-weight:700; text-align:center; line-height:1.25; text-shadow: 0 2px 6px rgba(0,0,0,0.35);">
      ${label}
    </div>
  </foreignObject>
</svg>`;
}

const items = [
  // Categories
  { path: "public/images/categories/whole-spices.svg", label: "Whole Spices", from: "#C1440E", to: "#7B3F00", icon: "🌶️" },
  { path: "public/images/categories/ground-spices.svg", label: "Ground Spices", from: "#E4A11B", to: "#B3311F", icon: "🧂" },
  { path: "public/images/categories/spice-blends.svg", label: "Spice Blends", from: "#8B0000", to: "#D2691E", icon: "🥘" },
  { path: "public/images/categories/dry-fruits.svg", label: "Dry Fruits", from: "#6B4226", to: "#B08D57", icon: "🌰" },

  // Products
  { path: "public/images/products/red-chili-powder.svg", label: "Red Chili Powder", from: "#B3311F", to: "#7A1E12", icon: "🌶️" },
  { path: "public/images/products/turmeric-powder.svg", label: "Turmeric Powder", from: "#E4A11B", to: "#C97C0A", icon: "🧡" },
  { path: "public/images/products/black-pepper.svg", label: "Black Pepper", from: "#3B3B3B", to: "#1A1A1A", icon: "⚫" },
  { path: "public/images/products/green-cardamom.svg", label: "Green Cardamom", from: "#2F5233", to: "#4E7A51", icon: "🌿" },
  { path: "public/images/products/biryani-masala.svg", label: "Biryani Masala", from: "#8B0000", to: "#C1440E", icon: "🍛" },
  { path: "public/images/products/garam-masala.svg", label: "Garam Masala", from: "#7B3F00", to: "#B3311F", icon: "🥄" },
  { path: "public/images/products/almonds.svg", label: "Premium Almonds", from: "#B08D57", to: "#6B4226", icon: "🌰" },
  { path: "public/images/products/cashews.svg", label: "Cashew Nuts", from: "#D2A857", to: "#8B6B2E", icon: "🥜" },
  { path: "public/images/products/cumin-seeds.svg", label: "Cumin Seeds", from: "#7B5B2A", to: "#4A3410", icon: "🌱" },
  { path: "public/images/products/coriander-powder.svg", label: "Coriander Powder", from: "#7A8B4A", to: "#4F5C2C", icon: "🌾" },
  { path: "public/images/products/karahi-masala.svg", label: "Karahi Masala", from: "#9B2226", to: "#5C1A1A", icon: "🍲" },
  { path: "public/images/products/pistachios.svg", label: "Pistachios", from: "#6B8E4E", to: "#3E5C2C", icon: "🥜" },

  // Blog
  { path: "public/images/blog/turmeric-benefits.svg", label: "Health Benefits of Turmeric", from: "#E4A11B", to: "#B3311F", icon: "🧡" },
  { path: "public/images/blog/spice-storage.svg", label: "Storing Spices Right", from: "#2F5233", to: "#1F3D22", icon: "🫙" },
  { path: "public/images/blog/masala-blending.svg", label: "The Art of Blending", from: "#8B0000", to: "#C1440E", icon: "🥘" },

  // Hero / misc
  { path: "public/images/hero-spices.svg", label: "Sardar Spices", from: "#B3311F", to: "#7B3F00", icon: "🌶️" },
  { path: "public/images/about-hero.svg", label: "Our Story", from: "#7B3F00", to: "#4A2410", icon: "🏺" },
  { path: "public/images/placeholder.svg", label: "Sardar Spices", from: "#8B6B2E", to: "#4A3410", icon: "🧂" },
];

for (const item of items) {
  mkdirSync(dirname(item.path), { recursive: true });
  writeFileSync(item.path, svgCard(item));
}

console.log(`Generated ${items.length} placeholder images.`);
