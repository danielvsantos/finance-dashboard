import React from "react";

export default function PnLTable({ data, view }) {
  if (!data || Object.keys(data).length === 0) return <p>No data to display</p>;

  const periods = Object.keys(data);

  // Extract all macro categories and their children
  const structuredData = {};
  periods.forEach((period) => {
    const entries = data[period];
    entries.forEach(({ plMacroCategory, data: categoryData }) => {
      if (!structuredData[plMacroCategory]) {
        structuredData[plMacroCategory] = new Set();
      }
      Object.keys(categoryData).forEach((plCategory) => {
        structuredData[plMacroCategory].add(plCategory);
      });
    });
  });

  return (
    <div className="table-responsive mt-4">
      <table className="table table-bordered table-sm">
        <thead className="table-dark">
          <tr>
            <th>Macro Category / Category</th>
            {periods.map((period) => (
              <th key={period} className="text-center">{period}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(structuredData).map(([macro, categories]) => (
            <React.Fragment key={macro}>
              <tr className="table-primary">
                <td colSpan={periods.length + 1}><strong>{macro}</strong></td>
              </tr>
              {[...categories].map((cat) => (
                <tr key={cat}>
                  <td>{cat}</td>
                  {periods.map((period) => {
                    const entry = data[period].find(e => e.plMacroCategory === macro);
                    const categoryInfo = entry?.data?.[cat];
                    const result = categoryInfo
                      ? (categoryInfo.revenue || 0) + (categoryInfo.expenses || 0)
                      : 0;
                    return <td key={period} className="text-end">{result.toFixed(2)}</td>;
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
