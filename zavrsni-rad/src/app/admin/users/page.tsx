import options from "@/app/api/auth/[...nextauth]/options";
import UserForm from "@/components/UserForm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getServerSession(options);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }
  return (
    <div>
      <UserForm />
    </div>
  );
}
