import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import jsonwebtoken from "jsonwebtoken";
import { userModel } from "../models/user.model";

const hashPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const password = req.body.password;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error in hashing password." });
  }
};

const validateSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requiredBody = z.object({
    name: z.string(),
    username: z
      .string()
      .min(4, { message: "Username should be at least 4 characters long." })
      .max(100, { message: "Username should be less than 100 characters." }),
    password: z
      .string()
      .min(8, { message: "Password should be at least 8 characters long." })
      .max(100, {
        message: "Password should be less than 100 characters long.",
      }),
  });

  const parsedBody = requiredBody.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(411).json({
      status: false,
      // message: "Invalid data format",
      message: parsedBody.error.issues[0].message,
    });
  }

  req.body = parsedBody.data;
  next();
};

const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  // Make sure token is present
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }
  const token = authHeader?.split(" ")[1];

  try {
    const decodedToken = jsonwebtoken.verify(token, "IamYasirNaseem") as {
      id: string;
    };
    const user = await userModel.findOne({
      username: decodedToken.id,
    });

    if (!user) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid or expired token." });
    }

    const userObject = user.toObject();
    const { password: _, ...safeUser } = userObject;

    (req as any).user = safeUser;
    next();
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Invalid or expired token.",
      error: error,
    });
  }
};

const comparePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.status(400).json({
      status: false,
      message: "Password and confirm password do not match!",
    });
  }

  next();
};

export { hashPassword, validateSignup, verifyJWT, comparePassword };
