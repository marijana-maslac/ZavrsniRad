import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import options from "@/app/api/auth/[...nextauth]/options";
import RecipeForm from "@/components/RecipeForm";

const NewRecipe = async () => {
  const session = await getServerSession(options);

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/recipes/new");
  }

  return <RecipeForm />;
};

export default NewRecipe;
