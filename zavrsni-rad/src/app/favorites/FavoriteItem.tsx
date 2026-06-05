"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function FavoriteItem({ fav }: any) {
  const router = useRouter();

  const remove = async () => {
    await axios.post("/api/favorites", {
      recipeId: fav.recipe.id,
    });

    router.refresh();
  };

  return (
    <div className={styles.card}>
      <Link href={`/recipes/${fav.recipe.id}`}>
        {fav.recipe.image && (
          <img src={fav.recipe.image} className={styles.image} />
        )}

        <h3 className={styles.title}>{fav.recipe.title}</h3>

        <p className={styles.author}>{fav.recipe.author.username}</p>

        <p className={styles.categories}>
          {fav.recipe.categories.map((c: any) => c.name).join(", ")}
        </p>
      </Link>

      <button onClick={remove} className={styles.removeBtn}>
        Ukloni iz omiljenih
      </button>
    </div>
  );
}
