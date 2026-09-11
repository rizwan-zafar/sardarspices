"use client";

import { useState } from "react";

export default function SmartImage({ src, alt, className, fallback = "🌶️" }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-brand-50 ${className || ""}`}>
        <span className="text-5xl">{fallback}</span>
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}
