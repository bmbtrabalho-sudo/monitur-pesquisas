import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { PesquisaCategoria, TipoPublicacao } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const MAX_PDF_SIZE = 20 * 1024 * 1024;
const MAX_COVER_SIZE = 10 * 1024 * 1024;

const publicationSchema = z.object({
  tipo: z.nativeEnum(TipoPublicacao),
  titulo: z.string().trim().min(1, "Título é obrigatório.").max(255),
  categoria: z.nativeEnum(PesquisaCategoria).optional(),
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
  mesAno: z.string().regex(/^\d{4}-\d{2}$/, "Mês e ano inválidos.").optional(),
  descricao: z.string().trim().optional(),
});

async function getAuthorizedSession() {
  return getServerSession(authOptions);
}

function validatePublication(data: z.infer<typeof publicationSchema>) {
  if (data.tipo === TipoPublicacao.RELATORIO_EVENTO && (!data.categoria || !data.dataInicio || !data.dataFim || !data.descricao)) {
    return "Preencha os campos do relatório de evento.";
  }
  if (data.tipo === TipoPublicacao.BOLETIM_MENSAL && !data.mesAno) {
    return "Informe o mês e o ano do boletim.";
  }
  if (data.dataInicio && data.dataFim && data.dataFim < data.dataInicio) {
    return "A data final não pode ser anterior à data inicial.";
  }
  return null;
}

function parseFormData(formData: FormData) {
  return publicationSchema.parse({
    tipo: formData.get("tipo"),
    titulo: formData.get("titulo"),
    categoria: formData.get("categoria") || undefined,
    dataInicio: formData.get("dataInicio") || undefined,
    dataFim: formData.get("dataFim") || undefined,
    mesAno: formData.get("mesAno") || undefined,
    descricao: formData.get("descricao") || undefined,
  });
}

async function validateFiles(formData: FormData, filesRequired: boolean) {
  const arquivo = formData.get("arquivoPdf");
  const imagemCapa = formData.get("imagemCapa");

  if (filesRequired && (!(arquivo instanceof File) || arquivo.size === 0)) return { error: "Anexe um arquivo PDF." };
  if (arquivo instanceof File && arquivo.size > 0) {
    if (arquivo.type !== "application/pdf" || !arquivo.name.toLowerCase().endsWith(".pdf")) return { error: "O documento deve estar no formato PDF." };
    if (arquivo.size > MAX_PDF_SIZE) return { error: "O PDF deve ter no máximo 20 MB." };
  }
  if (filesRequired && (!(imagemCapa instanceof File) || imagemCapa.size === 0)) return { error: "Anexe uma imagem para a capa." };
  if (imagemCapa instanceof File && imagemCapa.size > 0) {
    if (!imagemCapa.type.startsWith("image/")) return { error: "A capa deve ser uma imagem." };
    if (imagemCapa.size > MAX_COVER_SIZE) return { error: "A imagem da capa deve ter no máximo 10 MB." };
  }
  return { arquivo: arquivo instanceof File && arquivo.size > 0 ? arquivo : null, imagemCapa: imagemCapa instanceof File && imagemCapa.size > 0 ? imagemCapa : null };
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthorizedSession();
  if (!session) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    const formData = await request.formData();
    const data = parseFormData(formData);
    const validationError = validatePublication(data);
    if (validationError) return NextResponse.json({ message: validationError }, { status: 400 });

    const files = await validateFiles(formData, false);
    if (files.error) return NextResponse.json({ message: files.error }, { status: 400 });

    const updated = await prisma.relatorioEvento.update({
      where: { id },
      data: {
        ...data,
        ...(files.arquivo && { arquivoPdf: Buffer.from(await files.arquivo.arrayBuffer()), nomeArquivo: files.arquivo.name, mimeType: files.arquivo.type, tamanhoArquivo: files.arquivo.size }),
        ...(files.imagemCapa && { imagemCapa: Buffer.from(await files.imagemCapa.arrayBuffer()), nomeImagemCapa: files.imagemCapa.name, mimeImagemCapa: files.imagemCapa.type, tamanhoCapa: files.imagemCapa.size }),
      },
      select: { id: true, titulo: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ message: "Preencha os campos obrigatórios." }, { status: 400 });
    console.error("Erro ao editar publicação:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthorizedSession();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ message: "Apenas administradores podem excluir publicações." }, { status: 403 });

  try {
    await prisma.relatorioEvento.delete({ where: { id: (await params).id } });
    return NextResponse.json({ message: "Publicação excluída com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir publicação:", error);
    return NextResponse.json({ message: "Publicação não encontrada." }, { status: 404 });
  }
}