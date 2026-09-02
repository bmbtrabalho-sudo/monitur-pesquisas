// app/api/public/formularios/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const formularioId = (await params).id;

    const formulario = await prisma.formulario.findUnique({
      where: { 
        id: formularioId,
        ativo: true, // Garante que apenas formulários marcados como "ativos" possam ser acessados
      },
      // Inclui todas as perguntas associadas, já ordenadas.
      include: {
        perguntas: {
          orderBy: {
            ordem: 'asc',
          },
        },
      },
    });

    if (!formulario) {
      return NextResponse.json({ message: 'Formulário não encontrado ou não está ativo.' }, { status: 404 });
    }

    return NextResponse.json(formulario);

  } catch (error) {
    console.error("Erro ao buscar formulário público:", error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}