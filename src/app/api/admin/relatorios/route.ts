import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { PesquisaCategoria } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const MAX_PDF_SIZE = 20 * 1024 * 1024;

const reportSchema = z.object({
  titulo: z.string().trim().min(1, "Título é obrigatório.").max(255),
  categoria: z.nativeEnum(PesquisaCategoria),
  dataEvento: z.coerce.date({ required_error: "Data do evento é obrigatória." }),
  descricao: z.string().trim().min(1, "A descrição é obrigatória."),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  const relatorios = await prisma.relatorioEvento.findMany({
    orderBy: [{ dataEvento: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      titulo: true,
      categoria: true,
      dataEvento: true,
      descricao: true,
      nomeArquivo: true,
      tamanhoArquivo: true,
      createdAt: true,
    },
  });

  return NextResponse.json(relatorios);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const arquivo = formData.get("arquivoPdf");
    const dados = reportSchema.parse({
      titulo: formData.get("titulo"),
      categoria: formData.get("categoria"),
      dataEvento: formData.get("dataEvento"),
      descricao: formData.get("descricao"),
    });

    if (!(arquivo instanceof File) || arquivo.size === 0) {
      return NextResponse.json({ message: "Anexe um arquivo PDF." }, { status: 400 });
    }
    if (arquivo.type !== "application/pdf" || !arquivo.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ message: "O documento deve estar no formato PDF." }, { status: 400 });
    }
    if (arquivo.size > MAX_PDF_SIZE) {
      return NextResponse.json({ message: "O PDF deve ter no máximo 20 MB." }, { status: 400 });
    }

    const relatorio = await prisma.relatorioEvento.create({
      data: {
        ...dados,
        arquivoPdf: Buffer.from(await arquivo.arrayBuffer()),
        nomeArquivo: arquivo.name,
        mimeType: arquivo.type,
        tamanhoArquivo: arquivo.size,
        createdBy: session.user.id,
      },
      select: { id: true, titulo: true },
    });

    return NextResponse.json(relatorio, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Preencha os campos obrigatórios.", issues: error.issues }, { status: 400 });
    }
    console.error("Erro ao publicar relatório:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}