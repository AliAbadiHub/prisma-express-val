import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authGuard } from '../auth/auth.guard';
import { CustomRequest } from '../types';


const prisma = new PrismaClient();
const router = express.Router();

// Create a new product (requires VERIFIED or ADMIN role)
router.post('/', authGuard, async (req: CustomRequest, res: Response) => {
    // Check if the user has VERIFIED or ADMIN role
    if (req.user.role !== 'VERIFIED' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Insufficient permissions.' });
    }
  
    const { productName, productCategory, productComments } = req.body;
  try {
    const newProduct = await prisma.product.create({
      data: {
        productName,
        productCategory,
        productComments,
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

    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the product.' });
  }
});
  

    router.get('/', async (req: CustomRequest, res: Response) => {
        try {
          const products = await prisma.product.findMany({
            include: {
              createdBy: true,
              updatedBy: true,
            },
          });
          res.json(products);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'An error occurred while fetching products.' });
        }
      });


router.get('/:id', async (req: CustomRequest, res: Response) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { productId: id },
      include: {
        createdBy: true,
        updatedBy: true,
      },
    });

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the product.' });
  }
});
  
router.put('/:id', authGuard, async (req: CustomRequest, res: Response) => {
    if (req.user.role !== 'VERIFIED' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Insufficient permissions.' });
    }
  
    const { id } = req.params;
    const { productName, productCategory, productComments } = req.body;
    try {
      const updatedProduct = await prisma.product.update({
        where: { productId: id },
        data: {
          productName,
          productCategory,
          productComments,
          updatedAt: new Date(),
          updatedBy: {
            connect: {
              userId: req.user.userId,
            },
          },
        },
      });
  
      res.json(updatedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while updating the product.' });
    }
  });
  // Delete a product (requires VERIFIED or ADMIN role)
  router.delete('/:id', authGuard, async (req: CustomRequest, res: Response) => {
    if (req.user.role !== 'VERIFIED' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Insufficient permissions.' });
    }
  
    const { id } = req.params;
    try {
      const deletedProduct = await prisma.product.delete({
        where: { productId: id },
      });
  
      res.json({ message: 'Product deleted successfully.', deletedProduct });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while deleting the product.' });
    }
  });
  
  export default router;