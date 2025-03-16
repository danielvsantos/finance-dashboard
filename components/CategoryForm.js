import { useState } from "react";
import axios from "axios";
import { getSession } from "next-auth/react";

export default function CategoryForm({ onCategoryAdded }) {
    const [formData, setFormData] = useState({ name: "", plCategory: "" });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting Category Data:", JSON.stringify(formData, null, 2)); // Logs data clearly
        const session = await getSession(); // Get the session object
        if (!session) {
        console.error("No session found. User not authenticated."); 
        return;
        }

        try {
            console.log("Submitting Category Data:", JSON.stringify(formData, null, 2)); // Logs data clearly
            
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/categories`, formData, {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`, // Explicitly send session token
                    "Content-Type": "application/json"
                }
            });
    
            console.log("Category Created:", response.data);
            setFormData({ name: "", plCategory: "" });
            onCategoryAdded();
        } catch (error) {
            console.error("Error creating category:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
                <label className="form-label">Category Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" required />
            </div>
            <div className="col-md-6">
                <label className="form-label">P&L Category</label>
                <input type="text" name="plCategory" value={formData.plCategory} onChange={handleChange} className="form-control" required />
            </div>
            <button type="submit" className="btn btn-primary mt-3">Submit</button>
        </form>
    );
}
