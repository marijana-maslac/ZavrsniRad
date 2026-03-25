import { Prisma } from "@/generated/prisma/client";
import DeleteButton from "./[id]/deleteButton";
import Link from "next/link";

type RecipeWithRelations = Prisma.RecipeGetPayload<{
  include: {
    author: true;
  };
}>;

interface Props {
  recipes: RecipeWithRelations[];
}

const DataTable = ({ recipes }: Props) => {
  return (
    <div>
      <br></br>
      <table border={1}>
        <thead>
          <tr>
            <th></th>
            <th>Naslov</th>
            <th>Opis</th>
            <th>Kategorija</th>
            <th>Vrijeme kuhanja</th>
            <th>Težina</th>
            <th>Detaljno</th>
            <th>Obriši</th>
          </tr>
        </thead>

        <tbody>
          {recipes.map((recipe) => (
            <tr key={recipe.id}>
              <td>
                {recipe.image ? (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    width={100}
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <span></span>
                )}
              </td>
              <td>{recipe.title}</td>
              <td>{recipe.description}</td>
              <td>{recipe.category}</td>
              <td>{recipe.cooking_time} min</td>
              <td>{recipe.difficulty}</td>
              <th>
                <Link href={"/recipes/" + recipe.id}>Detaljno</Link>
              </th>
              <td>
                <DeleteButton recipeId={recipe.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
