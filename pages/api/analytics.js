import { getToken } from 'next-auth/jwt';
import prisma from '../../prisma/prisma.js';
import { StatusCodes } from 'http-status-codes';
import * as Sentry from '@sentry/nextjs';

export default async function handler(req, res) {
  
    try {
  
      const session = await getToken({ req });
      if (!session) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
      }
  
      switch (req.method) {
        case 'GET':
          return handleGet(req, res, session);
        case 'POST':
          return handlePost(req, res, session);
        case 'PUT':
          return handlePut(req, res, session);
        case 'DELETE':
          return handleDelete(req, res, session);
        default:
          res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
          return res.status(StatusCodes.METHOD_NOT_ALLOWED).end();
      }
    } catch (error) {
      Sentry.captureException(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { details: error.message }),
      });
    }
  }

async function handleGet(req, res) {
  const {
    currency = "USD",
    countries = [],
    view = "year", // 'year', 'quarter', or 'month'
    years = [],
    startMonth,
    endMonth,
    startQuarter,
    endQuarter,
    plMacroCategories = []
  } = req.query;

  const selectedCountries = typeof countries === "string" ? [countries] : countries;
  const yearArray = typeof years === "string" ? [parseInt(years)] : years.map(Number);
  const selectedMacroCats = typeof plMacroCategories === "string" ? [plMacroCategories] : plMacroCategories;

  const filters = {
    currency,
    ...(selectedCountries.length && { country: { in: selectedCountries } }),
    ...(selectedMacroCats.length && { plMacroCategory: { in: selectedMacroCats } })
  };

  if (view === "year") {
    filters.year = { in: yearArray };
  } 
  else if (view === "month") {
    const [startYear, startMonthNum] = startMonth.split("-").map(Number);
    const [endYear, endMonthNum] = endMonth.split("-").map(Number);
  
    filters.OR = [];
  
    for (let year = startYear; year <= endYear; year++) {
      const minMonth = year === startYear ? startMonthNum : 1;
      const maxMonth = year === endYear ? endMonthNum : 12;
  
      filters.OR.push({
        year,
        month: {
          gte: minMonth,
          lte: maxMonth,
        },
      });
    }
  } 
  else if (view === "quarter") {
    const [startYear, startQ] = startQuarter.split("-Q").map((val, idx) => idx === 1 ? parseInt(val) : parseInt(val));
    const [endYear, endQ] = endQuarter.split("-Q").map((val, idx) => idx === 1 ? parseInt(val) : parseInt(val));

    filters.OR = [];
    for (let year = startYear; year <= endYear; year++) {
      const minQ = year === startYear ? startQ : 1;
      const maxQ = year === endYear ? endQ : 4;
      for (let q = minQ; q <= maxQ; q++) {
        const startMonth = (q - 1) * 3 + 1;
        const endMonth = startMonth + 2;
        filters.OR.push({
          year,
          month: { gte: startMonth, lte: endMonth },
        });
      }
    }
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
      grouped[key] = [];
    }

    const enrichedData = {};
    for (const cat in row.data) {
      enrichedData[cat] = {
        revenue: row.data[cat].revenue || 0,
        expenses: row.data[cat].expenses || 0,
        revenueOriginal: row.data[cat].revenueOriginal || 0,
        expensesOriginal: row.data[cat].expensesOriginal || 0,
      };
    }

    grouped[key].push({
      country: row.country,
      plMacroCategory: row.plMacroCategory,
      revenue: row.revenue,
      expenses: row.expenses,
      revenueOriginal: row.revenueOriginal,
      expensesOriginal: row.expensesOriginal,
      data: enrichedData
    });
  }
  
    return res.status(StatusCodes.OK).json({ currency, view, data: grouped });
  }

  async function handlePost(req, res, session) {
    return res.status(StatusCodes.NOT_IMPLEMENTED).json({ error: "POST not implemented" });
  }
  
  async function handlePut(req, res, session) {
    return res.status(StatusCodes.NOT_IMPLEMENTED).json({ error: "PUT not implemented" });
  }
  
  async function handleDelete(req, res, session) {
    return res.status(StatusCodes.NOT_IMPLEMENTED).json({ error: "DELETE not implemented" });
  }