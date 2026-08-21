# spicer — E-commerce Platform

A modern, full-stack e-commerce website built entirely with **Next.js (App Router)**,
**plain JavaScript**, and **MySQL** (via **Prisma**). The customer storefront,
REST-style API, and the admin dashboard all live in a single Next.js project —
no separate backend service.

## Tech Stack

- **Next.js 16** (App Router, Route Handlers, Proxy)
- **React 19** — plain JavaScript, no TypeScript
- **Prisma ORM** + **MySQL**
- **Tailwind CSS v4** for styling
- **bcryptjs** for password hashing, **jsonwebtoken** for admin sessions (httpOnly cookie)

## 1. Architecture

Everything is one Next.js app:

- **Customer storefront** — Server Components fetch data directly via Prisma for
  fast, SEO-friendly pages (home, products, categories, blog, about, contact).
- **Cart** — stored in `localStorage` via a small React Context
  (`components/cart/CartContext.jsx`); no login required.
- **Backend / API** — Next.js Route Handlers under `app/api/*` provide REST
  endpoints for admin CRUD operations, checkout, and the contact form.
- **Admin panel** — protected pages under `app/admin/*`, guarded by `proxy.js`
  (Next.js 16's replacement for `middleware.js`) which checks a signed JWT
  session cookie. Route Handlers double-check the same session server-side as
  defense in depth.
- **Database** — MySQL, accessed exclusively through Prisma. Stock updates and
  order creation use `prisma.$transaction` so multi-step writes stay consistent.

## 2. Folder Structure

```
app/
  page.jsx                  Home page
  layout.jsx                Root layout (providers only)
  products/                 Product listing + detail
  categories/                Category listing + detail
  cart/                      Cart page (client-side)
  checkout/                  Checkout + success page
  blogs/                     Blog listing + detail
  about/, contact/           Static/simple pages
  admin/                     Admin dashboard, protected by proxy.js
    login/                   Admin login (public)
    products/, categories/, orders/, blogs/, messages/
  api/                       Route Handlers (REST API)
    auth/, categories/, products/, orders/, blogs/, contact/, upload/, dashboard/
components/
  common/                    Navbar, Footer, Button, Input, Modal, Table, Pagination, Toast...
  products/, categories/, cart/, admin/
lib/
  db.js          Prisma client singleton
  auth.js        Password hashing + JWT session helpers
  utils.js       Formatting, slugs, misc helpers
  validation.js  Server-side input validation
  mail.js        Order emails and receipt HTML
prisma/
  schema.prisma  Database schema
  seed.js        Seed script (admin user, categories, products, blogs)
proxy.js         Protects /admin/* routes (Next.js 16 "proxy" convention)
public/uploads/  Admin-uploaded images (git-ignored)
```

## 3. Database Design

| Table              | Purpose                                                              |
| ------------------- | --------------------------------------------------------------------- |
| `admins`            | Admin login accounts                                                  |
| `categories`         | Product categories                                                    |
| `products`           | Products (belongs to a category)                                      |
| `orders`             | Customer orders (guest checkout — no user table needed)              |
| `order_items`        | Line items per order — stores a **price snapshot** at purchase time  |
| `blogs`              | Blog posts                                                             |
| `contact_messages`   | Messages submitted through the Contact Us form                       |

Relationships: `Category 1—N Product`, `Order 1—N OrderItem`, `Product 1—N OrderItem`
(`OrderItem.productId` is nullable with `ON DELETE SET NULL`, so order history
survives even if a product is later deleted). See `prisma/schema.prisma` for
full field-level detail.

## 4. Application Flow

```
Customer → Products → Cart (localStorage) → Checkout (name/email/phone/address, COD)
  → POST /api/orders (transaction: validate stock → decrement stock → create order)
  → Order saved in MySQL → Confirmation emails sent to customer + admin
  → Confirmation page
  → Admin Dashboard sees the order → Admin can download the receipt
  → Admin updates order status (cancelling an order restores stock automatically)
```

## Getting Started

### 1. Prerequisites

- Node.js 20+
- A running MySQL server with a database named `spicer`

### 2. Configure environment

Copy/check `.env` in the project root (already created for local dev):

```
DATABASE_URL="mysql://root:@localhost:3306/sardarspices"
JWT_SECRET="change-this-in-production"
ADMIN_SEED_EMAIL="admin@sardarspices.com"
ADMIN_SEED_PASSWORD="Admin@123"
ADMIN_NOTIFY_EMAIL="admin@sardarspices.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="Sardar Spices <noreply@sardarspices.com>"
```

Fill in `SMTP_USER` and `SMTP_PASS` to send order emails. For Gmail, use an App Password. If SMTP is left empty, orders still work — emails are just skipped.

### 3. Install dependencies

```bash
npm install
```

### 4. Run database migrations

```bash
npm run db:migrate
```

> **Note:** if your local MySQL/MariaDB server reports a
> `Column count of mysql.proc is wrong` error (an outdated system table
> unrelated to this project), the schema has already been applied for you via
> `prisma/migrations/20260811132206_init/migration.sql`. Running
> `mysql_upgrade` on your server fixes this permanently.

### 5. Seed sample data

```bash
npm run db:seed
```

This creates an admin account, 4 categories, 12 products, and 3 blog posts.

### 6. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the storefront and
[http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the
admin panel.

**Default admin login:**

- Email: `admin@spicer.com`
- Password: `Admin@123`

Change these (or the `.env` values before seeding) before deploying to production.

## Business Rules Implemented

- Guest checkout only — no customer accounts, wishlist, or reviews.
- Checkout requires name, email, phone, and address.
- After a successful order, a confirmation email is sent to the customer and
  a new-order email is sent to the admin (requires SMTP settings in `.env`).
- Admin can download an HTML receipt from the order list or order detail page.
- Cash on Delivery is the only payment method.
- Stock is validated and decremented atomically inside a database transaction
  when an order is placed; it can never go negative.
- Cancelling an order automatically restores stock for its items.
- Order items store the product name/price **at the time of purchase**, so
  price changes or product deletions never affect historical orders.
- All admin routes require authentication (`proxy.js` + per-route session
  checks); customers never need to log in.
