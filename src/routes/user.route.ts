import { Router } from "express";
import { z, ZodError } from "zod";
import {
  hashPassword,
  validateSignup,
  verifyJWT,
} from "../middlewares/auth.middleware";
import { userModel } from "../models/user.model";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { ContentModel } from "../models/content.model";

const userRouter = Router();

userRouter.post("/signup", validateSignup, hashPassword, async (req, res) => {
  const { username, password } = req.body;

  try {
    const doesUserExists = await userModel.findOne({ username: username });
    if (doesUserExists) {
      return res.status(403).json({
        status: false,
        message: "User with that username already exists.",
      });
    }

    const newUser = await userModel.create({
      username: username,
      password: password,
    });

    res.status(201).json({
      status: true,
      message: "User successfully registered.",
      user: newUser,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Internal server error." });
  }
});

userRouter.post("/login", async (req, res) => {
  const requiredBody = z.object({
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
      message: "Invalid data format.",
      errors: parsedBody.error.issues[0].message,
    });
  }

  const { username, password } = parsedBody.data;

  const user = await userModel.findOne({
    username: username,
  });

  if (!user) {
    return res
      .status(404)
      .json({ status: false, message: "No user found with this username." });
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    return res
      .status(403)
      .json({ status: false, message: "Invalid credentials" });
  }

  const accessToken = jsonwebtoken.sign(
    {
      id: user.username,
    },
    "IamYasirNaseem"
  );

  res.status(200).json({
    status: true,
    message: "Logged in successfully.",
    token: accessToken,
  });
});

userRouter.get("/me", verifyJWT, async (req, res) => {
  const user = req.body.user;
  res.status(200).json({
    success: true,
    message: "Data fetched successfully.",
    user: user,
  });
});

userRouter.post("/contents", verifyJWT, async (req, res) => {
  const user = req.body.user;

  if (!user) {
    return res.status(403).json({ status: false, message: "Unauthorised." });
  }

  try {
    const requiredBody = z.object({
      type: z
        .string()
        .refine(
          (val) => ["document", "tweet", "youtube", "link"].includes(val),
          {
            message: "Type should be a valid string.",
          }
        ),
      link: z.url({ error: "Link should be a valid url." }),
      title: z.string({ error: "Title should be a valid title." }),
      tags: z.array(z.string({ error: "Please use strings for tags." })),
    });

    const parsedBody = requiredBody.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(411).json({
        status: false,
        message: "Invalid data format.",
        errors: parsedBody.error.issues[0].message,
      });
    }

    const { type, link, title, tags }: z.infer<typeof requiredBody> =
      parsedBody.data;

    const content = await ContentModel.create({
      type,
      link,
      title,
      tags,
      userId: user._id,
    });

    const populatedContent = await content.populate({
      path: "userId",
      select: "-password",
    });

    res.status(201).json({
      status: true,
      message: "Content saved successfully.",
      content: populatedContent,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
    });
  }
});

userRouter.get("/contents", verifyJWT, async (req, res) => {
  const user = req.body.user;
  try {
    const userDocuments = await ContentModel.find({
      userId: user._id,
    });

    if (!userDocuments || userDocuments.length < 1) {
      return res.status(404).json({
        status: false,
        message: "No brains found.",
      });
    }

    res.status(200).json({
      status: true,
      message: `Brains fetched successfully for ${user.username}`,
      brains: userDocuments,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Internal server error.", error: error });
  }
});

export { userRouter };
