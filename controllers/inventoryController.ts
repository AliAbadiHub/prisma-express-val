import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CustomRequest } from '../types';
import { authGuard } from '../auth/auth.guard';

const router = Router();
const prisma = new PrismaClient();

// Create a new inventory entry (accessible to VERIFIED and ADMIN roles)
router.post('/', authGuard, async (req: CustomRequest, res: Response) => {
  if (req.user.role !== 'VERIFIED' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Insufficient permissions.' });
  }

  const { price, productId, supermarketId } = req.body;

  try {
    const newInventory = await prisma.inventory.create({
      data: {
        price,
        product: {
          connect: {
            productId,
          },
        },
        supermarket: {
          connect: {
            supermarketId,
          },
        },
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

    res.status(201).json(newInventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the inventory entry.' });
  }
});

// Get all inventory entries
router.get('/', authGuard, async (_req: CustomRequest, res: Response) => {
  try {
    const inventories = await prisma.inventory.findMany({
      include: {
        createdBy: true,
        updatedBy: true,
        product: true,
        supermarket: true,
      },
    });
    res.json(inventories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching inventory entries.' });
  }
});

// Update an existing inventory entry (accessible to VERIFIED and ADMIN roles)
router.patch('/:supermarketId/:productId', authGuard, async (req: CustomRequest, res: Response) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'VERIFIED') {
    return res.status(403).json({ message: 'Insufficient permissions.' });
  }

  const { supermarketId, productId } = req.params;
  const { price } = req.body;

  try {
    const updatedInventory = await prisma.inventory.update({
      where: {
        supermarketId_productId: {
          supermarketId,
          productId,
        },
      },
      data: {
        price,
        updatedAt: new Date(),
        updatedBy: {
          connect: {
            userId: req.user.userId,
          },
        },
      },
    });

    res.json(updatedInventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the inventory entry.' });
  }
});

// Delete an inventory entry (accessible to ADMIN role only)
router.delete('/:supermarketId/:productId', authGuard, async (req: CustomRequest, res: Response) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Insufficient permissions.' });
  }

  const { supermarketId, productId } = req.params;

  try {
    await prisma.inventory.delete({
      where: {
        supermarketId_productId: {
          supermarketId,
          productId,
        },
      },
    });

    res.status(204).json({ message: 'Inventory entry deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the inventory entry.' });
}
});

export default router;