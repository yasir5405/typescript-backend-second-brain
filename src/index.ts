import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { userRouter } from "./routes/user.route";
import cors from "cors";
import { connectDB } from "./db/db";

connectDB();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://memora-delta.vercel.app",
      "https://www.memora-delta.vercel.app",
    ],
  })
);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to second brain app." });
});

app.use("/api/v1", userRouter);

app.listen(process.env.PORT || 3000, () => {
  console.log(`The server is running at: http://localhost:3000`);
});
