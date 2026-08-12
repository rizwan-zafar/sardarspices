import ProductCard from "./ProductCard";
import EmptyState from "@/components/common/EmptyState";

export default function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title="No products found"
        description="Try adjusting your filters or check back later for new arrivals."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
