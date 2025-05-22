import mongoose, { HydratedDocument, InferSchemaType } from "mongoose";

const permissaoSchema = new mongoose.Schema(
  {
    placa: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
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

permissaoSchema.pre("save", async function (done) {
  this.set("updatedAt", new Date());
  done();
});

export type Permissao = HydratedDocument<
  InferSchemaType<typeof permissaoSchema>
>;

export const PermissaoModel = mongoose.model("Permissao", permissaoSchema);
