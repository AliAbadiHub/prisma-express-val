"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supermarketController = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_guard_1 = require("../auth/auth.guard");
const router = (0, express_1.Router)();
exports.supermarketController = router;
const prisma = new client_1.PrismaClient();
// Create a new supermarket
router.post('/', auth_guard_1.authGuard, async (req, res) => {
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
            select: {
                supermarketId: true,
                supermarketName: true,
                supermarketComments: true,
                city: true,
                createdAt: true,
                createdBy: {
                    select: {
                        userId: true,
                        email: true,
                    },
                },
            },
        });
        res.status(201).json(newSupermarket);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the supermarket.' });
    }
});
// Get all supermarkets
router.get('/', auth_guard_1.authGuard, async (req, res) => {
    if (!['BASIC', 'VERIFIED', 'ADMIN'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions.' });
    }
    try {
        const supermarkets = await prisma.supermarket.findMany({
            select: {
                supermarketId: true,
                supermarketName: true,
                city: true,
            },
        });
        res.json(supermarkets);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching supermarkets.' });
    }
});
// Get a supermarket by ID
router.get('/:id', auth_guard_1.authGuard, async (req, res) => {
    if (!['BASIC', 'VERIFIED', 'ADMIN'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions.' });
    }
    const { id } = req.params;
    try {
        const supermarket = await prisma.supermarket.findUnique({
            where: {
                supermarketId: id,
            },
            select: {
                supermarketId: true,
                supermarketName: true,
                city: true,
            },
        });
        if (!supermarket) {
            return res.status(404).json({ message: 'Supermarket not found.' });
        }
        res.json(supermarket);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the supermarket.' });
    }
});
// Update a supermarket by ID
router.patch('/:id', auth_guard_1.authGuard, async (req, res) => {
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating the supermarket.' });
    }
});
// Delete a supermarket by ID
router.delete('/:id', auth_guard_1.authGuard, async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Insufficient permissions.' });
    }
    const { id } = req.params;
    try {
        const deletedSupermarket = await prisma.supermarket.delete({
            where: { supermarketId: id },
        });
        res.json({ message: 'Supermarket deleted successfully.', deletedSupermarket: deletedSupermarket });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred while deleting the supermarket.' });
    }
});
//# sourceMappingURL=supermarketController.js.map