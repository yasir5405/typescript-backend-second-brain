import { Router } from "express";
import { oauth2Client } from "../utils/googleConfig";
import { userModel } from "../models/user.model";
import jsonwebtoken from "jsonwebtoken";

const authRouter = Router();

authRouter.get("/google", async (req, res) => {
  try {
    const code = req.query.code as string;
    const googleRes = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(googleRes.tokens);

    const userRes = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`,
      {
        method: "GET",
      }
    );

    const userInfo = await userRes.json();

    const { email, name, picture, id: googleId } = userInfo;

    let user = await userModel.findOne({
      $or: [{ username: email }, { googleId: googleId }],
    });

    if (!user) {
      user = await userModel.create({
        name: name,
        username: email,
        googleId: googleId,
        profileImage: picture,
      });
    } else {
      user.profileImage = picture;
      if (!user.googleId) {
        user.googleId = googleId;
      }
      await user.save();
    }

    const token = jsonwebtoken.sign(
      {
        id: user.username,
      },
      "IamYasirNaseem"
    );

    res.status(200).json({
      status: true,
      token: token,
      message: "Login successful.",
    });

    // console.log(email + " " + name);
  } catch (error: any) {
    console.error("Internal server error: ", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

export { authRouter };
