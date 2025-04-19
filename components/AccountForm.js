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
    console.log("Submitting Account Data:", JSON.stringify(formData, null, 2));
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

      console.log("Account Created:", response.data);

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
      <div className="col-md-4">
        <label className="form-label">Account Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" required />
      </div>

      <div className="col-md-4">
        <label className="form-label">Account Number</label>
        <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="form-control" />
      </div>

      <div className="col-md-4">
        <label className="form-label">Bank</label>
        <input type="text" name="bank" value={formData.bank} onChange={handleChange} className="form-control" />
      </div>

      <div className="col-md-4">
        <label className="form-label">Currency</label>
        <input type="text" name="currency" value={formData.currency} onChange={handleChange} className="form-control" />
      </div>

      <div className="col-md-4">
        <label className="form-label">Country</label>
        <input type="text" name="country" value={formData.country} onChange={handleChange} className="form-control" required />
      </div>

      <div className="col-md-4">
        <label className="form-label">Owner</label>
        <input type="text" name="owner" value={formData.owner} onChange={handleChange} className="form-control" />
      </div>

      <div className="col-12">
        <button type="submit" className="btn btn-primary mt-2">Add Account</button>
      </div>
    </form>
  );
}
