import Link from "next/link";
import prisma from "../../prisma/db";
import styles from "./page.module.css";

export default async function Home() {
  const topFavorites = await prisma.recipe.findMany({
    take: 6,
    orderBy: {
      favorites: {
        _count: "desc",
      },
    },
    include: {
      categories: true,
      _count: { select: { favorites: true } },
    },
  });

  const recipes = await prisma.recipe.findMany({
    include: {
      ratings: true,
    },
  });

  const ratedWithAvg = recipes
    .map((r) => ({
      ...r,
      avg:
        r.ratings.length > 0
          ? r.ratings.reduce((s, x) => s + x.value, 0) / r.ratings.length
          : 0,
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 6);

  const categories = await prisma.category.findMany();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Dobrodošli u Recipe App</h1>

          <p>
            Pronađi, spremi i podijeli svoje omiljene recepte. Istraži recepte
            drugih korisnika ili dodaj vlastite kulinarske ideje.
          </p>

          <div className={styles.heroButtons}>
            <Link href="/recipes" className={styles.primaryBtn}>
              Pregledaj recepte
            </Link>

            <Link href="/recipes/new" className={styles.secondaryBtn}>
              Dodaj recept
            </Link>
          </div>
        </div>
      </section>
      <section className={styles.features}>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>📖</span>
          <h3>Stotine recepata</h3>
          <p>Pronađi inspiraciju za svaki obrok na jednom mjestu.</p>
        </div>

        <div className={styles.feature}>
          <span className={styles.featureIcon}>❤️</span>
          <h3>Spremi favorite</h3>
          <p>Sačuvaj recepte koje želiš ponovno pripremati.</p>
        </div>

        <div className={styles.feature}>
          <span className={styles.featureIcon}>👥</span>
          <h3>Dijeli s zajednicom</h3>
          <p>Otkrij recepte drugih korisnika i podijeli svoje.</p>
        </div>

        <div className={styles.feature}>
          <span className={styles.featureIcon}>👨‍🍳</span>
          <h3>Dodaj vlastite recepte</h3>
          <p>Kreiraj i organiziraj svoju zbirku omiljenih jela.</p>
        </div>
      </section>
      <section className={styles.section}>
        <h2>Kategorije</h2>

        <div className={styles.categoryGrid}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/recipes?categories=${cat.name}`}
              className={styles.categoryPill}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>❤️ Najomiljeniji</h2>

        <div className={styles.cardGrid}>
          {topFavorites.map((r) => (
            <Link
              key={r.id}
              href={`/recipes/${r.id}`}
              className={styles.recipeCard}
              style={{
                backgroundImage: `url(${r.image || "/food-placeholder.jpg"})`,
              }}
            >
              <div className={styles.overlay}>
                <h3>{r.title}</h3>
                <p>❤️ {r._count.favorites}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>⭐ Najbolje ocijenjeni</h2>

        <div className={styles.cardGrid}>
          {ratedWithAvg.map((r) => (
            <Link
              key={r.id}
              href={`/recipes/${r.id}`}
              className={styles.recipeCard}
              style={{
                backgroundImage: `url(${r.image || "/food-placeholder.jpg"})`,
              }}
            >
              <div className={styles.overlay}>
                <h3>{r.title}</h3>
                <p>⭐ {r.avg.toFixed(1)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
