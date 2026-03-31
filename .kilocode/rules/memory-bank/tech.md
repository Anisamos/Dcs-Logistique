# Technical Context: ADC Logistique

## Technology Stack

| Technology   | Version | Purpose                         |
| ------------ | ------- | ------------------------------- |
| Next.js      | 16.x    | React framework with App Router |
| React        | 19.x    | UI library                      |
| TypeScript   | 5.9.x   | Type-safe JavaScript            |
| Tailwind CSS | 4.x     | Utility-first CSS               |
| Bun          | Latest  | Package manager & runtime       |
| Drizzle ORM  | 0.45.x  | SQLite database ORM             |
| Recharts     | 3.8.x   | Charts and data visualization   |
| Lucide React | 1.7.x   | Icon library                    |

## Database Schema

9 tables: users, spaces, equipment, stock_items, stock_movements, projects, activities, purchases, cleanliness_checks

## Authentication

Cookie-based session auth (SHA-256 password hashing). Multi-admin support.

## Commands

```bash
bun install        # Install dependencies
bun dev            # Start dev server
bun build          # Production build
bun lint           # Run ESLint
bun typecheck      # Run TypeScript type checking
bun db:generate    # Generate Drizzle migrations
bun db:migrate     # Run migrations
bun db:seed        # Seed database with defaults
```

## API Routes

| Route | Methods | Purpose |
|-------|---------|---------|
| /api/auth/login | POST | Login |
| /api/auth/logout | POST | Logout |
| /api/auth/me | GET | Current user |
| /api/spaces | GET,POST,PUT,DELETE | Spaces CRUD |
| /api/equipment | GET,POST,PUT,DELETE | Equipment CRUD |
| /api/stock | GET,POST,PUT,DELETE | Stock CRUD + movements |
| /api/purchases | GET,POST,PUT,DELETE | Purchases CRUD |
| /api/projects | GET,POST,PUT,DELETE | Projects CRUD |
| /api/activities | GET,POST,PUT,DELETE | Activities CRUD |
| /api/statistics | GET | Statistics by period |
| /api/cleanliness | GET,POST | Cleanliness checks |

## File Structure

```
src/
├── app/
│   ├── page.tsx                    # Login page
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard layout with sidebar
│   │   ├── page.tsx                # Dashboard home
│   │   ├── espaces/page.tsx        # Spaces management
│   │   ├── equipements/page.tsx    # Equipment management
│   │   ├── stocks/page.tsx         # Stock management
│   │   ├── achats/page.tsx         # Purchases/invoices
│   │   ├── projets/page.tsx        # Projects & activities
│   │   └── statistiques/page.tsx   # Statistics & charts
│   └── api/                        # API routes
├── components/
│   ├── Sidebar.tsx                 # Navigation sidebar
│   ├── FormModal.tsx               # Modal form wrapper
│   └── StatCard.tsx                # Statistics card
├── db/
│   ├── schema.ts                   # Drizzle schema
│   ├── index.ts                    # Database client
│   └── migrate.ts                  # Migration runner
└── lib/
    ├── auth.ts                     # Authentication utilities
    └── api-helpers.ts              # API route helpers
```
