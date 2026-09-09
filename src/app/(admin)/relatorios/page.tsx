import RelatoriosList from "@/components/admin/relatorios/relatorios-list";
import { prisma } from "@/lib/prisma";

async function getRelatorios() {
  return prisma.relatorioEvento.findMany({
    orderBy: [{ dataInicio: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      tipo: true,
      titulo: true,
      categoria: true,
      dataInicio: true,
      dataFim: true,
      mesAno: true,
      descricao: true,
      nomeArquivo: true,
      tamanhoArquivo: true,
      nomeImagemCapa: true,
      tamanhoCapa: true,
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