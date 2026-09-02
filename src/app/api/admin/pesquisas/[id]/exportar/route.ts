// app/api/admin/pesquisas/[id]/exportar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const pesquisaId = (await params).id;
    
    const pesquisa = await prisma.pesquisa.findUnique({
      where: { id: pesquisaId },
      include: {
        formularios: {
          include: {
            perguntas: { orderBy: { ordem: 'asc' } }
          }
        }
      }
    });

    if (!pesquisa) {
      return NextResponse.json({ message: 'Pesquisa não encontrada' }, { status: 404 });
    }

    const respostas = await prisma.resposta.findMany({
      where: { pesquisaId: pesquisaId },
      include: { detalhes: true }
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "MoniTUR";
    workbook.created = new Date();

    for (const formulario of pesquisa.formularios) {
      const respostasDoFormulario = respostas.filter((resposta) => resposta.formularioId === formulario.id);
      const worksheet = workbook.addWorksheet(formulario.nome.substring(0, 31));
      const headers = [
        "ID da Resposta",
        "Data da Resposta",
        ...formulario.perguntas.map((pergunta) => pergunta.texto),
      ];

      worksheet.addRow(headers);
      worksheet.getRow(1).font = { bold: true };

      for (const resposta of respostasDoFormulario) {
        const rowData = [
          resposta.id,
          resposta.dataResposta.toLocaleString("pt-BR"),
          ...formulario.perguntas.map((pergunta) => {
            const detalhe = resposta.detalhes.find((item) => item.perguntaId === pergunta.id);
            const valor = detalhe?.valorTexto ?? detalhe?.valorNumero ?? detalhe?.valorOpcao ?? detalhe?.valorData ?? "";
            return valor instanceof Date ? valor.toLocaleDateString("pt-BR") : String(valor);
          }),
        ];
        worksheet.addRow(rowData);
      }

      worksheet.columns.forEach((column) => {
        column.width = 30;
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="resultados-${pesquisa.titulo.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-+|-+$/g, "")}.xlsx"`,
      },
    });

  } catch (error) {
    console.error("Erro ao exportar resultados:", error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}