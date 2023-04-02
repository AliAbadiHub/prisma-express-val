import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authGuard } from "../auth/auth.guard";
import argon2 from "argon2";

const prisma = new PrismaClient();

const router = Router();


router.post("/", async (req: Request, res: Response) => {
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
        role: user.role,
      };
      
      res.json(userResponse)
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred. Make sure the email is not already registered!" });
    }
  });

  router.use(authGuard);
  router.post("/:email/profile", async (req: Request, res: Response) => {
    try {
      const { email } = req.params;
      const {
        firstName,
        lastName,
        phone,
        address1,
        city1,
        address2,
        city2,
        address3,
        city3,
        address4,
        city4,
        dob,
      } = req.body;
  
      const existingUser = await prisma.user.findUnique({ where: { email } });
  
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const birthday = new Date(dob);
      const age = calculateAge(birthday);
  
      const userProfile = await prisma.userProfile.create({
        data: {
          firstName,
          lastName,
          phone,
          address1,
          city1,
          address2,
          city2,
          address3,
          city3,
          address4,
          city4,
          dob: birthday,
          age,
          userId: existingUser.userId,
        },
      });
  
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: "VERIFIED", userProfile: { connect: { profileId: userProfile.profileId } } },
      });
  
      const responseUserProfile = {
        ...userProfile,
        role: updatedUser.role,
        email: updatedUser.email,
        createdAt: userProfile.createdAt,
        updatedAt: userProfile.updatedAt,
      };
  
      const filteredResponseUserProfile = Object.fromEntries(
        Object.entries(responseUserProfile).filter(([key, value]) => value !== null)
      );
  
      res.json(filteredResponseUserProfile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred. Make sure the user exists!" });
    }
  });
  
  function calculateAge(birthday: Date): number {
    const today = new Date();
    const age = today.getFullYear() - birthday.getFullYear();
    const monthDifference = today.getMonth() - birthday.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthday.getDate())) {
      return age - 1;
    }
    return age;
  }
  
  router.patch("/:email/profile", async (req: Request, res: Response) => {
    try {
      const { email } = req.params;
      const {
        firstName,
        lastName,
        phone,
        address1,
        city1,
        address2,
        city2,
        address3,
        city3,
        address4,
        city4,
        dob,
      } = req.body;
  
      const existingUser = await prisma.user.findUnique({
        where: { email },
        include: { userProfile: true },
      });
  
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
  
      if (!existingUser.userProfile) {
        return res.status(404).json({ error: "UserProfile not found" });
      }
  
      const updateData: any = {
        firstName,
        lastName,
        phone,
        address1,
        city1,
        address2,
        city2,
        address3,
        city3,
        address4,
        city4,
        dob,
      };
  
      if (dob) {
        const birthday = new Date(dob);
        const age = calculateAge(birthday);
        updateData.dob = birthday;
        updateData.age = age;
      }
  
      const updatedProfile = await prisma.userProfile.update({
        where: { profileId: existingUser.userProfile.profileId },
        data: removeNullFields(updateData),
      });
  
      res.json(updatedProfile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while updating the UserProfile." });
    }
  });


  

  router.get("/", async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
      select: {
        userId: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        userProfile: true,
      },
    });
    res.json(users);
  });
  
  const removeNullFields = (obj: any) => {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== null));
  };
  
  router.get("/:email", async (req: Request, res: Response) => {
    const { email } = req.params;
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        userId: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        userProfile: true,
      },
    });
  
    if (!user) {
      return res.status(404).json({ message: "There is no user with that email address!" });
    }
  
    const userProfile = user.userProfile
      ? removeNullFields(user.userProfile)
      : null;
  
    res.json({ ...user, userProfile });
  });
  
  // Update user password by email
  router.patch("/:email", async (req: Request, res: Response) => {
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
  router.delete("/:email", async (req: Request, res: Response) => {
    try {
      const email = req.params.email;
  
      const deletedUser = await prisma.user.delete({
        where: {
          email: email,
        },
        select: {
          userId: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
  
      res.json(deletedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while deleting the user." });
    }
  });
  
  export default router;