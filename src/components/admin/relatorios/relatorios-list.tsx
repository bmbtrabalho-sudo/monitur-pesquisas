"use client";

import { FormEvent, useState } from "react";
import { FileText, Image as ImageIcon, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
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

function inputDate(date: Date | null) {
  return date ? new Date(date).toISOString().slice(0, 10) : "";
}

interface RelatoriosListProps {
  relatoriosIniciais: Relatorio[];
}

export default function RelatoriosList({ relatoriosIniciais }: RelatoriosListProps) {
  const { data: session } = useSession();
  const [relatorios, setRelatorios] = useState(relatoriosIniciais);
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoPublicacao | null>(null);
  const [escolhaAberta, setEscolhaAberta] = useState(false);
  const [editando, setEditando] = useState<Relatorio | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<"TODOS" | TipoPublicacao>("TODOS");
  const [filtroAno, setFiltroAno] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mensagem, setMensagem] = useState<{ texto: string; sucesso: boolean } | null>(null);

  async function atualizarLista() {
    const response = await fetch("/api/admin/relatorios", { cache: "no-store" });
    if (!response.ok) throw new Error("Falha ao atualizar a lista");
    setRelatorios(await response.json());
  }

  function limparFiltros() {
    setFiltroTipo("TODOS");
    setFiltroAno("");
    setFiltroMes("");
    setFiltroCategoria("");
  }

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setMensagem(null);
    setIsLoading(true);

    try {
      const response = await fetch(editando ? `/api/admin/relatorios/${editando.id}` : "/api/admin/relatorios", {
        method: editando ? "PUT" : "POST",
        body: new FormData(form),
      });
      const resultado = await response.json();

      if (!response.ok) {
        setMensagem({ texto: resultado.message || "Não foi possível salvar.", sucesso: false });
        return;
      }

      form.reset();
      setTipoSelecionado(null);
      setEditando(null);
      setEscolhaAberta(false);
      setMensagem({ texto: editando ? "Alterações salvas com sucesso." : "Publicado com sucesso.", sucesso: true });
      try {
        await atualizarLista();
      } catch (refreshError) {
        console.error("Publicação salva, mas a lista não foi atualizada:", refreshError);
      }
    } catch (error) {
      console.error("Erro ao salvar publicação:", error);
      setMensagem({ texto: "Não foi possível atualizar a lista após salvar. A publicação foi salva.", sucesso: false });
    } finally {
      setIsLoading(false);
    }
  }

  async function excluir(id: string) {
    if (!window.confirm("Deseja realmente excluir esta publicação?")) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/relatorios/${id}`, { method: "DELETE" });
      const resultado = await response.json();
      if (!response.ok) throw new Error(resultado.message || "Não foi possível excluir.");
      setMensagem({ texto: "Publicação excluída com sucesso.", sucesso: true });
      await atualizarLista();
    } catch (error) {
      setMensagem({ texto: error instanceof Error ? error.message : "Não foi possível excluir.", sucesso: false });
    } finally {
      setIsLoading(false);
    }
  }

  const filtrados = relatorios.filter((relatorio) => {
    if (filtroTipo !== "TODOS" && relatorio.tipo !== filtroTipo) return false;
    if (filtroTipo === TipoPublicacao.BOLETIM_MENSAL && filtroAno && !relatorio.mesAno?.startsWith(filtroAno)) return false;
    if (filtroTipo === TipoPublicacao.RELATORIO_EVENTO) {
      if (filtroMes && (!relatorio.dataInicio || new Date(relatorio.dataInicio).toISOString().slice(0, 7) !== filtroMes)) return false;
      if (filtroCategoria && relatorio.categoria !== filtroCategoria) return false;
    }
    return true;
  });

  const tipoFormulario = editando?.tipo ?? tipoSelecionado;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Publicações</h1><p className="mt-1 text-sm text-muted-foreground">Publique relatórios de eventos e boletins mensais em PDF.</p></div>
        <Button onClick={() => setEscolhaAberta(!escolhaAberta)}><Plus />Publicar novo</Button>
      </div>

      {mensagem && <p className={`rounded-md border p-3 text-sm ${mensagem.sucesso ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>{mensagem.texto}</p>}

      <div className="grid gap-3 rounded-lg border bg-white p-4 shadow-sm md:grid-cols-4">
        <div className="space-y-2"><Label htmlFor="filtroTipo">Tipos de relatórios</Label><select id="filtroTipo" value={filtroTipo} onChange={(event) => { setFiltroTipo(event.target.value as "TODOS" | TipoPublicacao); setFiltroAno(""); setFiltroMes(""); setFiltroCategoria(""); }} className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"><option value="TODOS">Todos</option><option value={TipoPublicacao.RELATORIO_EVENTO}>Relatórios de eventos</option><option value={TipoPublicacao.BOLETIM_MENSAL}>Boletins mensais</option></select></div>
        {filtroTipo === TipoPublicacao.BOLETIM_MENSAL && <div className="space-y-2"><Label htmlFor="filtroAno">Ano do boletim</Label><Input id="filtroAno" type="number" min="2000" max="2100" placeholder="Ex.: 2026" value={filtroAno} onChange={(event) => setFiltroAno(event.target.value)} /></div>}
        {filtroTipo === TipoPublicacao.RELATORIO_EVENTO && <><div className="space-y-2"><Label htmlFor="filtroMes">Mês e ano do evento</Label><Input id="filtroMes" type="month" value={filtroMes} onChange={(event) => setFiltroMes(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="filtroCategoria">Categoria do evento</Label><select id="filtroCategoria" value={filtroCategoria} onChange={(event) => setFiltroCategoria(event.target.value)} className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"><option value="">Todas</option>{categorias.map((categoria) => <option key={categoria.value} value={categoria.value}>{categoria.label}</option>)}</select></div></>}
        <div className="flex items-end"><Button type="button" variant="outline" onClick={limparFiltros}>Limpar filtros</Button></div>
      </div>

      {escolhaAberta && tipoSelecionado === null && !editando && <div className="rounded-lg border bg-white p-5 shadow-sm"><h2 className="font-semibold">O que deseja publicar?</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><Button variant="outline" className="h-auto justify-start p-4 text-left" onClick={() => { setTipoSelecionado(TipoPublicacao.RELATORIO_EVENTO); setEscolhaAberta(false); }}><FileText /><span><strong className="block">Novo Relatório de Evento</strong><small className="font-normal text-muted-foreground">Período, categoria e descrição do evento</small></span></Button><Button variant="outline" className="h-auto justify-start p-4 text-left" onClick={() => { setTipoSelecionado(TipoPublicacao.BOLETIM_MENSAL); setEscolhaAberta(false); }}><FileText /><span><strong className="block">Novo Boletim Mensal</strong><small className="font-normal text-muted-foreground">Título e mês/ano da publicação</small></span></Button></div></div>}

      {tipoFormulario && <form key={editando?.id ?? tipoFormulario} onSubmit={enviarFormulario} className="space-y-5 rounded-lg border bg-white p-5 shadow-sm sm:p-6"><input type="hidden" name="tipo" value={tipoFormulario} /><div className="flex items-center justify-between border-b pb-4"><h2 className="text-lg font-semibold">{editando ? "Editar publicação" : tipoFormulario === TipoPublicacao.RELATORIO_EVENTO ? "Novo Relatório de Evento" : "Novo Boletim Mensal"}</h2><Button type="button" variant="ghost" onClick={() => { setTipoSelecionado(null); setEditando(null); }}>Cancelar</Button></div><div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2 sm:col-span-2"><Label htmlFor="titulo">Título</Label><Input id="titulo" name="titulo" defaultValue={editando?.titulo} maxLength={255} required /></div>{tipoFormulario === TipoPublicacao.RELATORIO_EVENTO ? <><div className="space-y-2"><Label htmlFor="categoria">Categoria do evento</Label><select id="categoria" name="categoria" defaultValue={editando?.categoria ?? "EVENTOS"} required className="h-9 w-full rounded-md border bg-transparent px-3 text-sm">{categorias.map((categoria) => <option key={categoria.value} value={categoria.value}>{categoria.label}</option>)}</select></div><div /><div className="space-y-2"><Label htmlFor="dataInicio">Início do evento</Label><Input id="dataInicio" name="dataInicio" type="date" defaultValue={inputDate(editando?.dataInicio ?? null)} required /></div><div className="space-y-2"><Label htmlFor="dataFim">Fim do evento</Label><Input id="dataFim" name="dataFim" type="date" defaultValue={inputDate(editando?.dataFim ?? null)} required /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="descricao">Breve descrição sobre o evento</Label><Textarea id="descricao" name="descricao" rows={4} defaultValue={editando?.descricao ?? ""} required /></div></> : <div className="space-y-2"><Label htmlFor="mesAno">Mês e ano do boletim</Label><Input id="mesAno" name="mesAno" type="month" defaultValue={editando?.mesAno ?? ""} required /></div>}<div className="space-y-2"><Label htmlFor="arquivoPdf">Documento PDF {editando && "(opcional)"}</Label><Input id="arquivoPdf" name="arquivoPdf" type="file" accept="application/pdf,.pdf" required={!editando} /><p className="text-xs text-muted-foreground">PDF de até 20 MB.</p></div><div className="space-y-2"><Label htmlFor="imagemCapa">Imagem da capa {editando && "(opcional)"}</Label><Input id="imagemCapa" name="imagemCapa" type="file" accept="image/*" required={!editando} /><p className="text-xs text-muted-foreground">Imagem de até 10 MB.</p></div></div><div className="flex justify-end"><Button type="submit" disabled={isLoading}>{isLoading ? "Salvando..." : editando ? "Salvar alterações" : "Publicar"}</Button></div></form>}

      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Publicações realizadas ({filtrados.length})</h2><Button variant="ghost" size="icon" onClick={() => atualizarLista().catch(() => setMensagem({ texto: "Não foi possível atualizar a lista.", sucesso: false }))} disabled={isLoading} title="Atualizar lista"><RefreshCw /><span className="sr-only">Atualizar lista</span></Button></div>
      {filtrados.length === 0 ? <div className="rounded-lg border-2 border-dashed py-16 text-center"><FileText className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-3 font-medium">Nenhuma publicação encontrada</p></div> : <div className="grid gap-4 md:grid-cols-2">{filtrados.map((relatorio) => <article key={relatorio.id} className="overflow-hidden rounded-lg border bg-white shadow-sm"><div className="relative aspect-2/1 bg-slate-100">{relatorio.nomeImagemCapa ? <img src={`/api/admin/relatorios/${relatorio.id}/capa`} alt="Capa da publicação" className="h-full w-full object-cover" /> : <ImageIcon className="m-auto h-full w-10 text-muted-foreground" />}</div><div className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{relatorio.tipo === TipoPublicacao.BOLETIM_MENSAL ? "Boletim Mensal" : categorias.find((item) => item.value === relatorio.categoria)?.label}</p><h3 className="mt-1 text-lg font-semibold">{relatorio.titulo}</h3>{relatorio.tipo === TipoPublicacao.BOLETIM_MENSAL ? <p className="mt-2 text-sm text-muted-foreground">Referência: {relatorio.mesAno}</p> : <><p className="mt-2 text-sm text-muted-foreground">Evento: {formatDate(relatorio.dataInicio)} a {formatDate(relatorio.dataFim)}</p><p className="mt-2 text-sm text-muted-foreground">{relatorio.descricao}</p></>}<p className="mt-3 text-xs text-muted-foreground">PDF: {formatBytes(relatorio.tamanhoArquivo)}{relatorio.tamanhoCapa ? ` | Capa: ${formatBytes(relatorio.tamanhoCapa)}` : ""}</p><div className="mt-4 flex flex-wrap gap-2"><Button asChild variant="outline" className="flex-1"><a href={`/api/admin/relatorios/${relatorio.id}/arquivo`} target="_blank" rel="noreferrer">Abrir PDF</a></Button><Button variant="outline" size="icon" title="Editar publicação" onClick={() => { setEditando(relatorio); setTipoSelecionado(null); setEscolhaAberta(false); }}><Pencil /><span className="sr-only">Editar publicação</span></Button>{session?.user?.role === "ADMIN" && <Button type="button" variant="destructive" size="icon" className="bg-red-600 text-white hover:bg-red-700" title="Excluir publicação" onClick={() => excluir(relatorio.id)}><Trash2 /><span className="sr-only">Excluir publicação</span></Button>}</div></div></article>)}</div>}
    </div>
  );
}
