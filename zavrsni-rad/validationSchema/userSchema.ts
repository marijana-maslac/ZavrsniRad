import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(3, "Name is requierd").max(255),
  username: z.string().min(3, "Username is requierd").max(255),
  email: z.email("Invalid email adress"),
  password: z
    .string()
    .min(8, "Password must have at least 8 characters")
    .max(255, "Password is too long")
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])/,
      "Password must contain uppercase, lowercase, number, and special character",
    ),
});
