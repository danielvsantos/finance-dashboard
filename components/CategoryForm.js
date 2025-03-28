import { useState } from "react";
import { getSession } from "next-auth/react";
import axios from "axios";

export default function CategoryForm({ onCategoryAdded }) {
    const [formData, setFormData] = useState({
        name: "",
        plCategory: "",
        plMacroCategory: ""
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

            setFormData({ name: "", plCategory: "", plMacroCategory: "" });
            onCategoryAdded();
        } catch (error) {
            console.error("Error creating category:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-4">
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

            <div className="col-md-4">
                <label className="form-label">P&L Category</label>
                <input
                    type="text"
                    name="plCategory"
                    value={formData.plCategory}
                    onChange={handleChange}
                    className="form-control"
                    required
                />
            </div>

            <div className="col-md-4">
                <label className="form-label">Macro Category</label>
                <input
                    type="text"
                    name="plMacroCategory"
                    value={formData.plMacroCategory}
                    onChange={handleChange}
                    className="form-control"
                    required
                />
            </div>

            <div className="col-12">
                <button type="submit" className="btn btn-primary">Add Category</button>
            </div>
        </form>
    );
}
