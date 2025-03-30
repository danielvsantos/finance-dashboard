import { useState } from "react";
import Select from "react-select";

const yearOptions = Array.from({ length: new Date().getFullYear() - 2009 }, (_, i) => {
  const year = 2010 + i;
  return { value: year, label: year };
});

const monthOptions = Array.from({ length: 12 }, (_, i) => {
  const month = String(i + 1).padStart(2, '0');
  return {
    value: `2025-${month}`,
    label: `2025-${month}`,
  };
});

const quarterOptions = ["Q1", "Q2", "Q3", "Q4"].map(q => ({
  value: `2025-${q}`,
  label: `2025-${q}`
}));

const currencyOptions = ["USD", "EUR", "BRL"].map(c => ({ value: c, label: c }));
const countryOptions = ["USA", "Spain", "Brasil"].map(c => ({ value: c, label: c }));

export default function PnLForm({ onSubmit }) {
  const [view, setView] = useState("year");
  const [form, setForm] = useState({
    years: [],
    startMonth: null,
    endMonth: null,
    startQuarter: null,
    endQuarter: null,
    currency: "USD",
    countries: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ view, ...form });
  };

  return (
    <form onSubmit={handleSubmit} className="card p-3 mb-4 shadow-sm">
      <div className="mb-3">
        <label>View Type</label>
        <select className="form-select" value={view} onChange={e => setView(e.target.value)}>
          <option value="year">Yearly</option>
          <option value="month">Monthly</option>
          <option value="quarter">Quarterly</option>
        </select>
      </div>

      {view === "year" && (
        <div className="mb-3">
          <label>Select Years</label>
          <Select options={yearOptions} isMulti onChange={selected => setForm(f => ({ ...f, years: selected.map(s => s.value) }))} />
        </div>
      )}

      {view === "month" && (
        <div className="row mb-3">
          <div className="col">
            <label>Start Month</label>
            <Select options={monthOptions} onChange={s => setForm(f => ({ ...f, startMonth: s.value }))} />
          </div>
          <div className="col">
            <label>End Month</label>
            <Select options={monthOptions} onChange={s => setForm(f => ({ ...f, endMonth: s.value }))} />
          </div>
        </div>
      )}

      {view === "quarter" && (
        <div className="row mb-3">
          <div className="col">
            <label>Start Quarter</label>
            <Select options={quarterOptions} onChange={s => setForm(f => ({ ...f, startQuarter: s.value }))} />
          </div>
          <div className="col">
            <label>End Quarter</label>
            <Select options={quarterOptions} onChange={s => setForm(f => ({ ...f, endQuarter: s.value }))} />
          </div>
        </div>
      )}

      <div className="mb-3">
        <label>Currency</label>
        <Select options={currencyOptions} defaultValue={currencyOptions[0]} onChange={s => setForm(f => ({ ...f, currency: s.value }))} />
      </div>

      <div className="mb-3">
        <label>Countries</label>
        <Select options={countryOptions} isMulti onChange={selected => setForm(f => ({ ...f, countries: selected.map(s => s.value) }))} />
      </div>

      <button type="submit" className="btn btn-primary w-100">Load P&L</button>
    </form>
  );
}