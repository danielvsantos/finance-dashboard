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
            const { name, plCategory } = req.query;

            const categories = await prisma.category.findMany({
                where: {
                    name: name ? { contains: name, mode: "insensitive" } : undefined,
                    plCategory: plCategory ? { contains: plCategory, mode: "insensitive" } : undefined
                },
                include: {
                    transactions: true
                }
            });

            return res.status(200).json(categories);
        }

        if (req.method === 'POST') {
            const { name, plCategory } = req.body;

            const newCategory = await prisma.category.create({
                data: {
                    name,
                    plCategory
                }
            });

            return res.status(201).json(newCategory);
        }

        if (req.method === 'PUT') {
            const { id, ...data } = req.body;

            const updatedCategory = await prisma.category.update({
                where: { id: parseInt(id) },
                data
            });

            return res.status(200).json(updatedCategory);
        }

        if (req.method === 'DELETE') {
            const { id } = req.body;

            await prisma.category.delete({
                where: { id: parseInt(id) }
            });

            return res.status(200).json({ message: "Category deleted successfully" });
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        console.error("Error in categories API:", error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
