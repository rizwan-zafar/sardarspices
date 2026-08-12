"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartContext";
import { useToast } from "@/components/common/ToastContext";
import QuantitySelector from "./QuantitySelector";
import Button from "@/components/common/Button";

export default function ProductDetailActions({ product }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const outOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    showToast(`${quantity} × ${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push("/cart");
  };

  if (outOfStock) {
    return (
      <div className="rounded-xl bg-stone-100 px-4 py-3 text-stone-600 font-medium">
        This product is currently out of stock.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-stone-600">Quantity:</span>
        <QuantitySelector quantity={quantity} onChange={setQuantity} max={product.stock} />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleAddToCart} size="lg" className="flex-1">
          Add to Cart
        </Button>
        <Button onClick={handleBuyNow} variant="secondary" size="lg" className="flex-1">
          Buy Now
        </Button>
      </div>
    </div>
  );
}
