// app/api/admin/pesquisas/[id]/aplicar-template/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const aplicarTemplateSchema = z.object({
  templateId: z.string()
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const pesquisaId = (await params).id;
    const data = await request.json();

    const template = await prisma.formularioTemplate.findUnique({
      where: { id: data.templateId },
      include: { perguntas: true },
    });

    if (!template) {
      return NextResponse.json({ message: 'Template não encontrado' }, { status: 404 });
    }

    // Usar transação para garantir que tudo seja criado com sucesso
    const novoFormulario = await prisma.$transaction(async (tx) => {
      // 1. Cria um novo Formulário real a partir do template
      const formularioCriado = await tx.formulario.create({
        data: {
          pesquisaId: pesquisaId,
          nome: template.nome,
          descricao: template.descricao,
          tipo: template.tipo,
          ativo: true,
        },
      });

      if (template.perguntas.length > 0) {
        // 2. Prepara os dados das novas Perguntas
        const perguntasParaCriar = template.perguntas.map(p => ({
          formularioId: formularioCriado.id,
          texto: p.texto,
          tipoResposta: p.tipoResposta,
          opcoesJson: p.opcoesJson ?? Prisma.JsonNull,
          obrigatoria: p.obrigatoria,
          ordem: p.ordem,
        }));
        
        // 3. Cria todas as perguntas de uma vez
        await tx.pergunta.createMany({
          data: perguntasParaCriar,
        });
      }
      
      return formularioCriado;
    });

    return NextResponse.json(novoFormulario, { status: 201 });

  } catch (error) {
    console.error("Erro ao aplicar template:", error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}