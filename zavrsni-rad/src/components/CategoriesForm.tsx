"use client";

import { useState } from "react";
import axios from "axios";

const CategoriesForm = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Ime kategorije je obavezno");
      return;
    }

    try {
      await axios.post("/api/categories", { name });
      setSuccess("Kategorija uspješno kreirana");
      setName("");
    } catch {
      setError("Greška pri kreiranju kategorije");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Kreiraj kategoriju</h2>

      <input
        type="text"
        placeholder="Ime kategorije"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button type="submit">Spremi</button>

      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};

export default CategoriesForm;
