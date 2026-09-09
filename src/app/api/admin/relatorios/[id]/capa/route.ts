import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const publicacao = await prisma.relatorioEvento.findUnique({
    where: { id },
    select: { imagemCapa: true, mimeImagemCapa: true },
  });

  if (!publicacao?.imagemCapa || !publicacao.mimeImagemCapa) {
    return NextResponse.json({ message: "Capa não encontrada" }, { status: 404 });
  }

  return new NextResponse(publicacao.imagemCapa, {
    headers: { "Content-Type": publicacao.mimeImagemCapa, "Cache-Control": "private, max-age=3600" },
  });
}