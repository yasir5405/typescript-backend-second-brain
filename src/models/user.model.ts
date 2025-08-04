import mongoose, { Document } from "mongoose";

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

interface IUser extends Document {
  name: string;
  username: string;
  password: string;
  googleId: string;
  profileImage: string;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
    required: false,
    unique: true,
  },
  profileImage: {
    type: String,
    required: false,
    default: "",
  },
});

const userModel = mongoose.model("users", userSchema);

export { userModel };
