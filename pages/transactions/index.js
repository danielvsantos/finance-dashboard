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
                            <th>Currency</th>
                            <th>Category</th>
                            <th>P&L Category</th>
                            <th>Account</th>
                            <th>Country</th>
                            <th>Ticker</th>
                            <th># of Shares</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="10" className="text-center">Loading...</td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="text-center text-muted">No transactions found</td>
                            </tr>
                        ) : (
                            transactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td>{new Date(transaction.transaction_date).toLocaleDateString('en-GB')}</td>
                                    <td>{transaction.description}</td>
                                    <td>{transaction.credit || "-"}</td>
                                    <td>{transaction.debit || "-"}</td>
                                    <td>{transaction.currency || "-"}</td>
                                    <td>{transaction.category?.name || "N/A"}</td>
                                    <td>{transaction.category?.plCategory || "N/A"}</td>
                                    <td>{transaction.account?.name || "N/A"}</td>
                                    <td>{transaction.account?.country || "N/A"}</td>
                                    <td>{transaction.ticker || "-"}</td>
                                    <td>{transaction.numOfShares || "-"}</td>
                                    <td>{transaction.price || "-"}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}