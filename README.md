# 🏠 Habesha Homes — Ethiopian Property Marketplace with Claude AI

> Ethiopia's first AI-powered property marketplace. Buy, sell, rent, and invest with Claude AI assistance in Amharic and English.

---

## 🚀 Quick Start (Day 1)

```bash
# 1. Clone and install
npx create-next-app@latest habesha-homes --typescript --tailwind --app
cd habesha-homes
npm install @anthropic-ai/sdk @supabase/supabase-js @supabase/ssr mapbox-gl react-map-gl stripe @stripe/stripe-js @stripe/react-stripe-js ai zod zustand swr date-fns clsx tailwind-merge react-hook-form @hookform/resolvers react-dropzone react-hot-toast lucide-react sharp

# 2. Copy all provided source files into src/

# 3. Set up environment
cp .env.example .env.local
# Fill in all API keys in .env.local

# 4. Set up Supabase
# - Go to supabase.com, create project
# - Run supabase/migrations/001_initial_schema.sql in SQL editor
# - Create storage buckets: property-images, title-documents, ai-reports

# 5. Run development server
npm run dev
```

---

## 📁 Project Structure

```
habesha-homes/
├── src/
│   ├── app/
│   │   ├── page.tsx                    ← Homepage
│   │   ├── layout.tsx                  ← Root layout
│   │   ├── search/page.tsx             ← Property search
│   │   ├── property/[id]/page.tsx      ← Property detail
│   │   ├── dashboard/page.tsx          ← Agent dashboard
│   │   ├── diaspora/page.tsx           ← Diaspora buying guide
│   │   ├── ai-reports/page.tsx         ← AI reports marketplace
│   │   └── api/
│   │       ├── properties/route.ts     ← Property CRUD + search
│   │       ├── claude/
│   │       │   ├── chat/route.ts       ← Streaming Amharic chat
│   │       │   ├── fraud-check/route.ts ← Title document analysis
│   │       │   ├── valuation/route.ts  ← Property valuation
│   │       │   └── contract/route.ts   ← Contract analysis
│   │       └── payments/
│   │           ├── route.ts            ← Stripe + Telebirr
│   │           └── webhook/route.ts    ← Payment webhooks
│   ├── components/
│   │   ├── ai/
│   │   │   ├── PropertyChat.tsx        ← Main AI chat widget
│   │   │   ├── FraudCheckUpload.tsx    ← Document upload + analysis
│   │   │   ├── ValuationReport.tsx     ← Valuation display
│   │   │   └── ContractAnalyzer.tsx    ← Contract upload + analysis
│   │   ├── property/
│   │   │   ├── PropertyCard.tsx        ← Listing card
│   │   │   ├── PropertyMap.tsx         ← Mapbox map
│   │   │   ├── PropertyGallery.tsx     ← Photo gallery
│   │   │   └── PropertyFilters.tsx     ← Search filters
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/                         ← Shared UI components
│   ├── lib/
│   │   ├── claude.ts                   ← All Claude AI functions
│   │   ├── supabase/
│   │   │   ├── client.ts               ← Browser client
│   │   │   └── server.ts               ← Server client
│   │   └── utils.ts                    ← Helpers
│   └── types/
│       └── index.ts                    ← All TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql      ← Full DB schema
├── .env.example
├── next.config.ts
└── package.json
```

---

## 📅 Week-by-Week Development Plan

### Week 1–2: Foundation
**Goal: Working Next.js app with Supabase**

Day 1:
- [ ] Run schema migration in Supabase
- [ ] Set up all env variables
- [ ] Verify Supabase connection
- [ ] Run `npm run dev` — homepage should load

Day 2–3:
- [ ] Build root `layout.tsx` with Navbar and Footer
- [ ] Build homepage (`page.tsx`) — already provided
- [ ] Add Supabase auth (login/signup pages)
- [ ] Test user registration

Day 4–5:
- [ ] Build property listing creation form
- [ ] Add image upload to Supabase storage
- [ ] Test full property creation flow

Day 6–7:
- [ ] Build `/search` page with filters
- [ ] Test search API (`/api/properties`)
- [ ] Add neighborhood filter chips

---

### Week 3–4: Core Platform
**Goal: Full property browsing experience**

- [ ] Build `/property/[id]` detail page
  - Photo gallery
  - Full specs display
  - Agent contact form
  - Map with Mapbox
- [ ] Build Mapbox property map (`PropertyMap.tsx`)
- [ ] Add property save/favorite functionality
- [ ] Build agent profile pages
- [ ] Add inquiry/contact system

---

### Week 5: Claude AI — Chat
**Goal: Working Amharic property assistant**

- [ ] Integrate `PropertyChat.tsx` into property detail page
- [ ] Test `/api/claude/chat` with real properties
- [ ] Test in both Amharic and English
- [ ] Add language toggle
- [ ] Test streaming responses
- [ ] Add suggested questions

**Test prompts:**
- "Is this price fair for Bole?" / "ዋጋው ለቦሌ ትክክለኛ ነው?"
- "What documents do I need to buy?" / "ምን ሰነዶች ያስፈልጉኛል?"
- "Can I buy remotely from the US?" 

---

### Week 6: Claude AI — Fraud & Valuation
**Goal: Working AI reports**

- [ ] Build `FraudCheckUpload.tsx` component
- [ ] Test `/api/claude/fraud-check` with sample documents
- [ ] Build `ValuationReport.tsx` component
- [ ] Test `/api/claude/valuation`
- [ ] Build `/ai-reports` page showcasing all reports
- [ ] Generate PDF reports with `@react-pdf/renderer`

---

### Week 7: Claude AI — Contract & Matching
**Goal: Complete AI feature set**

- [ ] Build `ContractAnalyzer.tsx`
- [ ] Test `/api/claude/contract` 
- [ ] Build neighborhood report feature
- [ ] Build smart property matching
- [ ] Test AI listing description generator for agents

---

### Week 8: Payments
**Goal: Revenue flowing**

- [ ] Set up Stripe account and add keys
- [ ] Build payment flow for AI reports
- [ ] Test Stripe checkout
- [ ] Set up Telebirr (get credentials from Ethio Telecom)
- [ ] Build agent subscription plans page
- [ ] Test featured listing payment

**Stripe test cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

---

### Week 9: Diaspora Features
**Goal: Remote buying flow working**

- [ ] Build `/diaspora` landing page
- [ ] Build diaspora remote buying flow
- [ ] Add DocuSign e-signature integration
- [ ] Add USD pricing toggle throughout site
- [ ] Test end-to-end diaspora purchase flow
- [ ] Add international phone support

---

### Week 10: Polish & Launch
**Goal: Go live with real listings**

- [ ] Full QA testing on mobile
- [ ] Test on slow connections (Ethiopia network simulation)
- [ ] SEO optimization (meta tags, sitemap, robots.txt)
- [ ] Add Google Analytics
- [ ] Performance audit (Lighthouse score > 80)
- [ ] Onboard first 10 agents
- [ ] Add 50+ real property listings
- [ ] Configure custom domain
- [ ] Launch! 🚀

---

## 💰 Revenue Setup

### Stripe Products to Create
```
1. AI Valuation Report       → $25.00 (one-time)
2. Title Fraud Check         → $49.00 (one-time)
3. Contract Analysis         → $19.99 (one-time)
4. Neighborhood Report       → $14.99 (one-time)
5. Due Diligence Package     → $99.00 (one-time)
6. Featured Listing (30 days)→ $50.00 (one-time)
7. Agent Basic Monthly       → $29.00/month
8. Agent Pro Monthly         → $59.00/month
9. Agent Enterprise Monthly  → $149.00/month
```

### Telebirr Setup
1. Register at Ethio Telecom business portal
2. Get App ID, App Key, and Short Code
3. Use sandbox environment first: `https://developerspace.ethiotelecom.et`
4. Switch to production when ready

---

## 🔑 API Keys You Need

| Service | Where to get | Used for |
|---------|-------------|----------|
| Anthropic | console.anthropic.com | Claude AI features |
| Supabase | supabase.com | Database + Auth + Storage |
| Mapbox | mapbox.com | Interactive property map |
| Stripe | stripe.com | International payments |
| Telebirr | Ethio Telecom B2B portal | Ethiopian payments |
| Cloudinary | cloudinary.com | Image optimization |
| SendGrid | sendgrid.com | Email notifications |
| Twilio | twilio.com | SMS notifications |

---

## 🌍 Claude AI Features Summary

| Feature | File | Cost to user |
|---------|------|--------------|
| Amharic property Q&A | `claude.ts → streamPropertyChat` | Free (unlimited) |
| Title fraud detection | `claude.ts → analyzeTitleDocument` | $49/report |
| Property valuation | `claude.ts → generateValuation` | $25/report |
| Contract analysis | `claude.ts → analyzeContract` | $19.99/report |
| Neighborhood report | `claude.ts → generateNeighborhoodReport` | $14.99/report |
| Listing description writer | `claude.ts → generateListingDescription` | Agent plan feature |
| Smart property matching | `claude.ts → matchPropertiesToBuyer` | Free for buyers |

---

## 📱 Key Pages to Build

1. **`/`** — Homepage (provided)
2. **`/search`** — Property search + filters + map
3. **`/property/[id]`** — Property detail + AI chat
4. **`/agents`** — Agent directory
5. **`/agents/[id]`** — Agent profile + listings
6. **`/dashboard`** — Agent dashboard
7. **`/ai-reports`** — AI report marketplace
8. **`/diaspora`** — Diaspora buying guide
9. **`/auth/login`** — Login
10. **`/auth/signup`** — Signup

---

## 🐛 Troubleshooting

**Claude API not responding:**
- Check `ANTHROPIC_API_KEY` in `.env.local`
- Verify you have API credits at console.anthropic.com

**Supabase RLS blocking queries:**
- Check that your user is authenticated
- Temporarily disable RLS for testing: `ALTER TABLE properties DISABLE ROW LEVEL SECURITY;`

**Mapbox map not loading:**
- Ensure `NEXT_PUBLIC_MAPBOX_TOKEN` is set
- Add your domain to Mapbox allowed URLs

**Telebirr test:**
- Use sandbox: set `TELEBIRR_APP_ID=sandbox` for testing
- Real integration requires approval from Ethio Telecom

---

Built with ❤️ for Ethiopia | Powered by Claude AI
