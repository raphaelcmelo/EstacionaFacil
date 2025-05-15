import mongoose, { HydratedDocument, InferSchemaType } from "mongoose";

const veiculoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    placa: {
      type: String,
      required: true,
    },
    modelo: {
      type: String,
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

veiculoSchema.pre("save", async function (done) {
  this.set("updatedAt", new Date());
  done();
});

export type Veiculo = HydratedDocument<InferSchemaType<typeof veiculoSchema>>;

export const VeiculoModel = mongoose.model("Veiculo", veiculoSchema);
