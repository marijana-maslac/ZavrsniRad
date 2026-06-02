"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Category = {
  id: number;
  name: string;
};

export default function Filters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateQuery = (key: string, value: string | string[]) => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete(key);

    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value) {
      params.set(key, value);
    }

    router.push(`/recipes?${params.toString()}`);
  };

  const search = searchParams.get("search") || "";
  const difficulty = searchParams.get("difficulty") || "";
  const sort = searchParams.get("sort") || "newest";
  const activeCategories = searchParams.getAll("categories");

  const toggleCategory = (name: string) => {
    const exists = activeCategories.includes(name);

    const updated = exists
      ? activeCategories.filter((c) => c !== name)
      : [...activeCategories, name];

    updateQuery("categories", updated);
  };

  return (
    <div>
      <input
        value={search}
        onChange={(e) => updateQuery("search", e.target.value)}
        placeholder="Pretraži recepte..."
      />

      <select
        value={difficulty}
        onChange={(e) => updateQuery("difficulty", e.target.value)}
      >
        <option value="">Sve</option>
        <option value="LAGANO">Lagano</option>
        <option value="SREDNJE">Srednje</option>
        <option value="TEŠKO">Teško</option>
      </select>

      <select
        value={sort}
        onChange={(e) => updateQuery("sort", e.target.value)}
      >
        <option value="newest">Najnoviji</option>
        <option value="rating">Najbolje ocijenjeni</option>
        <option value="favorites">Najomiljeniji</option>
      </select>

      <div>
        {categories.map((cat) => (
          <label key={cat.id}>
            <input
              type="checkbox"
              checked={activeCategories.includes(cat.name)}
              onChange={() => toggleCategory(cat.name)}
            />
            {cat.name}
          </label>
        ))}
        <button type="button" onClick={() => router.push("/recipes")}>
          Očisti filtere
        </button>
      </div>
    </div>
  );
}
