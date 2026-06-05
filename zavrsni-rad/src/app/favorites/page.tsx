import { getServerSession } from "next-auth";
import options from "@/app/api/auth/[...nextauth]/options";
import prisma from "../../../prisma/db";
import FavoriteItem from "./FavoriteItem";
import styles from "./page.module.css";
export default async function FavoritesPage() {
  const session = await getServerSession(options);

  if (!session) {
    return <p>Moraš biti prijavljen da vidiš omiljene recepte.</p>;
  }

  const favorites = await prisma.favorite.findMany({
    where: {
      userId: Number(session.user.id),
    },
    include: {
      recipe: {
        include: {
          author: true,
          categories: true,
          _count: {
            select: { favorites: true },
          },
        },
      },
    },
  });

  return (
    <div className={styles.page}>
      <br></br>
      <h1>❤️ Omiljeni recepti</h1>

      {favorites.length === 0 && <p>Nema spremljenih recepata.</p>}
      <div className={styles.grid}>
        {favorites.map((fav) => (
          <FavoriteItem key={fav.id} fav={fav} />
        ))}
      </div>
    </div>
  );
}
