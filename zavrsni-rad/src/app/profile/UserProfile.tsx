"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import styles from "./page.module.css";

export default function UserProfile({ user }: any) {
  const router = useRouter();

  const [editMode, setEditMode] = useState(false);

  const [name, setName] = useState(user.name || "");
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMode, setPasswordMode] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

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

  const handleChangePassword = async () => {
    try {
      await axios.patch(`/api/users/${user.id}/password`, {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordError("");
      setPasswordSuccess("Lozinka uspješno promijenjena");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMode(false);
    } catch (error: any) {
      setPasswordSuccess("");

      const data = error.response?.data;

      if (data?.errors?.length) {
        setPasswordError(data.errors[0].message);
      } else if (data?.message) {
        setPasswordError(data.message);
      } else {
        setPasswordError("Greška pri promjeni lozinke");
      }
    }
  };
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>{user?.name}</h1>
            <p className={styles.subtitle}>Tvoj mali kutak s receptima</p>
          </div>
        </div>

        <div className={styles.card}>
          <h2>Moji podaci</h2>

          {!editMode ? (
            <div className={styles.info}>
              <p>
                <b>Ime:</b> {user.name}
              </p>
              <p>
                <b>Username:</b> {user.username}
              </p>
              <p>
                <b>Email:</b> {user.email}
              </p>

              <button
                onClick={() => setEditMode(true)}
                className={styles.btnPrimary}
              >
                Uredi profil
              </button>
            </div>
          ) : (
            <div className={styles.form}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ime"
              />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />

              <div className={styles.row}>
                <button onClick={handleSave} className={styles.btnPrimary}>
                  Spremi
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className={styles.btnSecondary}
                >
                  Otkaži
                </button>
              </div>
            </div>
          )}
          {!passwordMode ? (
            <>
              {passwordSuccess && (
                <p className={styles.success}>{passwordSuccess}</p>
              )}

              <button
                onClick={() => {
                  setPasswordError("");
                  setPasswordSuccess("");
                  setPasswordMode(true);
                }}
                className={styles.btnPrimary}
              >
                Promijeni lozinku
              </button>
            </>
          ) : (
            <div className={styles.form}>
              <input
                type="password"
                placeholder="Trenutna lozinka"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <input
                type="password"
                placeholder="Nova lozinka"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <input
                type="password"
                placeholder="Potvrdi novu lozinku"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              {passwordError && <p className={styles.error}>{passwordError}</p>}

              <div className={styles.row}>
                <button
                  onClick={handleChangePassword}
                  className={styles.btnPrimary}
                >
                  Spremi
                </button>

                <button
                  onClick={() => {
                    setPasswordMode(false);
                    setPasswordError("");
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className={styles.btnSecondary}
                >
                  Odustani
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.card}>
          <h2>🍲 Moji recepti</h2>

          {user.recipes.length === 0 && (
            <p className={styles.muted}>Nema recepata još.</p>
          )}

          <div className={styles.recipes}>
            {user.recipes.map((recipe: any) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className={styles.recipeCard}
              >
                <h3>{recipe.title}</h3>
                <span>➡️ otvori</span>
              </Link>
            ))}
          </div>
        </div>

        {user.role !== "ADMIN" && (
          <div className={`${styles.card} ${styles.danger}`}>
            <h2>⚠️ Opasna zona</h2>
            <button onClick={handleDeleteAccount} className={styles.btnDanger}>
              Izbriši račun
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
