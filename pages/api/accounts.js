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
            const accounts = await prisma.account.findMany();
            return res.status(200).json(accounts);
        }

        if (req.method === 'POST') {
            const { account_name, account_type } = req.body;
            
            const newAccount = await prisma.account.create({
                data: {
                    account_name,
                    account_type
                }
            });
            return res.status(201).json(newAccount);
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        console.error("Error in accounts API:", error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
