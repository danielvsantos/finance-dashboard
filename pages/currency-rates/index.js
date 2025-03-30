import { useState, useEffect } from "react";
import axios from "axios";
import CurrencyRateForm from "../../components/CurrencyRateForm";

export default function CurrencyRatesPage() {
  const [rates, setRates] = useState([]);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await axios.get("/api/currency-rates");
      setRates(res.data);
    } catch (err) {
      console.error("Error fetching rates:", err);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-primary text-center">Currency Rates</h1>
      <div className="card p-4 shadow mb-4">
        <CurrencyRateForm onRateAdded={fetchRates} />
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Year</th>
              <th>Month</th>
              <th>From</th>
              <th>To</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            {rates.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  No currency rates found
                </td>
              </tr>
            ) : (
              rates.map((rate) => (
                <tr key={`${rate.year}-${rate.month}-${rate.currencyFrom}-${rate.currencyTo}`}>
                  <td>{rate.year}</td>
                  <td>{rate.month}</td>
                  <td>{rate.currencyFrom}</td>
                  <td>{rate.currencyTo}</td>
                  <td>{rate.value}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
