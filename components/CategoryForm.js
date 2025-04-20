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
      {[
        { name: "name", label: "Name" },
        { name: "group", label: "Group" },
        { name: "type", label: "Type" },
      ].map(({ name, label }) => (
        <div className="col-md-4" key={name}>
          <label className="form-label fw-semibold" style={{ fontFamily: 'Urbanist, sans-serif', fontSize: '0.9rem' }}>
            {label}
          </label>
          <input
            type="text"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            required
            className="form-control rounded border shadow-sm"
            style={{ fontFamily: 'Urbanist, sans-serif', fontSize: '0.95rem' }}
          />
        </div>
      ))}

      <div className="col-12">
        <button
          type="submit"
          className="btn btn-primary mt-3 px-4"
          style={{ fontFamily: 'Urbanist, sans-serif', textTransform: 'lowercase' }}
        >
          save
        </button>
      </div>
    </form>
  );
}
