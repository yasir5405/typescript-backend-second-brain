import mongoose, { Document } from "mongoose";

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

interface IUser extends Document {
  username: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const userModel = mongoose.model("users", userSchema);

export { userModel };
