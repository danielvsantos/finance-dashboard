import { useState, useEffect } from "react";
import axios from "axios";
import { getSession } from "next-auth/react";
import { Pencil, Trash2, Plus } from "lucide-react";
import TransactionForm from "../../components/TransactionForm";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date");
  const [filters, setFilters] = useState({ category: "", account: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  const pageSize = 20;

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET}`,
        },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      const session = await getSession();
      await axios.delete(`/api/transactions?id=${id}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      await fetchTransactions();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const openNewModal = () => {
    setEditTransaction(null);
    setShowModal(true);
  };

  const handleEditModal = (transaction) => {
    setEditTransaction(transaction);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditTransaction(null);
  };

  const filteredTransactions = transactions.filter(tx => {
    return (
      (!filters.category || tx.category?.name?.toLowerCase().includes(filters.category.toLowerCase())) &&
      (!filters.account || tx.account?.name?.toLowerCase().includes(filters.account.toLowerCase()))
    );
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === "date") return new Date(b.transaction_date) - new Date(a.transaction_date);
    return (a[sortBy]?.name || "").localeCompare(b[sortBy]?.name || "");
  });

  const totalPages = Math.ceil(sortedTransactions.length / pageSize);
  const paginated = sortedTransactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="container" style={{ maxWidth: "1000px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2
          style={{
            fontFamily: "Urbanist, sans-serif",
            fontWeight: 700,
            textTransform: "lowercase",
            color: "#1e3a8a",
            letterSpacing: "0.5px",
          }}
        >
          transactions
        </h2>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openNewModal}>
          <Plus size={18} /> Add Transaction
        </button>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <input
            type="text"
            placeholder="Filter by category"
            className="form-control"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          />
        </div>
        <div className="col-md-4">
          <input
            type="text"
            placeholder="Filter by account"
            className="form-control"
            value={filters.account}
            onChange={(e) => setFilters({ ...filters, account: e.target.value })}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="date">Sort by Date</option>
            <option value="category">Sort by Category</option>
            <option value="account">Sort by Account</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : paginated.length === 0 ? (
        <p className="text-center text-muted">No transactions found</p>
      ) : (
        <table className="table table-borderless align-middle">
          <thead className="small text-muted text-uppercase" style={{ fontFamily: 'Urbanist, sans-serif', fontWeight: 600 }}>
            <tr>
              <th className="py-2">Date</th>
              <th className="py-2">Category</th>
              <th className="py-2">Group</th>
              <th className="py-2">Account</th>
              <th className="py-2 text-end">Credit</th>
              <th className="py-2 text-end">Debit</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody style={{ fontFamily: 'Urbanist, sans-serif', fontSize: '0.95rem' }}>
            {paginated.map((tx) => (
              <tr key={tx.id} className="border-bottom">
                <td className="py-2">{tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString("en-GB") : '-'}</td>
                <td className="py-2">{tx.category?.name || '-'}</td>
                <td className="py-2 text-muted">{tx.category?.group || '-'}</td>
                <td className="py-2 text-muted">{tx.account?.name || '-'}</td>
                <td className="py-2 text-end text-success">{tx.credit || "-"}</td>
                <td className="py-2 text-end text-danger">{tx.debit || "-"}</td>
                <td className="py-2 text-end">
                  <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-sm btn-light p-1 border" onClick={() => handleEditModal(tx)}>
                      <Pencil size={16} />
                    </button>
                    <button className="btn btn-sm btn-light p-1 border" onClick={() => handleDelete(tx.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
        <button
          className="btn btn-sm btn-outline-secondary"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Previous
        </button>
        <span className="small">{currentPage} / {totalPages}</span>
        <button
          className="btn btn-sm btn-outline-secondary"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editTransaction ? "Edit Transaction" : "Add Transaction"}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <TransactionForm
                  transaction={editTransaction}
                  onTransactionAdded={() => {
                    handleCloseModal();
                    fetchTransactions();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}