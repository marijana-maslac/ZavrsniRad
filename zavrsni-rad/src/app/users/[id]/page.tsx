import prisma from "../../../../prisma/db";

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
      recipes: true,
      _count: {
        select: {
          recipes: true,
        },
      },
    },
  });

  return (
    <div>
      <h1>Recepti autora {user?.username}</h1>
      <p>Broj recepata: {user?._count.recipes}</p>
      {recipes.map((r) => (
        <div key={r.id}>
          <a href={`/recipes/${r.id}`}>{r.title}</a>
        </div>
      ))}
    </div>
  );
};

export default AuthorPage;
