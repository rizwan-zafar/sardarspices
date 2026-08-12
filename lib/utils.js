// Small shared helpers used across the app. Kept intentionally simple.
import { prisma } from "@/lib/db";

export function formatCurrency(amount) {
  const value = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  return `Rs. ${value.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber() {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SS-${y}${m}${d}-${random}`;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export function orderStatusColor(status) {
  const map = {
    PENDING: "bg-amber-100 text-amber-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-indigo-100 text-indigo-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return map[status] || "bg-gray-100 text-gray-800";
}

// Ensures a slug is unique for a given Prisma model delegate, e.g. prisma.product.
export async function ensureUniqueSlug(prismaModel, baseSlug, excludeId) {
  let slug = baseSlug;
  let counter = 1;
  for (;;) {
    const existing = await prismaModel.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${baseSlug}-${counter++}`;
  }
}

// Serializes Prisma Decimal / Date fields so objects can be safely passed
// from Server Components / Route Handlers to the client as plain JSON.
export function toPlain(value) {
  return JSON.parse(
    JSON.stringify(value, (_key, val) => {
      if (val && typeof val === "object" && typeof val.toNumber === "function") {
        return val.toNumber();
      }
      return val;
    })
  );
}
