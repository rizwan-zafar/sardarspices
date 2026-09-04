export const productListInclude = {
  category: { select: { id: true, name: true, slug: true } },
  variants: { orderBy: { id: "asc" } },
};

export const productDetailInclude = {
  category: { select: { id: true, name: true, slug: true } },
  variants: { orderBy: { id: "asc" } },
};

function parseOptionalPrice(value) {
  if (value === undefined || value === null || value === "") return null;
  const amount = Number(value);
  return Number.isNaN(amount) ? null : amount;
}

export function normalizeVariants(input) {
  if (!Array.isArray(input)) return [];
  return input
    .map((variant) => ({
      id: variant.id ? Number(variant.id) : undefined,
      name: String(variant.name || "").trim(),
      price: Number(variant.price),
      compareAtPrice: parseOptionalPrice(variant.compareAtPrice),
      stock: Number(variant.stock),
    }))
    .filter((variant) => variant.name);
}

export function salePrice(variant) {
  const price = Number(variant?.price || 0);
  const compareAt = parseOptionalPrice(variant?.compareAtPrice);
  const onSale = compareAt != null && compareAt > price;
  return { price, compareAt, onSale };
}

export async function syncProductSummary(tx, productId) {
  const variants = await tx.productVariant.findMany({ where: { productId } });
  const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
  const minPrice = variants.length ? Math.min(...variants.map((variant) => Number(variant.price))) : 0;

  await tx.product.update({
    where: { id: productId },
    data: { stock: totalStock, price: minPrice },
  });
}

export function cheapestInStockVariant(product) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const available = variants.filter((variant) => Number(variant.stock) > 0);
  const pool = available.length ? available : variants;
  if (!pool.length) return null;
  return [...pool].sort((a, b) => Number(a.price) - Number(b.price))[0];
}

export async function replaceProductVariants(tx, productId, variants) {
  const existing = await tx.productVariant.findMany({ where: { productId } });
  const existingIds = new Set(existing.map((variant) => variant.id));
  const keepIds = variants.filter((variant) => variant.id && existingIds.has(variant.id)).map((variant) => variant.id);

  if (keepIds.length) {
    await tx.productVariant.deleteMany({
      where: { productId, id: { notIn: keepIds } },
    });
  } else {
    await tx.productVariant.deleteMany({ where: { productId } });
  }

  for (const variant of variants) {
    const data = {
      name: variant.name,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      stock: variant.stock,
    };
    if (variant.id && existingIds.has(variant.id)) {
      await tx.productVariant.update({
        where: { id: variant.id },
        data,
      });
    } else {
      await tx.productVariant.create({
        data: { productId, ...data },
      });
    }
  }

  await syncProductSummary(tx, productId);
}
