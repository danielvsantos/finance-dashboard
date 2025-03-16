# Finance Dashboard

A financial management dashboard for tracking transactions, accounts, categories, and investments. The application provides a structured financial overview with a secure authentication system, interactive dashboards, and portfolio tracking.

---

## Features
- **User Authentication**: Secure login via Google OAuth.
- **Transaction Management**: Create, view, update, and delete financial transactions.
- **Accounts & Categories**: Manage financial accounts and transaction categories.
- **Portfolio Tracking**: Track stock holdings and fetch real-time stock prices.
- **P&L Dashboard**: Visualize financial performance with interactive charts.
- **Expense Dashboard**: Analyze financial movements using dynamic filters.

---

## Pages & Objectives

### **1. Home (`/`)**
The landing page after login, providing navigation buttons to different sections.

### **2. Transactions (`/transactions`)**
Allows users to add, edit, delete, and view financial transactions.

### **3. Accounts (`/accounts`)**
Users can manage financial accounts, adding or modifying their details.

### **4. Categories (`/categories`)**
Users can manage financial transaction categories and assign P&L classifications.

### **5. Portfolio (`/portfolio`)**
Displays the user's current stock holdings, calculates held shares, and fetches live stock prices.

### **6. P&L Dashboard (`/P&L`)**
Provides an overview of financial performance with charts and data visualization.

### **7. Expense Dashboard (`/dashboard`)**
Offers tools for analyzing spending patterns and financial movements.

### **8. Authentication (`/auth/login`)**
Handles Google OAuth login and user authentication processes.

---

## API Endpoints

### **Transactions API** (`/api/transactions`)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/transactions` | Retrieve all transactions with filters for year, month, category, account, etc. |
| `POST` | `/api/transactions` | Create a new transaction (requires authentication). |
| `PUT` | `/api/transactions?id=TRANSACTION_ID` | Update an existing transaction. |
| `DELETE` | `/api/transactions?id=TRANSACTION_ID` | Delete a transaction. |

### **Accounts API** (`/api/accounts`)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/accounts` | Retrieve all accounts. |
| `POST` | `/api/accounts` | Create a new account. |
| `PUT` | `/api/accounts?id=ACCOUNT_ID` | Update an account. |
| `DELETE` | `/api/accounts?id=ACCOUNT_ID` | Delete an account. |

### **Categories API** (`/api/categories`)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/categories` | Retrieve all categories. |
| `POST` | `/api/categories` | Create a new category. |
| `PUT` | `/api/categories?id=CATEGORY_ID` | Update a category. |
| `DELETE` | `/api/categories?id=CATEGORY_ID` | Delete a category. |

---

## Database Schema

The application uses **Prisma ORM** with a **PostgreSQL** database.

### **Transaction Table**
```prisma
model Transaction {
  id              Int      @id @default(autoincrement())
  transaction_date DateTime
  year            Int
  quarter         String
  month           Int
  day             Int
  categoryId      Int
  accountId       Int
  description     String
  details         String?
  credit          Float?
  debit           Float?
  currency        String
  transfer        Boolean @default(false)
  numOfShares     Float?
  price           Float?
  ticker          String?
  category        Category @relation(fields: [categoryId], references: [id])
  account         Account  @relation(fields: [accountId], references: [id])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### **Account Table**
```prisma
model Account {
  id       Int    @id @default(autoincrement())
  name     String
  country  String
  transactions Transaction[]
}
```

### **Category Table**
```prisma
model Category {
  id         Int    @id @default(autoincrement())
  name       String
  plCategory String
  transactions Transaction[]
}
```

---

## Environment Variables

The following environment variables need to be configured in a `.env` file:

```env
NEXT_PUBLIC_API_URL=<your_api_url>
NEXT_PUBLIC_API_SECRET=<your_api_secret>
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
NEXTAUTH_SECRET=<your_auth_secret>
DATABASE_URL=<your_postgres_database_url>
ALPHA_VANTAGE_API_KEY=<your_alphavantage_api_key>
```

Ensure these values are set both **locally** and in **Vercel** for deployment.

---

## Google Authentication Setup
1. Go to **Google Cloud Console**.
2. Navigate to **Credentials** → **OAuth 2.0 Client IDs**.
3. Create a new OAuth credential with:
   - **Authorized redirect URI**: `http://localhost:3000/api/auth/callback/google` (for local dev)
   - **Authorized redirect URI**: `https://your-vercel-app.vercel.app/api/auth/callback/google` (for production)
4. Copy the generated **Client ID** and **Client Secret** and add them to your `.env` file as:
   ```env
   GOOGLE_CLIENT_ID=<your_google_client_id>
   GOOGLE_CLIENT_SECRET=<your_google_client_secret>
   ```
5. Restart the development server for changes to take effect.

---

## Running the App Locally

### **1. Clone the repository**
```bash
git clone <your-repo-url>
cd finance-dashboard
```

### **2. Install dependencies**
```bash
npm install
```

### **3. Generate Prisma Client**
```bash
npx prisma generate
```

### **4. Set up Prisma database**
```bash
npx prisma migrate dev --name init
```

### **5. Start the development server**
```bash
npm run dev
```
The app will be available at `http://localhost:3000`

---

## Deploying to Vercel

### **1. Install Vercel CLI (if not installed)**
```bash
npm install -g vercel
```

### **2. Login to Vercel**
```bash
vercel login
```

### **3. Deploy the app**
```bash
vercel --prod
```

Ensure that all **environment variables** are correctly set in **Vercel’s project settings**.

---

## Future Improvements
- Enhance security with **role-based access control (RBAC)**.
- Optimize stock price fetching by **caching API responses**.
- Add **P&L page** with transactions grouped
- Improving filtering capabilities and graphs on **Dashboard**

---

## License
This project is licensed under the **MIT License**.

---

## Author
**Daniel Viana Santos**