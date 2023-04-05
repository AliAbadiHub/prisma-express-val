import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authGuard } from '../auth/auth.guard';
import { CustomRequest } from '../types';

const prisma = new PrismaClient();
const router = express.Router();

// Create a new shopping list
router.post('/', authGuard, async (req: CustomRequest, res: Response) => {
  const { city, shoppingItems } = req.body;
  const currentDate = new Date();

  try {
    const shoppingItemsWithPrices = [];

    for (const item of shoppingItems) {
      const inventoryItem = await prisma.inventory.findFirst({
        where: {
          supermarket: {
            city: city,
          },
          productId: item.productId,
          inStock: true,
        },
        orderBy: {
          price: 'asc',
        },
        include: {
          supermarket: true,
          product: true,
        },
      });

      if (inventoryItem) {
        shoppingItemsWithPrices.push({
          productName: inventoryItem.product.productName,
          supermarketName: inventoryItem.supermarket.supermarketName,
          quantity: item.quantity,
          lowestPrice: inventoryItem.price,
          subtotal: parseFloat((inventoryItem.price * item.quantity).toFixed(2)),
        });
      } else {
        shoppingItemsWithPrices.push({
          productName: `Product with ID ${item.productId} not found in ${city}`,
          supermarketName: 'N/A',
          quantity: item.quantity,
          lowestPrice: 0,
          subtotal: 0,
        });
      }
    }

    const total = parseFloat(shoppingItemsWithPrices.reduce(
      (accumulator, currentItem) => accumulator + currentItem.subtotal,
      0
    ).toFixed(2)
    );

    res.status(201).json({
      userEmail: req.user.email,
      currentDate: currentDate,
      city: city,
      shoppingItems: shoppingItemsWithPrices,
      total: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the shopping list.' });
  }
});

export default router;