import argon2 from "argon2";
import status from "http-status";
import ApiError from "../../../../utils/ApiError";

export class Password {
  static async toHash(password: string) {
    try {
      const hash = await argon2.hash(password);
      return hash;
    } catch (error) {
      console.error("Error hashing password:", error);
      throw new ApiError(status.BAD_REQUEST, "Error hashing password");
    }
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    try {
      return await argon2.verify(storedPassword, suppliedPassword);
    } catch (error) {
      console.error("Error verifying password:", error);
      return false;
    }
  }
}
