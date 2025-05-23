import mongoose from "mongoose";
import { PaymentStatus, PaymentMethod } from "@shared/schema";

const permitSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
    durationHours: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
    },
    paymentId: {
      type: String,
    },
    transactionCode: {
      type: String,
      unique: true,
    },
    notificationSent: {
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
        delete ret.__v;
      },
    },
  }
);

permitSchema.pre("save", async function (done) {
  this.set("updatedAt", new Date());
  done();
});

export const PermitModel = mongoose.model("Permissoe", permitSchema);
