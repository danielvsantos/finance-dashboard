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
      const categoryId = parseInt(id, 10);
      if (isNaN(categoryId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid category ID' });
      }
  
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });
  
      if (!category) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'Category not found' });
      }
  
      return res.status(StatusCodes.OK).json(category);
    }
  
    const category = await prisma.category.findMany({
      orderBy: { id: 'asc' },
    });
  
    return res.status(StatusCodes.OK).json(category);
  }


  async function handlePost(req, res, session) {
    try {
    const { name, plCategory, plMacroCategory } = req.body;
    if (!name || !plCategory || !plMacroCategory) {
        return res.status(400).json({ message: "Missing required fields: name, plCategory, plMacroCategory" });
    }
  
    const newCategory = await prisma.category.create({
        data: { name, plCategory, plMacroCategory }
    });
    await prisma.auditLog.create({
      data: {
        userId: session?.email || req.body.userId || "unknown-user",
        action: "CREATE",
        table: "Category",
        recordId: newCategory.id,
      },
    });
    return res.status(StatusCodes.CREATED).json(newCategory);
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
      const { name, plCategory, plMacroCategory } = req.body;
      const categoryId = parseInt(id, 10);
      if (isNaN(categoryId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid category ID' });
      }
  
      const existingCategory = await prisma.category.findUnique({
        where: { id: categoryId },
      });
  
      if (!existingCategory) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'Category not found' });
      }
      
      const updatedCategory = await prisma.category.update({
        where: { id: parseInt(id, 10) },
        data: { name, plCategory, plMacroCategory }
    });
    await prisma.auditLog.create({
      data: {
        userId: session?.email || req.body.userId || "unknown-user",
        action: "UPDATE",
        table: "Category",
        recordId: updatedCategory.id,
      },
    });
    return res.status(StatusCodes.OK).json(updatedCategory);
  }
  catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Validation Failed',
      details: error.message,
    });
  }
  }

  async function handleDelete(req, res, session) {
    try {
      const { id } = req.query;
      const categoryId = parseInt(id, 10);
      if (isNaN(categoryId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid category ID' });
      }
  
      const existingCategory = await prisma.category.findUnique({
        where: { id: categoryId },
      });
  
      if (!existingCategory) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'Category not found' });
      }
      
    const deleted = await prisma.category.delete({
        where: { id: parseInt(id, 10) },
    });
    await prisma.auditLog.create({
      data: {
        userId: session.email,
        action: "DELETE",
        table: "Category",
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



