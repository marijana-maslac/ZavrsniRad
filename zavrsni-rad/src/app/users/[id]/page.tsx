import prisma from "../../../../prisma/db";
import styles from "./page.module.css";

interface Params {
  params: Promise<{ id?: string }>;
}

const AuthorPage = async ({ params }: Params) => {
  const { id } = await params;

  if (!id) {
    return <p>Autor nije pronađen.</p>;
  }
  const authorId = parseInt(id);

  const recipes = await prisma.recipe.findMany({
    where: {
      authorId,
    },
    include: {
      author: true,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: Number(authorId) },
    include: {
      recipes: {
        include: {
          ratings: true,
          favorites: true,
          comments: true,
        },
      },
      _count: {
        select: {
          recipes: true,
        },
      },
    },
  });
  const totalFavorites =
    user?.recipes.reduce((sum, recipe) => sum + recipe.favorites.length, 0) ??
    0;

  const totalComments =
    user?.recipes.reduce((sum, recipe) => sum + recipe.comments.length, 0) ?? 0;
  const allRatings = user?.recipes.flatMap((recipe) => recipe.ratings) ?? [];

  const averageRating =
    allRatings.length > 0
      ? allRatings.reduce((sum, recipe) => sum + recipe.value, 0) /
        allRatings.length
      : 0;

  return (
    <div className={styles.page}>
      <div className={styles.profileCard}>
        <h1>👨‍🍳 {user?.username}</h1>
        <p>Broj recepata: {user?._count.recipes}</p>
        <p>Član od: {user?.createdAt.toLocaleDateString("hr-HR")}</p>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <br></br>
            {totalFavorites} ❤️ recepata autora {user?.username} je spremljeno
          </div>

          <div className={styles.statCard}>
            {averageRating.toFixed(1)} ⭐ Prosječna ocjena od svih recepata
            autora {user?.username}
          </div>

          <div className={styles.statCard}>
            {totalComments} 💬 Ukupan broj komentara na stranici
          </div>
        </div>
      </div>

      <div className={styles.recipesGrid}>
        {recipes.map((recipe) => (
          <a
            key={recipe.id}
            href={`/recipes/${recipe.id}`}
            className={styles.recipeCard}
          >
            <h3>{recipe.title}</h3>
            {recipe.image && (
              <img
                src={recipe.image}
                alt={recipe.title}
                className={styles.recipeImage}
              />
            )}
          </a>
        ))}
      </div>
    </div>
  );
};

export default AuthorPage;
