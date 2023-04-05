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
        },
      });

      if (inventoryItem) {
        shoppingItemsWithPrices.push({
          productId: item.productId,
          supermarketId: inventoryItem.supermarketId,
          supermarketName: inventoryItem.supermarket.supermarketName,
          quantity: item.quantity,
          lowestPrice: inventoryItem.price,
          subtotal: inventoryItem.price * item.quantity,
        });
      }
    }

    const newShoppingList = await prisma.shoppingList.create({
      data: {
        city,
        date: new Date(),
        user: {
          connect: {
            userId: req.user.userId,
          },
        },
        shoppingItems: {
          create: shoppingItemsWithPrices.map((item: any) => ({
            productId: item.productId,
            supermarketId: item.supermarketId,
            quantity: item.quantity,
            lowestPrice: item.lowestPrice,
            subtotal: item.subtotal,
          })),
        },
      },
      include: {
        user: true,
        shoppingItems: {
          include: {
            product: true,
            supermarket: true,
          },
        },
      },
    });

    const total = shoppingItemsWithPrices.reduce(
      (accumulator, currentItem) => accumulator + currentItem.subtotal,
      0
    );

    res.status(201).json({ shoppingList: newShoppingList, userEmail: req.user.email, total: total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the shopping list.' });
  }
});

export default router;