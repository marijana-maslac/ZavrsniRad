import Link from "next/link";
import prisma from "../../../prisma/db";
import DataTable from "./DataTable";
import Filters from "./Filters";
import { getServerSession } from "next-auth";
import options from "@/app/api/auth/[...nextauth]/options";
import styles from "./DataTable.module.css";

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

  const category =
    typeof sp.categories === "string" ? [sp.categories] : sp.categories || [];

  const where: any = {};

  if (sp.search) {
    where.title = {
      contains: sp.search,
      mode: "insensitive",
    };
  }

  if (sp.difficulty) {
    where.difficulty = sp.difficulty;
  }

  if (category.length > 0) {
    where.categories = {
      some: {
        name: {
          in: category,
        },
      },
    };
  }

  let recipeOrder: number[] | null = null;

  if (sp.sort === "rating") {
    const ratings = await prisma.rating.groupBy({
      by: ["recipeId"],
      _avg: {
        value: true,
      },
      _count: {
        value: true,
      },
      orderBy: [
        {
          _avg: {
            value: "desc",
          },
        },
        {
          _count: {
            value: "desc",
          },
        },
      ],
    });

    recipeOrder = ratings.map((recipe) => recipe.recipeId);

    if (recipeOrder.length > 0) {
      where.id = {
        in: recipeOrder,
      };
    }
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
      ratings: true,
    },
  });

  if (recipeOrder) {
    recipes = recipes.sort(
      (a, b) => recipeOrder!.indexOf(a.id) - recipeOrder!.indexOf(b.id),
    );
  }

  return (
    <div className={styles.page}>
      <br></br>
      <div className={styles.header}>
        <h1>Svi recepti</h1>

        {session && (
          <Link href="/recipes/new" className={styles.addNew}>
            + Dodaj novi recept
          </Link>
        )}
      </div>
      <Filters categories={categories} />
      <div>
        <br />

        <DataTable recipes={recipes} />
      </div>
    </div>
  );
}
