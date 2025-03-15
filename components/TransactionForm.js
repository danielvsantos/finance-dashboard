import { useState } from "react";
import axios from "axios";

export default function TransactionForm({ onTransactionAdded }) {
    const [formData, setFormData] = useState({
        transaction_date: "",
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
            onTransactionAdded();
            setFormData({
                transaction_date: "",
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
        <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
                <label className="form-label">Transaction Date</label>
                <input type="date" name="transaction_date" value={formData.transaction_date} onChange={handleChange} className="form-control" required />
            </div>

            <div className="col-md-6">
                <label className="form-label">Category ID</label>
                <input type="number" name="category_id" placeholder="Category ID" value={formData.category_id} onChange={handleChange} className="form-control" required />
            </div>

            <div className="col-12">
                <label className="form-label">Description</label>
                <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="form-control" required />
            </div>

            <div className="col-md-6">
                <label className="form-label">Credit</label>
                <input type="number" step="0.01" name="credit" placeholder="Credit" value={formData.credit} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-6">
                <label className="form-label">Debit</label>
                <input type="number" step="0.01" name="debit" placeholder="Debit" value={formData.debit} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-6">
                <label className="form-label">Account ID</label>
                <input type="number" name="account_id" placeholder="Account ID" value={formData.account_id} onChange={handleChange} className="form-control" required />
            </div>

            <div className="col-md-6">
                <label className="form-label">Card Type</label>
                <input type="text" name="card" placeholder="Card Type" value={formData.card} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-6">
                <label className="form-label">P&L Category</label>
                <input type="text" name="pl_category" placeholder="P&L Category" value={formData.pl_category} onChange={handleChange} className="form-control" required />
            </div>

            <button type="submit" className="btn btn-primary mt-3">Submit</button>
        </form>
    );
}
