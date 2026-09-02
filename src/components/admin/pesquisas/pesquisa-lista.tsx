'use client';

import { Pesquisa } from "@prisma/client";
import { useEffect, useState } from "react";
import CriarPesquisaModal from "./criar-pesquisa-modal";
import { PesquisaCard } from "./pesquisa-card";
import VerificacaoStatus from "@/components/admin/pesquisas/verificacao-status";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface PesquisasListProps {
  pesquisasIniciais: Pesquisa[];
}

export default function PesquisasList({ pesquisasIniciais }: PesquisasListProps) {
  const [pesquisas, setPesquisas] = useState(pesquisasIniciais);
  const [filtroStatus, setFiltroStatus] = useState("TODAS");
  const [isLoading, setIsLoading] = useState(false);

  const refetchPesquisas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/pesquisas');
      const data = await response.json();
      setPesquisas(data);
    } catch (error) {
      console.error("Falha ao recarregar pesquisas", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    setPesquisas(pesquisasIniciais);
  }, [pesquisasIniciais]);

  const pesquisasFiltradas = filtroStatus === "TODAS"
    ? pesquisas
    : pesquisas.filter((pesquisa) => pesquisa.status === filtroStatus);

  return (
    <div className="space-y-6">
      <VerificacaoStatus pesquisas={pesquisas} onStatusAtualizado={refetchPesquisas} />
      <div className="flex flex-col justify-between items-center gap-4 sm:flex-row">
        <h1 className="text-lg font-bold">Gerenciamento de Pesquisas</h1>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-full bg-white sm:w-52">
              <SelectValue placeholder="Filtrar pesquisas" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="TODAS">Todas as pesquisas</SelectItem>
              <SelectItem value="PLANEJADO">Pesquisas planejadas</SelectItem>
              <SelectItem value="EM_ANDAMENTO">Pesquisas em andamento</SelectItem>
              <SelectItem value="CONCLUIDO">Pesquisas finalizadas</SelectItem>
            </SelectContent>
          </Select>
          <CriarPesquisaModal onPesquisaCriada={refetchPesquisas} />
        </div>
      </div>

      {isLoading && <p>Atualizando lista...</p>}

      {pesquisasFiltradas.length > 0 ? (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pesquisasFiltradas.map(p => (
            <PesquisaCard key={p.id} pesquisa={p} onListChange={refetchPesquisas} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">
              {pesquisas.length > 0 ? "Nenhuma pesquisa neste filtro" : "Nenhuma pesquisa encontrada"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {pesquisas.length > 0
                ? "Selecione outro status para visualizar pesquisas."
                : 'Clique em "Criar Nova Pesquisa" para começar.'}
            </p>
        </div>
      )}
    </div>
  );
}