"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authGuard = void 0;
const auth_service_1 = require("./auth.service");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const authService = new auth_service_1.AuthService(prisma);
const authGuard = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    try {
        const decodedToken = await authService.verifyAccessToken(token);
        // Attach the decoded user information to the request object
        req.user = decodedToken;
        // Proceed to the next middleware function or route handler
        next();
    }
    catch (error) {
        console.error('Error in authGuard:', error);
        res.status(403).json({ message: 'Invalid token.' });
    }
};
exports.authGuard = authGuard;
//# sourceMappingURL=auth.guard.js.map