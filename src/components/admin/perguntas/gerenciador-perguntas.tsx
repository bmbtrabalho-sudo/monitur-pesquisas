"use client";

import { useEffect, useState } from "react";
import { Formulario, Pergunta } from "@prisma/client";
import { ListChecks } from "lucide-react";
import { CriarPerguntaModal } from "./criar-perguntas-modal";
import { EditarPerguntaModal } from "./editar-pergunta-modal";
import { DeletarPerguntaBotao } from "./deletar-pergunta-modal";
import { useSession } from "next-auth/react";

type FormularioComPerguntas = Formulario & { perguntas: Pergunta[] };

interface GerenciadorProps {
  formularioInicial: FormularioComPerguntas;
}

export function GerenciadorDePerguntas({
  formularioInicial,
}: GerenciadorProps) {
  const { data: session } = useSession();
  const [perguntas, setPerguntas] = useState(formularioInicial.perguntas || []);
  const [isLoading, setIsLoading] = useState(false);

  const refetchPerguntas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/perguntas?formularioId=${formularioInicial.id}`
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
    setPerguntas(formularioInicial.perguntas || []);
  }, [formularioInicial]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between items-center pb-4 border-b md:flex-row">
        <div>
          <h1 className="text-3xl font-bold">{formularioInicial.nome}</h1>
          <p className="text-muted-foreground">{formularioInicial.descricao}</p>
        </div>
        <CriarPerguntaModal
          formularioId={formularioInicial.id}
          onPerguntaCriada={refetchPerguntas}
        />
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Carregando perguntas...</p>
      )}

      {!isLoading && perguntas.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <ListChecks className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold">
            Nenhuma pergunta cadastrada
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Clique em "Adicionar Pergunta" para começar.
          </p>
        </div>
      )}

      {!isLoading && perguntas.length > 0 && (
        <div className="border rounded-lg bg-white">
          <ul className="divide-y">
            {perguntas.map((pergunta) => (
              <li
                key={pergunta.id}
                className="flex justify-between items-center p-4 hover:bg-slate-50"
              >
                <div className="flex-1">
                  <span className="font-medium">
                    {pergunta.ordem}. {pergunta.texto}
                  </span>
                  <span className="block text-xs text-muted-foreground font-mono ml-5">
                    {" "}
                    {pergunta.tipoResposta === "TEXTO"
                      ? "Texto"
                      : pergunta.tipoResposta === "NUMERO"
                      ? "Número"
                      : pergunta.tipoResposta === "OPCAO"
                      ? "Opção"
                      : pergunta.tipoResposta === "MULTIPLA"
                      ? "Multipla"
                      : pergunta.tipoResposta === "LOCALIDADE_MUNICIPIO"
                      ? "Municipio"
                      : "Grade de Multipla escolha"}{" "}
                    {pergunta.obrigatoria ? "(Obrigatória)" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <EditarPerguntaModal
                    pergunta={pergunta}
                    onPerguntaEditada={refetchPerguntas}
                  />
                  <DeletarPerguntaBotao
                    perguntaId={pergunta.id}
                    onPerguntaDeleted={refetchPerguntas}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
