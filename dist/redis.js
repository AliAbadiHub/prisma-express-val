"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delAsync = exports.setAsync = exports.getAsync = exports.setWithExpiration = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisClient = new ioredis_1.default(process.env.REDIS_URL);
async function setWithExpiration(key, value, time) {
    await redisClient.setex(key, time, value);
}
exports.setWithExpiration = setWithExpiration;
const getAsync = async (key) => {
    return await redisClient.get(key);
};
exports.getAsync = getAsync;
const setAsync = async (key, value) => {
    await redisClient.set(key, value);
};
exports.setAsync = setAsync;
const delAsync = async (key) => {
    await redisClient.del(key);
};
exports.delAsync = delAsync;
//# sourceMappingURL=redis.js.map