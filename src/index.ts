import express from "express";
import mongoose from "mongoose";
import { userRouter } from "./routes/user.route";

const connectDB = async (): Promise<void> => {
  await mongoose
    .connect(
      "mongodb+srv://yasirnaseem1920:yasirnaseem1920@cluster0.ybzjb1p.mongodb.net/second-brain"
    )
    .then(() => console.log("Database has been connected."))
    .catch((error) => console.log("Error connecting to the database." + error));
};
connectDB();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to second brain app." });
});

app.use("/api/v1", userRouter);

app.listen(3000, () => {
  console.log(`The server is running at: http://localhost:3000`);
});
