import { Prisma } from "@/generated/prisma/client";
import DeleteButton from "./deleteButton";
import Link from "next/link";

type RecipeWithRelations = Prisma.RecipeGetPayload<{
  include: { author: true; ingredients: true; steps: true };
}>;

interface Props {
  recipe: RecipeWithRelations;
}

const RecipeDetails = ({ recipe }: Props) => {
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
      <p>Autor: {recipe.author.username}</p>
      <p>Kategorija: {recipe.category}</p>
      <p>Vrijeme kuhanja: {recipe.cooking_time} min</p>
      <p>Težina: {recipe.difficulty}</p>

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
        </div>
      )}

      <Link href="/recipes">
        <button style={{ padding: "5px 10px", marginBottom: "20px" }}>
          Natrag
        </button>
      </Link>
      <Link href={`/recipes/edit/${recipe.id}`}>
        <button style={{ padding: "5px 10px", marginBottom: "20px" }}>
          Uredi
        </button>
      </Link>

      <DeleteButton recipeId={recipe.id} />
    </div>
  );
};

export default RecipeDetails;
