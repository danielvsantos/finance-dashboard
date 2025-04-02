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
  const { id, year, month, currencyFrom, currencyTo } = req.query;

  if (id) {
    const currencyRateId = parseInt(id, 10);
    if (isNaN(currencyRateId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid currency rate ID' });
    }

    const currencyRate = await prisma.currencyRate.findUnique({ where: { id: currencyRateId } });
    if (!currencyRate) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Currency Rate not found' });
    }

    return res.status(StatusCodes.OK).json(currencyRate);
  }

  const filters = {};
  if (year) filters.year = parseInt(year);
  if (month) filters.month = parseInt(month);
  if (currencyFrom) filters.currencyFrom = currencyFrom.toUpperCase();
  if (currencyTo) filters.currencyTo = currencyTo.toUpperCase();

  const currencyRate = await prisma.currencyRate.findMany({
    where: filters,
    orderBy: { id: 'asc' },
  });

  return res.status(StatusCodes.OK).json(currencyRate);
}

async function handlePost(req, res, session) {
  try {
    const { year, month, currencyFrom, currencyTo, value } = req.body;
    if (!year || !month || !currencyFrom || !currencyTo || !value) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newCurrencyRate = await prisma.currencyRate.upsert({
      where: {
        year_month_currencyFrom_currencyTo: {
          year: parseInt(year),
          month: parseInt(month),
          currencyFrom: currencyFrom.toUpperCase(),
          currencyTo: currencyTo.toUpperCase()
        },
      },
      update: {
        value: parseFloat(value),
        updatedAt: new Date(),
      },
      create: {
        year: parseInt(year),
        month: parseInt(month),
        currencyFrom: currencyFrom.toUpperCase(),
        currencyTo: currencyTo.toUpperCase(),
        value: parseFloat(value),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session?.email || req.body.userId || "unknown-user",
        action: "CREATE",
        table: "Currency Rate",
        recordId: newCurrencyRate.id,
      },
    });

    return res.status(StatusCodes.CREATED).json(newCurrencyRate);
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Validation Failed',
      details: error.message,
    });
  }
}

async function handlePut(req, res, session) {
  try {
    const { id } = req.query;
    const { year, month, currencyFrom, currencyTo, value } = req.body;

    const currencyRateId = parseInt(id, 10);
    if (isNaN(currencyRateId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid currency rate ID' });
    }

    const existing = await prisma.currencyRate.findUnique({ where: { id: currencyRateId } });
    if (!existing) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Currency Rate not found' });
    }

    const updated = await prisma.currencyRate.update({
      where: { id: currencyRateId },
      data: {
        year: parseInt(year),
        month: parseInt(month),
        currencyFrom: currencyFrom.toUpperCase(),
        currencyTo: currencyTo.toUpperCase(),
        value: parseFloat(value),
        updatedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session?.email || req.body.userId || "unknown-user",
        action: "UPDATE",
        table: "Currency Rate",
        recordId: updated.id,
      },
    });

    return res.status(StatusCodes.OK).json(updated);
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Validation Failed',
      details: error.message,
    });
  }
}

async function handleDelete(req, res, session) {
  try {
    const { id } = req.query;
    const currencyRateId = parseInt(id, 10);
    if (isNaN(currencyRateId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid currency rate ID' });
    }

    const existing = await prisma.currencyRate.findUnique({ where: { id: currencyRateId } });
    if (!existing) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Currency Rate not found' });
    }

    const deleted = await prisma.currencyRate.delete({ where: { id: currencyRateId } });

    await prisma.auditLog.create({
      data: {
        userId: session.email,
        action: "DELETE",
        table: "Currency Rate",
        recordId: deleted.id,
      },
    });

    return res.status(StatusCodes.NO_CONTENT).end();
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Deletion Failed',
      details: error.message,
    });
  }
}
