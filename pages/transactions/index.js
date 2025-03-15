import { useState, useEffect } from "react";
import axios from "axios";
import TransactionForm from "../../components/TransactionForm";

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    async function fetchTransactions() {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET}`
                }
            });
            setTransactions(response.data);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container mt-5">
            <h1 className="text-primary text-center">Transactions</h1>

            {/* Bootstrap Card for Transaction Form */}
            <div className="card p-4 shadow mb-4">
                <TransactionForm onTransactionAdded={fetchTransactions} />
            </div>

            {/* Bootstrap Table for Transactions */}
            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead className="table-dark">
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Credit</th>
                            <th>Debit</th>
                            <th>Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center">Loading...</td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center text-muted">No transactions found</td>
                            </tr>
                        ) : (
                            transactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td>{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                                    <td>{transaction.description}</td>
                                    <td>{transaction.credit || "-"}</td>
                                    <td>{transaction.debit || "-"}</td>
                                    <td>{transaction.category?.category_name || "N/A"}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
