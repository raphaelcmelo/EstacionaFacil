import mongoose, { HydratedDocument, InferSchemaType } from "mongoose";

const pontoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: { type: String },
      coordinates: [],
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

pontoSchema.pre("save", async function (done) {
  this.set("updatedAt", new Date());
  done();
});

export type Ponto = HydratedDocument<InferSchemaType<typeof pontoSchema>>;

export const PontoModel = mongoose.model("Ponto", pontoSchema);
