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
              {sortedRatings.map((r) => (
                <li key={r.id}>
                  <Link href={`/recipes/${r.id}`}>
                    <span>{r.title}</span>
                    <strong>{r.avg.toFixed(1)}</strong>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.topCard}>
            <h2>❤️ Top 5 omiljenih</h2>

            <ol>
              {sortedFavorites.map((r) => (
                <li key={r.id}>
                  <Link href={`/recipes/${r.id}`}>
                    <span>{r.title}</span>
                    <strong>{r.favCount}</strong>
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
