import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CustomRequest } from '../types';
import { authGuard } from '../auth/auth.guard';

const router = Router();
const prisma = new PrismaClient();

// Create a new supermarket
router.post('/', authGuard, async (req: CustomRequest, res: Response) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Insufficient permissions.' });
  }

  const { supermarketName, supermarketComments, city } = req.body;
  try {
    const newSupermarket = await prisma.supermarket.create({
      data: {
        supermarketName,
        supermarketComments,
        city,
        createdBy: {
          connect: {
            userId: req.user.userId,
          },
        },
        updatedBy: {
          connect: {
            userId: req.user.userId,
          },
        },
      },
    });

    res.status(201).json(newSupermarket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the supermarket.' });
  }
});

// Get all supermarkets
router.get('/', async (_req: Request, res: Response) => {
  try {
    const supermarkets = await prisma.supermarket.findMany({
      include: {
        createdBy: true,
        updatedBy: true,
      },
    });
    res.json(supermarkets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching supermarkets.' });
  }
});

// Get a supermarket by ID
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const supermarket = await prisma.supermarket.findUnique({
      where: {
        supermarketId: id,
      },
      include: {
        createdBy: true,
        updatedBy: true,
      },
    });

    if (!supermarket) {
      return res.status(404).json({ message: 'Supermarket not found.' });
    }

    res.json(supermarket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the supermarket.' });
  }
});

// Update a supermarket by ID
router.patch('/:id', authGuard, async (req: CustomRequest, res: Response) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Insufficient permissions.' });
  }

  const { id } = req.params;
  const { supermarketName, supermarketComments, city } = req.body;

  try {
    const updatedSupermarket = await prisma.supermarket.update({
      where: {
        supermarketId: id,
      },
      data: {
        supermarketName,
        supermarketComments,
        city,
        updatedBy: {
          connect: {
            userId: req.user.userId,
          },
        },
      },
    });

    res.json(updatedSupermarket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the supermarket.' });
  }
});

// Delete a supermarket by ID
router.delete('/:id', authGuard, async (req: CustomRequest, res: Response) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Insufficient permissions.' });

    }

    const { id } = req.params;
    try {
        const deletedSupermarket = await prisma.supermarket.delete({
            where: { supermarketId: id },
        });

        res.json({ message: 'Supermarket deleted successfully.', deletedSupermarket: deletedSupermarket });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred while deleting the supermarket.' });

    }
    });

    export default router;