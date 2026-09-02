"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PesquisaCategoria, PesquisaStatus } from "@prisma/client";
import { toast } from "sonner";
import InputMask from "react-input-mask";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CATEGORIAS_PESQUISA, MUNICIPIOS_RONDONIA } from "@/lib/pesquisa-options";

// Schema Zod completo, refletindo o backend
const formSchema = z.object({
  titulo: z.string().min(3, "O título é obrigatório."),
  categoria: z.nativeEnum(PesquisaCategoria),
  status: z.nativeEnum(PesquisaStatus),
  descricao: z.string().optional(),
  tituloProjeto: z.string().optional().nullable(),
  objetivoGeral: z.string().optional().nullable(),
  objetivosEspecificos: z.string().optional().nullable(),
  justificativa: z.string().optional().nullable(),
  publicoAlvo: z.string().optional().nullable(),
  metodologia: z.string().optional().nullable(),
  produtosEsperados: z.string().optional().nullable(),
  proponente: z.string().optional().nullable(),
  cnpjProponente: z.string().optional().nullable(),
  municipio: z.string().refine(
    (municipio) => MUNICIPIOS_RONDONIA.includes(municipio as (typeof MUNICIPIOS_RONDONIA)[number]),
    "Município é obrigatório."
  ),
  areaAbrangencia: z.string().optional().nullable(),
  processoSei: z.string().optional(),
  valorTotal: z.coerce.number().optional().nullable(),
  fonteRecurso: z.string().optional().nullable(),
  elementoDespesa: z.string().optional().nullable(),
  dataInicio: z.coerce.date().optional().nullable(),
  dataFim: z.coerce.date().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface CriarPesquisaModalProps {
  onPesquisaCriada?: () => void;
}

// Função para formatar o número do Processo SEI
function formatarProcessoSEI(value: string): string {
  const apenasNumeros = value.replace(/\D/g, "").slice(0, 17);
  let resultado = apenasNumeros.replace(/(\d{4})(\d)/, "$1.$2");
  resultado = resultado.replace(/(\d{4})\.(\d{6})(\d)/, "$1.$2/$3");
  resultado = resultado.replace(/(\d{4})\.(\d{6})\/(\d{4})(\d)/, "$1.$2/$3-$4");
  return resultado;
}

export default function CriarPesquisaModal({
  onPesquisaCriada,
}: CriarPesquisaModalProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      categoria: PesquisaCategoria.EVENTOS,
      status: PesquisaStatus.PLANEJADO,
      descricao: "",
      tituloProjeto: "",
      objetivoGeral: "",
      objetivosEspecificos: "",
      justificativa: "",
      publicoAlvo: "",
      metodologia: "",
      produtosEsperados: "",
      proponente: "",
      cnpjProponente: "",
      municipio: undefined,
      areaAbrangencia: "",
      processoSei: "",
      valorTotal: 0,
      fonteRecurso: "",
      elementoDespesa: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch("/api/admin/pesquisas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao criar pesquisa.");
      }
      toast.success("Pesquisa criada com sucesso!");
      setOpen(false);
      form.reset();
      onPesquisaCriada?.();
    } catch (error: any) {
      console.error("Erro na submissão:", error);
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='openModal'>
          Criar Nova Pesquisa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl bg-white">
        <DialogHeader>
          <DialogTitle>Criar Nova Pesquisa</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <div className="p-2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* --- SEÇÃO 1: INFORMAÇÕES BÁSICAS --- */}
                <fieldset className="space-y-4 rounded-lg">
                  <legend className=" text-lg font-medium">
                    Informações Básicas
                  </legend>
                  <FormField
                    control={form.control}
                    name="titulo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título da Pesquisa</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Pesquisa de Satisfação - ExpoAgro 2025"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 md:gap-4">
                    <FormField
                      control={form.control}
                      name="categoria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger></FormControl>
                            <SelectContent className="bg-white">
                              {CATEGORIAS_PESQUISA.map((categoria) => (
                                <SelectItem key={categoria.value} value={categoria.value}>{categoria.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white">
                              <SelectItem value={PesquisaStatus.PLANEJADO}>
                                Planejado
                              </SelectItem>
                              <SelectItem value={PesquisaStatus.EM_ANDAMENTO}>
                                Em Andamento
                              </SelectItem>
                              <SelectItem value={PesquisaStatus.CONCLUIDO}>
                                Concluído
                              </SelectItem>
                              <SelectItem value={PesquisaStatus.CANCELADO}>
                                Cancelado
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Breve resumo sobre o objetivo da pesquisa..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </fieldset>

                {/* --- SEÇÃO 2: DETALHES DO PROJETO (CONDICIONAL) --- */}
                <fieldset className="space-y-4 ">
                    <legend className="-ml-1 px-1 text-lg font-medium">
                      Detalhes do Projeto/Evento
                    </legend>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dataInicio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Início</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={
                                  field.value
                                    ? new Date(field.value)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dataFim"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Fim</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={
                                  field.value
                                    ? new Date(field.value)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="tituloProjeto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título do Projeto</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Título completo do projeto vinculado"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="objetivoGeral"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Objetivo Geral</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva o objetivo principal..."
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="objetivosEspecificos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Objetivos Específicos</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Liste os objetivos específicos..."
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="justificativa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Justificativa</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Justifique a importância da pesquisa..."
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="publicoAlvo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Público Alvo</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva o público que a pesquisa visa alcançar..."
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="metodologia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Metodologia</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Detalhe a metodologia a ser aplicada..."
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="produtosEsperados"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Produtos/Resultados Esperados</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Liste os produtos ou resultados esperados..."
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  
                </fieldset>

                {/* --- SEÇÃO 3: ADMINISTRAÇÃO E LOCALIZAÇÃO --- */}
                <fieldset className="space-y-4 ">
                  <legend className="-ml-1 px-1 text-lg font-medium">
                    Administração e Localização
                  </legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="proponente"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proponente</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cnpjProponente"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ do Proponente</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="processoSei"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Processo SEI</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="0000.000000/0000-00"
                              {...field}
                              onChange={(e) => {
                                const v = formatarProcessoSEI(e.target.value);
                                field.onChange(v);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="municipio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Município</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? ""}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione o município" /></SelectTrigger></FormControl>
                            <SelectContent className="bg-white">
                              {MUNICIPIOS_RONDONIA.map((municipio) => <SelectItem key={municipio} value={municipio}>{municipio}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="areaAbrangencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área de Abrangência</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </fieldset>

                {/* --- SEÇÃO 4: INFORMAÇÕES FINANCEIRAS --- */}
                <fieldset className="space-y-4 ">
                  <legend className="-ml-1 px-1 text-lg font-medium">
                    Informações Financeiras
                  </legend>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="valorTotal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Total (R$)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="1500.50"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fonteRecurso"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fonte do Recurso</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="elementoDespesa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Elemento de Despesa</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </fieldset>

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  variant='create'
                >
                  {form.formState.isSubmitting
                    ? "Criando..."
                    : "Criar Pesquisa"}
                </Button>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
