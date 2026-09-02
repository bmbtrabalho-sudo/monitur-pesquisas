"use client";

import { Pesquisa, PesquisaStatus } from "@prisma/client";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface VerificacaoStatusProps {
  pesquisas: Pesquisa[];
  onStatusAtualizado: () => void;
}

function inicioDoDia(data: Date): Date {
  const resultado = new Date(data);
  resultado.setHours(0, 0, 0, 0);
  return resultado;
}

function dataDoCalendario(data: Date | string): Date {
  const texto = typeof data === "string" ? data : data.toISOString();
  const [ano, mes, dia] = texto.slice(0, 10).split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

/**
 * Confere as datas somente no navegador, onde e possivel pedir confirmacao
 * ao administrador. O status so muda depois que ele confirma a pergunta.
 */
export default function VerificacaoStatus({ pesquisas, onStatusAtualizado }: VerificacaoStatusProps) {
  const idsVerificados = useRef(new Set<string>());

  useEffect(() => {
    const hoje = inicioDoDia(new Date());
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const verificarPesquisas = async () => {
      for (const pesquisa of pesquisas) {
        if (idsVerificados.current.has(pesquisa.id)) continue;
        idsVerificados.current.add(pesquisa.id);

        const dataFim = pesquisa.dataFim ? inicioDoDia(dataDoCalendario(pesquisa.dataFim)) : null;
        const dataInicio = pesquisa.dataInicio ? inicioDoDia(dataDoCalendario(pesquisa.dataInicio)) : null;

        if (pesquisa.status === PesquisaStatus.EM_ANDAMENTO && dataFim && dataFim < hoje) {
          const concluiu = window.confirm(
            `A pesquisa "${pesquisa.titulo}" terminou em ${dataFim.toLocaleDateString("pt-BR")}. O evento ja foi concluido?`
          );

          if (concluiu && await atualizarStatus(pesquisa.id, PesquisaStatus.CONCLUIDO)) {
            toast.success("Status atualizado para Concluído.");
            onStatusAtualizado();
          }
        } else if (pesquisa.status === PesquisaStatus.PLANEJADO && dataInicio?.getTime() === amanha.getTime()) {
          const podeIniciar = window.confirm(
            `A pesquisa "${pesquisa.titulo}" esta programada para amanha. Esta tudo certo para iniciar a pesquisa?`
          );

          if (podeIniciar && await atualizarStatus(pesquisa.id, PesquisaStatus.EM_ANDAMENTO)) {
            toast.success("Status atualizado para Em andamento.");
            onStatusAtualizado();
          }
        }
      }
    };

    void verificarPesquisas();
  }, [pesquisas, onStatusAtualizado]);

  return null;
}

async function atualizarStatus(id: string, status: PesquisaStatus): Promise<boolean> {
  try {
    const resposta = await fetch(`/api/admin/pesquisas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return resposta.ok;
  } catch (error) {
    console.error("Erro ao atualizar status da pesquisa:", error);
    toast.error("Não foi possível atualizar o status da pesquisa.");
    return false;
  }
}
