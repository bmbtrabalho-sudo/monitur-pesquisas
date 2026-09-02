import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import PerfilForm from "@/components/account/perfil-form";

export const dynamic = "force-dynamic";

export default async function PaginaPerfil() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <PerfilForm usuarioInicial={{
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      }} />
    </div>
  );
}
