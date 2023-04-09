"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const argon2_1 = __importDefault(require("argon2"));
const auth_service_1 = require("./auth.service");
const prisma = new client_1.PrismaClient();
const authService = new auth_service_1.AuthService(prisma);
const router = (0, express_1.Router)();
exports.authController = router;
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isPasswordValid = await argon2_1.default.verify(user.password, password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const { accessToken, refreshToken } = await authService.generateTokens(user);
        res.json({
            accessToken,
            refreshToken,
            user: {
                userId: user.userId,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while logging in.' });
    }
});
//# sourceMappingURL=auth.controller.js.map