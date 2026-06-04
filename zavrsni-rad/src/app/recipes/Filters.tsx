"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styles from "./filters.module.css";

type Category = {
  id: number;
  name: string;
};

export default function Filters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const difficulty = searchParams.get("difficulty") || "";
  const sort = searchParams.get("sort") || "newest";
  const search = searchParams.get("search") || "";

  const update = (key: string, value: string | string[]) => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete(key);

    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value) {
      params.set(key, value);
    }

    router.push(`/recipes?${params.toString()}`);
  };

  const activeCategories = searchParams.getAll("categories");

  const toggle = (name: string) => {
    const exists = activeCategories.includes(name);

    const updated = exists
      ? activeCategories.filter((c) => c !== name)
      : [...activeCategories, name];

    update("categories", updated);
  };

  return (
    <div className={styles.filters}>
      <br></br>
      <div className={styles.filtersBar}>
        <input
          value={search}
          placeholder="🔍 Pretraži recepte..."
          className={styles.input}
          onChange={(e) => update("search", e.target.value)}
        />

        <select
          value={difficulty}
          className={styles.select}
          onChange={(e) => update("difficulty", e.target.value)}
        >
          <option value="">Sve težine</option>
          <option value="LAGANO">Lagano</option>
          <option value="SREDNJE">Srednje</option>
          <option value="TEŠKO">Teško</option>
        </select>

        <select
          value={sort}
          className={styles.select}
          onChange={(e) => update("sort", e.target.value)}
        >
          <option value="newest">🕒 Najnoviji</option>
          <option value="rating">⭐ Najbolje ocijenjeni</option>
          <option value="favorites">❤️ Najomiljeniji</option>
        </select>
        <button
          className={styles.clearBtn}
          onClick={() => router.push("/recipes")}
        >
          Očisti filtere
        </button>

        <div className={styles.pills}>
          {categories.map((c) => {
            const active = activeCategories.includes(c.name);

            return (
              <button
                key={c.id}
                onClick={() => toggle(c.name)}
                className={`${styles.pill} ${active ? styles.active : ""}`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
