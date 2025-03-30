import { useEffect, useState } from "react";
import axios from "axios";
import PortfolioTable from "../../components/PortfolioTable";

export default function PortfolioPage() {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ account: "", category: "" });
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = async () => {
    try {
      console.log("Fetching portfolio with filters:", filters);
      const res = await axios.get("/api/portfolio", {
        params: {
          ...(filters.account && { account: filters.account }),
          ...(filters.category && { category: filters.category })
        }
      });
      console.log("API Response:", res.data);
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch portfolio:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">My Investment Portfolio</h1>

      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            name="account"
            placeholder="Filter by Account"
            className="form-control"
            value={filters.account}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-6">
          <input
            type="text"
            name="category"
            placeholder="Filter by Category"
            className="form-control"
            value={filters.category}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {loading ? <p>Loading portfolio...</p> : <PortfolioTable data={data} />}
    </div>
  );
}