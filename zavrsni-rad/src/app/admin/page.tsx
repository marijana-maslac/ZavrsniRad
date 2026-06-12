import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "../../../prisma/db";
import CategoryPieChart from "@/components/CategoryPieChart";
import options from "@/app/api/auth/[...nextauth]/options";
import styles from "./admin.module.css";

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
  const chartData = categories.map((category) => ({
    name: category.name,
    value: category._count.recipes,
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
      id: { in: topRating.map((rating) => rating.recipeId) },
    },
  });

  const sortedRatings = topRatedRecipes
    .map((recipe) => {
      const match = topRating.find((rating) => rating.recipeId === recipe.id);
      return {
        ...recipe,
        avg: match?._avg.value ?? 0,
      };
    })
    .sort((a, b) => b.avg - a.avg);

  const topFavoriteRecipes = await prisma.recipe.findMany({
    where: {
      id: { in: topFavorites.map((favorite) => favorite.recipeId) },
    },
  });

  const sortedFavorites = topFavoriteRecipes
    .map((recipe) => {
      const match = topFavorites.find(
        (favorite) => favorite.recipeId === recipe.id,
      );

      return {
        ...recipe,
        favCount: match?._count.recipeId ?? 0,
      };
    })
    .sort((a, b) => b.favCount - a.favCount);
  return (
    <div>
      <div className={styles.statsGrid}>
        <div className={styles.card}>
          <h3>Recepti</h3>
          <p>{totalRecipes}</p>
        </div>

        <div className={styles.card}>
          <h3>Korisnici</h3>
          <p>{usersCount}</p>
        </div>

        <div className={styles.card}>
          <h3>Kategorije</h3>
          <p>{categoriesCount}</p>
        </div>
      </div>
      <div className={styles.dashboardGrid}>
        <div className={styles.chartCard}>
          <CategoryPieChart data={chartData} />
        </div>

        <div className={styles.sideCards}>
          <div className={styles.topCard}>
            <h2>⭐ Top 5 ocijenjenih</h2>

            <ol>
              {sortedRatings.map((recipe) => (
                <li key={recipe.id}>
                  <Link href={`/recipes/${recipe.id}`}>
                    <span>{recipe.title}</span>
                    <strong>{recipe.avg.toFixed(1)}</strong>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.topCard}>
            <h2>❤️ Top 5 omiljenih</h2>

            <ol>
              {sortedFavorites.map((recipe) => (
                <li key={recipe.id}>
                  <Link href={`/recipes/${recipe.id}`}>
                    <span>{recipe.title}</span>
                    <strong>{recipe.favCount}</strong>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
