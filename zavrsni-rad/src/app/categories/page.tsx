import CategoriesForm from "@/components/CategoriesForm";
import { getServerSession } from "next-auth";
import options from "../api/auth/[...nextauth]/options";

export default async function Page() {
  const session = await getServerSession(options);

  if (!session) {
    return <p>Samo Admin može upravljati kategorijama.</p>;
  }
  return (
    <div>
      <CategoriesForm />
    </div>
  );
}
