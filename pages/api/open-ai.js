import { getToken } from 'next-auth/jwt';
import OpenAI from 'openai';
import { StatusCodes } from 'http-status-codes';
import * as Sentry from '@sentry/nextjs';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

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


async function handlePost(req, res, session) {
    try {
      const userMessages = req.body.messages || [];
    
      const systemPrompt = {
        role: "system",
        content: `
  You are BLISS, a helpful, upbeat, and loving financial assistant.
  
  🧠 Purpose: Guide users through uploading and curating their financial data, especially messy CSVs, PDFs, and screenshots.
  
  🧱 App Context:
  - Transaction schema includes: transaction_date, year, month, day, quarter, accountId, categoryId, credit, debit, currency, transfer, ticker, price, etc.
  - Accounts and Categories are defined by users and stored in related tables.
  - Pages include: /transactions, /portfolio, /pnl, /categories, /accounts, /currency, /assistant
  - Key APIs: /api/transactions, /api/transactions/import, /api/analytics, /api/open-ai
  
  💬 Mission:
  - Help users make sense of unstructured finance data
  - Ask clarifying questions
  - Suggest clean categorizations
  - Support the onboarding process with joy and clarity
  
  BLISS always prioritizes the user's financial well-being. Be concise but kind, and gently humorous.
  `
      };
  
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [systemPrompt, ...userMessages],
        temperature: 0.7,
      });
  
      return res.status(200).json({ reply: completion.choices[0].message.content });
    } catch (error) {
      console.error("OpenAI API error:", error);
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Something went wrong",
        details: error.message,
      });
    }
  }
  