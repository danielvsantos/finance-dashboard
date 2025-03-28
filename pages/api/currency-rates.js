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
            const { year, month, fromCurrency } = req.query;

            const filters = {};
            if (year) filters.year = parseInt(year);
            if (month) filters.month = parseInt(month);
            if (fromCurrency) filters.fromCurrency = fromCurrency.toUpperCase();

            const rates = await prisma.currencyRate.findMany({ where: filters });
            return res.status(200).json(rates);
        }

        if (req.method === "POST") {
            const { year, month, fromCurrency, toUSD } = req.body;

            if (!year || !month || !fromCurrency || !toUSD) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            const rate = await prisma.currencyRate.upsert({
                where: {
                    year_month_fromCurrency: {
                        year: parseInt(year),
                        month: parseInt(month),
                        fromCurrency: fromCurrency.toUpperCase()
                    }
                },
                update: {
                    toUSD: parseFloat(toUSD),
                    updatedAt: new Date()
                },
                create: {
                    year: parseInt(year),
                    month: parseInt(month),
                    fromCurrency: fromCurrency.toUpperCase(),
                    toUSD: parseFloat(toUSD)
                }
            });

            return res.status(200).json({ message: "Currency rate saved", rate });
        }

        if (req.method === "PUT") {
            const { year, month, fromCurrency, toUSD } = req.body;

            if (!year || !month || !fromCurrency || !toUSD) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            const updated = await prisma.currencyRate.update({
                where: {
                    year_month_fromCurrency: {
                        year: parseInt(year),
                        month: parseInt(month),
                        fromCurrency: fromCurrency.toUpperCase()
                    }
                },
                data: {
                    toUSD: parseFloat(toUSD),
                    updatedAt: new Date()
                }
            });

            return res.status(200).json({ message: "Currency rate updated", updated });
        }

        if (req.method === "DELETE") {
            const { year, month, fromCurrency } = req.body;

            if (!year || !month || !fromCurrency) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            await prisma.currencyRate.delete({
                where: {
                    year_month_fromCurrency: {
                        year: parseInt(year),
                        month: parseInt(month),
                        fromCurrency: fromCurrency.toUpperCase()
                    }
                }
            });

            return res.status(200).json({ message: "Currency rate deleted" });
        }

        return res.status(405).json({ message: "Method not allowed" });

    } catch (error) {
        console.error("Error in currency rate API:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
