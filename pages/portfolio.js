import { useState, useEffect } from "react";
import axios from "axios";

export default function Portfolio() {
    const [stocks, setStocks] = useState([]);
    const [currentPrices, setCurrentPrices] = useState({});

    useEffect(() => {
        fetchStocks();
    }, []);

    async function fetchStocks() {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET}`
                },
                params: { category_id: 1 } // Category ID 1 for stocks
            });

            const transactions = response.data;
            const holdings = {};

            transactions.forEach(tx => {
                if (!tx.ticker) return;
                if (!holdings[tx.ticker]) {
                    holdings[tx.ticker] = {
                        ticker: tx.ticker,
                        account: tx.account.name,
                        shares: 0
                    };
                }
                
                if (tx.details === "Purchase") {
                    holdings[tx.ticker].shares += tx.numOfShares;
                } else if (tx.details === "Sale") {
                    holdings[tx.ticker].shares -= tx.numOfShares;
                }
            });

            setStocks(Object.values(holdings));
            fetchStockPrices(Object.keys(holdings));
        } catch (error) {
            console.error("Error fetching stocks:", error);
        }
    }

    async function fetchStockPrices(tickers) {
        try {
            const prices = {};
            for (const ticker of tickers) {
                const response = await axios.get(`https://www.alphavantage.co/query`, {
                    params: {
                        function: "GLOBAL_QUOTE",
                        symbol: ticker,
                        apikey: process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY
                    }
                });
                const price = response?.data?.["Global Quote"]?.["05. price"] || 0;
                prices[ticker] = parseFloat(price);
            }
            setCurrentPrices(prices);
        } catch (error) {
            console.error("Error fetching stock prices:", error);
        }
    }

    return (
        <div className="container mt-5">
            <h1 className="text-primary text-center">Portfolio - Stocks</h1>
            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead className="table-dark">
                        <tr>
                            <th>Ticker</th>
                            <th>Account</th>
                            <th># of Held Shares</th>
                            <th>Current Stock Value</th>
                            <th>Total Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center text-muted">No stocks held</td>
                            </tr>
                        ) : (
                            stocks.map(stock => (
                                <tr key={stock.ticker}>
                                    <td>{stock.ticker}</td>
                                    <td>{stock.account}</td>
                                    <td>{stock.shares}</td>
                                    <td>${currentPrices[stock.ticker]?.toFixed(2) || "Loading..."}</td>
                                    <td>
                                        ${((currentPrices[stock.ticker] || 0) * stock.shares).toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
