import { getServerSession } from "next-auth";
import options from "../api/auth/[...nextauth]/options";
import Link from "next/link";
import prisma from "../../../prisma/db";

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
          favorites: true,
          _count: {
            select: {
              favorites: true,
            },
          },
        },
      },
    },
  });

  return (
    <div>
      <h1>❤️ Omiljeni recepti</h1>

      {favorites.length === 0 && <p>Nema spremljenih recepata.</p>}

      {favorites.map((fav) => (
        <div key={fav.id} style={{ marginBottom: "20px" }}>
          <Link href={`/recipes/${fav.recipe.id}`}>
            <h3>{fav.recipe.title}</h3>
          </Link>

          {fav.recipe.image && (
            <img
              src={fav.recipe.image}
              alt={fav.recipe.title}
              style={{ width: "150px", borderRadius: "8px" }}
            />
          )}

          <p>Autor: {fav.recipe.author.username}</p>

          <p>
            Kategorije: {fav.recipe.categories.map((c) => c.name).join(", ")}
          </p>
        </div>
      ))}
    </div>
  );
}
