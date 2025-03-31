import React, { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import SimpleChat from '../components/SimpleChat';
import Link from 'next/link';

export default function HomePage() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    getSession().then(setSession);
  }, []);

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">Welcome to Bliss Finance Dashboard</h1>

      {/* Embedded BLISS Assistant */}
      <div className="card mb-5 p-4 shadow-sm">
        <SimpleChat />
      </div>

      {/* Main Navigation Buttons */}
      <div className="row g-4">
        <div className="col-md-3 d-grid">
          <Link href="/transactions" className="btn btn-outline-primary">
            💰 Transactions
          </Link>
        </div>
        <div className="col-md-3 d-grid">
          <Link href="/accounts" className="btn btn-outline-success">
            🏦 Accounts
          </Link>
        </div>
        <div className="col-md-3 d-grid">
          <Link href="/categories" className="btn btn-outline-info">
            🏷️ Categories
          </Link>
        </div>
        <div className="col-md-3 d-grid">
          <Link href="/portfolio" className="btn btn-outline-dark">
            📈 Portfolio
          </Link>
        </div>
        <div className="col-md-3 d-grid">
          <Link href="/pnl" className="btn btn-outline-warning">
            📊 P&L
          </Link>
        </div>
        <div className="col-md-3 d-grid">
          <Link href="/dashboard" className="btn btn-outline-secondary">
            📉 Dashboard
          </Link>
        </div>
        <div className="col-md-3 d-grid">
          <Link href="/currency" className="btn btn-outline-danger">
            💱 Currency Rates
          </Link>
        </div>
        <div className="col-md-3 d-grid">
          <Link href="/assistant" className="btn btn-outline-primary">
            🤖 BLISS Assistant
          </Link>
        </div>
      </div>
    </div>
  );
}