import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { userRouter } from "./routes/user.route";
import cors from "cors";
import { connectDB } from "./db/db";

// Log uncaught errors (for Railway)
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});

connectDB();

const app = express();
app.use(express.json());
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "https://memora-delta.vercel.app",
//       "https://www.memora-delta.vercel.app",
//     ],
//   })
// );
app.use(
  cors({
    origin: "*",
  })
);

const PORT = Number(process.env.PORT) || 3000;

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to second brain app ." });
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use("/api/v1", userRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`The server is running at: http://localhost:${PORT}`);
});
