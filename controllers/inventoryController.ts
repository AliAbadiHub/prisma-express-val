import { Router, Request, Response } from 'express';
import { PrismaClient, ProductCategory } from '@prisma/client';
import { CustomRequest } from '../types';
import { authGuard } from '../auth/auth.guard';

const router = Router();
const prisma = new PrismaClient();

// Helper function to convert string to ProductCategory enum
function toProductCategory(category: string): ProductCategory | null {
  if (Object.values(ProductCategory).includes(category as ProductCategory)) {
    return category as ProductCategory;
  }
  return null;
}

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
      // Include product and supermarket to fetch productName and supermarketName
      include: {
        product: true,
        supermarket: true,
      },
    });

    // Include productName and supermarketName in the response
    res.status(201).json({
      ...newInventory,
      productName: newInventory.product.productName,
      supermarketName: newInventory.supermarket.supermarketName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the inventory entry.' });
  }
});
// Get all inventory entries
router.get('/', authGuard, async (req: CustomRequest, res: Response) => {
  try {
    const inventories = await prisma.inventory.findMany({
      select: {
        price: true,
        inStock: true,
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
      inStock: inventory.inStock,
      updatedAt: inventory.updatedAt,
    }));

    res.json(formattedInventories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching inventory entries.' });
  }
});

// Find the cheapest listing of a product in a city
router.get('/cheapest/:productId/:city', authGuard, async (req: CustomRequest, res: Response) => {
  const allowedRoles = ['BASIC', 'VERIFIED', 'ADMIN'];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Insufficient permissions.' });
  }

  const { productId, city } = req.params;

  try {
    const cheapestListing = await prisma.inventory.findFirst({
      where: {
        productId,
        inStock: true,
        supermarket: {
          city,
        },
      },
      orderBy: {
        price: 'asc',
      },
      select: {
        price: true,
        inStock: true,
        updatedAt: req.user.role === 'ADMIN',
        updatedBy: req.user.role === 'ADMIN' ? { select: { email: true, userId: true } } : undefined,
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
        inStock: true,
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

// Get the lowest price of every item in a given product category within a city
router.get('/category/:city/:productCategory', authGuard, async (req: CustomRequest, res: Response) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'VERIFIED') {
    return res.status(403).json({ message: 'Insufficient permissions.' });
  }

  const { city, productCategory } = req.params;

  // Convert the productCategory string to the appropriate enum
  const categoryEnum = toProductCategory(productCategory);

  if (!categoryEnum) {
    return res.status(400).json({ message: 'Invalid product category.' });
  }

  try {
    const productList = await prisma.product.findMany({
      where: {
        productCategory: categoryEnum,
        inventory: {
          some: {
            supermarket: {
              city: city,
            },
            inStock: true,
          },
        },
      },
      select: {
        productName: true,
        inventory: {
          where: {
            supermarket: {
              city: city,
            },
            inStock: true,
          },
          orderBy: {
            price: 'asc',
          },
          take: 1,
          select: {
            price: true,
            supermarket: {
              select: {
                supermarketName: true,
              },
            },
          },
        },
      },
    });

    res.json(productList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the products by category.' });
  }
});



// Update an existing inventory entry (accessible to VERIFIED and ADMIN roles)
router.patch('/:supermarketId/:productId', authGuard, async (req: CustomRequest, res: Response) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'VERIFIED') {
    return res.status(403).json({ message: 'Insufficient permissions.' });
  }

  const { supermarketId, productId } = req.params;
  const { price, inStock } = req.body;

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
        inStock,
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