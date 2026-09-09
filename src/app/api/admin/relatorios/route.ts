import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { PesquisaCategoria, TipoPublicacao } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const MAX_PDF_SIZE = 20 * 1024 * 1024;
const MAX_COVER_SIZE = 10 * 1024 * 1024;

const reportSchema = z.object({
  tipo: z.nativeEnum(TipoPublicacao),
  titulo: z.string().trim().min(1, "Título é obrigatório.").max(255),
  categoria: z.nativeEnum(PesquisaCategoria).optional(),
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
  mesAno: z.string().regex(/^\d{4}-\d{2}$/, "Mês e ano inválidos.").optional(),
  descricao: z.string().trim().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  const relatorios = await prisma.relatorioEvento.findMany({
    orderBy: [{ dataInicio: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      tipo: true,
      titulo: true,
      categoria: true,
      dataInicio: true,
      dataFim: true,
      mesAno: true,
      descricao: true,
      nomeArquivo: true,
      tamanhoArquivo: true,
      nomeImagemCapa: true,
      tamanhoCapa: true,
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
    const imagemCapa = formData.get("imagemCapa");
    const dados = reportSchema.parse({
      tipo: formData.get("tipo"),
      titulo: formData.get("titulo"),
      categoria: formData.get("categoria") || undefined,
      dataInicio: formData.get("dataInicio") || undefined,
      dataFim: formData.get("dataFim") || undefined,
      mesAno: formData.get("mesAno") || undefined,
      descricao: formData.get("descricao") || undefined,
    });

    if (dados.tipo === TipoPublicacao.RELATORIO_EVENTO && (!dados.categoria || !dados.dataInicio || !dados.dataFim || !dados.descricao)) {
      return NextResponse.json({ message: "Preencha os campos do relatório de evento." }, { status: 400 });
    }
    if (dados.tipo === TipoPublicacao.BOLETIM_MENSAL && !dados.mesAno) {
      return NextResponse.json({ message: "Informe o mês e o ano do boletim." }, { status: 400 });
    }
    if (dados.dataInicio && dados.dataFim && dados.dataFim < dados.dataInicio) {
      return NextResponse.json({ message: "A data final não pode ser anterior à data inicial." }, { status: 400 });
    }

    if (!(arquivo instanceof File) || arquivo.size === 0) {
      return NextResponse.json({ message: "Anexe um arquivo PDF." }, { status: 400 });
    }
    if (arquivo.type !== "application/pdf" || !arquivo.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ message: "O documento deve estar no formato PDF." }, { status: 400 });
    }
    if (arquivo.size > MAX_PDF_SIZE) {
      return NextResponse.json({ message: "O PDF deve ter no máximo 20 MB." }, { status: 400 });
    }
    if (!(imagemCapa instanceof File) || imagemCapa.size === 0) {
      return NextResponse.json({ message: "Anexe uma imagem para a capa." }, { status: 400 });
    }
    if (!imagemCapa.type.startsWith("image/")) {
      return NextResponse.json({ message: "A capa deve ser uma imagem." }, { status: 400 });
    }
    if (imagemCapa.size > MAX_COVER_SIZE) {
      return NextResponse.json({ message: "A imagem da capa deve ter no máximo 10 MB." }, { status: 400 });
    }

    const relatorio = await prisma.relatorioEvento.create({
      data: {
        ...dados,
        arquivoPdf: Buffer.from(await arquivo.arrayBuffer()),
        nomeArquivo: arquivo.name,
        mimeType: arquivo.type,
        tamanhoArquivo: arquivo.size,
        imagemCapa: Buffer.from(await imagemCapa.arrayBuffer()),
        nomeImagemCapa: imagemCapa.name,
        mimeImagemCapa: imagemCapa.type,
        tamanhoCapa: imagemCapa.size,
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