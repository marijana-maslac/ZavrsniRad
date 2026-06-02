"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <h1>Prijava</h1>

      <input
        placeholder="Korisničko ime"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
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
