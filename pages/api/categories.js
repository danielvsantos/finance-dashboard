import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
        console.error("Unauthorized request - No valid token found.");
        return res.status(401).json({ message: "Unauthorized - Please log in" });
    }
    
    console.log("Authenticated User:", token);
    try {
        if (req.method === "GET") {
            const categories = await prisma.category.findMany();
            return res.status(200).json(categories);
        }

        if (req.method === "POST") {
            const { name, plCategory, plMacroCategory } = req.body;
            if (!name || !plCategory || !plMacroCategory) {
                return res.status(400).json({ message: "Missing required fields: name, plCategory, plMacroCategory" });
            }

            const newCategory = await prisma.category.create({
                data: { name, plCategory, plMacroCategory }
            });
            return res.status(201).json(newCategory);
        }

        if (req.method === "PUT") {
            const { id } = req.query;
            if (!id || isNaN(id)) {
                return res.status(400).json({ message: "Invalid or missing category ID" });
            }

            const updatedCategory = await prisma.category.update({
                where: { id: parseInt(id, 10) },
                data: req.body
            });
            return res.status(200).json(updatedCategory);
        }

        if (req.method === "DELETE") {
            const { id } = req.query;
            if (!id || isNaN(id)) {
                return res.status(400).json({ message: "Invalid or missing category ID" });
            }

            await prisma.category.delete({ where: { id: parseInt(id, 10) } });
            return res.status(204).end();
        }

        return res.status(405).json({ message: "Method not allowed" });
    } catch (error) {
        console.error("Error in category API:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
