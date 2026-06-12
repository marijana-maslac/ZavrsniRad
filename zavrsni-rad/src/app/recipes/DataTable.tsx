import Link from "next/link";
import styles from "./DataTable.module.css";
import { Prisma } from "@/generated/prisma/client";

type RecipeWithAuthor = Prisma.RecipeGetPayload<{
  include: {
    author: true;
  };
}>;
export default function DataTable({
  recipes,
}: {
  recipes: RecipeWithAuthor[];
}) {
  return (
    <div className={styles.container}>
      {recipes.map((recipe) => (
        <Link
          key={recipe.id}
          href={`/recipes/${recipe.id}`}
          className={styles.card}
        >
          <img src={recipe.image || "/food-placeholder.jpg"} />

          <div className={styles.info}>
            <div className={styles.title}>{recipe.title}</div>
            <div className={styles.author}>{recipe.author.name}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
