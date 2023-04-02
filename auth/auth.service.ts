import { PrismaClient, User } from '@prisma/client';
import jwt, { Secret, SignOptions, VerifyOptions } from 'jsonwebtoken';
import { promisify } from 'util';
import dotenv from 'dotenv';
import { getAsync, setAsync, delAsync, setWithExpiration } from '../redis';

dotenv.config();



const jwtSignAsync = (payload: string | object, secret: Secret, options: SignOptions): Promise<string> =>
  new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) reject(err);
      else resolve(token as string);
    });
  });

const jwtVerifyAsync = (token: string, secret: Secret, options?: VerifyOptions): Promise<object> =>
  new Promise((resolve, reject) => {
    jwt.verify(token, secret, options, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded as object);
    });
  });

  export class AuthService {
    constructor(private prisma: PrismaClient) {}
  
    async generateTokens(user: User) {
      const payload = { userId: user.userId, email: user.email, role: user.role };
  
      const accessToken = await jwtSignAsync(payload, process.env.ACCESS_TOKEN_SECRET as Secret, { expiresIn: '2h' });
      const refreshToken = await jwtSignAsync(payload, process.env.REFRESH_TOKEN_SECRET as Secret, { expiresIn: '7d' });
  
      // Store the refresh token in Redis with the key `refreshToken:<userId>`
      await setWithExpiration(`refreshToken:${user.userId}`, refreshToken, 60 * 60 * 24 * 7); // Set an expiry time of 7 days
  
      return { accessToken, refreshToken };
    }

  async verifyAccessToken(token: string) {
    try {
      const decoded = await jwtVerifyAsync(token, process.env.ACCESS_TOKEN_SECRET as Secret);
      return decoded;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async verifyRefreshToken(token: string) {
    try {
      const decoded: any = await jwtVerifyAsync(token, process.env.REFRESH_TOKEN_SECRET as Secret);
      const userId = decoded.userId;

      // Retrieve the stored refresh token from Redis
      const storedRefreshToken = await getAsync(`refreshToken:${userId}`);

      if (storedRefreshToken === token) {
        return decoded;
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}