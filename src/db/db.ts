import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  await mongoose
    .connect(`${process.env.MONGO_DB_URI}`)
    .then(() => console.log("Database has been connected."))
    .catch((error) => console.log("Error connecting to the database." + error));
};
