import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";

const viewOptions = [
  { value: "year", label: "Yearly" },
  { value: "quarter", label: "Quarterly" },
  { value: "month", label: "Monthly" }
];

const currencyOptions = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "BRL", label: "BRL" }
];

const countryOptions = [
  { value: "USA", label: "USA" },
  { value: "Spain", label: "Spain" },
  { value: "Brasil", label: "Brasil" }
];

const yearOptions = Array.from({ length: new Date().getFullYear() - 2009 }, (_, i) => {
  const year = 2010 + i;
  return { value: year, label: year };
});

export default function PnLPage() {
  const [viewType, setViewType] = useState("year");
  const [years, setYears] = useState([]);
  const [start, setStart] = useState(2010);
  const [end, setEnd] = useState(new Date().getFullYear());
  const [currency, setCurrency] = useState("USD");
  const [countries, setCountries] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        view: viewType,
        currency,
        countries: countries.map(c => c.value).join(",")
      };

      if (viewType === "year") {
        params.years = years.map(y => y.value).join(",");
      } else {
        params.startYear = start;
        params.endYear = end;
      }

      const response = await axios.get("/api/analytics", { params });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ((viewType === "year" && years.length > 0) || (viewType !== "year" && start && end)) {
      fetchData();
    }
  }, [viewType, years, start, end, currency, countries]);

  return (
    <div className="container mt-4">
      <h2 className="text-primary">P&L Analytics</h2>

      <div className="row mb-3">
        <div className="col-md-3">
          <label className="form-label">View Type</label>
          <Select options={viewOptions} defaultValue={viewOptions[0]} onChange={(e) => setViewType(e.value)} />
        </div>

        {viewType === "year" && (
          <div className="col-md-3">
            <label className="form-label">Years</label>
            <Select isMulti options={yearOptions} onChange={setYears} />
          </div>
        )}

        {viewType !== "year" && (
          <>
            <div className="col-md-2">
              <label className="form-label">Start Year</label>
              <select className="form-control" value={start} onChange={e => setStart(parseInt(e.target.value))}>
                {yearOptions.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">End Year</label>
              <select className="form-control" value={end} onChange={e => setEnd(parseInt(e.target.value))}>
                {yearOptions.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
              </select>
            </div>
          </>
        )}

        <div className="col-md-2">
          <label className="form-label">Currency</label>
          <Select options={currencyOptions} defaultValue={currencyOptions[0]} onChange={(e) => setCurrency(e.value)} />
        </div>

        <div className="col-md-2">
          <label className="form-label">Countries</label>
          <Select isMulti options={countryOptions} onChange={setCountries} />
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <p>Loading data...</p>
        ) : data ? (
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>Period</th>
                <th>Revenue</th>
                <th>Expenses</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.data).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{value.revenue.toFixed(2)}</td>
                  <td>{value.expenses.toFixed(2)}</td>
                  <td>{(value.revenue - value.expenses).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
}