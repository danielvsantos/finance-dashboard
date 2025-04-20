// components/pnltable.js
import { useState } from "react";

export default function PnLTable({ data, view, currency, countries }) {
  const types = [
    "Revenue",
    "Asset Transfer",
    "Net Income",
    "Housing & Utilities",
    "Life Expenses",
    "Personal Development",
    "Net Profit",
    "Investments",
  ];

  const [expandedTypes, setExpandedTypes] = useState([]);

  const toggleExpand = (type) => {
    setExpandedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const formatCurrency = (val) => {
    const n = parseFloat(val);
    if (isNaN(n)) return "-";
    const formatted = n.toLocaleString(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return n < 0 ? <span className="text-danger">({formatted.replace("-", "")})</span> : formatted;
  };

  const sortKeysChronologically = (keys) => {
    const parseKey = (key) => {
      if (view === "year") return [parseInt(key), 0];
      if (view === "quarter") {
        const [year, quarter] = key.split("-Q");
        return [parseInt(year), parseInt(quarter)];
      }
      if (view === "month") {
        const [year, month] = key.split("-").map(Number);
        return [year, month];
      }
      return [0, 0];
    };
    return keys.sort((a, b) => {
      const [ya, ma] = parseKey(a);
      const [yb, mb] = parseKey(b);
      return ya !== yb ? ya - yb : ma - mb;
    });
  };

  const getColumnKeys = sortKeysChronologically(Object.keys(data));
  const columnCount = getColumnKeys.length;

  const collectValues = (type, group = null) => {
    return getColumnKeys.map((key) => {
      const entries = data[key].filter(
        (item) =>
          countries.includes(item.country) &&
          item.type === type &&
          (group ? item.group === group : true)
      );
      return entries.reduce((sum, e) => sum + e.balance, 0);
    });
  };

  const renderRow = (label, values, isTotal = false, isSub = false, percentOf = null) => (
    <tr className={`${isTotal ? "fw-semibold text-dark border-top align-middle" : isSub ? "text-muted" : ""}`}> 
      <td className={`${isTotal ? "pt-3 fw-semibold text-dark" : isSub ? "ps-4 text-muted small" : "ps-2"}`} style={{ fontSize: isSub ? '0.875rem' : isTotal ? '1rem' : '0.95rem' }}>{label}</td>
      {values.map((val, i) => {
        const pct = percentOf && percentOf[i] !== 0 ? ` (${Math.round((val / percentOf[i]) * 100)}%)` : "";
        return (
          <td key={i} className={`text-end ${isSub ? "text-muted small" : "align-middle"}`}> 
            {formatCurrency(val)}{pct}
          </td>
        );
      })}
    </tr>
  );

  const renderTypeRows = (type) => {
    if (type === "Net Income" || type === "Net Profit") return null;
    const values = collectValues(type);
    const showAll = expandedTypes.includes(type);

    const groupsWithValues = {};
    for (const key of getColumnKeys) {
      for (const item of data[key]) {
        if (countries.includes(item.country) && item.type === type) {
          groupsWithValues[item.group] = (groupsWithValues[item.group] || 0) + item.balance;
        }
      }
    }

    const sortedGroups = Object.entries(groupsWithValues)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .map(([group]) => group);

    const groupRows = sortedGroups
      .slice(0, showAll ? undefined : 3)
      .map((group) => renderRow(group, collectValues(type, group), false, true));

    return (
      <>
        {renderRow(type, values, true)}
        {groupRows}
        {sortedGroups.length > 3 && (
          <tr>
            <td colSpan={columnCount + 1} className="pt-2 pb-3">
              <button
                className="btn btn-sm btn-outline-secondary px-3 py-1 rounded-pill"
                onClick={() => toggleExpand(type)}
              >
                {showAll ? "Show Less" : "Show More"}
              </button>
            </td>
          </tr>
        )}
      </>
    );
  };

  const revenue = collectValues("Revenue");
  const assetTransfer = collectValues("Asset Transfer");
  const housing = collectValues("Housing & Utilities");
  const life = collectValues("Life Expenses");
  const personal = collectValues("Personal Development");

  const netIncome = revenue.map((v, i) => v + assetTransfer[i]);
  const netProfit = netIncome.map((v, i) => v + housing[i] + life[i] + personal[i]);

  return (
    <div className="table-responsive mt-4 bg-white p-4 rounded shadow-sm">
      <table className="table table-sm table-borderless mb-0">
        <thead>
          <tr className="border-bottom text-muted text-uppercase small align-bottom">
            <th style={{ width: '20%' }} className="text-start">Type</th>
            {getColumnKeys.map((key) => (
              <th key={key} className="text-end align-bottom">{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {types.map((type) => {
            if (type === "Net Income") return renderRow("Net Income", netIncome, true);
            if (type === "Net Profit") return renderRow("Net Profit", netProfit, true, false, netIncome);
            return renderTypeRows(type);
          })}
        </tbody>
      </table>
    </div>
  );
}
