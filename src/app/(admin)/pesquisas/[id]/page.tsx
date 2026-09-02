import { Pesquisa } from "@prisma/client";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { FormulariosList } from "@/components/admin/formularios/formulario-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type PageProps = Promise<{id: string}>

async function getPesquisaById(id: string): Promise<Pesquisa | null> {
  try {
    return await prisma.pesquisa.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Erro crítico ao buscar pesquisa:", error);
    return null;
  }
}

// A página recebe 'params' como prop, que contém o 'id' da URL
export default async function PaginaDetalhePesquisa(props: {params: PageProps}) {
  const { id } = await props.params;
  const pesquisa = await getPesquisaById(id);

  // Se a pesquisa não for encontrada, exibe a página de 404 padrão do Next.js
  if (!pesquisa) {
    notFound();
  }

  return (
    <div className="p-4 space-y-2 sm:p-6 md:p-8 ">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/pesquisas">Pesquisas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-lg font-semibold">{pesquisa.titulo}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {pesquisa.status === "PLANEJADO" ? (
        <Badge className="bg-amber-400">Planejado</Badge>
      ) : pesquisa.status === "CANCELADO" ? (
        <Badge className="bg-red-400">Cancelado</Badge>
      ) : pesquisa.status === "CONCLUIDO" ? (
        <Badge className="bg-green-400">Concluído</Badge>
      ) : (
        <Badge className="bg-blue-400">Em andamento</Badge>
      )}

      <div className="flex flex-col justify-between items-start gap-2 md:flex-row">
        <p className="text-muted-foreground mt-2 text-justify">{pesquisa.descricao}</p>

        <Link href={`/pesquisas/${pesquisa.id}/resultados`}>
          <Button className="bg-emerald-400 shadow-2xl shadow-black font-semibold transition transform hover:scale-105">
            Resultados da Pesquisa
          </Button>
        </Link>
      </div>

      {/* Detalhes complementares da pesquisa, independentemente da categoria. */}
        <Card className="bg-gray-100 flex flex-col justify-between border-none shadow-xl-t shadow-black">
          <CardHeader>
            <CardTitle>Detalhes do Projeto</CardTitle>
            <CardDescription>
              Informações detalhadas sobre o projeto ou evento associado a esta
              pesquisa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <strong className="text-muted-foreground">
                  Título do Projeto:
                </strong>
                <p>{pesquisa.tituloProjeto || "N/A"}</p>
              </div>
              <div>
                <strong className="text-muted-foreground">Proponente:</strong>
                <p>{pesquisa.proponente || "N/A"}</p>
              </div>
              <div>
                <strong className="text-muted-foreground">Município:</strong>
                <p>{pesquisa.municipio || "N/A"}</p>
              </div>
              <div>
                <strong className="text-muted-foreground">Categoria:</strong>
                <p>{pesquisa.categoria || "N/A"}</p>
              </div>
              <div>
                <strong className="text-muted-foreground">Início:</strong>
                <p>
                  {new Date(pesquisa.dataInicio!).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div>
                <strong className="text-muted-foreground">Fim:</strong>
                <p>{new Date(pesquisa.dataFim!).toLocaleDateString("pt-BR")}</p>
              </div>
              <div className="col-span-2">
                <strong className="text-muted-foreground">
                  Objetivo Geral:
                </strong>
                <p>{pesquisa.objetivoGeral || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* --- Seção de Gerenciamento de Formulários --- */}
      <div className="space-y-4 pt-8 border-t">
        <div className="flex justify-between items-center">
          <FormulariosList pesquisaId={pesquisa.id} />
        </div>
      </div>
    </div>
  );
}
