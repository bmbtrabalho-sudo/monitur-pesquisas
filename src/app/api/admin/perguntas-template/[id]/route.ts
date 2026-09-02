// app/api/admin/perguntas/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { TipoResposta } from "@prisma/client";

const editPerguntaSchema = z.object({
  texto: z.string().min(1).optional(),
  tipoResposta: z.nativeEnum(TipoResposta).optional(),
  obrigatoria: z.boolean().optional(),
  incluirOpcaoOutro: z.boolean().optional().default(false),
  opcoesJson: z.any().optional().nullable(),
  opcoesLinhas: z.array(z.object({ texto: z.string() })).optional(),
  opcoesColunas: z.array(z.object({ texto: z.string() })).optional(),
  ordem: z.number().int().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const perguntaId = (await params).id;
    const json = await request.json();
    const data = editPerguntaSchema.parse(json);

    const updatedPergunta = await prisma.perguntaTemplate.update({
      where: { id: perguntaId },
      data: data,
    });

    return NextResponse.json(updatedPergunta);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const perguntaId = (await params).id;
    await prisma.perguntaTemplate.delete({ where: { id: perguntaId } });
    return NextResponse.json({ message: "Pergunta excluída com sucesso." });
  } catch (error) {
    return NextResponse.json(
      { message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
