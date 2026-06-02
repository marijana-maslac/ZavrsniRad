"use client";
import { Prisma } from "@/generated/prisma/client";
import DeleteButton from "./deleteButton";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import BackButton from "./backButton";
import Rating from "@/components/Rating";
import { useState } from "react";
import CommentsModal from "@/components/CommentsModal";
import error from "next/error";

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
  const isOwner = session?.user?.id === recipe.author.id;
  const isAdmin = session?.user?.role === "ADMIN";
  const canEdit = isOwner || isAdmin;

  const [openComments, setOpenComments] = useState(false);
  const [commentCount, setCommentCount] = useState(
    recipe.comments?.length ?? 0,
  );

  return (
    <div>
      <h1>{recipe.title}</h1>
      {recipe.image && (
        <div style={{ marginBottom: "20px" }}>
          <img
            src={recipe.image}
            alt={recipe.title}
            style={{
              maxWidth: "300px",
              width: "100%",
              height: "auto",
              borderRadius: "8px",
            }}
          />
        </div>
      )}
      <p>{recipe.description}</p>
      <p>
        Autor:{" "}
        <Link href={`/users/${recipe.author.id}`}>
          {recipe.author.username}
        </Link>
      </p>
      <FavoriteButton
        recipeId={recipe.id}
        initialIsFavorite={initialIsFavorite}
      />
      <p>❤️ {recipe._count?.favorites ?? 0} osoba je spremila ovaj recept</p>{" "}
      <Rating recipeId={recipe.id} />
      <div>
        <p>Kategorije:</p>
        <ul>
          {recipe.categories?.map((cat) => (
            <li key={cat.id}>{cat.name}</li>
          ))}
        </ul>
      </div>{" "}
      <p>Vrijeme kuhanja: {recipe.cooking_time} min</p>
      <p>Težina: {recipe.difficulty}</p>
      <p>Broj porcija: {recipe.servings}</p>
      {recipe.ingredients && (
        <div>
          <h3>Sastojci:</h3>
          <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
            {recipe.ingredients.map((ing) => (
              <li key={ing.id}>
                {ing.name} {ing.amount ?? ""} {ing.unit ?? ""}
              </li>
            ))}
          </ul>
        </div>
      )}
      {recipe.steps && (
        <div>
          <h3>Koraci:</h3>
          <ol>
            {recipe.steps
              .sort((a, b) => a.step_order - b.step_order)
              .map((step, index) => (
                <li key={step.id}>
                  <strong>{index + 1}. korak:</strong> {step.description}{" "}
                  {step.image && (
                    <div style={{ marginBottom: "20px" }}>
                      <img
                        src={step.image}
                        alt={"stepimage"}
                        style={{
                          maxWidth: "300px",
                          width: "100%",
                          height: "auto",
                          borderRadius: "8px",
                        }}
                      />
                    </div>
                  )}
                </li>
              ))}
          </ol>
          <button onClick={() => setOpenComments(true)}>
            Komentari ({commentCount})
          </button>
          {openComments && (
            <CommentsModal
              recipeId={recipe.id}
              onClose={() => setOpenComments(false)}
              setCommentCount={setCommentCount}
            />
          )}
        </div>
      )}
      <BackButton />
      {canEdit && (
        <Link href={`/recipes/edit/${recipe.id}`}>
          <button style={{ padding: "5px 10px", marginBottom: "20px" }}>
            Uredi
          </button>
        </Link>
      )}
      {canEdit && <DeleteButton recipeId={recipe.id} />}
    </div>
  );
};

export default RecipeDetails;
