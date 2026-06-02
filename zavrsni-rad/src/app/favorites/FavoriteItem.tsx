"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FavoriteItem({ fav }: any) {
  const router = useRouter();

  const remove = async () => {
    await axios.post("/api/favorites", {
      recipeId: fav.recipe.id,
    });

    router.refresh();
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <Link href={`/recipes/${fav.recipe.id}`}>
        <h3>{fav.recipe.title}</h3>
      </Link>

      {fav.recipe.image && (
        <img
          src={fav.recipe.image}
          alt={fav.recipe.title}
          style={{ width: "150px", borderRadius: "8px" }}
        />
      )}

      <p>Autor: {fav.recipe.author.username}</p>

      <p>
        Kategorije: {fav.recipe.categories.map((c: any) => c.name).join(", ")}
      </p>

      <button onClick={remove}>❌ Makni iz favorita</button>
    </div>
  );
}
