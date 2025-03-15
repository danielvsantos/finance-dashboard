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
            const { transaction_date, category_id, description, credit, debit, account_id, card, pl_category } = req.body;

            if (!transaction_date) {
                return res.status(400).json({ message: "Transaction date is required" });
            }

            const date = new Date(transaction_date);
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // Months are 0-based, so +1
            const day = date.getDate();
            const quarter = `Q${Math.ceil(month / 3)}`; // Q1-Q4 based on month

            const newTransaction = await prisma.transaction.create({
                data: {
                    transaction_date: date,
                    year,
                    quarter,
                    month,
                    day,
                    categoryId: parseInt(category_id, 10),
                    description,
                    credit: credit ? parseFloat(credit) : null,
                    debit: debit ? parseFloat(debit) : null,
                    accountId: parseInt(account_id, 10),
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
