"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useSession } from "next-auth/react";
import styles from "../styles/UserForm.module.css";

type User = {
  id: number;
  username: string;
  email: string;
  _count?: {
    recipes: number;
  };
};

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const { data: session } = useSession();

  const fetchUsers = async () => {
    const res = await axios.get("/api/users");
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/users/${id}`);
      fetchUsers();
    } catch {
      setError("Greška pri brisanju");
    }
  };

  return (
    <div className={styles.page}>
      <h2>Korisnici</h2>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>#</span>
          <span>Korisničko ime</span>
          <span>Recepata</span>
          <span>Akcije</span>
        </div>

        {users.map((user, index) => (
          <div key={user.id} className={styles.row}>
            <span>{index + 1}</span>

            <Link href={`/users/${user.id}`} className={styles.userLink}>
              {user.username}
            </Link>

            <span>{user._count?.recipes ?? 0}</span>

            <div className={styles.actions}>
              {session?.user?.id !== user.id && (
                <button
                  className={styles.deleteBtn}
                  onClick={() => {
                    if (confirm("Obrisati korisnika?")) {
                      handleDelete(user.id);
                    }
                  }}
                >
                  Obriši
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
