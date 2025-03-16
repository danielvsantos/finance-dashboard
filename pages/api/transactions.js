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
            console.log("Fetching transactions...");
            const transactions = await prisma.transaction.findMany({
                include: { category: true, account: true }
            });
            // console.log("Fetched transactions:", transactions);
            return res.status(200).json(transactions);
        }

        if (req.method === "POST") {
            const { transaction_date, category_id, account_id, description, details, credit, debit, currency, transfer, numOfShares, price, ticker } = req.body;
            console.log("Incoming Transaction Data:", req.body);

            if (!category_id || isNaN(category_id)) {
                return res.status(400).json({ message: "Invalid or missing category ID" });
            }
            if (!account_id || isNaN(account_id)) {
                return res.status(400).json({ message: "Invalid or missing account ID" });
            }

            const date = new Date(transaction_date);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const quarter = `Q${Math.ceil(month / 3)}`;

            const newTransaction = await prisma.transaction.create({
                data: {
                    transaction_date: date,
                    year,
                    quarter,
                    month,
                    day,
                    categoryId: parseInt(category_id, 10),
                    accountId: parseInt(account_id, 10),
                    description,
                    details,
                    credit: credit ? parseFloat(credit) : null,
                    debit: debit ? parseFloat(debit) : null,
                    currency,
                    transfer,
                    numOfShares: numOfShares ? parseFloat(numOfShares) : null,
                    price: price ? parseFloat(price) : null,
                    ticker
                }
            });
            console.log("Created Transaction:", newTransaction);
            return res.status(201).json(newTransaction);
        }

        if (req.method === "PUT") {
            const { id } = req.query;
            console.log("Updating Transaction ID:", id);

            if (!id || isNaN(id)) {
                return res.status(400).json({ message: "Invalid or missing transaction ID" });
            }

            const updatedTransaction = await prisma.transaction.update({
                where: { id: parseInt(id, 10) },
                data: req.body
            });
            console.log("Updated Transaction:", updatedTransaction);
            return res.status(200).json(updatedTransaction);
        }

        if (req.method === "DELETE") {
            const { id } = req.query;
            console.log("Deleting Transaction ID:", id);

            if (!id || isNaN(id)) {
                return res.status(400).json({ message: "Invalid or missing transaction ID" });
            }

            await prisma.transaction.delete({ where: { id: parseInt(id, 10) } });
            console.log("Deleted Transaction ID:", id);
            return res.status(204).end();
        }

        return res.status(405).json({ message: "Method not allowed" });
    } catch (error) {
        console.error("Error in transactions API:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
