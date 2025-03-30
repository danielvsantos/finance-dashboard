import { useEffect, useState } from "react";
import axios from "axios";

export default function PortfolioTable({ data }) {
  const [currentPrices, setCurrentPrices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const tickers = [...new Set(data.map(item => item.ticker))];

    async function fetchStockPrices() {
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
      } finally {
        setLoading(false);
      }
    }

    fetchStockPrices();
  }, [data]);

  if (!data || data.length === 0) {
    return <p className="text-muted text-center mt-3">No portfolio data available.</p>;
  }

  const grouped = {};
  data.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = {};
    if (!grouped[item.category][item.account]) grouped[item.category][item.account] = [];
    grouped[item.category][item.account].push(item);
  });

  let grandTotal = 0;

  return (
    <div className="container mt-4">
      {Object.entries(grouped).map(([category, accounts]) => (
        <div key={category} className="mb-5">
          <h4 className="text-primary mb-3">{category}</h4>
          {Object.entries(accounts).map(([account, items]) => {
            const subtotal = items.reduce((sum, item) => {
              const price = currentPrices[item.ticker] || 0;
              return sum + item.sharesHeld * price;
            }, 0);
            grandTotal += subtotal;
            return (
              <div key={account} className="card p-3 mb-3 shadow-sm">
                <h5 className="mb-3">Account: {account}</h5>
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Ticker</th>
                      <th>Shares Held</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.ticker}>
                        <td>{item.ticker}</td>
                        <td>{item.sharesHeld}</td>
                        <td>{currentPrices[item.ticker]?.toFixed(2) || "..."}</td>
                        <td>{(item.sharesHeld * (currentPrices[item.ticker] || 0)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                      </tr>
                    ))}
                    <tr className="fw-bold">
                      <td colSpan="3" className="text-end">Subtotal</td>
                      <td>{subtotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      ))}
      <div className="text-end fw-bold fs-5">
        Grand Total: {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </div>
    </div>
  );
}