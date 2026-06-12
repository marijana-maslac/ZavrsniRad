"use client";
import { Prisma } from "@/generated/prisma/client";
import DeleteButton from "./deleteButton";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import BackButton from "./backButton";
import Rating from "@/components/Rating";
import { useState } from "react";
import CommentsModal from "@/components/CommentsModal";
import styles from "./recipeDetails.module.css";

type RecipeWithRelations = Prisma.RecipeGetPayload<{
  include: {
    author: true;
    ingredients: true;
    steps: true;
    categories: true;
    _count: {
      select: {
        favorites: true;
      };
    };
    comments: true;
  };
}>;

interface Props {
  recipe: RecipeWithRelations;
  initialIsFavorite: boolean;
  session: any;
}

const RecipeDetails = ({ recipe, initialIsFavorite, session }: Props) => {
  const isAuthor = session?.user?.id === recipe.author.id;
  const isAdmin = session?.user?.role === "ADMIN";
  const canEdit = isAuthor || isAdmin;

  const [openComments, setOpenComments] = useState(false);
  const [commentCount, setCommentCount] = useState(
    recipe.comments?.length ?? 0,
  );

  return (
    <div className={styles.page}>
      <BackButton className={`${styles.actionBtn} ${styles.secondaryBtn}`} />
      <section className={styles.hero}>
        <div className={styles.heroInfo}>
          <div className={styles.favoriteSection}>
            <FavoriteButton
              recipeId={recipe.id}
              initialIsFavorite={initialIsFavorite}
            />
            <span>{recipe._count?.favorites ?? 0}</span>
          </div>
          <p className={styles.author}>
            <Link href={`/users/${recipe.author.id}`}>
              {recipe.author.username}
            </Link>
          </p>
          <p style={{ fontSize: "10px", fontFamily: "Poppins, sans-serif" }}>
            {new Date(recipe.createdAt).toLocaleDateString("hr-HR")}
          </p>
          <div className={styles.titleRow}>
            <h1>{recipe.title}</h1>
          </div>
          <p className={styles.description}>{recipe.description}</p>
          <div className={styles.categories}>
            <span>
              {recipe.categories?.map((category) => (
                <span key={category.id}>
                  {category.name} <br></br>
                </span>
              ))}
            </span>
          </div>
        </div>
        <div className={styles.heroImage}>
          {recipe.image && <img src={recipe.image} alt={recipe.title} />}
        </div>
      </section>
      <section className={styles.stats}>
        <div className={styles.statCardInteractive}>
          <Rating recipeId={recipe.id} />
          <button
            onClick={() => setOpenComments(true)}
            className={styles.commentBtn}
          >
            Napiši komentar ({commentCount})
          </button>
          {openComments && (
            <CommentsModal
              recipeId={recipe.id}
              onClose={() => setOpenComments(false)}
              setCommentCount={setCommentCount}
            />
          )}
        </div>
        <div className={styles.statCard}>
          <p>Vrijeme kuhanja</p>⏱ {recipe.cooking_time} min
        </div>
        <div className={styles.statCard}>
          <p>Težina kuhanja</p>👨‍🍳 {recipe.difficulty}
        </div>
        <div className={styles.statCard}>
          <p>Broj porcija</p>🍽 {recipe.servings}
        </div>
      </section>
      <section className={styles.content}>
        <aside className={styles.ingredients}>
          <h2>Sastojci</h2>
          <br></br>
          <ul>
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient.id}>
                {ingredient.name} {ingredient.amount ?? ""}{" "}
                {ingredient.unit ?? ""}
              </li>
            ))}
          </ul>
        </aside>
        <div className={styles.steps}>
          <h2>Priprema</h2>

          {recipe.steps
            .sort((a, b) => a.step_order - b.step_order)
            .map((step, index) => (
              <div key={step.id} className={styles.stepCard}>
                <div className={styles.stepText}>
                  <h3>{index + 1}.</h3>

                  <p>{step.description}</p>
                </div>
                {step.image && (
                  <img
                    src={step.image}
                    alt={`Korak ${index + 1}`}
                    style={{
                      maxWidth: "300px",
                      width: "100%",
                      height: "auto",
                      borderRadius: "8px",
                    }}
                    className={styles.stepImage}
                  />
                )}
              </div>
            ))}
        </div>
      </section>
      <section className={styles.actions}>
        {canEdit && (
          <Link href={`/recipes/edit/${recipe.id}`}>
            <button className={`${styles.actionBtn} ${styles.primaryBtn}`}>
              Uredi
            </button>
          </Link>
        )}
        {canEdit && (
          <DeleteButton
            recipeId={recipe.id}
            className={`${styles.actionBtn} ${styles.dangerBtn}`}
          />
        )}
      </section>
    </div>
  );
};

export default RecipeDetails;
