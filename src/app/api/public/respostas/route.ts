import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const publicSubmissionSchema = z.object({
  formularioId: z.string(),
  respostas: z.record(z.any()),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const data = publicSubmissionSchema.parse(json);

    const formulario = await prisma.formulario.findUnique({
      where: { id: data.formularioId },
      include: { perguntas: true },
    });

    if (!formulario) {
      return NextResponse.json(
        { message: "Formulário não encontrado." },
        { status: 404 }
      );
    }

    const novaResposta = await prisma.$transaction(async (tx) => {
      const respostaCriada = await tx.resposta.create({
        data: {
          formularioId: formulario.id,
          pesquisaId: formulario.pesquisaId,
        },
      });

      const detalhesParaCriar = formulario.perguntas
        .map((pergunta) => {
          const valor = data.respostas[pergunta.id];
          if (
            valor === undefined ||
            valor === null ||
            valor === "" ||
            Object.keys(valor).length === 0
          )
            return null;

          const detalhe: any = {
            respostaId: respostaCriada.id,
            perguntaId: pergunta.id,
          };

          switch (pergunta.tipoResposta) {
            case "TEXTO":
              detalhe.valorTexto = String(valor);
              break;
            case "NUMERO":
              detalhe.valorNumero = Number(valor);
              break;
            case "OPCAO":
            case "MULTIPLA":
              detalhe.valorOpcao = Array.isArray(valor)
                ? valor.join(", ")
                : String(valor);
              break;
            case "LOCALIDADE_MUNICIPIO":
              detalhe.valorTexto = String(valor);
              break;
            case "GRADE_MULTIPLA_ESCOLHA": 
              if (typeof valor === "object" && !Array.isArray(valor)) {
                detalhe.valorOpcao = JSON.stringify(valor);
              }
              break;
          }
          return detalhe;
        })
        .filter(Boolean);

      if (detalhesParaCriar.length > 0) {
        await tx.respostaDetalhe.createMany({
          data: detalhesParaCriar,
        });
      }

      return respostaCriada;
    });

    return NextResponse.json(
      { message: "Pesquisa enviada com sucesso!", respostaId: novaResposta.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.issues }, { status: 400 });
    }
    console.error("Erro ao salvar resposta:", error);
    return NextResponse.json(
      { message: "Erro ao salvar resposta" },
      { status: 500 }
    );
  }
}
