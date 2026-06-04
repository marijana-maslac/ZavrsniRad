"use client";

import { signOut } from "next-auth/react";
import styles from "../styles/mainNav.module.css";
export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className={styles.signOutBtn}
    >
      Odjavi se
    </button>
  );
}
