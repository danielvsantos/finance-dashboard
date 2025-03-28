import Link from "next/link";
import Head from "next/head";

export default function HomePage() {
    return (
        <>
            <Head>
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"
                />
            </Head>
            <div className="min-vh-100 bg-light d-flex flex-column justify-content-center align-items-center">
                <h1 className="text-primary mb-5">Bataty Finance</h1>
                <div className="container">
                    <div className="row g-3 justify-content-center">

                        <HomeButton href="/transactions" icon="bi-list-check" text="Transactions" style="primary" />
                        <HomeButton href="/pnl" icon="bi-graph-up" text="P&L" style="success" />
                        <HomeButton href="/dashboard" icon="bi-pie-chart" text="Expense Dashboard" style="info" />
                        <HomeButton href="/portfolio" icon="bi-bar-chart-line" text="Portfolio" style="secondary" />
                        <HomeButton href="/accounts" icon="bi-wallet2" text="Accounts" style="warning" />
                        <HomeButton href="/categories" icon="bi-tags" text="Categories" style="danger" />
                        <HomeButton href="/currency-rates" icon="bi-currency-exchange" text="Currency Rates" style="dark" />

                    </div>
                </div>
            </div>
        </>
    );
}

function HomeButton({ href, icon, text, style }) {
    return (
        <div className="col-6 col-md-4 col-lg-3">
            <Link href={href} className={`btn btn-outline-${style} w-100 py-3 d-flex align-items-center justify-content-center shadow-sm`}>
                <i className={`bi ${icon} me-2`}></i> {text}
            </Link>
        </div>
    );
}