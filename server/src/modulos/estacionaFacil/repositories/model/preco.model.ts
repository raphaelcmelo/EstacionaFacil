import mongoose, { HydratedDocument, InferSchemaType } from "mongoose";

const precoSchema = new mongoose.Schema(
  {
    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      default: null,
    },
    hour1Price: {
      type: Number,
      required: true,
      min: 0,
    },
    hour2Price: {
      type: Number,
      required: true,
      min: 0,
    },
    hour3Price: {
      type: Number,
      required: true,
      min: 0,
    },
    hour4Price: {
      type: Number,
      required: true,
      min: 0,
    },
    hour5Price: {
      type: Number,
      required: true,
      min: 0,
    },
    hour6Price: {
      type: Number,
      required: true,
      min: 0,
    },
    hour12Price: {
      type: Number,
      required: true,
      min: 0,
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
        delete ret.__v;
      },
    },
  }
);

precoSchema.pre("save", async function (done) {
  this.set("updatedAt", new Date());
  done();
});

export type Preco = HydratedDocument<InferSchemaType<typeof precoSchema>>;

export const PrecoModel = mongoose.model("Preco", precoSchema);
