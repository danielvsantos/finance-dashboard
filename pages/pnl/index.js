import { useState } from "react";
import axios from "axios";
import PnLForm from "../../components/PnLFilterForm.js";
import PnLTable from "../../components/PnLTable.js";

export default function PnLPage() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalyticsData = async (filters) => {
    const params = new URLSearchParams();

    params.append("view", filters.view);
    params.append("currency", filters.currency);

    if (filters.view === "year" && filters.years) {
      filters.years.forEach(year => params.append("years", year));
    }

    if (filters.view === "month") {
      params.append("startMonth", filters.startMonth);
      params.append("endMonth", filters.endMonth);
    }

    if (filters.view === "quarter") {
      params.append("startQuarter", filters.startQuarter);
      params.append("endQuarter", filters.endQuarter);
    }

    if (filters.countries) {
      filters.countries.forEach(country => params.append("countries", country));
    }

    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/api/analytics?${params.toString()}`);
      setAnalyticsData(res.data);
    } catch (err) {
      setError("Failed to fetch analytics data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center text-primary mb-4">Profit & Loss Viewer</h1>
      <PnLForm onSubmit={fetchAnalyticsData} />
      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-danger text-center">{error}</p>}
      {analyticsData && (
        <PnLTable data={analyticsData.data} view={analyticsData.view} />
      )}
    </div>
  );
}