import mongoose, { Document, Types } from "mongoose";

const Schema = mongoose.Schema;
// const ObjectID = Schema.ObjectId;

interface Content extends Document {
  type: "document" | "tweet" | "youtube" | "link";
  link: string;
  title: string;
  tags: string[];
  userId: Types.ObjectId;
}

const contentSchema = new Schema<Content>({
  type: {
    type: String,
    required: true,
    enum: ["document", "tweet", "youtube", "link"],
  },
  link: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
});

const ContentModel = mongoose.model<Content>("content", contentSchema);

export { ContentModel };
