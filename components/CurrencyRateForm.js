import { useState } from "react";
import axios from "axios";
import { getSession } from "next-auth/react";

export default function CurrencyRateForm({ onRateAdded }) {
  const [formData, setFormData] = useState({
    year: "",
    month: "",
    currencyFrom: "",
    currencyTo: "USD",
    value: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["year", "month", "value"].includes(name) ? value : value.toUpperCase()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const session = await getSession();
    if (!session) {
      console.error("No session found. User not authenticated.");
      return;
    }

    try {
      await axios.post("/api/currency-rates", formData);
      setFormData({
        year: "",
        month: "",
        currencyFrom: "",
        currencyTo: "USD",
        value: ""
      });
      onRateAdded();
    } catch (error) {
      console.error("Error submitting currency rate:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="row g-3" style={{ fontFamily: 'Urbanist, sans-serif', fontSize: '0.95rem' }}>
      <div className="col-md-2">
        <input type="number" name="year" placeholder="Year" value={formData.year} onChange={handleChange} className="form-control rounded shadow-sm" required />
      </div>
      <div className="col-md-2">
        <input type="number" name="month" placeholder="Month" value={formData.month} onChange={handleChange} className="form-control rounded shadow-sm" required />
      </div>
      <div className="col-md-2">
        <input type="text" name="currencyFrom" placeholder="From (e.g. BRL)" value={formData.currencyFrom} onChange={handleChange} className="form-control rounded shadow-sm text-uppercase" required />
      </div>
      <div className="col-md-2">
        <input type="text" name="currencyTo" placeholder="To (e.g. USD)" value={formData.currencyTo} onChange={handleChange} className="form-control rounded shadow-sm text-uppercase" required />
      </div>
      <div className="col-md-2">
        <input type="number" step="0.0001" name="value" placeholder="Conversion Rate" value={formData.value} onChange={handleChange} className="form-control rounded shadow-sm" required />
      </div>
      <div className="col-md-2 d-grid">
        <button type="submit" className="btn btn-primary text-lowercase">add rate</button>
      </div>
    </form>
  );
}