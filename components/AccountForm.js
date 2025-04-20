import { useState } from "react";
import axios from "axios";
import { getSession } from "next-auth/react";

export default function AccountForm({ onAccountAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    accountNumber: "",
    bank: "",
    currency: "",
    country: "",
    owner: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const session = await getSession();
    if (!session) {
      console.error("No session found. User not authenticated.");
      return;
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, formData, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      setFormData({
        name: "",
        accountNumber: "",
        bank: "",
        currency: "",
        country: "",
        owner: "",
      });

      onAccountAdded();
    } catch (error) {
      console.error("Error creating account:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="row g-3">
      {[
        { name: "name", label: "Account Name", required: true },
        { name: "accountNumber", label: "Account Number" },
        { name: "bank", label: "Bank" },
        { name: "currency", label: "Currency" },
        { name: "country", label: "Country", required: true },
        { name: "owner", label: "Owner" }
      ].map(({ name, label, required }) => (
        <div className="col-md-4" key={name}>
          <label className="form-label fw-semibold" style={{ fontFamily: 'Urbanist, sans-serif', fontSize: '0.9rem' }}>
            {label}
          </label>
          <input
            type="text"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            required={required}
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
