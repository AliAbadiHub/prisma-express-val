import express from "express";
import userController from "./controllers/userController";

const app = express();
app.use(express.json());

// Use the controllers as middleware
app.use("/users", userController);

app.listen(3333, () => {
  console.log("Server running beautifully on http://localhost:3333");
});