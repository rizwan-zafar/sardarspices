"use client";

import { useState } from "react";
import SmartImage from "@/components/common/SmartImage";

export default function ProductImageGallery({ images = [], productName }) {
  const list = images.length ? images : [null];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSrc = list[activeIndex];
  const multi = list.length > 1;

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200/80">
        <SmartImage src={activeSrc} alt={productName} framed dense fallback="🌶️" />
      </div>

      {multi && (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Product images">
          {list.map((src, index) => {
            const selected = index === activeIndex;
            return (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`flex h-14 w-14 items-center justify-center rounded-lg bg-white p-1 transition ${
                    selected ? "ring-2 ring-brand-600" : "ring-1 ring-stone-200 hover:ring-stone-300"
                  }`}
                  aria-label={`Image ${index + 1}`}
                  aria-pressed={selected}
                >
                  <SmartImage src={src} alt="" fit="contain" className="h-11 w-11" fallback="🌶️" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}