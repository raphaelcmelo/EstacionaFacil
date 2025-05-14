import mongoose, { HydratedDocument, InferSchemaType } from "mongoose";
import validator from "validator";

import { roles } from "../../../../config/roles";
import { Password } from "../../use-cases/auth/password";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    cpf: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error("E-mail inválido");
        }
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value: string) {
        const requirements = [
          { re: /[0-9]/, message: "A senha deve conter pelo menos um número" },
          {
            re: /[a-z]/,
            message: "A senha deve conter pelo menos uma letra minúscula",
          },
          {
            re: /[A-Z]/,
            message: "A senha deve conter pelo menos uma letra maiúscula",
          },
          {
            re: /[$&+,:;=?@#|'<>.^*()%!-]/,
            message: "A senha deve conter pelo menos um caractere especial",
          },
        ];

        for (const requirement of requirements) {
          if (!requirement.re.test(value)) {
            throw new Error(requirement.message);
          }
        }
      },
    },
    role: {
      type: String,
      enum: roles,
      default: "CITIZEN",
    },
    isEmailVerified: {
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

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  this.set("updatedAt", new Date());
  done();
});

export type User = HydratedDocument<InferSchemaType<typeof userSchema>>;

export const UserModel = mongoose.model("User", userSchema);
