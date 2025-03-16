import Link from 'next/link';

export default function Home() {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center text-center" style={{ backgroundColor: '#f4f7fc', minHeight: '100vh', width: '100vw' }}>
            <h1 className="text-primary fw-bold mb-4">Bataty Finance</h1>
            
            <div className="container">
                <div className="row g-3 justify-content-center">
                    <div className="col-md-5">
                        <Link href="/transactions" passHref>
                            <button className="btn btn-primary w-100 shadow-sm py-3 rounded">Transactions</button>
                        </Link>
                    </div>
                    <div className="col-md-5">
                        <Link href="/P&L" passHref>
                            <button className="btn btn-primary w-100 shadow-sm py-3 rounded">P&L</button>
                        </Link>
                    </div>
                    <div className="col-md-5">
                        <Link href="/dashboard" passHref>
                            <button className="btn btn-primary w-100 shadow-sm py-3 rounded">Expense Dashboard</button>
                        </Link>
                    </div>
                    <div className="col-md-5">
                        <Link href="/portfolio" passHref>
                            <button className="btn btn-primary w-100 shadow-sm py-3 rounded">Portfolio</button>
                        </Link>
                    </div>
                    <div className="col-md-5">
                        <Link href="/accounts" passHref>
                            <button className="btn btn-primary w-100 shadow-sm py-3 rounded">Accounts</button>
                        </Link>
                    </div>
                    <div className="col-md-5">
                        <Link href="/categories" passHref>
                            <button className="btn btn-primary w-100 shadow-sm py-3 rounded">Categories</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
