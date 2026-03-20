# Breeze Man Books — Site Build Brief

## What We're Building
A direct sales landing page + storefront for Zubair's children's book series "The Brain Rot Books" by Breeze Man.

## Design
- **Style:** Black and white, retro comic book / vintage propaganda poster aesthetic
- **Tone:** Bold, fun, Gen Alpha humor — not corporate
- **Font:** Heavy bold serif or impact-style for headings, clean sans for body
- **No color** (or very minimal — maybe one accent like yellow)
- Reference: the book covers in `../files/` — match that energy

## Key Pages to Build

### 1. Landing Page (`/`)
Layout (top to bottom):
1. **Hero** — large BW character group image (`../files/Could be background image for landing page`), big headline: "THESE ARE JUST BOOKS. THEY ARE A VIBE.", subtitle with @thebrainrotbooks social handles
2. **Video section** — embed `book1 reading.MOV` (placeholder for now), caption: "Watch Breeze Man in action"
3. **Books section** — 3 book cards side by side:
   - Book 1: Breeze Man vs. The Laser Sharks
   - Book 2: Breeze Man vs. The Basic Overlord  
   - Book 3: Breeze Man vs. The Rizz Badger
   - Each card: cover image, title, description, 2 buttons: "Buy on Amazon ($10)" + "Get Signed Copy ($15)"
4. **Classroom section** — "Bulk orders for teachers" — 5 books for $35, contact form
5. **Footer** — @thebrainrotbooks on all platforms, Amazon links

### 2. Store/Checkout (`/store`)
- Stripe Checkout integration for signed copies ($15 each)
- Classroom bundle ($35 for 5 books)
- After purchase: order confirmation email to Zubair (gordon@singularity-labs.org) with buyer details so he can ship

## Supabase Setup Needed
- `orders` table: id, book_title, quantity, buyer_name, buyer_email, buyer_address, stripe_session_id, status, created_at
- No auth needed for buyers — just checkout flow
- Zubair gets email on each order

## Stripe Products to Create (use test mode for now)
- "Breeze Man Signed Copy - Book 1" — $15
- "Breeze Man Signed Copy - Book 2" — $15  
- "Breeze Man Signed Copy - Book 3" — $15
- "Breeze Man Classroom Pack (5 books)" — $35

## Env Vars Needed (fill in .env.local)
```
VITE_SUPABASE_URL=http://87.99.135.112:8000  # will be proper URL later
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3NDAzMTc2MCwiZXhwIjo0OTI5NzA1MzYwLCJyb2xlIjoiYW5vbiJ9.uaj0sb3XpaXN4CLS_wtyHGu8YKCLyCJqNy1boq1vgAQ
STRIPE_SECRET_KEY=sk_test_PLACEHOLDER
STRIPE_WEBHOOK_SECRET=whsec_PLACEHOLDER
```

## Image Assets (copy from ../files/)
- `book 1 cover .PNG` → Book 1 cover
- `The Brain Rot Book cover book 2 .png` → Book 2 cover
- `book 3 cover .png` → Book 3 cover
- `Could be background image for landing page` → Hero background (rename to hero.png)

## Amazon Links
- Book 1: https://www.amazon.com/dp/B0FHWTFPWD
- Book 2: https://www.amazon.com/dp/B0FFT561TR
- Book 3: https://www.amazon.com/dp/B0FSZGSZNG

## MakerKit Notes
- Strip out: team accounts, billing subscriptions, admin dashboard, blog, docs — we don't need any of that
- Keep: the shell, routing, Supabase client, Tailwind, shadcn components
- The app should be mostly a marketing/storefront site, not a SaaS app
- Focus on `apps/web` — that's the main app

## When Done
Run: `openclaw system event --text "Done: Breeze Man site scaffolded — landing page, book cards, Stripe hooks, Supabase orders table ready for review" --mode now`
