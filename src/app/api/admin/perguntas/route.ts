// app/api/admin/perguntas/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { TipoResposta } from "@prisma/client";

const createPerguntaSchema = z.object({
  formularioId: z.string().uuid(),
  texto: z.string().min(1, "O texto da pergunta é obrigatório."),
  tipoResposta: z.nativeEnum(TipoResposta),
  obrigatoria: z.boolean().default(false),
  incluirOpcaoOutro: z.boolean().optional().default(false),
  opcoesJson: z.any().optional().nullable(), // Aceita qualquer estrutura JSON
  opcoesLinhas: z.array(z.object({ texto: z.string() })).optional(),
  opcoesColunas: z.array(z.object({ texto: z.string() })).optional(),
  ordem: z.number().int().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Lógica para definir a ordem (ex: colocar como última)
    const ultimaPergunta = await prisma.pergunta.findFirst({
      where: { formularioId: data.formularioId },
      orderBy: { ordem: "desc" },
    });
    const novaOrdem = (ultimaPergunta?.ordem ?? 0) + 1;

    const novaPergunta = await prisma.pergunta.create({
      data: { ...data, ordem: novaOrdem },
    });
    return NextResponse.json(novaPergunta, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos", issues: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const formularioId = searchParams.get("formularioId");

  if (!formularioId) {
    return NextResponse.json(
      { message: "O 'formularioId' é obrigatório." },
      { status: 400 }
    );
  }

  const perguntas = await prisma.pergunta.findMany({
    where: { formularioId: formularioId },
    orderBy: { ordem: "asc" },
  });

  return NextResponse.json(perguntas);
}
