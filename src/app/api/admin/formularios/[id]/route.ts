// app/api/admin/formularios/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { FormularioTipo } from "@prisma/client";

// Schema Zod para edição (campos opcionais)
const editFormularioSchema = z.object({
  nome: z.string().min(3, "O nome é obrigatório.").optional(),
  tipo: z.nativeEnum(FormularioTipo).optional(),
  descricao: z.string().optional().nullable(),
  ativo: z.boolean().optional(),
});

// --- Handler PATCH: Atualizar um formulário ---
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const formularioId = (await params).id;
    const data = await request.json();

    const updatedFormulario = await prisma.formulario.update({
      where: { id: formularioId },
      data: data,
    });

    return NextResponse.json(updatedFormulario);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Dados inválidos', issues: error.issues }, { status: 400 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}

// --- Handler DELETE: Excluir um formulário ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const formularioId = (await params).id;

    // O onDelete: Cascade no schema cuidará de excluir as perguntas e respostas associadas.
    await prisma.formulario.delete({
      where: { id: formularioId },
    });

    return NextResponse.json({ message: 'Formulário excluído com sucesso.' }, { status: 200 });
  } catch (error) {
     if (error) {
       return NextResponse.json({ message: 'Formulário não encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}