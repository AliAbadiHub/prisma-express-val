"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_guard_1 = require("../auth/auth.guard");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
exports.productController = router;
// Create a new product (requires VERIFIED or ADMIN role)
router.post('/', auth_guard_1.authGuard, async (req, res) => {
    if (req.user.role !== 'VERIFIED' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Insufficient permissions.' });
    }
    const { productName, productCategory, productComments } = req.body;
    try {
        const existingProduct = await prisma.product.findUnique({
            where: {
                productName,
            },
        });
        if (existingProduct) {
            return res.status(400).json({
                message: "The product you entered already exists in the database. If you want to update the price, please use the 'update' feature.",
            });
        }
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the product.' });
    }
});
router.get('/', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            select: {
                productId: true,
                productName: true,
                productCategory: true,
                productComments: true,
            },
        });
        res.json(products);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching products.' });
    }
});
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await prisma.product.findUnique({
            where: { productId: id },
            select: {
                productId: true,
                productName: true,
                productCategory: true,
                productComments: true,
            },
        });
        if (product) {
            res.json(product);
        }
        else {
            res.status(404).json({ message: 'Product not found.' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the product.' });
    }
});
router.patch('/:id', auth_guard_1.authGuard, async (req, res) => {
    if (req.user.role !== 'VERIFIED' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Insufficient permissions.' });
    }
    const { id } = req.params;
    const { productName, productCategory, productComments, price } = req.body;
    try {
        const updateData = {
            updatedBy: {
                connect: {
                    userId: req.user.userId,
                },
            },
        };
        if (req.user.role === 'ADMIN') {
            if (productName) {
                updateData.productName = productName;
            }
            if (productCategory) {
                updateData.productCategory = productCategory;
            }
            if (productComments) {
                updateData.productComments = productComments;
            }
        }
        const updatedProduct = await prisma.product.update({
            where: {
                productId: id,
            },
            data: updateData,
            select: {
                productId: true,
                productName: true,
                productCategory: true,
                productComments: true,
                updatedAt: true,
                updatedBy: {
                    select: {
                        userId: true,
                        email: true,
                    },
                },
            },
        });
        res.json(updatedProduct);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating the product.' });
    }
});
// Delete a product (requires VERIFIED or ADMIN role)
router.delete('/:id', auth_guard_1.authGuard, async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Insufficient permissions.' });
    }
    const { id } = req.params;
    try {
        const deletedProduct = await prisma.product.delete({
            where: { productId: id },
        });
        res.json({ message: 'Product deleted successfully.', deletedProduct });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting the product.' });
    }
});
//# sourceMappingURL=productController.js.map