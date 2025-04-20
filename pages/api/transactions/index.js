import { getToken } from 'next-auth/jwt';
import prisma from '../../../prisma/prisma.js';
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

async function handleGet(req, res, session) {
  const { id, year, month, quarter, categoryId, accountId, group, type } = req.query;

  if (id) {
    const transactionId = parseInt(id, 10);
    if (isNaN(transactionId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid transaction ID' });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        account: { select: { name: true } },
        category: { select: { name: true, group: true, type: true } },
      },
    });

    if (!transaction) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Transaction not found' });
    }

    return res.status(StatusCodes.OK).json(transaction);
  }

  const filters = {
    ...(year && { year: parseInt(year, 10) }),
    ...(month && { month: parseInt(month, 10) }),
    ...(quarter && { quarter }),
    ...(categoryId && { categoryId: parseInt(categoryId, 10) }),
    ...(accountId && { accountId: parseInt(accountId, 10) }),
    ...(group && { category: { group } }),
    ...(type && { category: { type } }),
  };

  const transactions = await prisma.transaction.findMany({
    where: filters,
    include: {
      account: { select: { name: true } },
      category: { select: { name: true, group: true, type: true } },
    },
    orderBy: { transaction_date: 'desc' },
  });

  return res.status(StatusCodes.OK).json(transactions);
}

async function handlePost(req, res, session) {
  try {
    const { transaction_date, categoryId, accountId, description, details, credit, debit, currency, numOfShares, price, ticker } = req.body;
    console.log("Incoming Transaction Data:", req.body);

    const date = new Date(transaction_date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const quarter = `Q${Math.ceil(month / 3)}`;

    const newTransaction = await prisma.transaction.create({
      data: {
        userId: session.email || req.body.userId || "unknown-user",
        transaction_date: date,
        year,
        quarter,
        month,
        day,
        categoryId: parseInt(categoryId, 10),
        accountId: parseInt(accountId, 10),
        description,
        details,
        credit: credit ? parseFloat(credit) : null,
        debit: debit ? parseFloat(debit) : null,
        currency,
        numOfShares: numOfShares ? parseFloat(numOfShares) : null,
        price: price ? parseFloat(price) : null,
        ticker,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.email || req.body.userId || "unknown-user",
        action: "CREATE",
        table: "Transaction",
        recordId: newTransaction.id,
      },
    });

    return res.status(StatusCodes.CREATED).json(newTransaction);
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
    const transactionId = parseInt(id, 10);
    if (isNaN(transactionId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid transaction ID' });
    }

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!existingTransaction) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Transaction not found' });
    }

    const { transaction_date, categoryId, accountId, description, details, credit, debit, currency, numOfShares, price, ticker } = req.body;
    console.log("Incoming Transaction Data:", req.body);

    const date = new Date(transaction_date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const quarter = `Q${Math.ceil(month / 3)}`;

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        userId: session?.email || req.body.userId || "unknown-user",
        transaction_date: date,
        year,
        quarter,
        month,
        day,
        categoryId: parseInt(categoryId, 10),
        accountId: parseInt(accountId, 10),
        description,
        details,
        credit: credit ? parseFloat(credit) : null,
        debit: debit ? parseFloat(debit) : null,
        currency,
        numOfShares: numOfShares ? parseFloat(numOfShares) : null,
        price: price ? parseFloat(price) : null,
        ticker,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session?.email || req.body.userId || "unknown-user",
        action: "UPDATE",
        table: "Transaction",
        recordId: updatedTransaction.id,
      },
    });

    return res.status(StatusCodes.OK).json(updatedTransaction);
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Update Failed',
      details: error.message,
    });
  }
}

async function handleDelete(req, res, session) {
  try {
    const { id } = req.query;
    const transactionId = parseInt(id, 10);
    if (isNaN(transactionId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid transaction ID' });
    }

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!existingTransaction || existingTransaction.userId !== session.email) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Transaction not found' });
    }

    const deleted = await prisma.transaction.delete({
      where: { id: transactionId },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.email,
        action: "DELETE",
        table: "Transaction",
        recordId: deleted.id,
      },
    });

    return res.status(StatusCodes.NO_CONTENT).end();
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Deletion Failed',
      details: error.message,
    });
  }
}