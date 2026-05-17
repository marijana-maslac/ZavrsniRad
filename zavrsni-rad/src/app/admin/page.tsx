import { getServerSession } from "next-auth";
import options from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "../../../prisma/db";

export default async function AdminPage() {
  const session = await getServerSession(options);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }
  const categoriesCount = await prisma.category.count();
  const usersCount = await prisma.user.count();

  const topRating = await prisma.rating.groupBy({
    by: ["recipeId"],
    _avg: { value: true },
    orderBy: { _avg: { value: "desc" } },
    take: 5,
  });

  const topFavorites = await prisma.favorite.groupBy({
    by: ["recipeId"],
    _count: { recipeId: true },
    orderBy: {
      _count: { recipeId: "desc" },
    },
    take: 5,
  });

  const topRatedRecipes = await prisma.recipe.findMany({
    where: {
      id: { in: topRating.map((t) => t.recipeId) },
    },
  });

  const sortedRatings = topRatedRecipes.map((r) => {
    const match = topRating.find((t) => t.recipeId === r.id);
    return {
      ...r,
      avg: match?._avg.value ?? 0,
    };
  });

  const topFavoriteRecipes = await prisma.recipe.findMany({
    where: {
      id: { in: topFavorites.map((t) => t.recipeId) },
    },
  });

  const sortedFavorites = topFavoriteRecipes.map((r) => {
    const match = topFavorites.find((t) => t.recipeId === r.id);

    return {
      ...r,
      favCount: match?._count.recipeId ?? 0,
    };
  });
  return (
    <div>
      <h1>Admin panel</h1>

      <Link href="/admin/categories">
        Popis kategorija recepata ({categoriesCount})
      </Link>
      <br></br>
      <Link href="/admin/users">Popis korisnika ({usersCount})</Link>

      <h2>Top 5 najbolje ocjenjenih recepata</h2>

      <ol>
        {sortedRatings.map((r) => (
          <li key={r.id}>
            <Link href={`/recipes/${r.id}`}>
              {r.title} ({r.avg.toFixed(1)})
            </Link>
          </li>
        ))}
      </ol>
      <h2>Top 5 omiljenih recepata</h2>

      <ol>
        {sortedFavorites.map((r) => (
          <li key={r.id}>
            <Link href={`/recipes/${r.id}`}>
              {r.title} ❤️ ({r.favCount})
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
