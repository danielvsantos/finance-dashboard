import Link from "next/link";

export default function HomePage() {
    return (
        <div className="container text-center mt-5">
            <h1 className="text-primary mb-4">Bataty Finance</h1>
            <div className="d-flex flex-column align-items-center">
                <Link href="/transactions" className="btn btn-lg btn-primary mb-3 w-50">Transactions</Link>
                <Link href="/pnl" className="btn btn-lg btn-secondary mb-3 w-50">P&L</Link>
                <Link href="/dashboard" className="btn btn-lg btn-success mb-3 w-50">Expense Dashboard</Link>
                <Link href="/portfolio" className="btn btn-lg btn-warning mb-3 w-50">Portfolio</Link>
            </div>
        </div>
    );
}
