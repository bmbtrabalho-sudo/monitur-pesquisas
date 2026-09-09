import RelatoriosList from "@/components/admin/relatorios/relatorios-list";
import { prisma } from "@/lib/prisma";

async function getRelatorios() {
  return prisma.relatorioEvento.findMany({
    orderBy: [{ dataEvento: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      titulo: true,
      categoria: true,
      dataEvento: true,
      descricao: true,
      nomeArquivo: true,
      tamanhoArquivo: true,
      createdAt: true,
    },
  });
}

export default async function RelatoriosPage() {
  const relatorios = await getRelatorios();

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <RelatoriosList relatoriosIniciais={relatorios} />
    </div>
  );
}