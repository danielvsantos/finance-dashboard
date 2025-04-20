import { useState, useEffect } from "react";
import axios from "axios";
import AccountForm from "../../components/AccountForm";
import { getSession } from "next-auth/react";
import { Pencil, Trash2 } from "lucide-react";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("id");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET}`,
        },
      });
      setAccounts(response.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (account) => {
    setEditingId(account.id);
    setEditData(account);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const session = await getSession();
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/accounts?id=${editingId}`, editData, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      setEditingId(null);
      await fetchAccounts();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this account?")) return;

    try {
      const session = await getSession();
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/accounts?id=${id}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      await fetchAccounts();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const sortedAccounts = [...accounts].sort((a, b) => {
    if (sortBy === "id") return a.id - b.id;
    return a[sortBy]?.localeCompare(b[sortBy]);
  });

  return (
    <div className="container" style={{ maxWidth: "800px" }}>
      <div className="mb-4 text-center">
        <h2
          style={{
            fontFamily: 'Urbanist, sans-serif',
            fontWeight: 700,
            textTransform: 'lowercase',
            color: '#1e3a8a',
            letterSpacing: '0.5px'
          }}
        >
          accounts
        </h2>
      </div>

      <div className="bg-white rounded shadow-sm p-4 mb-4">
        <AccountForm onAccountAdded={fetchAccounts} />
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <small className="text-muted">{sortedAccounts.length} accounts</small>
        <select
          className="form-select form-select-sm w-auto"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="id">Sort by ID</option>
          <option value="name">Sort by Name</option>
          <option value="country">Sort by Country</option>
          <option value="currency">Sort by Currency</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <ul className="list-group mb-4">
          {sortedAccounts.map((account) => (
            <li
              key={account.id}
              className="list-group-item d-flex flex-column gap-1 position-relative"
              style={{ borderLeft: '4px solid #1e3a8a' }}
            >
              {editingId === account.id ? (
                <>
                  <div className="d-flex gap-2 flex-wrap">
                    <input name="name" className="form-control" value={editData.name} onChange={handleEditChange} />
                    <input name="accountNumber" className="form-control" value={editData.accountNumber} onChange={handleEditChange} />
                    <input name="bank" className="form-control" value={editData.bank} onChange={handleEditChange} />
                    <input name="currency" className="form-control" value={editData.currency} onChange={handleEditChange} />
                    <input name="country" className="form-control" value={editData.country} onChange={handleEditChange} />
                    <input name="owner" className="form-control" value={editData.owner} onChange={handleEditChange} />
                  </div>
                  <div className="d-flex gap-2 mt-2">
                    <button className="btn btn-sm btn-success" onClick={handleUpdate}>Save</button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="fw-bold text-dark d-flex justify-content-between align-items-start">
                    {account.name}
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-light p-1 border"
                        onClick={() => handleEdit(account)}
                        aria-label="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="btn btn-sm btn-light p-1 border"
                        onClick={() => handleDelete(account.id)}
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="small text-muted">
                    <strong>Account #:</strong> {account.accountNumber} &nbsp;|&nbsp;
                    <strong>Bank:</strong> {account.bank} &nbsp;|&nbsp;
                    <strong>Currency:</strong> {account.currency}
                  </div>
                  <div className="small text-muted">
                    <strong>Country:</strong> {account.country} &nbsp;|&nbsp;
                    <strong>Owner:</strong> {account.owner}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
