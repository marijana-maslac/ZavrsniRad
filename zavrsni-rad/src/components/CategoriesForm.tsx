"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import styles from "../styles/CategoriesForm.module.css";

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
    const response = await axios.get("/api/categories");
    setCategories(response.data);
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

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditValue(category.name);
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

      <form onSubmit={handleSubmit} className={styles.createForm}>
        <input
          type="text"
          placeholder="Nova kategorija"
          value={name}
          className={styles.input}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className={styles.addBtn}>
          Dodaj
        </button>
      </form>

      {success && <p>{success}</p>}
      {error && <p>{error}</p>}

      <h3 className={styles.tableTitle}>Postojeće kategorije</h3>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>#</span>
          <span>Naziv kategorije</span>
          <span>Recepata</span>
          <span>Akcije</span>
        </div>

        {categories.map((category, index) => (
          <div key={category.id} className={styles.row}>
            <span>{index + 1}</span>

            <span>
              {editingId === category.id ? (
                <input
                  className={styles.editInput}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
              ) : (
                <Link href={`/recipes?categories=${category.name}`}>
                  {category.name}
                </Link>
              )}
            </span>

            <span>{category._count?.recipes ?? 0}</span>

            <div className={styles.actions}>
              {editingId === category.id ? (
                <>
                  <button
                    className={styles.saveBtn}
                    onClick={() => saveEdit(category.id)}
                  >
                    Spremi
                  </button>

                  <button className={styles.cancelBtn} onClick={cancelEdit}>
                    Odustani
                  </button>
                </>
              ) : (
                category.name !== "RAZNO" && (
                  <>
                    <button
                      className={styles.editBtn}
                      onClick={() => startEdit(category)}
                    >
                      Uredi
                    </button>

                    <button
                      className={styles.deleteBtn}
                      onClick={() => {
                        if (
                          confirm(
                            "Jesi li siguran da želiš obrisati ovu kategoriju?",
                          )
                        ) {
                          handleDelete(category.id);
                        }
                      }}
                    >
                      Obriši
                    </button>
                  </>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesAdmin;
