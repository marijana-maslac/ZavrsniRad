"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function UserProfile({ user }: any) {
  const router = useRouter();

  const [editMode, setEditMode] = useState(false);

  const [name, setName] = useState(user.name || "");
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || "");

  const handleSave = async () => {
    await axios.patch(`/api/users/${user.id}`, {
      name,
      username,
      email,
    });

    setEditMode(false);
    router.refresh();
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = confirm("Jesi sigurna da želiš obrisati račun?");
    if (!confirmDelete) return;
    try {
      await axios.delete(`/api/users/${user.id}`);
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      alert("Greška pri brisanju računa");
    }
  };

  return (
    <div>
      <h1>👤 {user?.name} </h1>

      <section>
        <h2>Moji podaci</h2>

        {!editMode ? (
          <div>
            <p>
              <b>Ime:</b> {user.name}
            </p>
            <p>
              <b>Username:</b> {user.username}
            </p>
            <p>
              <b>Email:</b> {user.email}
            </p>

            <button onClick={() => setEditMode(true)}>Uredi profil</button>
          </div>
        ) : (
          <div>
            <b>Ime:</b>
            <input value={name} onChange={(e) => setName(e.target.value)} />
            <b>Username:</b>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <b>Email:</b>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />

            <button onClick={handleSave}>Spremi</button>
            <button onClick={() => setEditMode(false)}>Otkaži</button>
          </div>
        )}
      </section>

      <hr />

      <section>
        <h2>🍲 Moji recepti</h2>

        {user.recipes.length === 0 && <p>Nema recepata</p>}

        {user.recipes.map((r: any) => (
          <div key={r.id} style={{ marginBottom: "10px" }}>
            <Link href={`/recipes/${r.id}`}>
              <h3>{r.title}</h3>
            </Link>
            <Link href={`/recipes/edit/${r.id}`}>
              <button>Uredi recept</button>
            </Link>
          </div>
        ))}
      </section>

      <hr />
      {user.role !== "ADMIN" && (
        <section>
          <h2>⚠️ Opasna zona</h2>

          <button
            onClick={handleDeleteAccount}
            style={{ background: "red", color: "white" }}
          >
            Izbriši račun
          </button>
        </section>
      )}
    </div>
  );
}
