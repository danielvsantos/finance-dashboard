import { useEffect, useState } from "react";
import axios from "axios";
import { getSession } from "next-auth/react";

export default function TransactionForm({ onTransactionAdded, transaction }) {
  const [formData, setFormData] = useState({
    transaction_date: "",
    accountId: "",
    categoryId: "",
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
    fetchAccounts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (transaction) {
      setFormData({
        ...transaction,
        accountId: transaction.accountId || "",
        categoryId: transaction.categoryId || "",
        transaction_date: transaction.transaction_date?.split("T")[0] || ""
      });
    }
  }, [transaction]);

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
      const method = transaction ? "put" : "post";
      const url = transaction ? `/api/transactions?id=${transaction.id}` : "/api/transactions";

      const payload = {
        ...formData,
        accountId: parseInt(formData.accountId, 10),
        categoryId: parseInt(formData.categoryId, 10),
        credit: formData.credit ? parseFloat(formData.credit) : null,
        debit: formData.debit ? parseFloat(formData.debit) : null,
      };

      await axios[method](url, payload, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });

      if (!transaction) {
        setFormData({
          transaction_date: "",
          accountId: "",
          categoryId: "",
          description: "",
          details: "",
          currency: "USD",
          credit: "",
          debit: "",
          numOfShares: "",
          ticker: "",
          price: ""
        });
      }

      onTransactionAdded();
    } catch (error) {
      console.error("Error submitting transaction:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="row g-3" style={{ fontFamily: 'Urbanist, sans-serif', fontSize: '0.95rem' }}>
      <div className="col-md-4">
        <label className="form-label">Transaction Date</label>
        <input type="date" name="transaction_date" value={formData.transaction_date} onChange={handleChange} className="form-control rounded shadow-sm" required />
      </div>

      <div className="col-md-4">
        <label className="form-label">Account</label>
        <select name="accountId" value={formData.accountId} onChange={handleChange} className="form-select rounded shadow-sm" required>
          <option value="">Select Account</option>
          {accounts.map(account => (
            <option key={account.id} value={account.id}>{account.name}</option>
          ))}
        </select>
      </div>

      <div className="col-md-4">
        <label className="form-label">Category</label>
        <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="form-select rounded shadow-sm" required>
          <option value="">Select Category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      <div className="col-md-6">
        <label className="form-label">Description</label>
        <input type="text" name="description" value={formData.description} onChange={handleChange} className="form-control rounded shadow-sm" />
      </div>

      <div className="col-md-6">
        <label className="form-label">Details</label>
        <input type="text" name="details" value={formData.details} onChange={handleChange} className="form-control rounded shadow-sm" />
      </div>

      <div className="col-md-4">
        <label className="form-label">Currency</label>
        <select name="currency" value={formData.currency} onChange={handleChange} className="form-select rounded shadow-sm">
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="BRL">BRL</option>
        </select>
      </div>

      <div className="col-md-4">
        <label className="form-label">Credit</label>
        <input type="number" name="credit" value={formData.credit} onChange={handleChange} className="form-control rounded shadow-sm" />
      </div>

      <div className="col-md-4">
        <label className="form-label">Debit</label>
        <input type="number" name="debit" value={formData.debit} onChange={handleChange} className="form-control rounded shadow-sm" />
      </div>

      <div className="accordion mt-2" id="stockAccordion">
        <div className="accordion-item border-0">
          <h2 className="accordion-header" id="stockHeading">
            <button className="accordion-button collapsed rounded shadow-sm" type="button" data-bs-toggle="collapse" data-bs-target="#stockCollapse" aria-expanded="false" aria-controls="stockCollapse">
              Stock Purchase
            </button>
          </h2>
          <div id="stockCollapse" className="accordion-collapse collapse" aria-labelledby="stockHeading" data-bs-parent="#stockAccordion">
            <div className="accordion-body">
              <div className="row">
                <div className="col-md-4">
                  <label className="form-label"># of Shares</label>
                  <input type="number" name="numOfShares" value={formData.numOfShares} onChange={handleChange} className="form-control rounded shadow-sm" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Ticker</label>
                  <input type="text" name="ticker" value={formData.ticker} onChange={handleChange} className="form-control rounded shadow-sm" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Price</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} className="form-control rounded shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 text-center">
        <button type="submit" className="btn btn-primary mt-3 px-4" style={{ textTransform: 'lowercase' }}>
          {transaction ? 'save changes' : 'save'}
        </button>
      </div>
    </form>
  );
}
