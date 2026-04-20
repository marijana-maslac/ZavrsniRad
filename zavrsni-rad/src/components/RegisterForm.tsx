"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { userSchema } from "../../validationSchema/userSchema";

type RegisterFormData = z.infer<typeof userSchema>;

const RegisterForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const res = await axios.post("/api/users", data);
      console.log("Created user: ", res.data);
      router.push("/");
      router.refresh();
    } catch (error: any) {
      console.error("Error creating user:", error);
      setServerError(
        error.response?.data?.message || "Greška pri kreiranju korisnika",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-container">
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <>
            <label>Ime</label>
            <input type="text" {...field} placeholder="Ime..." />
            {errors.name && (
              <p className="error-message">{errors.name.message}</p>
            )}
          </>
        )}
      />

      <Controller
        name="username"
        control={control}
        render={({ field }) => (
          <>
            <label>Korisničko ime</label>
            <input type="text" {...field} placeholder="Username..." />
            {errors.username && (
              <p className="error-message">{errors.username.message}</p>
            )}
          </>
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <>
            <label>Email</label>
            <input type="email" {...field} placeholder="Email..." />
            {errors.email && (
              <p className="error-message">{errors.email.message}</p>
            )}
          </>
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <>
            <label>Lozinka</label>
            <input type="password" {...field} placeholder="Password..." />
            {errors.password && (
              <p className="error-message">{errors.password.message}</p>
            )}
          </>
        )}
      />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Kreiranje..." : "Kreiraj korisnika"}
      </button>
      {serverError && <p className="error-message">{serverError}</p>}
    </form>
  );
};

export default RegisterForm;
