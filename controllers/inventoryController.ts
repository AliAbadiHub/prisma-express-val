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
      select: {
        price: true,
        updatedAt: true,
        product: {
          select: {
            productName: true,
          },
        },
        supermarket: {
          select: {
            supermarketName: true,
          },
        },
      },
    });

    // Map the data to the desired format
    const formattedInventories = inventories.map((inventory) => ({
      productName: inventory.product.productName,
      supermarketName: inventory.supermarket.supermarketName,
      price: inventory.price,
      updatedAt: inventory.updatedAt,
    }));

    res.json(formattedInventories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching inventory entries.' });
  }
});

// Find the cheapest listing of a product in a city
router.get('/cheapest/:productId/:city', async (req: Request, res: Response) => {
  const { productId, city } = req.params;

  try {
    const cheapestListing = await prisma.inventory.findFirst({
      where: {
        productId,
        supermarket: {
          city,
        },
      },
      orderBy: {
        price: 'asc',
      },
      include: {
        supermarket: true,
        product: true,
      },
    });

    if (!cheapestListing) {
      return res.status(404).json({ message: 'No listing found for the given product and city.' });
    }

    res.json(cheapestListing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the cheapest listing.' });
  }
});

// Get all inventory items in a given supermarket
router.get('/supermarket/:supermarketId', async (req: Request, res: Response) => {
  const { supermarketId } = req.params;

  try {
    const itemsInSupermarket = await prisma.inventory.findMany({
      where: {
        supermarketId,
      },
      select: {
        price: true,
        updatedAt: true,
        supermarket: {
          select: {
            supermarketName: true,
          },
        },
        product: {
          select: {
            productName: true,
          },
        },
      },
    });

    if (!itemsInSupermarket || itemsInSupermarket.length === 0) {
      return res.status(404).json({ message: 'No items found in the given supermarket.' });
    }

    res.json(itemsInSupermarket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the items in the supermarket.' });
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