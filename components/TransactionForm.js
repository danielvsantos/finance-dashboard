import { useState } from "react";
import axios from "axios";
import { getSession } from "next-auth/react";

export default function TransactionForm({ onTransactionAdded }) {
    const [formData, setFormData] = useState({
        transaction_date: "",
        category_id: "",
        description: "",
        details: "",
        credit: "",
        debit: "",
        currency: "",
        transfer: false,
        account_id: "",
        numOfShares: "",
        price: "",
        ticker: ""
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked :
                    (name === "category_id" || name === "account_id") ? parseInt(value, 10) || "" : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log("Submitting Transaction Data:", JSON.stringify(formData, null, 2)); // Logs data clearly
        const session = await getSession(); // Get the session object
        if (!session) {
        console.error("No session found. User not authenticated."); 
        return;
        }

        try {
            console.log("Submitting Transaction Data:", JSON.stringify(formData, null, 2)); // Logs data clearly
            
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, formData, {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`, // Explicitly send session token
                    "Content-Type": "application/json"
                }
            });
    
            console.log("Transaction Created:", response.data);
            onTransactionAdded();
            setFormData({
                transaction_date: "",
                category_id: "",
                description: "",
                details: "",
                credit: "",
                debit: "",
                currency: "",
                transfer: false,
                account_id: "",
                numOfShares: "",
                price: "",
                ticker: ""
            });
        } catch (error) {
            console.error("Error creating transaction:", error.response?.data || error);
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

            <div className="col-12">
                <label className="form-label">Details</label>
                <input type="text" name="details" placeholder="Details" value={formData.details} onChange={handleChange} className="form-control" />
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
                <label className="form-label">Currency</label>
                <input type="text" name="currency" placeholder="Currency" value={formData.currency} onChange={handleChange} className="form-control" required />
            </div>

            <div className="col-md-6">
                <label className="form-label">Account ID</label>
                <input type="number" name="account_id" placeholder="Account ID" value={formData.account_id} onChange={handleChange} className="form-control" required />
            </div>

            <div className="col-md-6">
                <label className="form-label">Number of Shares</label>
                <input type="number" step="0.01" name="numOfShares" placeholder="Number of Shares" value={formData.numOfShares} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-6">
                <label className="form-label">Price</label>
                <input type="number" step="0.01" name="price" placeholder="Price" value={formData.price} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-6">
                <label className="form-label">Ticker</label>
                <input type="text" name="ticker" placeholder="Ticker" value={formData.ticker} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-6 d-flex align-items-center">
                <input type="checkbox" name="transfer" checked={formData.transfer} onChange={handleChange} className="form-check-input me-2" />
                <label className="form-check-label">Is Transfer</label>
            </div>

            <button type="submit" className="btn btn-primary mt-3">Submit</button>
        </form>
    );
}
