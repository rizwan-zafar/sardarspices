import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
  const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@sardarspices.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || "Admin@123";

  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await prisma.admin.create({
      data: { name: "Sardar Spices Admin", email: adminEmail, password: hashed },
    });
    console.log(`Admin created -> email: ${adminEmail} / password: ${adminPassword}`);
  } else {
    console.log("Admin already exists, skipping.");
  }

  const categoriesData = [
    {
      name: "Whole Spices",
      description: "Sun-dried, unground spices packed with natural aroma and flavor.",
      image: "/images/categories/whole-spices.svg",
    },
    {
      name: "Ground Spices",
      description: "Finely milled spices ready to use in everyday cooking.",
      image: "/images/categories/ground-spices.svg",
    },
    {
      name: "Spice Blends",
      description: "Signature masala blends crafted for authentic regional flavor.",
      image: "/images/categories/spice-blends.svg",
    },
    {
      name: "Dry Fruits",
      description: "Premium quality dry fruits and nuts sourced from trusted farms.",
      image: "/images/categories/dry-fruits.svg",
    },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const slug = slugify(cat.name);
    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { ...cat, slug, status: "ACTIVE" },
    });
    categories[cat.name] = category;
  }
  console.log(`Seeded ${categoriesData.length} categories.`);

  const productsData = [
    {
      name: "Red Chili Powder 500g",
      category: "Ground Spices",
      price: 450,
      stock: 40,
      description:
        "Vibrant, fiery red chili powder made from sun-ripened chilies. Adds deep color and authentic heat to curries, marinades, and snacks.",
      images: ["/images/products/red-chili-powder.svg"],
    },
    {
      name: "Turmeric Powder 500g",
      category: "Ground Spices",
      price: 380,
      stock: 55,
      description:
        "Pure, high-curcumin turmeric powder with a warm earthy aroma. A daily kitchen essential for color and flavor.",
      images: ["/images/products/turmeric-powder.svg"],
    },
    {
      name: "Whole Black Pepper 250g",
      category: "Whole Spices",
      price: 520,
      stock: 30,
      description:
        "Bold, aromatic whole black peppercorns, hand-picked for maximum punch. Perfect for grinding fresh over any dish.",
      images: ["/images/products/black-pepper.svg"],
    },
    {
      name: "Green Cardamom 100g",
      category: "Whole Spices",
      price: 950,
      stock: 20,
      description:
        "Fragrant green cardamom pods with a sweet, floral aroma — ideal for tea, desserts, and biryani.",
      images: ["/images/products/green-cardamom.svg"],
    },
    {
      name: "Chicken Biryani Masala 100g",
      category: "Spice Blends",
      price: 320,
      stock: 45,
      description:
        "A perfectly balanced blend of 15 spices crafted to bring restaurant-style biryani flavor to your home kitchen.",
      images: ["/images/products/biryani-masala.svg"],
    },
    {
      name: "Garam Masala 100g",
      category: "Spice Blends",
      price: 280,
      stock: 60,
      description:
        "Our signature warm spice blend, roasted and ground the traditional way for rich, layered flavor.",
      images: ["/images/products/garam-masala.svg"],
    },
    {
      name: "Premium Almonds 500g",
      category: "Dry Fruits",
      price: 1450,
      stock: 25,
      description:
        "Handpicked, crunchy premium almonds — a healthy snack and a great addition to desserts and milk.",
      images: ["/images/products/almonds.svg"],
    },
    {
      name: "Cashew Nuts 500g",
      category: "Dry Fruits",
      price: 1650,
      stock: 18,
      description:
        "Creamy, whole cashew nuts sourced for quality and freshness. Great for snacking and rich gravies.",
      images: ["/images/products/cashews.svg"],
    },
    {
      name: "Cumin Seeds 250g",
      category: "Whole Spices",
      price: 340,
      stock: 50,
      description: "Earthy, aromatic cumin seeds — a foundational spice for tempering and roasting.",
      images: ["/images/products/cumin-seeds.svg"],
    },
    {
      name: "Coriander Powder 500g",
      category: "Ground Spices",
      price: 360,
      stock: 42,
      description: "Freshly ground coriander with a citrusy, mild flavor that balances any curry base.",
      images: ["/images/products/coriander-powder.svg"],
    },
    {
      name: "Karahi Masala 100g",
      category: "Spice Blends",
      price: 300,
      stock: 38,
      description: "A robust masala blend designed for the perfect restaurant-style karahi at home.",
      images: ["/images/products/karahi-masala.svg"],
    },
    {
      name: "Pistachios 500g",
      category: "Dry Fruits",
      price: 2100,
      stock: 15,
      description: "Roasted, lightly salted pistachios — a delicious and nutritious everyday snack.",
      images: ["/images/products/pistachios.svg"],
    },
  ];

  for (const p of productsData) {
    const slug = slugify(p.name);
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        stock: p.stock,
        images: p.images,
        status: "ACTIVE",
        categoryId: categories[p.category].id,
      },
    });
  }
  console.log(`Seeded ${productsData.length} products.`);

  const blogsData = [
    {
      title: "5 Health Benefits of Turmeric You Should Know",
      author: "Sardar Spices Team",
      content:
        "Turmeric has been used for centuries in South Asian kitchens, not just for its warm color and flavor but for its remarkable health properties. Rich in curcumin, turmeric is known for its anti-inflammatory and antioxidant effects. Adding a pinch of quality turmeric powder to your daily meals, milk, or teas is a simple way to support overall wellness. At Sardar Spices, we source our turmeric from trusted farms and grind it fresh to preserve its natural potency and aroma.",
      featuredImage: "/images/blog/turmeric-benefits.svg",
    },
    {
      title: "How to Store Spices for Maximum Freshness",
      author: "Sardar Spices Team",
      content:
        "Proper storage is the secret to keeping your spices flavorful for longer. Always store spices in airtight containers away from direct sunlight, heat, and moisture. Whole spices tend to retain their potency longer than ground ones, so consider buying whole and grinding as needed. Label your containers with purchase dates and try to use spices within 6-12 months for the best flavor. A well organized spice cabinet not only keeps your ingredients fresh but also makes cooking a joy.",
      featuredImage: "/images/blog/spice-storage.svg",
    },
    {
      title: "The Art of Blending: What Makes a Great Masala",
      author: "Sardar Spices Team",
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
