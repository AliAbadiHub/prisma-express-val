"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("./controllers/userController");
const auth_controller_1 = require("./auth/auth.controller");
const productController_1 = require("./controllers/productController");
const supermarketController_1 = require("./controllers/supermarketController");
const inventoryController_1 = require("./controllers/inventoryController");
const shoppingListController_1 = require("./controllers/shoppingListController");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Use the controllers as middleware
app.use('/users', userController_1.userController);
app.use('/auth', auth_controller_1.authController);
app.use('/products', productController_1.productController);
app.use('/supermarket', supermarketController_1.supermarketController);
app.use('/inventory', inventoryController_1.inventoryController);
app.use('/shoppingList', shoppingListController_1.shoppingListController);
app.listen(3333, () => {
    console.log("Server running beautifully on http://localhost:3333");
});
//# sourceMappingURL=index.js.map