import express from "express";
import userController from "./controllers/userController";
import dotenv from 'dotenv';
import authController from "./auth/auth.controller";
import productController from './controllers/productController';
import supermarketController from './controllers/supermarketController';
import inventoryController from './controllers/inventoryController';
import shoppingListController from "./controllers/shoppingListController";
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');

dotenv.config();



const app = express();
app.use(express.json());

const swaggerDocument = yaml.load('./swagger.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Use the controllers as middleware
app.use("/users", userController);
app.use("/auth", authController);
app.use('/products', productController);
app.use('/supermarket', supermarketController);
app.use('/inventory', inventoryController);
app.use('/shoppingList', shoppingListController);

app.listen(3333, () => {
  console.log("Server running beautifully on http://localhost:3333");
});