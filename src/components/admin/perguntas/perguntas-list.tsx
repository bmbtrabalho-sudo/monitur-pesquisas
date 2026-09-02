"use client";

import { useEffect, useState } from "react";
import { Pergunta } from "@prisma/client";
import { ListChecks } from "lucide-react";
import { CriarPerguntaModal } from "./criar-perguntas-modal";
import { EditarPerguntaModal } from "./editar-pergunta-modal";
import { DeletarPerguntaBotao } from "./deletar-pergunta-modal";

interface PerguntasListProps {
  formularioId: string;
}

export function PerguntasList({ formularioId }: PerguntasListProps) {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetchPerguntas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/perguntas?formularioId=${formularioId}`
      );
      if (!response.ok) throw new Error("Falha ao buscar perguntas.");
      const data = await response.json();
      setPerguntas(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (formularioId) {
      refetchPerguntas();
    }
  }, [formularioId]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Perguntas do Formulário</h3>
        <CriarPerguntaModal
          formularioId={formularioId}
          onPerguntaCriada={refetchPerguntas}
        />
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      )}

      {!isLoading && perguntas.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <ListChecks className="mx-auto h-8 w-8" />
          <p className="mt-2 text-sm">Nenhuma pergunta cadastrada.</p>
        </div>
      )}

      {!isLoading && perguntas.length > 0 && (
        <ul className="space-y-2">
          {perguntas.map((pergunta) => (
            <li
              key={pergunta.id}
              className="flex justify-between items-center bg-white p-3 rounded-md border text-sm"
            >
              <span>
                {pergunta.ordem}. {pergunta.texto}
              </span>
              <span className="font-mono text-xs p-1 bg-gray-100 rounded">
                {pergunta.tipoResposta === "TEXTO"
                  ? "Texto"
                  : pergunta.tipoResposta === "NUMERO"
                  ? "Número"
                  : pergunta.tipoResposta === "OPCAO"
                  ? "Opção"
                  : pergunta.tipoResposta === "MULTIPLA"
                  ? "Multipla"
                  : "Municipio"}
              </span>
              <EditarPerguntaModal
                pergunta={pergunta}
                onPerguntaEditada={refetchPerguntas}
              />
              <DeletarPerguntaBotao
                perguntaId={pergunta.id}
                onPerguntaDeleted={refetchPerguntas}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
