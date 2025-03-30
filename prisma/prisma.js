import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Validation middleware function
prisma.$use(async (params, next) => {
    const { model, action, args } = params;

    // Transaction validation logic
    if (model === 'Transaction' && (action === 'create' || action === 'update')) {
        const data = args.data;

        if (data.currency && !/^[A-Z]{3}$/.test(data.currency)) {
            throw new Error('Invalid currency code: Must be a valid ISO code (3 uppercase letters).');
        }

        if (data.credit && data.credit < 0) {
            throw new Error('Credit amount must be positive.');
        }

        if (data.debit && data.debit < 0) {
            throw new Error('Debit amount must be positive.');
        }

        if (data.transaction_date && new Date(data.transaction_date) > new Date()) {
            throw new Error('Transaction date cannot be in the future.');
        }
    }

    // Account validation logic
    if (model === 'Account' && (action === 'create' || action === 'update')) {
        const data = args.data;

        if (data.name?.length < 2 || data.name?.length > 50) {
            throw new Error('Account name must be between 2 and 50 characters.');
        }
    }

    // Category validation logic
    if (model === 'Category' && (action === 'create' || action === 'update')) {
        const data = args.data;

        if (data.name?.length < 2 || data.name?.length > 30) {
            throw new Error('Category name must be between 2 and 30 characters.');
        }
    }

    // StockPrice validation logic
    if (model === 'StockPrice' && (action === 'create' || action === 'update')) {
        const data = args.data;

        if (data.price && data.price <= 0) {
            throw new Error('Stock price must be positive.');
        }

        if (data.ticker?.length > 5) {
            throw new Error('Stock ticker must not exceed five characters.');
        }
    }

    // CurrencyRate validation logic
    if (model === 'CurrencyRate' && (action === 'create' || action === 'update')) {
        const data = args.data;

    if (data.currencyFrom && !/^[A-Z]{3}$/.test(data.currencyFrom)) {
        throw new Error('Invalid currencyFrom code: Must be a valid ISO 3-letter currency code.');
    }

    if (data.currencyTo && !/^[A-Z]{3}$/.test(data.currencyTo)) {
        throw new Error('Invalid currencyTo code: Must be a valid ISO 3-letter currency code.');
    }

    if (data.value !== undefined && data.value <= 0) {
        throw new Error('Conversion rate value must be a positive number.');
    }

    if (data.month !== undefined && (data.month < 1 || data.month > 12)) {
        throw new Error('Month must be between 1 and 12.');
    }

    if (data.year !== undefined && (data.year < 1900 || data.year > 2100)) {
        throw new Error('Year must be a valid 4-digit number.');
    }
}

    return next(params);
});

export default prisma;
