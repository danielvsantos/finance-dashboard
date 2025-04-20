import { useState, useEffect } from "react";
import axios from "axios";
import CategoryForm from "../../components/CategoryForm";
import { getSession } from "next-auth/react";
import { Pencil, Trash2 } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("id");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const pageSize = 20;

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET}`,
        },
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (category) => {
    setEditingId(category.id);
    setEditData(category);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const session = await getSession();
      await axios.put(`/api/categories?id=${editingId}`, editData, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      setEditingId(null);
      await fetchCategories();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const session = await getSession();
      await axios.delete(`/api/categories?id=${id}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      await fetchCategories();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const sortedCategories = [...categories].sort((a, b) => {
    if (sortBy === "id") return a.id - b.id;
    return a[sortBy].localeCompare(b[sortBy]);
  });

  const totalPages = Math.ceil(sortedCategories.length / pageSize);
  const paginated = sortedCategories.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="container" style={{ maxWidth: "800px" }}>
      <div className="mb-4 text-center">
        <h2
          style={{
            fontFamily: "Urbanist, sans-serif",
            fontWeight: 700,
            textTransform: "lowercase",
            color: "#1e3a8a",
            letterSpacing: "0.5px",
          }}
        >
          categories
        </h2>
      </div>

      <div className="bg-white rounded shadow-sm p-4 mb-4">
        <CategoryForm onCategoryAdded={fetchCategories} />
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <small className="text-muted">Showing {paginated.length} of {categories.length} categories</small>
        <select
          className="form-select form-select-sm w-auto"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="id">Sort by ID</option>
          <option value="group">Sort by Group</option>
          <option value="type">Sort by Type</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : paginated.length === 0 ? (
        <p className="text-center text-muted">No categories found</p>
      ) : (
        <table className="table table-borderless align-middle">
          <thead className="small text-muted text-uppercase" style={{ fontFamily: 'Urbanist, sans-serif', fontWeight: 600 }}>
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">Group</th>
              <th className="py-2">Type</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody style={{ fontFamily: 'Urbanist, sans-serif', fontSize: '0.95rem' }}>
            {paginated.map((cat) => (
              <tr key={cat.id} className="border-bottom">
                {editingId === cat.id ? (
                  <>
                    <td><input name="name" value={editData.name} onChange={handleEditChange} className="form-control form-control-sm" /></td>
                    <td><input name="group" value={editData.group} onChange={handleEditChange} className="form-control form-control-sm" /></td>
                    <td><input name="type" value={editData.type} onChange={handleEditChange} className="form-control form-control-sm" /></td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-success" onClick={handleUpdate}>Save</button>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="fw-semibold text-dark py-2">{cat.name}</td>
                    <td className="text-muted py-2">{cat.group}</td>
                    <td className="text-muted py-2">{cat.type}</td>
                    <td className="py-2">
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-light p-1 border" onClick={() => handleEdit(cat)}><Pencil size={16} /></button>
                        <button className="btn btn-sm btn-light p-1 border" onClick={() => handleDelete(cat.id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </>
                )}
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
    </div>
  );
}
