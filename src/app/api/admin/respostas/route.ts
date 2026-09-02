import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const getRespostasSchema = z.object({
  pesquisaId: z.string().uuid().optional(),
  formularioId: z.string().uuid().optional()
}).refine(
  (data) => data.pesquisaId || data.formularioId,
  { message: "É necessário fornecer 'pesquisaId' ou 'formularioId'." }
);

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);

    const paramsToValidate = {
      pesquisaId: searchParams.get("pesquisaId") || undefined,
      formularioId: searchParams.get("formularioId") || undefined,
    };

    const parsedParams = getRespostasSchema.safeParse(paramsToValidate);

    if (!parsedParams.success) {
      return NextResponse.json(
        { message: "Parâmetros de busca inválidos.", issues: parsedParams.error.errors },
        { status: 400 }
      );
    }

    const { pesquisaId, formularioId } = parsedParams.data;

    const whereClause: any = {};
    if (pesquisaId) whereClause.pesquisaId = pesquisaId;
    if (formularioId) whereClause.formularioId = formularioId;

    const respostas = await prisma.resposta.findMany({
      where: whereClause,
      orderBy: { dataResposta: "desc" },
      include: {
        detalhes: {
          include: {
            pergunta: {
              select: { texto: true, tipoResposta: true },
            },
          },
        },
        formulario: {
          select: { nome: true },
        },
      },
    });

    return NextResponse.json(respostas);
  } catch (error) {
    console.error("Erro ao buscar respostas:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}
