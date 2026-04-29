# 🌾 Ranch Tracker

> A full-stack farm management system built for **Nandha Farm**, Fatehpur · Samana · Patiala, Punjab, India.

Ranch Tracker replaces paper ledgers and spreadsheets with a structured, queryable system for daily dairy and crop farming operations — designed around the real workflows of a North Indian farm.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Key Formulas](#key-formulas)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)

---

## Overview

Ranch Tracker is a private internal tool for:

- 🐄 Logging morning and evening milk yields per animal
- 🌾 Tracking crop season expenses, yields, and profitability
- 🏪 Running a dairy product shop with POS, wholesale, and processing
- 📊 Seeing all of the above summarised on a single dashboard

Domain-specific decisions throughout the codebase — Murrah buffalo breed detection, Rabi/Kharif season labelling, making-price as the primary shop metric, Verka as a default wholesale buyer, area units in acres/bigha/kanal, local crop names (Kanak for wheat, Jhona for rice, Makki for maize) — reflect real operational knowledge, not generic placeholders.

---

## Features

### 🏠 Dashboard
- Live KPIs: total revenue, expenses, net profit, today's milk yield
- Revenue vs. expenses area chart (week / month / year)
- Expense breakdown pie chart by module
- Per-module performance bars with trend indicators
- Smart alerts: expiring batches, unfed animals, over-budget seasons, no milk today
- Recent activity feed across all modules

### 🌱 Agriculture
- Separate views for Arable crops (wheat, rice, maize, etc.) and Vegetables (grouped by type — leafy, root, fruit, gourd)
- Crop detail page aggregating stats across all seasons
- Season lifecycle state machine: `PLANNED → ACTIVE → HARVESTED → COMPLETED` (or `ABANDONED`)
- Per-season expense logging by category (Seeds, Fertilizer, Labour, Irrigation, Machinery, Pest Control)
- Yield entries with market price → auto-calculated revenue
- Running P&L and ROI updated in real time as records are added or deleted

### 🐄 Dairy
- Separate herd management for Cows and Buffaloes
- Grid and list views with status filter (Calf, Heifer, Milking, Dry, Transition, etc.)
- Per-animal detail with five tabs:
  - **Breed** — identity, purchase info, bloodline (dam/sire)
  - **Milk Yield** — 30-day area/bar chart, morning & evening sessions, lactation cycles
  - **Feeding** — daily plan with fodder-type pie chart, per-type cost breakdown, daily/monthly/yearly cost projections
  - **Health** — vaccinations with due/overdue alerts, treatment records with medicines
  - **Reproduction** — AI records, calving records, pregnancy status tracking
- Inline status change via dropdown (no page reload)
- Profitability tab: milk income vs feed + medical cost, ROI, period-selectable
- Fodder module: cultivation tracking (planting, expected harvest, yield) and stock inventory with low-stock warnings

### 🏪 Shop
- **Dashboard** — daily report card: milk collected, available, revenue, net profit, pending payments
- **Inventory** — milk entries (morning/evening, FAT%, SNF%, OWN/PURCHASED), product catalogue, daily expenses with live making-price calculator
- **POS** — cart-based point of sale with category tabs, search, stock guard, CASH/UPI payment, success overlay
- **Processing** — converts raw milk into dairy products using accurate conversion ratios (e.g. 5L → 1kg paneer, 25L → 1kg ghee) with costing breakdown
- **Wholesale** — bulk milk sales to buyers (Verka, Amul, etc.) with PENDING/RECEIVED payment tracking
- **Reports** — daily and monthly reports: milk, expenses, making price, retail transactions, wholesale revenue

---

## Tech Stack

### Frontend

| Tool | Purpose |
|------|---------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| React Router v6 | Client-side routing |
| Zustand | Global state management |
| Axios | HTTP client with interceptors |
| Recharts | Charts and data visualisation |
| Tailwind CSS + inline styles | Styling |
| Lucide React | Icons |

### Backend

| Tool | Purpose |
|------|---------|
| Node.js + Express | HTTP server |
| TypeScript | Type safety |
| Mongoose | MongoDB ODM |
| Zod | Request validation |
| JWT + bcrypt | Authentication |
| express-rate-limit | Rate limiting |
| Helmet | Security headers |
| express-mongo-sanitize | NoSQL injection prevention |
| compression | Response compression |
| date-fns | Date arithmetic |

---

## Project Structure

```
ranch-tracker/
├── client/                        # React frontend
│   └── src/
│       ├── components/
│       │   ├── layout/            # Sidebar, Topbar, Layout
│       │   ├── shared/            # AlertPanel, ConfirmDialog, ExportBtn
│       │   └── ui/                # Badge, Button, Input, Modal, StatCard, Table, Tabs
│       ├── hooks/                 # useAnimals, useDairyData, useDashboard, useSeasons, ...
│       ├── lib/
│       │   ├── api.ts             # Axios instance + all API namespaces
│       │   ├── constant.ts        # Crop lists, status maps, breed lists, product types
│       │   ├── utils.ts           # formatCurrency, formatDate, formatLiters, ...
│       │   └── animalStatus.ts    # Status colours and labels (single source of truth)
│       ├── pages/
│       │   ├── dashboard/         # Dashboard index
│       │   ├── agriculture/       # Index, CropDetail, SeasonDetail
│       │   ├── dairy/             # Index, AnimalList, AnimalDetail, FodderModule
│       │   │   └── tabs/          # BreedTab, MilkTab, FeedingTab, HealthTab, ReproductionTab, ProfitabilityTab
│       │   └── shop/
│       │       ├── dashboard/
│       │       ├── inventory/     # MilkTab, ProductsTab, ExpensesTab
│       │       ├── pos/
│       │       ├── processing/
│       │       ├── wholesale/
│       │       └── reports/
│       ├── store/                 # Zustand stores (dashboard, agriculture, animals, cart, UI)
│       └── types/                 # All TypeScript interfaces
│
└── server/                        # Express backend
    └── src/
        ├── config/                # db.ts, env.ts
        ├── controllers/           # agriculture, dairy, dashboard, shop
        ├── middleware/            # auth, errorHandler, rateLimiter, validate
        ├── models/                # Mongoose models
        ├── routes/                # Route definitions
        ├── services/              # Business logic layer
        ├── utils/                 # cache, logger, response helpers
        └── validators/            # Zod schemas
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6+ (local or Atlas)
- npm or pnpm

### Installation

```bash
# Clone the repo
git clone https://github.com/Manjotsi01/Ranch-tracker.git
cd Ranch-tracker

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Running in Development

```bash
# Terminal 1 — start the backend
cd server
npm run dev

# Terminal 2 — start the frontend
cd client
npm run dev
```
### Building for Production

```bash
# Build frontend
cd client
npm run build

# Build backend
cd server
npm run build
npm start
```

---

## Environment Variables

### Server (`server/.env`)

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/ranch-tracker
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
BASE_API=/api
MILK_PRICE_PER_LITRE=35
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

---

## API Reference

All endpoints are prefixed with `/api`.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Aggregated financial and operational KPIs |
| GET | `/dashboard/kpis` | Per-module revenue/expense/profit |
| GET | `/dashboard/alerts` | Active system alerts |
| GET | `/dashboard/profit-chart?period=month` | Chart data (week/month/year) |
| GET | `/dashboard/recent-activity` | Latest events across all modules |

### Agriculture

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/agriculture/crops` | All crops with aggregated stats |
| GET | `/agriculture/crops/:cropId` | Single crop summary |
| GET | `/agriculture/crops/:cropId/seasons` | All seasons for a crop |
| POST | `/agriculture/seasons` | Create a season |
| GET | `/agriculture/seasons/:id` | Season detail |
| PUT | `/agriculture/seasons/:id` | Update season (including status) |
| DELETE | `/agriculture/seasons/:id` | Delete season and all its records |
| GET | `/agriculture/seasons/:id/expenses` | List expenses |
| POST | `/agriculture/seasons/:id/expenses` | Log an expense |
| DELETE | `/agriculture/seasons/:id/expenses/:expenseId` | Remove an expense |
| GET | `/agriculture/seasons/:id/yields` | List yield entries |
| POST | `/agriculture/seasons/:id/yields` | Log a yield |
| DELETE | `/agriculture/seasons/:id/yields/:yieldId` | Remove a yield |

### Dairy

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dairy/herd/summary` | Herd-wide stats and milk totals |
| GET | `/dairy/animals` | List animals (filter by `type`, `status`) |
| POST | `/dairy/animals` | Add an animal |
| GET | `/dairy/animals/:id` | Animal detail |
| PUT | `/dairy/animals/:id` | Update animal |
| DELETE | `/dairy/animals/:id` | Delete animal |
| GET | `/dairy/animals/:id/milk` | Milk records |
| POST | `/dairy/animals/:id/milk` | Log a milk session |
| DELETE | `/dairy/animals/:id/milk/:recordId` | Remove a milk record |
| GET | `/dairy/animals/:id/milk/summary` | Daily milk summary (last 30 days) |
| GET | `/dairy/animals/:id/lactations` | Lactation cycles |
| POST | `/dairy/animals/:id/lactations` | Start a lactation |
| GET | `/dairy/animals/:id/reproduction` | AI and calving records |
| POST | `/dairy/animals/:id/reproduction/ai` | Log an AI attempt |
| POST | `/dairy/animals/:id/reproduction/calving` | Log a calving |
| GET | `/dairy/animals/:id/health` | Vaccinations and treatments |
| POST | `/dairy/animals/:id/health/vaccinations` | Add vaccination |
| POST | `/dairy/animals/:id/health/treatments` | Add treatment |
| GET | `/dairy/animals/:id/feeding` | Feeding plan and records |
| POST | `/dairy/animals/:id/feeding/records` | Log feed consumption |
| PUT | `/dairy/animals/:id/feeding/plan` | Update feeding plan |
| GET | `/dairy/animals/:id/profitability` | Animal profitability (period-selectable) |
| GET | `/dairy/fodder/crops` | Fodder cultivation records |
| POST | `/dairy/fodder/crops` | Add fodder crop |
| GET | `/dairy/fodder/stock` | Fodder stock inventory |
| POST | `/dairy/fodder/stock` | Add stock entry |

### Shop

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/shop/milk` | Milk shift entries |
| POST | `/shop/milk` | Log a milk shift |
| GET | `/shop/milk/stock` | Today's collected / wholesaled / available |
| GET | `/shop/products` | Product catalogue |
| POST | `/shop/products` | Create product |
| PATCH | `/shop/products/:id` | Update product |
| PATCH | `/shop/products/:id/stock/adjust` | Adjust stock by delta |
| PATCH | `/shop/products/:id/stock/set` | Set stock to exact quantity |
| DELETE | `/shop/products/:id` | Delete product |
| GET | `/shop/sales` | Retail sales history |
| POST | `/shop/sales` | Create POS sale (validates and deducts stock) |
| GET | `/shop/wholesale` | Wholesale sales |
| POST | `/shop/wholesale` | Create wholesale sale |
| PATCH | `/shop/wholesale/:id/received` | Mark payment as received |
| GET | `/shop/expenses` | Daily expense records |
| POST | `/shop/expenses` | Upsert daily expenses |
| GET | `/shop/reports/daily` | Daily report |
| GET | `/shop/reports/monthly?month=YYYY-MM` | Monthly report |

---

## Data Models

| Model | Key Fields |
|-------|-----------|
| **Season** | `cropId`, `cropName`, `label`, `startDate`, `endDate`, `status`, `areaSown`, `areaUnit`, `budget`, `totalExpense`, `totalRevenue`, `totalYield`, `variety`, `notes` |
| **Animal** | `tagNo`, `name`, `type` (COW/BUFFALO), `gender`, `breed`, `status`, `dateOfBirth`, `bloodline` (dam/sire), `purchaseCost`, `currentWeight`, `lactations[]`, `feedingPlan[]` |
| **MilkRecord** | `animalId`, `date`, `session` (MORNING/EVENING), `quantity`, `fat`, `snf` |
| **MilkEntry** (shop) | `date`, `shift`, `quantityLiters`, `fat`, `snf`, `source` (OWN/PURCHASED) |
| **WholesaleSale** | `date`, `buyerName`, `quantityLiters`, `ratePerLiter`, `totalAmount`, `paymentStatus` (PENDING/RECEIVED) |
| **Expense** | `date`, `feed`, `labor`, `transport`, `medical`, `misc`, `total` (one document per day, upserted) |
| **Sale** | `dateTime`, `items[]`, `paymentMode`, `totalAmount`, `customerName` |

---

## Key Formulas

**Making Price** — the core shop profitability metric; the minimum price per litre to break even:

```
Making Price (₹/L) = Total Daily Expenses ÷ Total Milk Collected Today
```

**Milk Stock** — computed on the fly from records, always accurate:

```
Available (L) = Collected Today − Wholesaled Today
```

**Season ROI:**

```
ROI (%) = (Total Revenue − Total Expense) ÷ Total Expense × 100
```

---

## Known Limitations

- **Routes are unauthenticated** — the JWT middleware exists but is not applied to dairy, agriculture, or shop routes. All data is currently publicly accessible to anyone with the API URL.
- **Resources tab is a stub** — the UI renders the tab and the API endpoint exists, but the service returns an empty array and `addResource` throws a 501 Not Implemented.
- **No pagination** — list endpoints return all records; this will degrade as data accumulates.
- **`FodderStock` model dual-purpose** — fodder cultivation and fodder stock inventory share one Mongoose model, distinguished by an `isCrop` boolean.
- **Reports page double-unwrap** — `useReports` hook re-unwraps a response that `shopApi` has already unwrapped, producing undefined data in the Reports page.
- **Dashboard milk chart** — uses shop `Sale` revenue for the dairy line; wholesale milk revenue is excluded, so dairy profitability is understated.

---

## Roadmap

- [ ] Apply auth middleware to all protected routes
- [ ] Implement the Resources tab (SeasonResource model + service)
- [ ] Fix Reports page response unwrapping
- [ ] Add pagination to all list endpoints
- [ ] Split `FodderStock` into separate Fodder and Stock models
- [ ] Labour/Workers module (wage tracking, daily attendance)
- [ ] Assets module (tractor, equipment maintenance and depreciation)
- [ ] Mobile-optimised POS layout
- [ ] Export to PDF/CSV for reports
- [ ] Push notifications for vaccination due dates and low stock

---

## Farm Context

Built for **Nandha Farm**, Fatehpur · Samana · Patiala, Punjab, India.

*Built with React, Express, MongoDB, and a lot of Punjabi farming knowledge.*