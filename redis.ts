import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = new Redis(process.env.REDIS_URL as string);

export async function setWithExpiration(
  key: string,
  value: string,
  time: number
): Promise<void> {
  await redisClient.setex(key, time, value);
}

const getAsync = async (key: string): Promise<string | null> => {
  return await redisClient.get(key);
};

const setAsync = async (key: string, value: string): Promise<void> => {
  await redisClient.set(key, value);
};

const delAsync = async (key: string): Promise<void> => {
  await redisClient.del(key);
};

export { getAsync, setAsync, delAsync };