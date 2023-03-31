import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import argon2 from 'argon2';

const app = express();
app.use(express.json());

const prisma = new PrismaClient();


app.post("/users", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Hash the password using Argon2
    const hashedPassword = await argon2.hash(password);
    
    // Store the hashed password in the database
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    });

    const userResponse ={
      id: user.userId,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    res.json(userResponse)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred. Make sure the email is not already registered!" });
  }
});


app.get("/users", async (req:Request, res:Response) => {
    const users = await prisma.user.findMany();
    res.json(users);
});

app.get("/users/:email", async (req:Request, res:Response) => {
  const { email } = req.params;
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({ message: "There is no user with that email address!" });
    }
    res.json(user);
  });

// Update user password by email
app.patch("/users/:email", async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    const { password } = req.body;

    // Hash the password using Argon2
    const hashedPassword = await argon2.hash(password);

    const updatedUser = await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        password: hashedPassword,
      },
    });

    // Create a custom response object without the password field
    const userResponse = {
      id: updatedUser.userId,
      email: updatedUser.email,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      message: "Your password has been successfully updated! Don't lose it this time...",
    };

    res.json(userResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating the user." });
  }
});

// Delete user by email
app.delete("/users/:email", async (req: Request, res: Response) => {
  try {
    const email = req.params.email;

    const deletedUser = await prisma.user.delete({
      where: {
        email: email,
      },

    });

    res.json(deletedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting the user." });
  }
});

app.listen(3333, () => {
    console.log("Server running beautifully on http://localhost:3333");
});