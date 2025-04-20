import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState({});
  const [filters, setFilters] = useState({
    group: "",
    type: "",
    currency: "EUR",
    country: "",
    view: "month",
    startMonth: "2023-01",
    endMonth: "2023-12"
  });

  const [groups, setGroups] = useState([]);
  const [types, setTypes] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetchData();
  }, [filters]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  async function fetchData() {
    try {
      const res = await axios.get(`/api/analytics`, {
        params: {
          view: filters.view,
          currency: filters.currency,
          startMonth: filters.startMonth,
          endMonth: filters.endMonth,
        },
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET}`
        }
      });
      setData(res.data.data);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    }
  }

  async function fetchFilterOptions() {
    try {
      const [accountRes, categoryRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, {
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET}` },
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET}` },
        })
      ]);

      setGroups([...new Set(categoryRes.data.map(cat => cat.group))]);
      setTypes([...new Set(categoryRes.data.map(cat => cat.type))]);
      setCurrencies([...new Set(accountRes.data.map(acc => acc.currency))]);
      setCountries([...new Set(accountRes.data.map(acc => acc.country))]);
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  }

  const sortedKeys = Object.keys(data).sort((a, b) => new Date(a) - new Date(b));

  const EXPENSE_TYPES = ["Life Expenses", "Housing & Utilities", "Personal Development"];

  const currencySymbols = {
    USD: "$",
    EUR: "€",
    BRL: "R$"
  };

  const chartData = sortedKeys.map(key => {
    let total = 0;
    for (const item of data[key]) {
      if (
        (!filters.group || item.group === filters.group) &&
        (!filters.type || item.type === filters.type) &&
        (!filters.country || item.country === filters.country)
      ) {
        const value = EXPENSE_TYPES.includes(item.type) ? -item.balance : item.balance;
        total += value;
      }
    }
    return { date: key, balance: total };
  });

  return (
    <div className="container mt-5" style={{ maxWidth: "900px" }}>
      <h1 className="text-center fw-bold mb-4" style={{ fontFamily: 'Urbanist, sans-serif', color: '#1e3a8a' }}>dashboard</h1>

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <label className="form-label">Group</label>
          <select className="form-select" value={filters.group} onChange={(e) => setFilters({ ...filters, group: e.target.value })}>
            <option value="">All</option>
            {groups.map((g, idx) => <option key={idx} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Type</label>
          <select className="form-select" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All</option>
            {types.map((t, idx) => <option key={idx} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Currency</label>
          <select className="form-select" value={filters.currency} onChange={(e) => setFilters({ ...filters, currency: e.target.value })}>
            <option value="">All</option>
            {currencies.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Country</label>
          <select className="form-select" value={filters.country} onChange={(e) => setFilters({ ...filters, country: e.target.value })}>
            <option value="">All</option>
            {countries.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Start Month</label>
          <input type="month" className="form-control" value={filters.startMonth} onChange={(e) => setFilters({ ...filters, startMonth: e.target.value })} />
        </div>
        <div className="col-md-3">
          <label className="form-label">End Month</label>
          <input type="month" className="form-control" value={filters.endMonth} onChange={(e) => setFilters({ ...filters, endMonth: e.target.value })} />
        </div>
      </div>

      {/* Graph */}
      <div className="card p-4 shadow">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => `${currencySymbols[filters.currency] || ''}${Math.round(value).toLocaleString()}`} />
            <Legend />
            <Line type="monotone" dataKey="balance" stroke="#1e3a8a" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}