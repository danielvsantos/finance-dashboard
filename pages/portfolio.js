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
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/stockPrices`, {
                    params: { ticker }
                });
                prices[ticker] = response.data.price;
            }
            setCurrentPrices(prices);
        } catch (error) {
            console.error("Error fetching stock prices:", error);
        }
    }

    // Calculate total portfolio value
    const totalPortfolioValue = stocks.reduce((acc, stock) => {
        const totalValue = (currentPrices[stock.ticker] || 0) * stock.shares;
        return acc + totalValue;
    }, 0);

    // Helper function to format numbers with thousand separators
    const formatCurrency = (value) => {
        return `$${Math.round(value).toLocaleString()}`;
    };

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
                            stocks.map(stock => {
                                const totalValue = (currentPrices[stock.ticker] || 0) * stock.shares;
                                return (
                                    <tr key={stock.ticker}>
                                        <td>{stock.ticker}</td>
                                        <td>{stock.account}</td>
                                        <td>{stock.shares}</td>
                                        <td>${currentPrices[stock.ticker]?.toFixed(2) || "Loading..."}</td>
                                        <td>{formatCurrency(totalValue)}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                    {/* Totalizer Row */}
                    {stocks.length > 0 && (
                        <tfoot>
                            <tr className="table-dark">
                                <td colSpan="4" className="text-end"><strong>Total Portfolio Value:</strong></td>
                                <td><strong>{formatCurrency(totalPortfolioValue)}</strong></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}
