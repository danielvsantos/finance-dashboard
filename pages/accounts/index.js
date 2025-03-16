import { useState, useEffect } from "react";
import axios from "axios";
import AccountForm from "../../components/AccountForm";

export default function AccountsPage() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAccounts();
    }, []);

    async function fetchAccounts() {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET}`
                }
            });
            setAccounts(response.data);
        } catch (error) {
            console.error("Error fetching accounts:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container mt-5">
            <h1 className="text-primary text-center">Accounts</h1>

            <div className="card p-4 shadow mb-4">
                <AccountForm onAccountAdded={fetchAccounts} />
            </div>

            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Country</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="3" className="text-center">Loading...</td></tr>
                        ) : accounts.length === 0 ? (
                            <tr><td colSpan="3" className="text-center text-muted">No accounts found</td></tr>
                        ) : (
                            accounts.map((account) => (
                                <tr key={account.id}>
                                    <td>{account.id}</td>
                                    <td>{account.name}</td>
                                    <td>{account.country}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
