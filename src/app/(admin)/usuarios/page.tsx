import UsuariosList from "@/components/admin/usuarios/usuarios-list";
import { User } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type SafeUser = Omit<User, "password" | "emailVerified">;

async function getUsers(): Promise<SafeUser[]> {
  try {
    return await prisma.user.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: false,
        password: false,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    console.error("Erro crítico ao buscar usuários:", error);
    return [];
  }
}

// A página é um Server Component que passa os dados para o Client Component
export default async function PaginaUsuarios() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/perfil");
  }

  const usuariosIniciais = await getUsers();

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* O Server Component renderiza o Client Component com os dados iniciais */}
      <UsuariosList usuariosIniciais={usuariosIniciais} />
    </div>
  );
}