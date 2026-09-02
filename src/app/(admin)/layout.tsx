import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/navigation/admin-navbar";

export const dynamic = "force-dynamic";

// Este layout protege todas as paginas dentro do grupo administrativo.
// Novas paginas administrativas recebem esta verificacao automaticamente.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  // Usuarios sem sessao nao podem acessar nenhuma funcionalidade administrativa.
  if (!session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
        <Navbar />     
        <main className="flex-1"> 
            {children}
        </main>
    </div>
  );
}