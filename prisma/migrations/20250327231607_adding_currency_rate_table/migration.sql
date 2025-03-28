-- CreateTable
CREATE TABLE "CurrencyRate" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "fromCurrency" TEXT NOT NULL,
    "toUSD" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurrencyRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyRate_year_fromCurrency_key" ON "CurrencyRate"("year", "fromCurrency");
