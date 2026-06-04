import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "../../../prisma/db";
import CategoryPieChart from "@/components/CategoryPieChart";
import options from "@/app/api/auth/[...nextauth]/options";

export default async function AdminPage() {
  const session = await getServerSession(options);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }
  const categoriesCount = await prisma.category.count();
  const usersCount = await prisma.user.count();
  const totalRecipes = await prisma.recipe.count();
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          recipes: true,
        },
      },
    },
  });
  const chartData = categories.map((c) => ({
    name: c.name,
    value: c._count.recipes,
  }));

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

  const sortedRatings = topRatedRecipes
    .map((r) => {
      const match = topRating.find((t) => t.recipeId === r.id);
      return {
        ...r,
        avg: match?._avg.value ?? 0,
      };
    })
    .sort((a, b) => b.avg - a.avg);

  const topFavoriteRecipes = await prisma.recipe.findMany({
    where: {
      id: { in: topFavorites.map((t) => t.recipeId) },
    },
  });

  const sortedFavorites = topFavoriteRecipes
    .map((r) => {
      const match = topFavorites.find((t) => t.recipeId === r.id);

      return {
        ...r,
        favCount: match?._count.recipeId ?? 0,
      };
    })
    .sort((a, b) => b.favCount - a.favCount);
  return (
    <div>
      <h1>Admin panel</h1>
      <Link href="/admin/categories">
        Popis kategorija recepata ({categoriesCount})
      </Link>
      <CategoryPieChart data={chartData} />
      <br></br> <hr />
      <p>Ukupan broj recepata: {totalRecipes}</p>
      <br></br> <hr />
      <Link href="/admin/users">Popis korisnika ({usersCount})</Link>
      <hr />
      <h2>Top 5 najbolje ocjenjenih recepata</h2>
      <ol>
        {sortedRatings.map((r) => (
          <li key={r.id}>
            <Link href={`/recipes/${r.id}`}>
              {r.title} ({r.avg.toFixed(1)})
            </Link>
          </li>
        ))}
      </ol>{" "}
      <hr />
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
