import { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function Dashboard() {
    const [transactions, setTransactions] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [filters, setFilters] = useState({ year: "", month: "", quarter: "" });

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        filterTransactions();
    }, [filters, transactions]);

    async function fetchTransactions() {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET}`
                }
            });
            setTransactions(response.data);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    }

    function filterTransactions() {
        let filtered = transactions;

        if (filters.year) {
            filtered = filtered.filter(tx => tx.year.toString() === filters.year);
        }
        if (filters.month) {
            filtered = filtered.filter(tx => tx.month.toString() === filters.month);
        }
        if (filters.quarter) {
            filtered = filtered.filter(tx => tx.quarter === filters.quarter);
        }

        setFilteredData(filtered);
    }

    const chartData = filteredData.reduce((acc, tx) => {
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
                <div className="col-md-4">
                    <label className="form-label">Year</label>
                    <select className="form-control" onChange={(e) => setFilters({ ...filters, year: e.target.value })}>
                        <option value="">All</option>
                        {[...new Set(transactions.map(tx => tx.year))].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Month</label>
                    <select className="form-control" onChange={(e) => setFilters({ ...filters, month: e.target.value })}>
                        <option value="">All</option>
                        {[...new Set(transactions.map(tx => tx.month))].map(month => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Quarter</label>
                    <select className="form-control" onChange={(e) => setFilters({ ...filters, quarter: e.target.value })}>
                        <option value="">All</option>
                        {[...new Set(transactions.map(tx => tx.quarter))].map(quarter => (
                            <option key={quarter} value={quarter}>{quarter}</option>
                        ))}
                    </select>
                </div>
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
