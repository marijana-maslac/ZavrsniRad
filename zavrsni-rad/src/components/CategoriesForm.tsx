"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Category = {
  id: number;
  name: string;
  _count?: {
    recipes: number;
  };
};

const CategoriesAdmin = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCategories = async () => {
    const res = await axios.get("/api/categories");
    setCategories(res.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Ime kategorije je obavezno");
      return;
    }

    try {
      await axios.post("/api/categories", { name });
      setName("");
      setSuccess("Kategorija kreirana");
      fetchCategories();
    } catch {
      setError("Greška pri kreiranju");
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditValue(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = async (id: number) => {
    if (!editValue.trim()) return;

    try {
      await axios.patch(`/api/categories/${id}`, {
        name: editValue,
      });

      setEditingId(null);
      setEditValue("");
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.error || "Greška pri uređivanju");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/categories/${id}`);
      fetchCategories();
    } catch {
      setError("Greška pri brisanju");
    }
  };

  return (
    <div>
      <h2>Admin kategorije</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nova kategorija"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Dodaj</button>
      </form>

      {success && <p>{success}</p>}
      {error && <p>{error}</p>}

      <h3>Postojeće kategorije</h3>

      {categories.map((cat, index) => (
        <div key={cat.id}>
          {" "}
          <span>{index + 1}. </span>
          {editingId === cat.id ? (
            <>
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
              />
              <button onClick={() => saveEdit(cat.id)}>Spremi</button>
              <button onClick={cancelEdit}>Odustani</button>
            </>
          ) : (
            <>
              <span>
                {cat.name} ({cat._count?.recipes ?? 0})
              </span>{" "}
              {cat.name !== "RAZNO" && (
                <>
                  <button onClick={() => startEdit(cat)}> Uredi</button>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "Jesi li siguran da želiš obrisati ovu kategoriju?",
                        )
                      ) {
                        handleDelete(cat.id);
                      }
                    }}
                  >
                    Obriši
                  </button>
                </>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default CategoriesAdmin;
