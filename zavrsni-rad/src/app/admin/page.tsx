import { getServerSession } from "next-auth";
import options from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(options);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }
  return (
    <div>
      <h1>Admin panel</h1>
      <p>U izradi...</p>
    </div>
  );
}
