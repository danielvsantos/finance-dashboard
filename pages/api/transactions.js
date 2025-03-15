import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../../utils/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    try {
        const isAuthenticated = verifyAuth(req);
        if (!isAuthenticated) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (req.method === 'GET') {
            const transactions = await prisma.transaction.findMany({
                include: { category: true, account: true }
            });
            return res.status(200).json(transactions);
        }

        if (req.method === 'POST') {
            const { transaction_date, year, quarter, month, day, category_id, description, credit, debit, account_id, card, pl_category } = req.body;

            // ✅ Convert string values to integers/floats
            const parsedYear = parseInt(year, 10);
            const parsedMonth = parseInt(month, 10);
            const parsedDay = parseInt(day, 10);
            const parsedCategoryId = parseInt(category_id, 10);
            const parsedAccountId = parseInt(account_id, 10);
            const parsedCredit = credit ? parseFloat(credit) : null;
            const parsedDebit = debit ? parseFloat(debit) : null;

            if (isNaN(parsedYear) || isNaN(parsedMonth) || isNaN(parsedDay) || isNaN(parsedCategoryId) || isNaN(parsedAccountId)) {
                return res.status(400).json({ message: "Invalid data: year, month, day, category_id, and account_id must be numbers" });
            }

            const newTransaction = await prisma.transaction.create({
                data: {
                    transaction_date: new Date(transaction_date),
                    year: parsedYear,
                    quarter,
                    month: parsedMonth,
                    day: parsedDay,
                    categoryId: parsedCategoryId,
                    description,
                    credit: parsedCredit,
                    debit: parsedDebit,
                    accountId: parsedAccountId,
                    card,
                    pl_category
                }
            });
            
            return res.status(201).json(newTransaction);
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        console.error("Error in transactions API:", error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
