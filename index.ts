import express from "express";
import userController from "./controllers/userController";
import dotenv from 'dotenv';
import authController from "./auth/auth.controller";
import productController from './controllers/productController';

dotenv.config();

const app = express();
app.use(express.json());

// Use the controllers as middleware
app.use("/users", userController);
app.use("/auth", authController);
app.use('/products', productController);

app.listen(3333, () => {
  console.log("Server running beautifully on http://localhost:3333");
});