# Frameora — Photo Frame Store (working name)

Custom photo-frame e-commerce site: customers pick a category → frame → upload photo → pay → track order.
Admin manages orders and updates status.

## Run it on your computer

1. Install **Node.js 20 or newer** from https://nodejs.org (LTS version).
2. Open a terminal in this folder (`C:\Mandar\FrameStore`) and run:

   ```
   npm install
   npm run dev
   ```

3. Open http://localhost:3000 in your browser.
   - Store: http://localhost:3000
   - Admin: http://localhost:3000/admin
   - Demo order to track: `FR10244`

## Connect Supabase (lets the admin add products)

Without this the site still works, using the built-in products in `src/lib/data.ts`.

1. Create a free project at https://supabase.com (region: Mumbai).
2. In the project: **SQL Editor → New query**, paste all of `supabase/setup.sql`, click **Run**.
   This creates the products table, the photo storage, the security rules, and copies in today's products.
3. **Authentication → Users → Add user**: your admin email + a password, tick *Auto Confirm User*.
   Then in the SQL Editor run (with your email):
   `insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';`
4. Copy `.env.example` to `.env.local` and paste your **Project URL** and **anon / publishable key**
   (Project Settings → API).
5. Restart `npm run dev`, open `/admin`, sign in → **Products → Add product**.

Only accounts in the `admins` table can add, edit or delete products; this is enforced by the database itself.

## Change things quickly

| What | Where |
|---|---|
| Brand name, WhatsApp, email, shipping fee, free-shipping limit | `src/lib/site.ts` |
| Products (once Supabase is connected) | `/admin/products` |
| Categories, art styles, built-in products, add-ons | `src/lib/data.ts` |
| Colours & fonts | `src/app/globals.css` (the `@theme` block) |

## Pages

- `/` Home · `/shop` Catalogue with category filters · `/frame/[slug]` Frame page with live preview, photo upload, quality check, wall colours, add-ons
- `/cart` · `/checkout` (address, PIN validation, Online / COD) · `/orders` and `/orders/[id]` status timeline
- `/admin` dashboard · `/admin/orders` (filter, search, change status) · `/admin/orders/[id]` (download photo, next-status button) · `/admin/products` (add / edit / hide / delete products with photo upload)

## Current status: front-end demo

Cart and orders are saved in the browser (localStorage) and payment is simulated.
Next steps:
1. Supabase — ✅ products + admin login + product photos · next: orders in the database, customer login (OTP), customer photo storage
2. Razorpay — real payments
3. Shiprocket — courier booking & live tracking
4. WhatsApp notifications, policy pages, real product photos

Tech: Next.js 16 · React 19 · Tailwind CSS 4 · Motion · Lucide icons · TypeScript
