"use client";

import { useState } from "react";
import { FileText, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PesquisaCategoria } from "@prisma/client";

type Relatorio = {
  id: string;
  titulo: string;
  categoria: PesquisaCategoria;
  dataEvento: Date;
  descricao: string;
  nomeArquivo: string;
  tamanhoArquivo: number;
  createdAt: Date;
};

const categorias: { value: PesquisaCategoria; label: string }[] = [
  { value: "EVENTOS", label: "Eventos" },
  { value: "FEIRAS", label: "Feiras" },
  { value: "FESTIVAL", label: "Festival" },
  { value: "MOTOCROSS", label: "Motocross" },
  { value: "PESCA_ESPORTIVA", label: "Pesca esportiva" },
];

interface RelatoriosListProps {
  relatoriosIniciais: Relatorio[];
}

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(date));
}

export default function RelatoriosList({ relatoriosIniciais }: RelatoriosListProps) {
  const [relatorios, setRelatorios] = useState(relatoriosIniciais);
  const [formAberto, setFormAberto] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  async function atualizarLista() {
    setIsLoading(true);
    const response = await fetch("/api/admin/relatorios");
    if (response.ok) setRelatorios(await response.json());
    setIsLoading(false);
  }

  async function publicarRelatorio(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("");
    setIsLoading(true);

    const response = await fetch("/api/admin/relatorios", {
      method: "POST",
      body: new FormData(event.currentTarget),
    });
    const resultado = await response.json();

    if (!response.ok) {
      setMensagem(resultado.message || "Não foi possível publicar o relatório.");
      setIsLoading(false);
      return;
    }

    event.currentTarget.reset();
    setFormAberto(false);
    setMensagem("Relatório publicado com sucesso.");
    await atualizarLista();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios de eventos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Publique e consulte os relatórios em PDF.</p>
        </div>
        <Button onClick={() => setFormAberto(!formAberto)}>
          <Plus />
          Publicar relatório
        </Button>
      </div>

      {mensagem && <p className="rounded-md border bg-white p-3 text-sm">{mensagem}</p>}

      {formAberto && (
        <form onSubmit={publicarRelatorio} className="space-y-5 rounded-lg border bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="titulo">Título do relatório</Label>
              <Input id="titulo" name="titulo" maxLength={255} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria do evento</Label>
              <select id="categoria" name="categoria" defaultValue="EVENTOS" required className="h-9 w-full rounded-md border bg-transparent px-3 text-sm">
                {categorias.map((categoria) => <option key={categoria.value} value={categoria.value}>{categoria.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataEvento">Data que ocorreu o evento</Label>
              <Input id="dataEvento" name="dataEvento" type="date" required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="descricao">Breve descrição sobre o evento</Label>
              <Textarea id="descricao" name="descricao" rows={4} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="arquivoPdf">Documento PDF</Label>
              <Input id="arquivoPdf" name="arquivoPdf" type="file" accept="application/pdf,.pdf" required />
              <p className="text-xs text-muted-foreground">Somente PDF, até 20 MB.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setFormAberto(false)}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Publicando..." : "Publicar relatório"}</Button>
          </div>
        </form>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Relatórios publicados</h2>
        <Button variant="ghost" size="icon" onClick={atualizarLista} disabled={isLoading} title="Atualizar lista">
          <RefreshCw className={isLoading ? "animate-spin" : ""} />
          <span className="sr-only">Atualizar lista</span>
        </Button>
      </div>

      {relatorios.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed py-16 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium">Nenhum relatório publicado</p>
          <p className="mt-1 text-sm text-muted-foreground">Publique o primeiro relatório de evento para começar.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {relatorios.map((relatorio) => (
            <article key={relatorio.id} className="rounded-lg border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{categorias.find((item) => item.value === relatorio.categoria)?.label}</p>
                  <h3 className="mt-1 text-lg font-semibold">{relatorio.titulo}</h3>
                </div>
                <FileText className="h-5 w-5 shrink-0 text-red-600" />
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{relatorio.descricao}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
                <span>Evento em {formatDate(relatorio.dataEvento)}</span>
                <span>{formatBytes(relatorio.tamanhoArquivo)}</span>
              </div>
              <Button asChild variant="outline" className="mt-4 w-full">
                <a href={`/api/admin/relatorios/${relatorio.id}/arquivo`} target="_blank" rel="noreferrer">Abrir PDF</a>
              </Button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}