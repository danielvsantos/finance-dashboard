import { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function Dashboard() {
    const [transactions, setTransactions] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [filters, setFilters] = useState({
        year: "",
        month: "",
        quarter: "",
        categoryName: "",
        plCategory: "",
        accountName: "",
        accountCountry: "",
        transfer: "",
        details: "",
        currency: ""
    });

    useEffect(() => {
        fetchTransactions();
    }, [filters]);

    async function fetchTransactions() {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET}`
                },
                params: filters
            });
            setTransactions(response.data);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    }

    const chartData = transactions.reduce((acc, tx) => {
        const date = new Date(tx.transaction_date).toLocaleDateString();
        const existingEntry = acc.find(entry => entry.date === date);

        if (existingEntry) {
            existingEntry.balance += (tx.credit || 0) - (tx.debit || 0);
        } else {
            acc.push({ date, balance: (tx.credit || 0) - (tx.debit || 0) });
        }

        return acc;
    }, []);

    return (
        <div className="container mt-5">
            <h1 className="text-primary text-center">Dashboard</h1>

            {/* Filters */}
            <div className="row mb-4">
                {Object.keys(filters).map((filterKey) => (
                    <div className="col-md-4" key={filterKey}>
                        <label className="form-label">{filterKey.replace(/([A-Z])/g, " $1").trim()}</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder={filterKey}
                            value={filters[filterKey]}
                            onChange={(e) => setFilters({ ...filters, [filterKey]: e.target.value })}
                        />
                    </div>
                ))}
            </div>

            {/* Graph */}
            <div className="card p-4 shadow">
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="balance" stroke="#007bff" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
