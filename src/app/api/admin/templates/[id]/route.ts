import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { FormularioTipo } from "@prisma/client";

// Schema para editar um template (todos os campos são opcionais)
const editTemplateSchema = z.object({
  nome: z.string().min(3, "O nome do template é obrigatório.").optional(),
  descricao: z.string().optional().nullable(),
  tipo: z.nativeEnum(FormularioTipo).optional(),
});

// --- Handler GET: Buscar um template e suas perguntas ---
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const templateId = (await params).id;
    const template = await prisma.formularioTemplate.findUnique({
      where: { id: templateId },
      include: { perguntas: { orderBy: { ordem: 'asc' } } },
    });

    if (!template) {
      return NextResponse.json({ message: "Template não encontrado" }, { status: 404 });
    }
    return NextResponse.json(template);
  } catch (error) {
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}

// --- Handler PATCH: Editar um template ---
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Proteção da rota
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const templateId = (await params).id;
    const json = await request.json();
    
    // 2. Validação dos dados
    const data = editTemplateSchema.parse(json);

    // 3. Lógica de atualização no banco
    const updatedTemplate = await prisma.formularioTemplate.update({
      where: { id: templateId },
      data: data,
    });

    return NextResponse.json(updatedTemplate);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Dados inválidos', issues: error.issues }, { status: 400 });
    }
    if (error) {
       return NextResponse.json({ message: 'Template não encontrado.' }, { status: 404 });
    }
    console.error("Erro ao atualizar template:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}

// --- Handler DELETE: Excluir um template ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Proteção da rota
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const templateId =(await params).id;
    
    await prisma.formularioTemplate.delete({
      where: { id: templateId },
    });

    return NextResponse.json({ message: 'Template excluído com sucesso.' }, { status: 200 });
  } catch (error) {
    if (error) {
       return NextResponse.json({ message: 'Template não encontrado.' }, { status: 404 });
    }
    console.error("Erro ao excluir template:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}