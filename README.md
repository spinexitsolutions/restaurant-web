# Noor — Modern Indian Kitchen & Bar

A restaurant website plus admin panel built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, **Framer Motion** and **Lenis** smooth scroll. The layout is mobile-first. Everything on the public site can be edited from `/admin`.

```bash
npm install
npm run dev        # http://localhost:3000  ·  admin: http://localhost:3000/admin
```

Demo admin login: `admin@noor.kitchen` / `noor2026` (change via `.env.local`; see `.env.example`).

## Public site
- **Intro animation** in 3 styles (curtain, counter flip-book, words). Its words, duration and "play once per session" setting are edited in the admin. Add `/?intro=1` to the URL to replay it.
- **Island navbar**: a floating glass pill with a live open/closed status, shrinks on scroll, shows a scroll-progress line and has a bag counter. It morphs into a full menu with hover image previews. On mobile there is also a bottom Order/Reserve dock.
- **Homepage** (section order and visibility are set in the admin):
  - Hero where the image grows into a full-screen frame as you scroll
  - Apple-style manifesto text that lights up word by word as you scroll
  - Signature dishes in a pinned horizontal-scroll section
  - Story section with a parallax image reveal, plus animated counters
  - Menu preview where a photo follows the cursor
  - Experiences as stacked cards
  - Gallery in parallax columns
  - Coupon tickets and a testimonials carousel
  - Journal, quick reservation, and a map with opening hours
- **Menu** page with search, diet filters, a sticky category bar and a quick-view modal.
- **Reservations** in a 4-step booking flow with an add-to-calendar (.ics) download.
- **Online ordering**: bag drawer, checkout (delivery or pickup, coupons, tax and fees) and a live **order tracking** page.
- **Other pages**: Experiences / private dining, Gallery with lightbox, Journal (blog), About, Contact with FAQ, newsletter signup and a custom cursor.

## Admin (`/admin`)
- **Dashboard**: KPIs, revenue chart, orders by status, upcoming bookings and top dishes.
- **CRM**:
  - Reservations with status workflow and table assignment
  - Orders as a kanban board
  - Customers: built automatically from bookings and orders, with tags, notes, timeline and CSV export
  - Inbox and newsletter subscribers
- **CMS**: menu items and categories, homepage sections and content, gallery, team, events, journal posts, offers, testimonials and FAQs. Image upload is included.
- **Settings**:
  - Brand name and theme colours, with live re-theming
  - Intro animation
  - Contact details and opening hours
  - Ordering and reservations rules
  - SEO
  - Reset demo data

## Data
The app uses a zero-setup JSON store at `.data/db.json`, which is created from `src/lib/seed.ts` on first run. Every read and write goes through `src/lib/db.ts`. To use Postgres, Supabase or MongoDB in production, replace that module.
On serverless hosts such as Vercel the file system is temporary, so use a real database (or a persistent disk) for live data.
