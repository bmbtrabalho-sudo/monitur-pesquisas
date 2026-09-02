import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { TipoResposta } from "@prisma/client";

const createPerguntaTemplateSchema = z.object({
  templateId: z.string(),
  texto: z.string().min(1, "O texto da pergunta é obrigatório."),
  tipoResposta: z.nativeEnum(TipoResposta),
  incluirOpcaoOutro: z.boolean().optional().default(false),
  obrigatoria: z.boolean().default(false),
  opcoesLinhas: z.array(z.object({ texto: z.string() })).optional(),
  opcoesColunas: z.array(z.object({ texto: z.string() })).optional(),
  opcoesJson: z.any().optional().nullable(),
  ordem: z.number().int().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const data = createPerguntaTemplateSchema.parse(json);

    const ultimaPergunta = await prisma.perguntaTemplate.findFirst({
      where: { templateId: data.templateId },
      orderBy: { ordem: "desc" },
    });
    const novaOrdem = (ultimaPergunta?.ordem ?? 0) + 1;

    const novaPergunta = await prisma.perguntaTemplate.create({
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
    console.error("Erro ao criar pergunta de template:", error);
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
  const templateId = searchParams.get("templateId");
  if (!templateId) {
    return NextResponse.json(
      { message: "O 'templateId' é obrigatório." },
      { status: 400 }
    );
  }

  const perguntas = await prisma.perguntaTemplate.findMany({
    where: { templateId },
    orderBy: { ordem: "asc" },
  });

  return NextResponse.json(perguntas);
}
