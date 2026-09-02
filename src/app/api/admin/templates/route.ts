import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FormularioTipo } from "../../../../../types/types";
import { z } from "zod";

const templateSchema = z.object({
  nome: z.string().min(3, "O nome do template é obrigatório."),
  descricao: z.string().optional().nullable(),
  tipo: z.nativeEnum(FormularioTipo).optional(),
});

// Handler para LISTAR todos os templates de formulário
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const templates = await prisma.formularioTemplate.findMany({
    orderBy: { nome: 'asc' },
  });

  return NextResponse.json(templates);
}

// Handler para CRIAR um novo template (o corpo será o mesmo do modal de criação de formulário)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const json = await request.json();
    const data = templateSchema.parse(json);

    const novoTemplate = await prisma.formularioTemplate.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
        tipo: data.tipo,
      },
    });
    return NextResponse.json(novoTemplate, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: 'Erro ao criar template' }, { status: 500 });
  }
}