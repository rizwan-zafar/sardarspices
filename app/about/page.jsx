import Link from "next/link";
import Button from "@/components/common/Button";

export const metadata = {
  title: "About Us | spicer",
  description: "Learn about spicer — our story, our values, and our commitment to quality.",
};

const VALUES = [
  { icon: "🌿", title: "100% Authentic", desc: "No fillers, no shortcuts — just pure, natural spices sourced responsibly." },
  { icon: "🤝", title: "Trusted Sourcing", desc: "We work directly with trusted farms and suppliers across the region." },
  { icon: "🔬", title: "Quality Checked", desc: "Every batch is inspected for purity, aroma, and freshness before packing." },
  { icon: "🚚", title: "Reliable Delivery", desc: "Fast, careful delivery straight to your doorstep, nationwide." },
];

export default function AboutPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 text-white py-16">
        <div className="container-app text-center">
          <h1 className="font-display text-4xl font-bold mb-3">Our Story</h1>
          <p className="text-brand-100 max-w-2xl mx-auto">
            From a small family spice stall to a name trusted by thousands of households —
            this is the story of spicer.
          </p>
        </div>
      </section>

      <section className="container-app py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="aspect-video rounded-2xl overflow-hidden bg-brand-50 flex items-center justify-center text-7xl">
          🏺
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-stone-800 mb-4">
            Rooted in Tradition, Built for Today
          </h2>
          <p className="text-stone-600 leading-relaxed mb-4">
            spicer began as a humble family business dedicated to bringing the
            true flavors of traditional cooking into modern kitchens. What started with
            a handful of hand-blended masalas has grown into a full range of premium
            spices, blends, and dry fruits — all while keeping our founding promise:
            uncompromising quality.
          </p>
          <p className="text-stone-600 leading-relaxed">
            Every product that leaves our facility is selected, roasted, and packed with
            care, so that every meal you cook carries the same warmth and authenticity
            our family has cherished for generations.
          </p>
        </div>
      </section>

      <section className="bg-stone-50 py-16">
        <div className="container-app">
          <h2 className="font-display text-2xl font-bold text-stone-800 text-center mb-10">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl bg-white border border-stone-200 p-6 text-center">
                <div className="text-4xl mb-3">{v.icon}</div>
                <h3 className="font-semibold text-stone-800 mb-1.5">{v.title}</h3>
                <p className="text-sm text-stone-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-app py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-stone-800 mb-3">
          Taste the Difference Today
        </h2>
        <p className="text-stone-500 max-w-xl mx-auto mb-8">
          Explore our range of authentic spices and dry fruits, delivered fresh to your door.
        </p>
        <Button as={Link} href="/products" size="lg">
          Shop Now
        </Button>
      </section>
    </div>
  );
}
