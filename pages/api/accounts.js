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
    const { id } = req.query;
  
    if (id) {
      const accountId = parseInt(id, 10);
      if (isNaN(accountId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid account ID' });
      }
  
      const account = await prisma.account.findUnique({
        where: { id: accountId }
      });
  
      if (!account) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'Account not found' });
      }
  
      return res.status(StatusCodes.OK).json(account);
    }
  
    const account = await prisma.account.findMany({
      orderBy: { id: 'asc' },
    });
  
    return res.status(StatusCodes.OK).json(account);
  }


  async function handlePost(req, res, session) {
    try {
      const { name, accountNumber, bank, currency, country, owner } = req.body;
  
      if (!name || !accountNumber || !bank || !currency || !country || !owner) {
        return res.status(400).json({ message: "Missing required fields: name, accountNumber, bank, currency, country, owner" });
      }
  
      const newAccount = await prisma.account.create({
        data: {
          name,
          accountNumber,
          bank,
          currency,
          country,
          owner,
        }
      });
  
      await prisma.auditLog.create({
        data: {
          userId: session?.email || req.body.userId || "unknown-user",
          action: "CREATE",
          table: "Account",
          recordId: newAccount.id,
        },
      });
  
      return res.status(StatusCodes.CREATED).json(newAccount);
    } 
    catch (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Validation Failed',
        details: error.message,
      });
    }
  }
  
  async function handlePut(req, res, session) {
    try {
      const { id } = req.query;
      const { name, accountNumber, bank, currency, country, owner } = req.body;
      const accountId = parseInt(id, 10);
  
      if (isNaN(accountId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid account ID' });
      }
  
      const existingAccount = await prisma.account.findUnique({
        where: { id: accountId },
      });
  
      if (!existingAccount) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'Account not found' });
      }
  
      const updatedAccount = await prisma.account.update({
        where: { id: accountId },
        data: {
          name,
          accountNumber,
          bank,
          currency,
          country,
          owner,
        }
      });
  
      await prisma.auditLog.create({
        data: {
          userId: session?.email || req.body.userId || "unknown-user",
          action: "UPDATE",
          table: "Account",
          recordId: updatedAccount.id,
        },
      });
  
      return res.status(StatusCodes.OK).json(updatedAccount);
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
      const accountId = parseInt(id, 10);
      if (isNaN(accountId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid account ID' });
      }
  
      const existingAccount = await prisma.account.findUnique({
        where: { id: accountId },
      });
  
      if (!existingAccount) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'Account not found' });
      }
      
    const deleted = await prisma.account.delete({
        where: { id: parseInt(id, 10) },
    });
    await prisma.auditLog.create({
      data: {
        userId: session.email,
        action: "DELETE",
        table: "Account",
        recordId: deleted.id,
      },
    });
    return res.status(StatusCodes.NO_CONTENT).end();
  }
  catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Deletion Failed',
      details: error.message,
    });
  }
  }



