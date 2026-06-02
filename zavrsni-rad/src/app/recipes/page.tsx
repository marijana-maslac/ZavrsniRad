import Link from "next/link";
import prisma from "../../../prisma/db";
import DataTable from "./DataTable";
import Filters from "./Filters";
import { getServerSession } from "next-auth";
import options from "@/app/api/auth/[...nextauth]/options";

type SearchParams = {
  search?: string;
  difficulty?: "LAGANO" | "SREDNJE" | "TEŠKO";
  sort?: "newest" | "rating" | "favorites";
  categories?: string | string[];
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function Recipes({ searchParams }: Props) {
  const sp = await searchParams;

  const session = await getServerSession(options);

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const cats =
    typeof sp.categories === "string" ? [sp.categories] : sp.categories || [];

  const where: any = {};

  if (sp.search) {
    where.title = {
      contains: sp.search,
      mode: "insensitive",
    };
  }
  let recipeIdsByRating: number[] | null = null;

  if (sp.sort === "rating") {
    const ratings = await prisma.rating.groupBy({
      by: ["recipeId"],
      _avg: {
        value: true,
      },
      orderBy: {
        _avg: {
          value: "desc",
        },
      },
    });

    recipeIdsByRating = ratings.map((r) => r.recipeId);
  }
  if (recipeIdsByRating) {
    where.id = {
      in: recipeIdsByRating,
    };
  }
  if (sp.difficulty) {
    where.difficulty = sp.difficulty;
  }

  if (cats.length > 0) {
    where.categories = {
      some: {
        name: {
          in: cats,
        },
      },
    };
  }

  let orderBy: any = { createdAt: "desc" };

  if (sp.sort === "favorites") {
    orderBy = {
      favorites: {
        _count: "desc",
      },
    };
  }

  let recipes = await prisma.recipe.findMany({
    where,
    orderBy,
    include: {
      author: true,
      ingredients: true,
      steps: true,
      categories: true,
      comments: {
        include: { user: true },
      },
    },
  });

  if (recipeIdsByRating) {
    recipes = recipes.sort(
      (a, b) =>
        recipeIdsByRating!.indexOf(a.id) - recipeIdsByRating!.indexOf(b.id),
    );
  }

  return (
    <div className="flex gap-6">
      <Filters categories={categories} />

      <div className="flex-1">
        <br />

        {session && <Link href="/recipes/new">Dodaj novi recept</Link>}

        <DataTable recipes={recipes} />
      </div>
    </div>
  );
}
