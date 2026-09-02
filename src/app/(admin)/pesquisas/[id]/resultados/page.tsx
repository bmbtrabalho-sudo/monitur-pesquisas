import { notFound } from "next/navigation";
import VisualizacaoDeRespostas from "@/components/admin/respostas/visualizacao-respostas";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Pesquisa } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Download } from "lucide-react";
import { prisma } from "@/lib/prisma";

interface PerguntaInfo {
  texto: string;
  tipoResposta: string;
}

interface DetalheResposta {
  valorTexto: string | null;
  valorNumero: number | null;
  valorOpcao: string | null;
  pergunta: PerguntaInfo;
}

interface RespostaCompleta {
  id: string;
  dataResposta: string;
  detalhes: DetalheResposta[];
}

export type PageProps = Promise<{id: string}>

async function getRespostas(pesquisaId: string): Promise<RespostaCompleta[]> {
  try {
    const respostas = await prisma.resposta.findMany({
      where: { pesquisaId },
      orderBy: { dataResposta: "desc" },
      include: {
        detalhes: {
          include: { pergunta: { select: { texto: true, tipoResposta: true } } },
        },
      },
    });

    return respostas.map((resposta) => ({
      id: resposta.id,
      dataResposta: resposta.dataResposta.toISOString(),
      detalhes: resposta.detalhes.map((detalhe) => ({
        valorTexto: detalhe.valorTexto,
        valorNumero: detalhe.valorNumero ? Number(detalhe.valorNumero) : null,
        valorOpcao: detalhe.valorOpcao,
        pergunta: detalhe.pergunta,
      })),
    }));
  } catch (error) {
    console.error("Erro crítico ao buscar respostas:", error);
    return [];
  }
}

async function getPesquisa(pesquisaId: string): Promise<Pesquisa | null> {
  try {
    return await prisma.pesquisa.findUnique({ where: { id: pesquisaId } });
  } catch (error) {
    console.error("Falha ao buscar detalhes da pesquisa:", error);
    return null;
  }
}

export default async function PaginaResultados(props: {params: PageProps}) {
  const { id } = await props.params;

  const [pesquisa, respostas] = await Promise.all([
    getPesquisa(id),
    getRespostas(id),
  ]);

  if (!pesquisa) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/pesquisas">Pesquisas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/pesquisas/${pesquisa.id}`}>
              {pesquisa.titulo}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Resultados</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="text-right">
      <Button asChild>
          <Link href={`/api/admin/pesquisas/${pesquisa.id}/exportar`} target="_blank" className="bg-green-400">
            <Download className="mr-2 h-4 w-4" />
            Baixar resultados em Excel
          </Link>
        </Button>
      </div>

      <VisualizacaoDeRespostas respostasIniciais={respostas} />
    </div>
  );
}
