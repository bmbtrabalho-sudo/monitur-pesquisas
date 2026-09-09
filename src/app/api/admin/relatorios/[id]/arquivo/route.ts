import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const relatorio = await prisma.relatorioEvento.findUnique({
    where: { id },
    select: { arquivoPdf: true, nomeArquivo: true, mimeType: true },
  });

  if (!relatorio) return NextResponse.json({ message: "Relatório não encontrado" }, { status: 404 });

  return new NextResponse(relatorio.arquivoPdf, {
    headers: {
      "Content-Type": relatorio.mimeType,
      "Content-Disposition": `inline; filename="${relatorio.nomeArquivo.replace(/"/g, "")}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}