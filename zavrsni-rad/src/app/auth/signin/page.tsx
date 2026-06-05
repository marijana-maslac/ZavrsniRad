"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function SignInPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    await signIn("password", {
      username,
      password,
      callbackUrl: "/",
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Prijavi se na RecipeApp</h1>

        <input
          className={styles.input}
          placeholder="Korisničko ime"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className={styles.input}
          placeholder="Lozinka"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin} className={styles.button}>
          Prijavi se
        </button>

        <p className={styles.footer}>
          Nemaš račun?{" "}
          <span
            onClick={() => router.push("/register")}
            className={styles.link}
          >
            Kreiraj profil
          </span>
        </p>
      </div>
    </div>
  );
}
