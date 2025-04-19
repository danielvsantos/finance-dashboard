import { useState } from "react";
import { getSession } from "next-auth/react";
import axios from "axios";

export default function CategoryForm({ onCategoryAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    group: "",
    type: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const session = await getSession();
      if (!session) throw new Error("User not authenticated");

      await axios.post("/api/categories", formData, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`
        }
      });

      setFormData({
        name: "",
        group: "",
        type: ""
      });

      onCategoryAdded();
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="row g-3">
      <div className="col-md-3">
        <label className="form-label">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>

      <div className="col-md-3">
        <label className="form-label">Group</label>
        <input
          type="text"
          name="group"
          value={formData.group}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>

      <div className="col-md-3">
        <label className="form-label">Type</label>
        <input
          type="text"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>

      <div className="col-12">
        <button type="submit" className="btn btn-primary">
          Add Category
        </button>
      </div>
    </form>
  );
}
