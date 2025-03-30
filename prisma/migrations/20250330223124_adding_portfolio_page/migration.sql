-- CreateTable
CREATE TABLE "PortfolioHolding" (
    "id" SERIAL NOT NULL,
    "account" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "sharesHeld" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PortfolioHolding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioHolding_account_category_ticker_key" ON "PortfolioHolding"("account", "category", "ticker");
