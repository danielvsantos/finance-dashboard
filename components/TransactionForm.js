import { useEffect, useState } from "react";
import axios from "axios";
import { getSession } from "next-auth/react";
import dynamic from "next/dynamic";

const loadBootstrap = () =>
    typeof window !== "undefined" && import("bootstrap/dist/js/bootstrap.bundle.min");
  

export default function TransactionForm({ onTransactionAdded }) {
    const [formData, setFormData] = useState({
        transaction_date: "",
        account_id: "",
        category_id: "",
        transfer: false,
        description: "",
        details: "",
        currency: "USD",
        credit: "",
        debit: "",
        numOfShares: "",
        ticker: "",
        price: ""
    });

    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        loadBootstrap();
        fetchAccounts();
        fetchCategories();
    }, []);

    const fetchAccounts = async () => {
        try {
            const session = await getSession();
            const res = await axios.get("/api/accounts", {
                headers: { Authorization: `Bearer ${session.accessToken}` },
            });
            setAccounts(res.data);
        } catch (err) {
            console.error("Error fetching accounts:", err);
        }
    };

    const fetchCategories = async () => {
        try {
            const session = await getSession();
            const res = await axios.get("/api/categories", {
                headers: { Authorization: `Bearer ${session.accessToken}` },
            });
            setCategories(res.data);
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const session = await getSession();
            await axios.post("/api/transactions", formData, {
                headers: { Authorization: `Bearer ${session.accessToken}` },
            });
            setFormData({
                transaction_date: "",
                account_id: "",
                category_id: "",
                transfer: false,
                description: "",
                details: "",
                currency: "USD",
                credit: "",
                debit: "",
                numOfShares: "",
                ticker: "",
                price: ""
            });
            onTransactionAdded();
        } catch (error) {
            console.error("Error creating transaction:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-4">
                <label className="form-label">Transaction Date</label>
                <input type="date" name="transaction_date" value={formData.transaction_date} onChange={handleChange} className="form-control" required />
            </div>

            <div className="col-md-4">
                <label className="form-label">Account</label>
                <select name="account_id" value={formData.account_id} onChange={handleChange} className="form-select" required>
                    <option value="">Select Account</option>
                    {accounts.map(account => (
                        <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                </select>
            </div>

            <div className="col-md-4">
                <label className="form-label">Category</label>
                <select name="category_id" value={formData.category_id} onChange={handleChange} className="form-select" required>
                    <option value="">Select Category</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
            </div>

            <div className="col-md-12">
                <div className="form-check">
                    <input type="checkbox" className="form-check-input" name="transfer" checked={formData.transfer} onChange={handleChange} />
                    <label className="form-check-label">Transfer</label>
                </div>
            </div>

            <div className="col-md-6">
                <label className="form-label">Description</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-6">
                <label className="form-label">Details</label>
                <input type="text" name="details" value={formData.details} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-4">
                <label className="form-label">Currency</label>
                <select name="currency" value={formData.currency} onChange={handleChange} className="form-select">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="BRL">BRL</option>
                </select>
            </div>

            <div className="col-md-4">
                <label className="form-label">Credit</label>
                <input type="number" name="credit" value={formData.credit} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-4">
                <label className="form-label">Debit</label>
                <input type="number" name="debit" value={formData.debit} onChange={handleChange} className="form-control" />
            </div>

            <div className="accordion mt-3" id="stockAccordion">
                <div className="accordion-item">
                    <h2 className="accordion-header" id="stockHeading">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#stockCollapse" aria-expanded="false" aria-controls="stockCollapse">
                            Stock Purchase
                        </button>
                    </h2>
                    <div id="stockCollapse" className="accordion-collapse collapse" aria-labelledby="stockHeading" data-bs-parent="#stockAccordion">
                        <div className="accordion-body">
                            <div className="row">
                                <div className="col-md-4">
                                    <label className="form-label"># of Shares</label>
                                    <input type="number" name="numOfShares" value={formData.numOfShares} onChange={handleChange} className="form-control" />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Ticker</label>
                                    <input type="text" name="ticker" value={formData.ticker} onChange={handleChange} className="form-control" />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Price</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleChange} className="form-control" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12">
                <button type="submit" className="btn btn-primary mt-3">Submit</button>
            </div>
        </form>
    );
}