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

            // Check if category exists
            const categoryExists = await prisma.category.findUnique({
                where: { id: category_id }
            });
            if (!categoryExists) {
                return res.status(400).json({ message: 'Invalid category_id. Category does not exist.' });
            }

            const newTransaction = await prisma.transaction.create({
                data: {
                    transaction_date: new Date(transaction_date),
                    year,
                    quarter,
                    month,
                    day,
                    categoryId: category_id,
                    description,
                    credit,
                    debit,
                    accountId: account_id,
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
