import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { categories as catalogCategories, products as catalogProducts } from "./catalog.js";

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@spicer.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || "Admin@123";

  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await prisma.admin.create({
      data: { name: "spicer Admin", email: adminEmail, password: hashed },
    });
    console.log(`Admin created -> email: ${adminEmail} / password: ${adminPassword}`);
  } else {
    console.log("Admin already exists, skipping.");
  }

  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const categories = {};
  for (const cat of catalogCategories) {
    const slug = slugify(cat.name);
    const category = await prisma.category.create({
      data: { ...cat, slug, status: "ACTIVE" },
    });
    categories[cat.name] = category;
  }
  console.log(`Seeded ${catalogCategories.length} categories.`);

  for (const p of catalogProducts) {
    const slug = slugify(p.name);
    const variants = p.variants.map((variant) => ({
      name: variant.name,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice || null,
      stock: variant.stock,
    }));
    const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
    const minPrice = Math.min(...variants.map((variant) => variant.price));
    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: p.description,
        price: minPrice,
        stock: totalStock,
        images: p.images || [],
        status: "ACTIVE",
        categoryId: categories[p.category].id,
        variants: { create: variants },
      },
    });
  }
  console.log(`Seeded ${catalogProducts.length} products.`);

  const blogsData = [
    {
      title: "5 Health Benefits of Turmeric You Should Know",
      author: "spicer Team",
      content:
        "Turmeric has been used for centuries in South Asian kitchens, not just for its warm color and flavor but for its remarkable health properties. Rich in curcumin, turmeric is known for its anti-inflammatory and antioxidant effects. Adding a pinch of quality turmeric powder to your daily meals, milk, or teas is a simple way to support overall wellness. At spicer, we source our turmeric from trusted farms and grind it fresh to preserve its natural potency and aroma.",
      featuredImage: "/images/blog/turmeric-benefits.svg",
    },
    {
      title: "How to Store Spices for Maximum Freshness",
      author: "spicer Team",
      content:
        "Proper storage is the secret to keeping your spices flavorful for longer. Always store spices in airtight containers away from direct sunlight, heat, and moisture. Whole spices tend to retain their potency longer than ground ones, so consider buying whole and grinding as needed. Label your containers with purchase dates and try to use spices within 6-12 months for the best flavor. A well organized spice cabinet not only keeps your ingredients fresh but also makes cooking a joy.",
      featuredImage: "/images/blog/spice-storage.svg",
    },
    {
      title: "The Art of Blending: What Makes a Great Masala",
      author: "spicer Team",
      content:
        "A great masala blend is more than just a mix of spices — it's a balance of aroma, heat, and depth. Our master blenders carefully select and roast each spice to unlock its full flavor before grinding. Whether it's our Biryani Masala or Garam Masala, every batch is crafted in small quantities to ensure consistent quality and freshness. Discover the difference a well-crafted blend can make in your everyday cooking.",
      featuredImage: "/images/blog/masala-blending.svg",
    },
  ];

  for (const b of blogsData) {
    const slug = slugify(b.title);
    await prisma.blog.upsert({
      where: { slug },
      update: {},
      create: {
        title: b.title,
        slug,
        author: b.author,
        content: b.content,
        featuredImage: b.featuredImage,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  }
  console.log(`Seeded ${blogsData.length} blog posts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
