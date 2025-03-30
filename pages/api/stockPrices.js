import prisma from '../../prisma/prisma.js';
import axios from "axios";



export default async function handler(req, res) {
    const { ticker } = req.query;

    if (!ticker) {
        return res.status(400).json({ message: "Ticker symbol is required" });
    }

    try {
        // Check if the stock price is cached
        const cachedStock = await prisma.stockPrice.findUnique({
            where: { ticker },
        });

        const now = new Date();
        const oneDayAgo = new Date();
        oneDayAgo.setDate(now.getDate() - 1);

        // Return cached value if it's still valid (less than 24 hours old)
        if (cachedStock && new Date(cachedStock.lastUpdated) > oneDayAgo) {
            return res.status(200).json({ ticker, price: cachedStock.price });
        }

        console.log(`Fetching new price for ${ticker}`);

        // Fetch new stock price from AlphaVantage API
        const response = await axios.get(`https://www.alphavantage.co/query`, {
            params: {
                function: "GLOBAL_QUOTE",
                symbol: ticker,
                apikey: process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY,
            }
        });

        const price = parseFloat(response?.data?.["Global Quote"]?.["05. price"]);

        if (!price) {
            throw new Error("Invalid API response or request limit exceeded");
        }

        // Upsert new price into database
        const updatedStock = await prisma.stockPrice.upsert({
            where: { ticker },
            update: { price, lastUpdated: now },
            create: { ticker, price },
        });

        return res.status(200).json({ ticker, price: updatedStock.price });
    } catch (error) {
        console.error("Error fetching stock price:", error);

        // If API fails, return the last known cached value if available
        const lastKnownStock = await prisma.stockPrice.findUnique({ where: { ticker } });

        if (lastKnownStock) {
            return res.status(200).json({ ticker, price: lastKnownStock.price, cached: true });
        }

        return res.status(500).json({ message: "Error fetching stock price", error: error.message });
    }
}
