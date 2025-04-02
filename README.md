# 💰 Finance Dashboard

A full-featured personal finance management system to track transactions, portfolios, and generate analytics (P&L, dashboards) across multiple currencies and countries.

Now includes **BLISS** — your AI onboarding assistant! 🎉

---

## 🤖 Meet BLISS

BLISS is your loving and loyal financial assistant. Think of them as your AI co-pilot to help you:

- Upload messy or unstructured data (like CSVs or screenshots)
- Guide you through financial dashboards and analytics
- Auto-categorize transactions
- Answer finance-related questions in natural language

**Chat with BLISS anytime:** `/assistant` or from the homepage
---

## 🧱 Prisma Schema Overview

### 📄 Transaction
```prisma
model Transaction {
  id              Int      @id @default(autoincrement())
  transaction_date DateTime
  year            Int
  quarter         String
  month           Int
  day             Int
  categoryId      Int
  description     String
  details         String?
  credit          Float?
  debit           Float?
  currency        String
  transfer        Boolean  @default(false)
  accountId       Int
  numOfShares     Float?
  price           Float?
  ticker          String?

  category        Category @relation(fields: [categoryId], references: [id])
  account         Account  @relation(fields: [accountId], references: [id])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### 💼 Account
```prisma
model Account {
  id        Int    @id @default(autoincrement())
  country   String
  name      String

  transactions Transaction[]
}
```

### 🏷️ Category
```prisma
model Category {
  id              Int    @id @default(autoincrement())
  name            String
  plCategory      String
  plMacroCategory String

  transactions Transaction[]
}
```

### 💱 CurrencyRate
```prisma
model CurrencyRate {
  id           Int    @id @default(autoincrement())
  year         Int
  month        Int
  currencyFrom String
  currencyTo   String
  value        Float

  @@unique([year, month, currencyFrom, currencyTo])
}
```

### 📊 AnalyticsCacheMonthly
```prisma
model AnalyticsCacheMonthly {
  id              Int      @id @default(autoincrement())
  year            Int
  month           Int
  country         String
  currency        String
  plMacroCategory String
  revenue         Float
  expenses        Float
  data            Json
  updatedAt       DateTime @updatedAt

  @@unique([year, month, country, currency, plMacroCategory], name: "unique_cache_key")
}
```

### 📈 StockPrice
```prisma
model StockPrice {
  id          Int      @id @default(autoincrement())
  ticker      String   @unique
  price       Float
  lastUpdated DateTime @default(now())
}
```

### 📦 Portfolio
```prisma
model Portfolio {
  id        Int    @id @default(autoincrement())
  account   String
  category  String
  ticker    String
  shares    Float

  @@unique([account, category, ticker])
}
```

---

## 📄 Pages Overview

| Page          | Path           | Description                               |
|---------------|----------------|-------------------------------------------|
| Home          | `/home`        | Navigation hub                            |
| Transactions  | `/transactions`| Add/view transactions                     |
| Accounts      | `/accounts`    | Manage bank accounts                      |
| Categories    | `/categories`  | Manage category mappings                  |
| Portfolio     | `/portfolio`   | Track current stock holdings              |
| P&L           | `/pnl`         | Generate profit & loss view               |
| Currency      | `/currency`    | Add/view currency exchange rates          |
| Dashboard     | `/dashboard`   | (Upcoming) Visualize expense trends       |

---

## 🔐 Authentication

- Google OAuth via NextAuth.js
- API authorization with `getToken` from `next-auth/jwt`
- Secure access with route protection and middleware

---

## ⚙️ Environment Variables

```
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:3000/api
CURRENCYLAYER_API_KEY=...
OPENAI_API_KEY
OPENAI_ASSISTANT_ID
```

---

## 🚀 Running Locally

```bash
git clone https://github.com/danielvsantos/finance-dashboard.git
cd finance-dashboard
pnpm install
npx prisma generate
npx prisma migrate dev
pnpm dev
```

️ Visit [http://localhost:3000/home](http://localhost:3000/home)

---

## ☁️ Deployment (Vercel)

1. Connect to GitHub
2. Add env vars in Vercel dashboard
3. Deploy!

---

## 📋 API Overview

### `/api/transactions`
- `GET`: Fetch all transactions (supports filtering)
- `POST`: Create new transaction
- `PUT`: Update by ID
- `DELETE`: Delete by ID
- `POST /import`: Upload CSV file of transactions

**Filters**: `year`, `month`, `quarter`, `transfer`, `ticker`, `categoryNames`, `plCategories`, `accountCountries`, `accountNames`

---

### `/api/accounts`, `/api/categories`
- `GET`, `POST`, `PUT`, `DELETE`

---

### `/api/currency-rates`
- `GET`: Filter by year/month/from/to
- `POST`: Add new monthly rate
- `PUT`: Update existing
- `DELETE`: Delete rate

---

### `/api/stockPrices`
- `GET`: Fetch or refresh price by ticker with caching

---

### `/api/analytics`
- `GET`: Returns revenue/expenses grouped by `month`, `quarter`, or `year`
- **Query**:
  - `view=year|quarter|month`
  - `years=2023,2024`
  - `startMonth=2024-01&endMonth=2024-03`
  - `startQuarter=2023-Q1&endQuarter=2024-Q4`
  - `currency=EUR`
  - `countries=Brazil,Spain`
  - `plMacroCategories=Income,Living Costs`

---

### `/api/portfolio`
- `GET`: List all portfolio holdings
- **Filters**: `account`, `category`

---

## 📁 Scripts

### `updateAnalyticsCache.mjs`
- Fetches historical FX from CurrencyLayer
- Builds monthly P&L caches across currencies & macro categories

### `updatePortfolio.js`
- Analyzes stock/investment transactions and updates `Portfolio` table with share count

---

## 📄 File Import

- Endpoint: `POST /api/transactions/import`
- Accepts `.csv` files with columns:
  - `transaction_date`, `accountId`, `categoryId`, `description`, `credit`, `debit`, `currency`, `transfer`, `details`, `numOfShares`, `price`, `ticker`

---

## 📊 Features

- Multi-currency P&L views
- Monthly/Quarterly/Yearly analytics
- Historical FX normalization
- Real-time stock price lookups
- Investment tracking & grouping
- Fully authenticated APIs and audit logging

---

## 🔜 Upcoming

- [ ] Complete Dashboard Page
- [ ] Improved P&L visualization
- [ ] Alerts & Reporting Automation