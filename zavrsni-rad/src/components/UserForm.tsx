"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useSession } from "next-auth/react";

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
    <div>
      <h2>Korisnici</h2>

      {users.map((user, index) => (
        <div key={user.id}>
          <span>{index + 1}. </span>

          <Link href={`/users/${user.id}`}>{user.username}</Link>

          <span> ({user._count?.recipes ?? 0})</span>

          {session?.user?.id !== user.id && (
            <button
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
      ))}

      {error && <p>{error}</p>}
    </div>
  );
}
