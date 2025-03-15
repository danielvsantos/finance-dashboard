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
        <div>
            <h1>Transactions</h1>
            <TransactionForm onTransactionAdded={fetchTransactions} />
            {loading ? <p>Loading...</p> : (
                <table border="1">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Credit</th>
                            <th>Debit</th>
                            <th>Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => (
                            <tr key={transaction.id}>
                                <td>{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                                <td>{transaction.description}</td>
                                <td>{transaction.credit || "-"}</td>
                                <td>{transaction.debit || "-"}</td>
                                <td>{transaction.category?.category_name || "N/A"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
