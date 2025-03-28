import { useState } from "react";
import axios from "axios";
import { getSession } from "next-auth/react";


export default function CurrencyRateForm({ onRateAdded }) {
    const [formData, setFormData] = useState({
        year: "",
        month: "",
        fromCurrency: "",
        toUSD: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value.toUpperCase()
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const session = await getSession(); // Get the session object
        if (!session) {
        console.error("No session found. User not authenticated."); 
        return;
        }

        
        
        try {


            await axios.post("/api/currency-rates", formData);
    
            setFormData({ year: "", month: "", fromCurrency: "", toUSD: "" });
            onRateAdded();
        } catch (error) {
            console.error("Error submitting currency rate:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-3">
                <input type="number" name="year" placeholder="Year" value={formData.year} onChange={handleChange} className="form-control" required />
            </div>
            <div className="col-md-3">
                <input type="number" name="month" placeholder="Month" value={formData.month} onChange={handleChange} className="form-control" required />
            </div>
            <div className="col-md-3">
                <input type="text" name="fromCurrency" placeholder="From Currency (e.g. BRL)" value={formData.fromCurrency} onChange={handleChange} className="form-control" required />
            </div>
            <div className="col-md-3">
                <input type="number" step="0.0001" name="toUSD" placeholder="To USD" value={formData.toUSD} onChange={handleChange} className="form-control" required />
            </div>
            <div className="col-12">
                <button type="submit" className="btn btn-primary">Add Rate</button>
            </div>
        </form>
    );
}
