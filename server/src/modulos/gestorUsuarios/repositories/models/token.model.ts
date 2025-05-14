import mongoose, { HydratedDocument, InferSchemaType } from "mongoose";
import { tokenTypes } from "../../../../config/tokens";

const tokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        tokenTypes.REFRESH,
        tokenTypes.RESET_PASSWORD,
        tokenTypes.VERIFY_EMAIL,
      ],
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

tokenSchema.pre("save", async function (done) {
  this.set("updatedAt", new Date());
  done();
});

export type Token = HydratedDocument<InferSchemaType<typeof tokenSchema>>;

export const TokenModel = mongoose.model("Token", tokenSchema);
