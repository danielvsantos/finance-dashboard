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
    <div className="container" style={{ maxWidth: "800px" }}>
      <div className="text-center mb-4">
        <h2
          style={{
            fontFamily: "Urbanist, sans-serif",
            fontWeight: 700,
            textTransform: "lowercase",
            color: "#1e3a8a",
            letterSpacing: "0.5px",
          }}
        >
          currency rates
        </h2>
      </div>

      <div className="bg-white rounded shadow-sm p-4 mb-4">
        <CurrencyRateForm onRateAdded={fetchRates} />
      </div>

      {rates.length === 0 ? (
        <p className="text-center text-muted">No currency rates found</p>
      ) : (
        <ul className="list-group">
          {rates.map((rate) => (
            <li
              key={`${rate.year}-${rate.month}-${rate.currencyFrom}-${rate.currencyTo}`}
              className="list-group-item d-flex justify-content-between align-items-center"
              style={{ fontFamily: 'Urbanist, sans-serif', fontSize: '0.95rem' }}
            >
              <div>
                <div className="fw-bold">
                  {rate.currencyFrom} → {rate.currencyTo}
                </div>
                <div className="text-muted small">
                  {rate.month}/{rate.year}
                </div>
              </div>
              <div className="text-primary fw-semibold">{rate.value}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
