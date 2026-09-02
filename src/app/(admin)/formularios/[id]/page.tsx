import { notFound } from "next/navigation";
import { Formulario, Pergunta } from "@prisma/client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { GerenciadorDePerguntas } from "@/components/admin/perguntas/gerenciador-perguntas";
import { prisma } from "@/lib/prisma";

type FormularioComPerguntas = Formulario & { perguntas: Pergunta[] };

export type PageProps = Promise<{id: string}>

async function getFormulario(
  id: string
): Promise<FormularioComPerguntas | null> {
  try {
    const formularioId = id;

    const formulario = await prisma.formulario.findUnique({
      where: { id: formularioId },
      include: {
        perguntas: {
          orderBy: { ordem: "asc" },
        },
      },
    });
    return formulario;
  } catch (error) {
    console.error("Falha ao buscar formulário:", error);
    return null;
  }
}

export default async function PaginaGerenciarPerguntas(props: {params: PageProps}) {
  const { id } = await props.params;
  const formulario = await getFormulario(id);

  if (!formulario) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/pesquisas">Pesquisas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/pesquisas/${formulario.pesquisaId}`}>
              Formulários
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{formulario.nome}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* O Client Component recebe os dados iniciais */}
      <GerenciadorDePerguntas formularioInicial={formulario} />
    </div>
  );
}
