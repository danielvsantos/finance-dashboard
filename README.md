# 📘 Finance Dashboard - README

A full-featured personal finance dashboard to track transactions, portfolios, expenses, and generate analytics such as P&L statements across multiple currencies and countries.

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
  fromCurrency String
  toUSD        Float

  @@unique([year, month, fromCurrency])
}
```

### 📊 AnalyticsCacheMonthly
```prisma
model AnalyticsCacheMonthly {
  id               Int    @id @default(autoincrement())
  year             Int
  month            Int
  country          String
  currency         String
  revenue          Float
  expenses         Float
  revenueOriginal  Float
  expensesOriginal Float
  data             Json
  updatedAt        DateTime @updatedAt

  @@unique([year, month, country, currency], name: "year_month_currency_country")
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

---

## 🧭 Pages Overview

| Page         | Path             | Description                                    |
|--------------|------------------|------------------------------------------------|
| Home         | `/home`          | Navigation hub                                 |
| Transactions | `/transactions`  | Add/view transactions                          |
| Accounts     | `/accounts`      | Manage bank accounts                           |
| Categories   | `/categories`    | Manage category mappings                       |
| Portfolio    | `/portfolio`     | Track current stock holdings                   |
| P&L          | `/pnl`           | Generate profit & loss across countries        |
| Dashboard    | `/dashboard`     | Visualize expense trends (TBD)                 |
| Currency     | `/currency`      | Add exchange rates by year & month            |

---

## 🔐 Authentication

- Google OAuth with [NextAuth.js](https://next-auth.js.org/)
- Protected routes via middleware (`_app.js`)
- Users are redirected to `/auth/login` if not authenticated
- Secure server-side API authentication using `getToken` from `next-auth/jwt`

To enable Google login:
```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=some-secret-key
```

---

## ⚙️ Environment Variables

Set the following in your `.env.local`:
```env
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:3000/api
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

Visit: http://localhost:3000/home

---

## ☁️ Deployment (Vercel)

1. Connect repo to Vercel
2. Add environment variables via dashboard
3. Deploy

---

## 📋 API Overview

### `/api/transactions`
- **GET**: Fetch all transactions (supports filters)
- **POST**: Create new transaction (auto-fills date metadata)
- **PUT**: Update transaction by ID
- **DELETE**: Delete transaction by ID
- **Query params**: `year`, `month`, `quarter`, `ticker`, `transfer`, `details`, `categoryNames`, `plCategories`, `accountCountries`, `accountNames`

### `/api/accounts`
- **GET**: Get all accounts
- **POST**: Add new account
- **PUT**: Update account by ID
- **DELETE**: Delete account by ID

### `/api/categories`
- **GET**: Get all categories
- **POST**: Add new category
- **PUT**: Update category by ID
- **DELETE**: Delete category by ID

### `/api/currency-rates`
- **GET**: Get all currency rates
- **POST**: Add new monthly currency rate
- **PUT**: Update by ID
- **DELETE**: Delete by ID

### `/api/stockPrices`
- **GET**: Get or refresh price from AlphaVantage with caching
  - **Query param**: `ticker`

### `/api/analytics`
- **GET**: Return normalized revenue/expenses by month/quarter/year and country
  - **Query params**:
    - `view=year|quarter|month`
    - `years=2023,2024,...`
    - `from=2023-01&to=2024-03` (for ranges)
    - `currency=USD`
    - `countries=Brazil,Spain`

---

### 🔜 Upcoming

- [ ] Finish P&L table (rows by macroCategory)
- [ ] Add support for multi-currency view in P&L
- [ ] Build Dashboard page with graph filters
- [ ] Extend Analytics API for Dashboard
- [ ] Monthly summary export
- [ ] Budget vs actual tracking

---

Let me know if you'd like export, PDF generation, email reports, or alerts added!

