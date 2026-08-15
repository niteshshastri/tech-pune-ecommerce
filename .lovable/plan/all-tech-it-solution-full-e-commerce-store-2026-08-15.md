# All Tech IT Solution — Full E-Commerce Store

A complete, working online store for All Tech IT Solution (Hadapsar, Pune): public shop, cart, UPI checkout, customer accounts, and an admin dashboard where you manage everything yourself — no developer needed.

## One technical note up front

You asked for Next.js + Vercel + Supabase. This project runs on Lovable's stack: React + TypeScript + Tailwind + TanStack Start, with Lovable Cloud (managed Postgres database, authentication, file storage, row-level security — the same engine as Supabase) and one-click publishing plus custom domain support for alltechitsolutionpune.com. Everything you asked for is fully supported; only the framework/hosting names differ. Secrets stay server-side; no private keys ever reach the browser.

## What gets built

### Public website
- Home (hero, categories, featured/bestsellers, contact strip)
- Shop with search, category, brand, price range, availability filters and sorting
- Category pages: Laptops, Refurbished Laptops, Desktops, Monitors, Accessories
- Product detail (image gallery, full specifications, condition, warranty, stock state, add to cart)
- Cart, Checkout, Order Confirmation, and "Track my order" via order number + phone
- About, Contact (map/address/phone/WhatsApp), and policy pages: Privacy, Terms, Delivery, Cancellation, Refund, Warranty — policy text is admin-editable, not hardcoded
- Distinct premium electronics identity (deep slate + electric blue accent, technical sans typography), mobile-first, no Amazon look-alike

### Catalogue seed
All 16 refurbished laptops, 23 accessories, and 3 monitors seeded with the exact names, specs and prices you supplied, plus the 11 categories. Every product starts as **"Stock: needs verification"** and is hidden from "in stock" filters until you confirm it — nothing claims availability we don't know. No invented images: clean "photo needed — upload from admin" placeholders until you upload real photos.

### Customer accounts
Email/password sign-up and login. Customers see only their own orders and profile.

### Checkout with manual UPI
1. Order is created with the total recalculated on the server from current database prices (browser prices are ignored)
2. Stock re-checked and reserved atomically so two buyers can never both get the last unit
3. Order page shows the exact amount, your configured UPI ID and QR code
4. Customer enters their UPI transaction reference; the order becomes **Payment Verification Pending**
5. Only you, signed in as admin, can mark it Paid. Entering a reference never marks an order paid.
Payment logic is isolated in one module so Razorpay can be added later without rework.

### Admin dashboard (/admin, admin-only)
- Overview: total products, active, out of stock, low stock, orders, pending verification, paid, delivered, revenue
- Products: add, edit, archive (never hard-delete anything tied to an order), price, name, description, category, brand, condition, warranty, custom specification rows, stock quantity, in/out of stock, featured, bestseller
- Images: upload multiple per product, set the main image, reorder, replace, delete
- Categories: create, edit, disable, archive
- Orders: full detail (customer name, phone, email, address, items with purchase-time name and price, totals, UPI reference, admin notes) and status updates through Payment Pending → Payment Verification Pending → Paid → Processing → Ready for Delivery → Out for Delivery → Delivered, plus Cancelled and Refunded
- Settings: business name, logo, phone, email, address, WhatsApp, UPI ID, UPI QR image, business hours, GST number, and all policy texts. Anything not supplied is left blank for you to fill — no invented values.

### Security
Row-level security on every table; roles kept in a separate roles table (never on the profile) so no one can promote themselves. Customers cannot read others' orders or touch prices, stock, or payment status. All pricing, stock and payment changes happen in server code that verifies who's calling.

### SEO & performance
Per-page titles, descriptions, Open Graph tags, canonical URLs, LocalBusiness + Product structured data, sitemap and robots.txt targeting searches like "refurbished laptops Pune" and "laptop shop Hadapsar". Lazy-loaded, sized images and minimal client JavaScript.

### Documentation
README covering local setup, backend/environment basics, making your account admin, uploading images, managing products, UPI configuration, publishing, and connecting alltechitsolutionpune.com.

## Technical details

- Tables: `profiles`, `user_roles` (+ `has_role()` security-definer function), `categories`, `products`, `product_images`, `orders`, `order_items` (snapshotted product name/price), `payment_records`, `business_settings`. Grants issued for every public table alongside RLS policies.
- Stock safety: order creation runs in a single Postgres function using `SELECT ... FOR UPDATE` row locks; insufficient stock aborts the whole order.
- Server functions (TanStack `createServerFn`) handle order creation, payment verification, admin mutations and stock adjustments; admin routes live under an authenticated layout with a server-side role check on every privileged call.
- Storage: private-read `product-images` bucket with admin-only write policies; public read for product photos.
- Seed data ships as SQL INSERTs in the migration with `stock_status = 'unverified'`.

## Build order
1. Enable Lovable Cloud, create schema + RLS + seed migration
2. Design system, layout shell, home and shop/category/product pages
3. Cart, checkout, UPI payment flow, order confirmation and tracking
4. Auth, customer account area
5. Admin dashboard: products, images, categories, orders, settings
6. Policies, About/Contact, SEO, sitemap
7. End-to-end test of a real customer purchase and full admin verification flow, then README
