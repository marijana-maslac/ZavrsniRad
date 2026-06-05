"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { userSchema } from "../../validationSchema/userSchema";
import styles from "../styles/RegisterForm.module.css";
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
    <div>
      <br></br>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <>
              <label>Ime</label>
              <input type="text" {...field} placeholder="Ime..." />
              {errors.name && (
                <p className={styles.error}>{errors.name.message}</p>
              )}
            </>
          )}
        />
        <br></br>
        <br></br>
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <>
              <label>Korisničko ime</label>
              <input type="text" {...field} placeholder="Username..." />
              {errors.username && (
                <p className={styles.error}>{errors.username.message}</p>
              )}
            </>
          )}
        />
        <br></br>
        <br></br>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <>
              <label>Email</label>
              <input type="email" {...field} placeholder="Email..." />
              {errors.email && (
                <p className={styles.error}>{errors.email.message}</p>
              )}
            </>
          )}
        />
        <br></br>
        <br></br>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <>
              <label>Lozinka</label>
              <input type="password" {...field} placeholder="Password..." />
              {errors.password && (
                <p className={styles.error}>{errors.password.message}</p>
              )}
            </>
          )}
        />
        <br></br>
        <br></br>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Kreiranje..." : "Kreiraj korisnika"}
        </button>
        {serverError && <p className={styles.error}>{serverError}</p>}
      </form>
    </div>
  );
};

export default RegisterForm;
