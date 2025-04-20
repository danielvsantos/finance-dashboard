import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Head from "next/head";

export default function AppLayout(props) {
  const { children } = props;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sections = [
    {
      title: "Analytics",
      items: [
        { name: "📉 Dashboard", href: "/dashboard" },
        { name: "📊 P&L", href: "/pnl" },
        { name: "📈 Portfolio", href: "/portfolio" }
      ]
    },
    {
      title: "Database",
      items: [
        { name: "💰 Transactions", href: "/transactions" },
        { name: "🏦 Accounts", href: "/accounts" },
        { name: "🏷️ Categories", href: "/categories" },
        { name: "💱 Currency Rates", href: "/currency-rates" }
      ]
    },
    {
      title: "Talk to bliss",
      items: [
        { name: "🤖 Import Assistant", href: "/import-assistant" }
      ]
    }
  ];

  const Logo = () => (
    <div className="text-center py-3 border-bottom">
      <span
        style={{
          fontFamily: 'Urbanist, sans-serif',
          fontSize: '1.75rem',
          fontWeight: 700,
          textTransform: 'lowercase',
          color: '#1e3a8a',
          letterSpacing: '0.5px'
        }}
      >
        bliss
      </span>
    </div>
  );

  const Header = () => {
    if (!isMobile) return null;
    return (
      <nav className="navbar bg-white border-bottom px-3 shadow-sm">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <Logo />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-outline-secondary btn-sm"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
    );
  };

  const renderNav = () => (
    <>
      {sections.map(section => (
        <div key={section.title} className="mb-3">
          <div className="small text-muted text-uppercase px-2 mb-1" style={{ fontFamily: 'Urbanist, sans-serif', fontWeight: 600 }}>{section.title}</div>
          {section.items.map(item => (
            <Link
              key={item.name}
              href={item.href}
              className="nav-link text-dark fw-medium px-2 py-1 rounded hover-bg-primary-subtle"
            >
              {item.name}
            </Link>
          ))}
        </div>
      ))}
    </>
  );

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@600;700&display=swap" rel="stylesheet" />
      </Head>
      <div className="d-flex vh-100 overflow-hidden bg-light">
        {/* Sidebar (desktop) */}
        {!isMobile && (
          <div className="d-flex flex-column bg-white border-end shadow-sm" style={{ width: '260px' }}>
            <Logo />
            <nav className="nav flex-column p-3 gap-2">
              {renderNav()}
            </nav>
          </div>
        )}

        <div className="flex-grow-1 d-flex flex-column overflow-hidden position-relative">
          {/* Mobile Header */}
          <Header />

          {/* Mobile Menu */}
          {isMobile && mobileMenuOpen && (
            <div className="bg-white border-bottom shadow-sm p-3 position-relative zindex-tooltip">
              <nav className="nav flex-column gap-2">
                {renderNav()}
              </nav>
            </div>
          )}

          {/* Main content */}
          <main className="flex-grow-1 overflow-auto p-4">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
