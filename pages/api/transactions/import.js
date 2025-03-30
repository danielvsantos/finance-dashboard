import { getToken } from 'next-auth/jwt';
import { StatusCodes } from 'http-status-codes';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import prisma from '../../../prisma/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const token = await getToken({ req });
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
  }

  if (req.method !== 'POST') {
    return res.status(StatusCodes.METHOD_NOT_ALLOWED).end();
  }

  const form = formidable({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Formidable error:", err);
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'File parsing error' });
    }

    const file = files.file;
    if (!file || !file[0]?.filepath) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'No file uploaded' });
    }

    try {
      const csv = fs.readFileSync(file[0].filepath, 'utf-8');
      console.log("✅ CSV file loaded.");

      const parsed = Papa.parse(csv, { header: true });
      const rows = parsed.data;
      const transactions = [];

      for (const row of rows) {
        if (!row.transaction_date || !row.accountId || !row.categoryId) {
          console.warn("⚠️ Missing required fields:", row);
          continue;
        }

        const [day, month, year] = row.transaction_date.split("/");
        const dateObj = new Date(`${year}-${month}-${day}`);
        const quarter = `Q${Math.ceil(parseInt(month) / 3)}`;

        transactions.push({
          transaction_date: dateObj,
          accountId: parseInt(row.accountId),
          categoryId: parseInt(row.categoryId),
          description: row.description || "",
          details: row.details || "",
          credit: row.credit ? parseFloat(row.credit) : null,
          debit: row.debit ? parseFloat(row.debit) : null,
          currency: row.currency || "USD",
          transfer: row.transfer?.toLowerCase() === "true",
          numOfShares: parseFloat(row.numOfShares || 0),
          price: parseFloat(row.price || 0),
          ticker: row.ticker || "",
          userId: token.sub,
          year: parseInt(year),
          month: parseInt(month),
          quarter,
          day: parseInt(day)
        });
      }

      console.log(`✅ Parsed ${transactions.length} valid transactions.`);

      if (transactions.length > 0) {
        await prisma.transaction.createMany({ data: transactions });
        console.log(`✅ Inserted ${transactions.length} transactions.`);
      }

      return res.status(StatusCodes.CREATED).json({ message: `${transactions.length} transactions imported.` });
    } catch (error) {
      console.error("❌ Import Error:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Import Failed',
        details: error.message
      });
    }
  });
}
