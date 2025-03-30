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

    if (req.method === 'GET') {
      return await handleGet(req, res);
    }

    res.setHeader('Allow', ['GET']);
    return res.status(StatusCodes.METHOD_NOT_ALLOWED).end();
  } catch (error) {
    Sentry.captureException(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Server Error',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
}

async function handleGet(req, res) {
  const { account, category } = req.query;

  const filters = {};
  if (account) filters.account = account;
  if (category) filters.category = category;

  try {
    const holdings = await prisma.portfolioHolding.findMany({
      where: filters,
      orderBy: { ticker: 'asc' }
    });

    return res.status(StatusCodes.OK).json(holdings);
  } catch (error) {
    Sentry.captureException(error);
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Failed to fetch portfolio holdings',
      details: error.message,
    });
  }
}
