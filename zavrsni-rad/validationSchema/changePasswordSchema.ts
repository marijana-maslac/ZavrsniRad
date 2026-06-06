import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Trenutna lozinka je obavezna"),

    newPassword: z
      .string()
      .min(8, "Lozinka mora imati najmanje 8 znakova")
      .max(255)
      .regex(
        /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/,
        "Lozinka mora sadržavati veliko slovo, malo slovo i broj",
      ),

    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Lozinke se ne podudaraju",
    path: ["confirmPassword"],
  });
