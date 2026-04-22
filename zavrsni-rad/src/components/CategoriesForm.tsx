"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Category = {
  id: number;
  name: string;
};

const CategoriesAdmin = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
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

  // DELETE
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

      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h3>Postojeće kategorije</h3>

      {categories.map((cat) => (
        <div key={cat.id} style={{ display: "flex", gap: "10px" }}>
          <span>{cat.name}</span>
          <button
            onClick={() => {
              if (
                confirm("Jesi li siguran da želiš obrisati ovu kategoriju?")
              ) {
                handleDelete(cat.id);
              }
            }}
          >
            Obriši
          </button>{" "}
        </div>
      ))}
    </div>
  );
};

export default CategoriesAdmin;
