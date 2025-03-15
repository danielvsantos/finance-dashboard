import { useState } from "react";
import axios from "axios";

export default function TransactionForm({ onTransactionAdded }) {
    const [formData, setFormData] = useState({
        transaction_date: "",
        year: "",
        quarter: "",
        month: "",
        day: "",
        category_id: "",
        description: "",
        credit: "",
        debit: "",
        account_id: "",
        card: "",
        pl_category: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, formData, {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET}`,
                    "Content-Type": "application/json"
                }
            });

            console.log("Transaction Created:", response.data);
            onTransactionAdded(); // Refresh the transaction list
            setFormData({
                transaction_date: "",
                year: "",
                quarter: "",
                month: "",
                day: "",
                category_id: "",
                description: "",
                credit: "",
                debit: "",
                account_id: "",
                card: "",
                pl_category: ""
            });
        } catch (error) {
            console.error("Error creating transaction:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add New Transaction</h2>
            <input type="date" name="transaction_date" value={formData.transaction_date} onChange={handleChange} required />
            <input type="number" name="year" placeholder="Year" value={formData.year} onChange={handleChange} required />
            <input type="text" name="quarter" placeholder="Quarter (Q1, Q2...)" value={formData.quarter} onChange={handleChange} required />
            <input type="number" name="month" placeholder="Month" value={formData.month} onChange={handleChange} required />
            <input type="number" name="day" placeholder="Day" value={formData.day} onChange={handleChange} required />
            <input type="number" name="category_id" placeholder="Category ID" value={formData.category_id} onChange={handleChange} required />
            <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
            <input type="number" step="0.01" name="credit" placeholder="Credit" value={formData.credit} onChange={handleChange} />
            <input type="number" step="0.01" name="debit" placeholder="Debit" value={formData.debit} onChange={handleChange} />
            <input type="number" name="account_id" placeholder="Account ID" value={formData.account_id} onChange={handleChange} required />
            <input type="text" name="card" placeholder="Card Type" value={formData.card} onChange={handleChange} />
            <input type="text" name="pl_category" placeholder="P&L Category" value={formData.pl_category} onChange={handleChange} required />
            <button type="submit">Submit</button>
        </form>
    );
}
