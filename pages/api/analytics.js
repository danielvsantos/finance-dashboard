import prisma from '../../prisma/prisma.js';
import { getToken } from "next-auth/jwt";




export default async function handler(req, res) {
  const token = await getToken({ req });
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const {
      currency = "USD",
      countries = [],
      view = "year", // 'year', 'quarter', or 'month'
      years = [],
      startMonth,
      endMonth,
      startQuarter,
      endQuarter
    } = req.query;

    const selectedCountries = typeof countries === "string" ? [countries] : countries;
    const yearArray = typeof years === "string" ? [parseInt(years)] : years.map(Number);

    const filters = {
      currency,
      ...(selectedCountries.length && { country: { in: selectedCountries } })
    };

    if (view === "year") {
      filters.year = { in: yearArray };
    } else if (view === "month") {
      filters.year = { gte: parseInt(startMonth.split("-")[0]), lte: parseInt(endMonth.split("-")[0]) };
    } else if (view === "quarter") {
      filters.year = { gte: parseInt(startQuarter.split("-Q")[0]), lte: parseInt(endQuarter.split("-Q")[0]) };
    }

    const data = await prisma.analyticsCacheMonthly.findMany({
      where: filters
    });

    const grouped = {};

    for (const row of data) {
      let key;

      if (view === "year") {
        key = row.year;
      } else if (view === "quarter") {
        const quarter = `Q${Math.ceil(row.month / 3)}`;
        key = `${row.year}-${quarter}`;
      } else if (view === "month") {
        key = `${row.year}-${String(row.month).padStart(2, "0")}`;
      }

      if (!grouped[key]) {
        grouped[key] = {
          revenue: 0,
          expenses: 0,
          byCategory: {}
        };
      }

      grouped[key].revenue += row.revenue;
      grouped[key].expenses += row.expenses;

      for (const cat in row.data) {
        grouped[key].byCategory[cat] = (grouped[key].byCategory[cat] || 0) + row.data[cat];
      }
    }

    return res.status(200).json({ currency, view, data: grouped });
  } catch (error) {
    console.error("Error in analytics API:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
