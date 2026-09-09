"use client";

import { FormEvent, useState } from "react";
import { FileText, Image as ImageIcon, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PesquisaCategoria, TipoPublicacao } from "@prisma/client";

type Relatorio = {
  id: string;
  tipo: TipoPublicacao;
  titulo: string;
  categoria: PesquisaCategoria | null;
  dataInicio: Date | null;
  dataFim: Date | null;
  mesAno: string | null;
  descricao: string | null;
  nomeArquivo: string;
  tamanhoArquivo: number;
  nomeImagemCapa: string | null;
  tamanhoCapa: number | null;
};

const categorias: { value: PesquisaCategoria; label: string }[] = [
  { value: "EVENTOS", label: "Eventos" },
  { value: "FEIRAS", label: "Feiras" },
  { value: "FESTIVAL", label: "Festival" },
  { value: "MOTOCROSS", label: "Motocross" },
  { value: "PESCA_ESPORTIVA", label: "Pesca esportiva" },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(date: Date | null) {
  return date ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(date)) : "";
}

interface RelatoriosListProps {
  relatoriosIniciais: Relatorio[];
}

export default function RelatoriosList({ relatoriosIniciais }: RelatoriosListProps) {
  const [relatorios, setRelatorios] = useState(relatoriosIniciais);
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoPublicacao | null>(null);
  const [escolhaAberta, setEscolhaAberta] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mensagem, setMensagem] = useState<{ texto: string; sucesso: boolean } | null>(null);

  async function atualizarLista() {
    const response = await fetch("/api/admin/relatorios");
    if (!response.ok) throw new Error("Falha ao atualizar a lista");
    setRelatorios(await response.json());
  }

  async function publicarRelatorio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/relatorios", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      const resultado = await response.json();

      if (!response.ok) {
        setMensagem({ texto: resultado.message || "Não foi possível publicar.", sucesso: false });
        return;
      }

      event.currentTarget.reset();
      setTipoSelecionado(null);
      setEscolhaAberta(false);
      setMensagem({ texto: "Publicado com sucesso.", sucesso: true });
      try { await atualizarLista(); } catch { /* A publicação já foi salva. */ }
    } catch {
      setMensagem({ texto: "Não foi possível conectar ao servidor.", sucesso: false });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Publicações</h1>
          <p className="mt-1 text-sm text-muted-foreground">Publique relatórios de eventos e boletins mensais em PDF.</p>
        </div>
        <Button onClick={() => setEscolhaAberta(!escolhaAberta)}><Plus />Publicar novo</Button>
      </div>

      {mensagem && <p className={`rounded-md border p-3 text-sm ${mensagem.sucesso ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>{mensagem.texto}</p>}

      {escolhaAberta && tipoSelecionado === null && (
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="font-semibold">O que deseja publicar?</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Button variant="outline" className="h-auto justify-start p-4 text-left" onClick={() => { setTipoSelecionado(TipoPublicacao.RELATORIO_EVENTO); setEscolhaAberta(false); }}><FileText /><span><strong className="block">Novo Relatório de Evento</strong><small className="font-normal text-muted-foreground">Período, categoria e descrição do evento</small></span></Button>
            <Button variant="outline" className="h-auto justify-start p-4 text-left" onClick={() => { setTipoSelecionado(TipoPublicacao.BOLETIM_MENSAL); setEscolhaAberta(false); }}><FileText /><span><strong className="block">Novo Boletim Mensal</strong><small className="font-normal text-muted-foreground">Título e mês/ano da publicação</small></span></Button>
          </div>
        </div>
      )}

      {tipoSelecionado && (
        <form onSubmit={publicarRelatorio} className="space-y-5 rounded-lg border bg-white p-5 shadow-sm sm:p-6">
          <input type="hidden" name="tipo" value={tipoSelecionado} />
          <div className="flex items-center justify-between border-b pb-4"><h2 className="text-lg font-semibold">{tipoSelecionado === TipoPublicacao.RELATORIO_EVENTO ? "Novo Relatório de Evento" : "Novo Boletim Mensal"}</h2><Button type="button" variant="ghost" onClick={() => { setTipoSelecionado(null); setEscolhaAberta(true); }}>Trocar tipo</Button></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="titulo">Título</Label><Input id="titulo" name="titulo" maxLength={255} required /></div>
            {tipoSelecionado === TipoPublicacao.RELATORIO_EVENTO ? <>
              <div className="space-y-2"><Label htmlFor="categoria">Categoria do evento</Label><select id="categoria" name="categoria" defaultValue="EVENTOS" required className="h-9 w-full rounded-md border bg-transparent px-3 text-sm">{categorias.map((categoria) => <option key={categoria.value} value={categoria.value}>{categoria.label}</option>)}</select></div>
              <div />
              <div className="space-y-2"><Label htmlFor="dataInicio">Início do evento</Label><Input id="dataInicio" name="dataInicio" type="date" required /></div>
              <div className="space-y-2"><Label htmlFor="dataFim">Fim do evento</Label><Input id="dataFim" name="dataFim" type="date" required /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="descricao">Breve descrição sobre o evento</Label><Textarea id="descricao" name="descricao" rows={4} required /></div>
            </> : <div className="space-y-2"><Label htmlFor="mesAno">Mês e ano do boletim</Label><Input id="mesAno" name="mesAno" type="month" required /></div>}
            <div className="space-y-2"><Label htmlFor="arquivoPdf">Documento PDF</Label><Input id="arquivoPdf" name="arquivoPdf" type="file" accept="application/pdf,.pdf" required /><p className="text-xs text-muted-foreground">PDF de até 20 MB.</p></div>
            <div className="space-y-2"><Label htmlFor="imagemCapa">Imagem da capa</Label><Input id="imagemCapa" name="imagemCapa" type="file" accept="image/*" required /><p className="text-xs text-muted-foreground">Imagem de até 10 MB.</p></div>
          </div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => { setTipoSelecionado(null); setEscolhaAberta(false); }}>Cancelar</Button><Button type="submit" disabled={isLoading}>{isLoading ? "Publicando..." : "Publicar"}</Button></div>
        </form>
      )}

      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Publicações realizadas</h2><Button variant="ghost" size="icon" onClick={() => atualizarLista().catch(() => setMensagem({ texto: "Não foi possível atualizar a lista.", sucesso: false }))} disabled={isLoading} title="Atualizar lista"><RefreshCw className={isLoading ? "animate-spin" : ""} /><span className="sr-only">Atualizar lista</span></Button></div>

      {relatorios.length === 0 ? <div className="rounded-lg border-2 border-dashed py-16 text-center"><FileText className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-3 font-medium">Nenhuma publicação encontrada</p></div> : <div className="grid gap-4 md:grid-cols-2">{relatorios.map((relatorio) => <article key={relatorio.id} className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <div className="relative aspect-2/1 bg-slate-100">{relatorio.nomeImagemCapa ? <img src={`/api/admin/relatorios/${relatorio.id}/capa`} alt="Capa da publicação" className="h-full w-full object-cover" /> : <ImageIcon className="m-auto h-full w-10 text-muted-foreground" />}</div>
        <div className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{relatorio.tipo === TipoPublicacao.BOLETIM_MENSAL ? "Boletim Mensal" : categorias.find((item) => item.value === relatorio.categoria)?.label}</p><h3 className="mt-1 text-lg font-semibold">{relatorio.titulo}</h3>{relatorio.tipo === TipoPublicacao.BOLETIM_MENSAL ? <p className="mt-2 text-sm text-muted-foreground">Referência: {relatorio.mesAno}</p> : <><p className="mt-2 text-sm text-muted-foreground">Evento: {formatDate(relatorio.dataInicio)} a {formatDate(relatorio.dataFim)}</p><p className="mt-2 text-sm text-muted-foreground">{relatorio.descricao}</p></>}<p className="mt-3 text-xs text-muted-foreground">PDF: {formatBytes(relatorio.tamanhoArquivo)}{relatorio.tamanhoCapa ? ` | Capa: ${formatBytes(relatorio.tamanhoCapa)}` : ""}</p><Button asChild variant="outline" className="mt-4 w-full"><a href={`/api/admin/relatorios/${relatorio.id}/arquivo`} target="_blank" rel="noreferrer">Abrir PDF</a></Button></div>
      </article>)}</div>}
    </div>
  );
}
