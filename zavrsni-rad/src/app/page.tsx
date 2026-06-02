import Link from "next/link";
import prisma from "../../prisma/db";
import styles from "./page.module.css";

export default async function Home() {
  const topFavorites = await prisma.recipe.findMany({
    take: 5,
    orderBy: {
      favorites: {
        _count: "desc",
      },
    },
    include: {
      categories: true,
    },
  });

  const topRated = await prisma.recipe.findMany({
    take: 5,
    include: {
      ratings: true,
      categories: true,
    },
  });

  const ratedWithAvg = topRated
    .map((r) => ({
      ...r,
      avg: r.ratings.reduce((s, x) => s + x.value, 0) / (r.ratings.length || 1),
    }))
    .sort((a, b) => b.avg - a.avg);

  const categories = await prisma.category.findMany();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1>Dobrodošli u Recipe App 🍽️</h1>
          <p>
            Pronađi, ocijeni i spremi svoje omiljene recepte na jednom mjestu.
          </p>

          <Link className={styles.cta} href="/recipes">
            Pregledaj sve recepte
          </Link>
        </div>

        <img src="/food-hero.jpg" alt="food" className={styles.heroImage} />
      </section>

      <section className={styles.section}>
        <h2>Kategorije</h2>

        <div className={styles.grid}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/recipes?categories=${cat.name}`}
              className={styles.card}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>❤️ Najomiljeniji recepti</h2>

        <div className={styles.grid}>
          {topFavorites.map((r) => (
            <Link key={r.id} href={`/recipes/${r.id}`} className={styles.card}>
              {r.title}
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>⭐ Najbolje ocijenjeni</h2>

        <div className={styles.grid}>
          {ratedWithAvg.map((r) => (
            <Link key={r.id} href={`/recipes/${r.id}`} className={styles.card}>
              {r.title} ({r.avg.toFixed(1)})
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
