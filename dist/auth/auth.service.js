"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const redis_1 = require("../redis");
dotenv_1.default.config();
const jwtSignAsync = (payload, secret, options) => new Promise((resolve, reject) => {
    jsonwebtoken_1.default.sign(payload, secret, options, (err, token) => {
        if (err)
            reject(err);
        else
            resolve(token);
    });
});
const jwtVerifyAsync = (token, secret, options) => new Promise((resolve, reject) => {
    jsonwebtoken_1.default.verify(token, secret, options, (err, decoded) => {
        if (err)
            reject(err);
        else
            resolve(decoded);
    });
});
class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateTokens(user) {
        const payload = { userId: user.userId, email: user.email, role: user.role };
        const accessToken = await jwtSignAsync(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' });
        const refreshToken = await jwtSignAsync(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        // Store the refresh token in Redis with the key `refreshToken:<userId>`
        await (0, redis_1.setWithExpiration)(`refreshToken:${user.userId}`, refreshToken, 60 * 60 * 24 * 7); // Set an expiry time of 7 days
        return { accessToken, refreshToken };
    }
    async verifyAccessToken(token) {
        try {
            const decoded = await jwtVerifyAsync(token, process.env.ACCESS_TOKEN_SECRET);
            return decoded;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
    async verifyRefreshToken(token) {
        try {
            const decoded = await jwtVerifyAsync(token, process.env.REFRESH_TOKEN_SECRET);
            const userId = decoded.userId;
            // Retrieve the stored refresh token from Redis
            const storedRefreshToken = await (0, redis_1.getAsync)(`refreshToken:${userId}`);
            if (storedRefreshToken === token) {
                return decoded;
            }
            else {
                return null;
            }
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map