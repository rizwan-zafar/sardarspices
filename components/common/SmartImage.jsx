"use client";

import { useState } from "react";

/**
 * @param {"cover" | "contain"} fit
 * @param {boolean} framed - centered contain with padding
 * @param {boolean} dense - less padding (product detail)
 */
export default function SmartImage({
  src,
  alt,
  className = "",
  fallback = "🌶️",
  fit = "cover",
  framed = false,
  dense = false,
}) {
  const [failed, setFailed] = useState(false);
  const framePad = dense ? "p-2 sm:p-3" : "p-4 sm:p-6 md:p-8";

  if (!src || failed) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-stone-100 ${framed ? framePad : ""} ${className}`}
      >
        <span className={`select-none opacity-90 ${dense ? "text-4xl" : "text-6xl"}`} aria-hidden>
          {fallback}
        </span>
        {alt ? <span className="sr-only">{alt}</span> : null}
      </div>
    );
  }

  if (framed) {
    const imgMax = dense ? "max-h-[200px] sm:max-h-[240px] lg:max-h-[260px]" : "max-h-full";
    return (
      <div className={`flex h-full w-full items-center justify-center ${framePad} ${className}`}>
        <img
          src={src}
          alt={alt}
          className={`max-w-full object-contain ${imgMax} w-auto`}
          onError={() => setFailed(true)}
          decoding="async"
        />
      </div>
    );
  }

  if (fit === "contain") {
    return (
      <img
        src={src}
        alt={alt}
        className={`object-contain ${className || "h-full w-full max-h-full max-w-full"}`}
        onError={() => setFailed(true)}
        decoding="async"
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`h-full w-full object-cover ${className}`}
      onError={() => setFailed(true)}
      decoding="async"
    />
  );
}