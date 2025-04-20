import { useEffect, useState } from "react";
import axios from "axios";
import PnLTable from "../../components/pnltable";

export default function PnLPage() {
  const [view, setView] = useState("year");
  const [startYear, setStartYear] = useState(new Date().getFullYear() - 1);
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  const [startMonthYear, setStartMonthYear] = useState(new Date().getFullYear());
  const [startMonth, setStartMonth] = useState("01");
  const [endMonthYear, setEndMonthYear] = useState(new Date().getFullYear());
  const [endMonth, setEndMonth] = useState("12");
  const [startQuarterYear, setStartQuarterYear] = useState(new Date().getFullYear());
  const [startQuarter, setStartQuarter] = useState("Q1");
  const [endQuarterYear, setEndQuarterYear] = useState(new Date().getFullYear());
  const [endQuarter, setEndQuarter] = useState("Q4");
  const [currency, setCurrency] = useState("EUR");
  const [countries, setCountries] = useState(["EU"]);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [view, startYear, endYear, startMonth, endMonth, currency, startQuarter, endQuarter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `/api/analytics?view=${view}&currency=${currency}`;
      if (view === "year") {
        const y = [];
        for (let yr = startYear; yr <= endYear; yr++) {
          y.push(yr);
        }
        url += `&years=${y.join("&years=")}`;
      } else if (view === "month") {
        url += `&startMonth=${startMonthYear}-${startMonth}&endMonth=${endMonthYear}-${endMonth}`;
      } else if (view === "quarter") {
        url += `&startQuarter=${startQuarterYear}-${startQuarter}&endQuarter=${endQuarterYear}-${endQuarter}`;
      }
      const response = await axios.get(url);
      setData(response.data.data || {});
    } catch (err) {
      console.error("Error fetching P&L data:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 2010 + 1 }, (_, i) => currentYear - i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const quarterOptions = ["Q1", "Q2", "Q3", "Q4"];

  return (
    <div className="container mt-4" style={{ maxWidth: "1000px" }}>
      <div className="text-center mb-4">
        <h2 style={{ fontFamily: "Urbanist, sans-serif", fontWeight: 700, textTransform: "lowercase", color: "#1e3a8a" }}>profit & loss</h2>
      </div>

      <div className="d-flex flex-column align-items-center gap-3 mb-4">
        {/* View Selector */}
        <div className="btn-group btn-group-sm" role="group">
          {['year', 'quarter', 'month'].map(v => (
            <button
              key={v}
              className={`btn btn-outline-secondary ${view === v ? "active bg-primary text-white border-primary" : ""}`}
              onClick={() => setView(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {/* Date Range Filter */}
        {view === "year" && (
          <div className="d-flex gap-2">
            <select value={startYear} onChange={(e) => setStartYear(parseInt(e.target.value))} className="form-select form-select-sm w-auto">
              {yearOptions.map(yr => <option key={yr} value={yr}>{yr}</option>)}
            </select>
            <select value={endYear} onChange={(e) => setEndYear(parseInt(e.target.value))} className="form-select form-select-sm w-auto">
              {yearOptions.map(yr => <option key={yr} value={yr}>{yr}</option>)}
            </select>
          </div>
        )}

        {view === "month" && (
          <div className="d-flex gap-3">
            <div className="d-flex gap-2">
              <select value={startMonthYear} onChange={(e) => setStartMonthYear(parseInt(e.target.value))} className="form-select form-select-sm w-auto">
                {yearOptions.map(yr => <option key={yr} value={yr}>{yr}</option>)}
              </select>
              <select value={startMonth} onChange={(e) => setStartMonth(e.target.value)} className="form-select form-select-sm w-auto">
                {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="d-flex gap-2">
              <select value={endMonthYear} onChange={(e) => setEndMonthYear(parseInt(e.target.value))} className="form-select form-select-sm w-auto">
                {yearOptions.map(yr => <option key={yr} value={yr}>{yr}</option>)}
              </select>
              <select value={endMonth} onChange={(e) => setEndMonth(e.target.value)} className="form-select form-select-sm w-auto">
                {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        )}

        {view === "quarter" && (
          <div className="d-flex gap-3">
            <div className="d-flex gap-2">
              <select value={startQuarterYear} onChange={(e) => setStartQuarterYear(parseInt(e.target.value))} className="form-select form-select-sm w-auto">
                {yearOptions.map(yr => <option key={yr} value={yr}>{yr}</option>)}
              </select>
              <select value={startQuarter} onChange={(e) => setStartQuarter(e.target.value)} className="form-select form-select-sm w-auto">
                {quarterOptions.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
            <div className="d-flex gap-2">
              <select value={endQuarterYear} onChange={(e) => setEndQuarterYear(parseInt(e.target.value))} className="form-select form-select-sm w-auto">
                {yearOptions.map(yr => <option key={yr} value={yr}>{yr}</option>)}
              </select>
              <select value={endQuarter} onChange={(e) => setEndQuarter(e.target.value)} className="form-select form-select-sm w-auto">
                {quarterOptions.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Currency Selector */}
        <div className="text-start w-100">
          <h6 className="text-muted mb-1">Currency</h6>
          <select className="form-select form-select-sm w-auto" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="BRL">BRL</option>
          </select>
        </div>

        {/* Country Selector */}
        <div className="text-start w-100">
          <h6 className="text-muted mt-3 mb-1">Country</h6>
          <div className="d-flex align-items-center gap-2">
            {['EU', 'USA', 'BRA'].map(code => (
              <div className="form-check form-check-inline" key={code}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={countries.includes(code)}
                  id={`country-${code}`}
                  onChange={() => {
                    setCountries(prev =>
                      prev.includes(code)
                        ? prev.filter(c => c !== code)
                        : [...prev, code]
                    );
                  }}
                />
                <label className="form-check-label" htmlFor={`country-${code}`}>{code}</label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : Object.keys(data).length === 0 ? (
        <p className="text-center text-muted">No data available</p>
      ) : (
        <PnLTable data={data} view={view} currency={currency} countries={countries} />
      )}
    </div>
  );
}