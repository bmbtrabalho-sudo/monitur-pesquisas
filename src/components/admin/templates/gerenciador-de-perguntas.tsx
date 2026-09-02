"use client";

import { useEffect, useState } from "react";
import { FormularioTemplate, PerguntaTemplate } from "@prisma/client";
import { ListChecks } from "lucide-react";
import { CriarPerguntaTemplateModal } from "../perguntas-template/criar-perguntas-template";
import { DeletarPerguntaTemplateBotao } from "../perguntas-template/deletar-pergunta-template";
import { EditarPerguntaTemplateModal } from "../perguntas-template/editar-pergunta-template";

type TemplateComPerguntas = FormularioTemplate & {
  perguntas: PerguntaTemplate[];
};

interface GerenciadorProps {
  templateInicial: TemplateComPerguntas;
}

export function GerenciadorDePerguntasTemplate({
  templateInicial,
}: GerenciadorProps) {
  const [template, setTemplate] = useState(templateInicial);
  const [perguntas, setPerguntas] = useState(templateInicial.perguntas || []);
  const [isLoading, setIsLoading] = useState(false);

  const refetchPerguntas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/templates/${template.id}`);
      if (!response.ok)
        throw new Error("Falha ao buscar perguntas do template.");
      const data: TemplateComPerguntas = await response.json();
      setTemplate(data);
      setPerguntas(data.perguntas || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTemplate(templateInicial);
    setPerguntas(templateInicial.perguntas || []);
  }, [templateInicial]);

  return (
    <div className="space-y-4 border-t pt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Perguntas do Template</h2>

        <CriarPerguntaTemplateModal
          templateId={template.id}
          onPerguntaCriada={refetchPerguntas}
        />
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      )}

      {!isLoading && perguntas.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ListChecks className="mx-auto h-10 w-10" />
          <p className="mt-4">Nenhuma pergunta cadastrada neste template.</p>
        </div>
      )}

      {!isLoading && perguntas.length > 0 && (
        <div className="border rounded-lg bg-white">
          <ul className="divide-y">
            {perguntas.map((pergunta) => (
              <li
                key={pergunta.id}
                className="flex justify-between items-center p-4"
              >
                <div className="flex-1">
                  <span className="font-medium">
                    {pergunta.ordem}. {pergunta.texto}
                  </span>
                  <span className="block text-xs text-muted-foreground font-mono ml-5">
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
                <div className="flex items-center gap-2">
                  {/* Aqui entrarão os botões de Editar e Excluir Pergunta */}
                  <EditarPerguntaTemplateModal
                    pergunta={pergunta}
                    onPerguntaEditada={refetchPerguntas}
                  />
                  <DeletarPerguntaTemplateBotao
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
