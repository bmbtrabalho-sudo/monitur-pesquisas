import PesquisasList from "@/components/admin/pesquisas/pesquisa-lista";
import { Pesquisa } from "@prisma/client";
import { prisma } from "@/lib/prisma";

async function getPesquisas(): Promise<Pesquisa[]> {
  try {
    return await prisma.pesquisa.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Erro crítico ao buscar pesquisas:", error);
    return [];
  }
}

// A página é um Server Component assíncrono
export default async function PaginaPesquisas() {
  const pesquisasIniciais = await getPesquisas();

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Renderiza o Client Component, passando os dados como prop */}
      <PesquisasList pesquisasIniciais={pesquisasIniciais} />
    </div>
  );
}