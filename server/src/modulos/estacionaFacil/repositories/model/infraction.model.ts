import mongoose from "mongoose";

const infractionSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
    },
    fiscalId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    fiscalName: {
      type: String,
      required: true,
    },
    checkTime: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "CANCELLED"],
      default: "PENDING",
      required: true,
    },
    amount: {
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

infractionSchema.pre("save", async function (done) {
  this.set("updatedAt", new Date());
  done();
});

export const InfractionModel = mongoose.model("Infraction", infractionSchema);
