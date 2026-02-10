# Codebase Map — tsumugi

> Last updated: 2026-02-10

## Architecture

```
Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
Auth: BetterAuth + NextAuth (dual, migrating to BetterAuth)
DB: PostgreSQL (Neon prod, Docker local) + Drizzle ORM
Storage: Cloudflare R2 (prod), LocalStack S3 (local)
Payments: Stripe Connect
Email: Resend
AI: Anthropic Claude (estimate service)
```

## Directory Map

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Homepage — property grid with filters
│   ├── listing/                # Seller-side listing management
│   │   ├── page.tsx            # My listings dashboard
│   │   ├── new/page.tsx        # Create new listing
│   │   ├── onboarding/         # Seller onboarding flow
│   │   └── [id]/               # Edit, preview, PDF for specific listing
│   ├── listings/               # Buyer-side property browsing
│   │   └── [id]/               # Property detail + inquiry form
│   ├── properties/             # Property management
│   │   └── [id]/               # Detail, payment, handover
│   ├── inquiry/                # Inquiry management
│   │   └── [id]/               # Agreement, viewing-complete, signing
│   ├── viewing/                # Viewing flow
│   │   └── [id]/               # Complete, review
│   ├── agreements/             # Agreement/contract pages
│   │   └── [id]/               # View + PDF generation
│   ├── account/                # User account
│   │   ├── page.tsx            # Account dashboard
│   │   ├── edit/               # Profile editing
│   │   └── stripe-setup/       # Stripe Connect onboarding
│   ├── admin/                  # Admin panel
│   ├── dashboard/              # User dashboard
│   ├── messages/               # Messaging
│   ├── creator/                # Creator landing page
│   ├── guide/                  # How-to guide
│   ├── for-managers/           # Landing page for property managers
│   ├── hosting/new/            # New hosting creation
│   ├── help/                   # Help pages
│   ├── privacy/                # Privacy policy
│   └── terms/                  # Terms of service
│
├── components/                 # React components
│   ├── ui/                     # shadcn/ui primitives (button, card, dialog, etc.)
│   ├── auth/                   # Auth: signup-dialog, become-seller-dialog/flow
│   ├── listing/                # Listing: create-listing-flow, furniture-form, pricing
│   ├── messaging/              # Messaging: thread-list, message-thread, schedule-templates
│   ├── payment/                # Payment: deposit, remaining, fee-breakdown, stripe-connect
│   ├── viewing/                # Viewing: furniture-checklist-ui
│   ├── admin/                  # Admin: inquiry-list, seller-listing-list
│   ├── header.tsx              # Global header with auth state
│   ├── footer.tsx              # Global footer
│   ├── property-card.tsx       # Property card (used on homepage)
│   ├── property-sidebar.tsx    # Property detail sidebar
│   ├── inquiry-form.tsx        # Inquiry submission form
│   ├── image-gallery.tsx       # Image gallery with lightbox
│   └── ...                     # Other shared components
│
├── contexts/                   # React contexts
│   └── auth-context.tsx        # Auth state provider
│
└── lib/                        # Utilities, data, business logic
    ├── types.ts                # All TypeScript interfaces (Property, User, Inquiry, etc.)
    ├── data.ts                 # Mock data + data access (getPublicProperties, etc.)
    ├── utils.ts                # Shared utilities (formatting, date helpers)
    ├── format.ts               # Number/currency formatting
    ├── site-config.ts          # Site metadata
    ├── auth.ts                 # Auth configuration (server)
    ├── auth-client.ts          # Auth client-side
    ├── storage.ts              # S3/R2 storage helpers
    ├── estimate-service.ts     # AI-powered price estimates
    ├── messaging.ts            # Messaging logic
    ├── viewing-flow.ts         # Viewing scheduling logic
    ├── handover-agreement.ts   # Agreement generation
    ├── pricing-guidance.ts     # Pricing recommendation engine
    ├── furniture-layers.ts     # Furniture depreciation
    ├── furniture-checklist.ts  # Viewing furniture checklist
    ├── cancellation-penalty.ts # Cancellation fee calculation
    ├── review-types.ts         # Review type definitions
    ├── station-data.ts         # Train station database
    ├── geocoding-service.ts    # Address → coordinates
    ├── migrate-local-data.ts   # Local storage migration
    ├── validations/            # Zod schemas (property, inquiry, message, furniture)
    ├── email/                  # Email sending (Resend)
    ├── pdf/                    # PDF generation (agreement, consent, consultation)
    └── stripe/                 # Stripe integration (config, server, client, webhooks, calculations)
```

## Key Data Flow

```
User browses → Homepage (page.tsx)
  → getPublicProperties() from data.ts
  → PropertyCard renders each property

User inquires → /listings/[id]/inquiry
  → InquiryForm → submits to API
  → Status: pending → reviewing → approved → viewing_scheduled → contract → completed

Seller lists → /listing/onboarding → /listing/new
  → CreateListingFlow component
  → Validates via Zod schemas (validations/)
  → Uploads images to S3/R2 (storage.ts)

Payment → /properties/[id]/payment
  → Stripe Connect (stripe/server.ts)
  → Fee calculation (stripe/calculations.ts)
  → ApplicationFeeForm → DepositForm → RemainingForm → HandoverConfirmation
```

## Core Types (src/lib/types.ts)

| Type | Purpose |
|------|---------|
| `Property` | Published property with images, pricing, host info |
| `User` | User with optional seller profile (isSeller flag) |
| `Inquiry` | Handover application with status workflow |
| `UserListing` | Seller-created listing (draft/published) |
| `SellerListing` | Legacy seller application |
| `FurnitureItem` | Furniture with photos and condition |
| `ViewingConfirmation` | Double-confirmation for viewings |
| `LandlordConsent` | Landlord approval tracking |
| `LiabilityTerms` | Legal responsibility terms |

## UI Terminology (CRITICAL)

| Internal | UI Display |
|----------|-----------|
| seller | 前の住人 |
| buyer | 次の住人 |
| rental_fee | 引越し費用 |
| sellerSince | 活動歴 |

## Test Structure

```
src/lib/__tests__/           # Unit tests for business logic
src/components/__tests__/    # Component tests
src/lib/*/___tests__/        # Nested module tests (email, pdf, stripe, validations)
e2e/                         # Playwright E2E tests
```
