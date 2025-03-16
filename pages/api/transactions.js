import { PrismaClient } from "@prisma/client";
import { verifyAuth } from "../../utils/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    try {
        const isAuthenticated = verifyAuth(req);
        if (!isAuthenticated) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (req.method === "GET") {
            const { year, quarter, month, day, ticker, categoryName, plCategory, accountName, accountCountry, transfer, details } = req.query;
            
            const filters = {};
            if (year) filters.year = parseInt(year);
            if (quarter) filters.quarter = quarter;
            if (month) filters.month = parseInt(month);
            if (day) filters.day = parseInt(day);
            if (ticker) filters.ticker = ticker;
            if (transfer) filters.transfer = transfer.toLowerCase() === "true";
            if (details) filters.details = { contains: details };
            
            const transactions = await prisma.transaction.findMany({
                where: {
                    ...filters,
                    category: categoryName ? { name: categoryName } : undefined,
                    category: plCategory ? { plCategory } : undefined,
                    account: accountName ? { name: accountName } : undefined,
                    account: accountCountry ? { country: accountCountry } : undefined
                },
                include: { category: true, account: true }
            });
            return res.status(200).json(transactions);
        }

        if (req.method === "POST") {
            console.log("Incoming Transaction Data:", JSON.stringify(req.body, null, 2));

            const { 
                transaction_date, 
                category_id, 
                account_id, 
                description, 
                details, 
                credit, 
                debit, 
                currency, 
                transfer, 
                numOfShares, 
                price, 
                ticker 
            } = req.body;

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

            console.log("Prisma Query Data:", {
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
            });

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
            return res.status(201).json(newTransaction);
        }

        if (req.method === "PUT") {
            const { id } = req.query;
            if (!id || isNaN(id)) {
                return res.status(400).json({ message: "Invalid or missing transaction ID" });
            }
            const updatedTransaction = await prisma.transaction.update({
                where: { id: parseInt(id, 10) },
                data: req.body
            });
            return res.status(200).json(updatedTransaction);
        }

        if (req.method === "DELETE") {
            const { id } = req.query;
            if (!id || isNaN(id)) {
                return res.status(400).json({ message: "Invalid or missing transaction ID" });
            }
            await prisma.transaction.delete({ where: { id: parseInt(id, 10) } });
            return res.status(204).end();
        }

        return res.status(405).json({ message: "Method not allowed" });
    } catch (error) {
        console.error("Error in transactions API:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
