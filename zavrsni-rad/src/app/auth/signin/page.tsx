"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    await signIn("password", {
      email,
      password,
      callbackUrl: "/",
    });
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <h1>Prijava</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Lozinka"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Prijavi se</button>

      <p style={{ marginTop: 20 }}>
        Nemaš račun?{" "}
        <button onClick={() => router.push("/register")}>Kreiraj profil</button>
      </p>
    </div>
  );
}
