import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PesquisaCategoria, PesquisaStatus } from "@prisma/client";
import { MUNICIPIOS_RONDONIA } from "@/lib/pesquisa-options";

const editPesquisaSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório.').optional(),
  categoria: z.nativeEnum(PesquisaCategoria).optional(),
  descricao: z.string().optional().nullable(),
  tituloProjeto: z.string().optional().nullable(),
  objetivoGeral: z.string().optional().nullable(),
  objetivosEspecificos: z.string().optional().nullable(),
  justificativa: z.string().optional().nullable(),
  publicoAlvo: z.string().optional().nullable(),
  metodologia: z.string().optional().nullable(),
  produtosEsperados: z.string().optional().nullable(),
  proponente: z.string().optional().nullable(),
  cnpjProponente: z.string().optional().nullable(),
  municipio: z.enum(MUNICIPIOS_RONDONIA).optional(),
  areaAbrangencia: z.string().optional().nullable(),
  processoSei: z.string().optional().nullable(),
  valorTotal: z.number().optional().nullable(),
  fonteRecurso: z.string().optional().nullable(),
  elementoDespesa: z.string().optional().nullable(),
  dataInicio: z.coerce.date().optional().nullable(),
  dataFim: z.coerce.date().optional().nullable(),
  status: z.nativeEnum(PesquisaStatus).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Proteção da rota
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const pesquisaId =(await params).id;

    const pesquisa = await prisma.pesquisa.findUnique({
      where: { id: pesquisaId },
      include: {
        formularios: true,
      }
    });

    if (!pesquisa) {
      return NextResponse.json({ message: 'Pesquisa não encontrada.' }, { status: 404 });
    }

    return NextResponse.json(pesquisa);

  } catch (error) {
    console.error("Erro ao buscar pesquisa:", error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Proteção da rota
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const pesquisaId = (await params).id;

    // Validação dos dados de entrada
    const json = await request.json();
    const data = editPesquisaSchema.parse(json);

    // Atualiza a pesquisa no banco
    const updatedPesquisa = await prisma.pesquisa.update({
      where: { id: pesquisaId },
      data: data,
    });

    return NextResponse.json(updatedPesquisa);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Dados inválidos', issues: error.issues }, { status: 400 });
    }
    console.error("Erro ao atualizar pesquisa:", error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Proteção da rota
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const pesquisaId = (await params).id;
    
    await prisma.pesquisa.delete({
      where: { id: pesquisaId },
    });

    return NextResponse.json({ message: 'Pesquisa excluída com sucesso.' }, { status: 200 });

  } catch (error) {
    if (error) {
       return NextResponse.json({ message: 'Pesquisa não encontrada.' }, { status: 404 });
    }
    console.error("Erro ao excluir pesquisa:", error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}