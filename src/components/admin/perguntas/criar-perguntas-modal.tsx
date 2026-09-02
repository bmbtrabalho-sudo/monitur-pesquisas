"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pergunta, TipoResposta } from "@prisma/client";
import { toast } from "sonner";
import { PlusCircle, X } from "lucide-react";

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
  FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z
  .object({
    texto: z.string().min(3, { message: "O texto da pergunta é obrigatório." }),
    tipoResposta: z.nativeEnum(TipoResposta),
    obrigatoria: z.boolean(),
    incluirOpcaoOutro: z.boolean().default(false).optional(),
    opcoesMultiplas: z.array(z.object({ texto: z.string() })).optional(),
    opcoesLinhas: z.array(z.object({ texto: z.string() })).optional(),
    opcoesColunas: z.array(z.object({ texto: z.string() })).optional(),
  })
  // Lógica de validação condicional
  .refine(
    (data) => {
      // Se for OPCAO ou MULTIPLA, verifique se as opções são válidas
      if (data.tipoResposta === "OPCAO" || data.tipoResposta === "MULTIPLA") {
        return (
          data.opcoesMultiplas &&
          data.opcoesMultiplas.length > 0 &&
          data.opcoesMultiplas.every((opt) => opt.texto.trim().length > 0)
        );
      }
      if (data.tipoResposta === "GRADE_MULTIPLA_ESCOLHA") {
        const linhasValidas =
          data.opcoesLinhas &&
          data.opcoesLinhas.length > 0 &&
          data.opcoesLinhas.every((opt) => opt.texto.trim().length > 0);
        const colunasValidas =
          data.opcoesColunas &&
          data.opcoesColunas.length > 0 &&
          data.opcoesColunas.every((opt) => opt.texto.trim().length > 0);
        return linhasValidas && colunasValidas;
      }
      return true;
    },
    {
      // Mensagem de erro se a validação acima falhar
      message:
        "Para os tipos OPCAO ou MULTIPLA, pelo menos uma opção deve ser preenchida.",
      // Associa o erro ao primeiro item do array de opções
      path: ["opcoesMultiplas.0.texto"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

interface CriarPerguntaModalProps {
  formularioId: string;
  onPerguntaCriada: () => void;
}

export function CriarPerguntaModal({
  formularioId,
  onPerguntaCriada,
}: CriarPerguntaModalProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      texto: "",
      tipoResposta: TipoResposta.TEXTO,
      incluirOpcaoOutro: false,
      obrigatoria: false,
      opcoesMultiplas: [{ texto: "" }],
      opcoesLinhas: [{ texto: "" }],
      opcoesColunas: [{ texto: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "opcoesMultiplas",
  });

  const {
    fields: fieldsLinhas,
    append: appendLinha,
    remove: removeLinha,
  } = useFieldArray({ control: form.control, name: "opcoesLinhas" });
  const {
    fields: fieldsColunas,
    append: appendColuna,
    remove: removeColuna,
  } = useFieldArray({ control: form.control, name: "opcoesColunas" });

  const tipoSelecionado = form.watch("tipoResposta");

  const onSubmit = async (data: FormValues) => {
    let opcoesJson = null;

    if (tipoSelecionado === "GRADE_MULTIPLA_ESCOLHA") {
      opcoesJson = {
        linhas: data.opcoesLinhas?.map((opt) => opt.texto).filter(Boolean),
        colunas: data.opcoesColunas?.map((opt) => opt.texto).filter(Boolean),
      };
    } else if (tipoSelecionado === "OPCAO" || tipoSelecionado === "MULTIPLA") {
      opcoesJson = {
        opcoes: data.opcoesMultiplas?.map((opt) => opt.texto).filter(Boolean),
      };
    }

    const payload = {
      texto: data.texto,
      tipoResposta: data.tipoResposta,
      obrigatoria: data.obrigatoria,
      incluirOpcaoOutro: data.incluirOpcaoOutro,
      opcoesJson: opcoesJson,
      formularioId: formularioId,
    };

    try {
      const response = await fetch("/api/admin/perguntas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao criar pergunta.");
      }

      toast.success("Pergunta criada com sucesso!");
      setOpen(false);
      form.reset();
      onPerguntaCriada();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="openModal" size="sm">
          Adicionar Pergunta
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white sm:max-w-2xl max-h-[85vh] overflow-y-auto" >
        <DialogHeader>
          <DialogTitle>Criar Nova Pergunta</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log("Erros de validação do Zod:", errors);
            })}
            className="space-y-4 p-2"
          >
            <FormField
              control={form.control}
              name="texto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto da Pergunta</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Qual o seu nível de satisfação?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-3 md:flex-row justify-between">
              <FormField
                control={form.control}
                name="tipoResposta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Resposta</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white ">
                        {Object.values(TipoResposta).map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo === "TEXTO"
                              ? "Texto"
                              : tipo === "NUMERO"
                              ? "Número"
                              : tipo === "OPCAO"
                              ? "Opção"
                              : tipo === "MULTIPLA"
                              ? "Multipla"
                              : tipo === "GRADE_MULTIPLA_ESCOLHA"
                              ? "Grade Multipla Escolha"
                              : "Municipio"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {tipoSelecionado === "OPCAO" && (
                <FormField
                  control={form.control}
                  name="incluirOpcaoOutro"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>

                        <FormLabel>
                          Incluir opção "Outro" com campo de texto?
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* --- CAMPOS DINÂMICOS COM BASE NO TIPO --- */}
            {(tipoSelecionado === "OPCAO" ||
              tipoSelecionado === "MULTIPLA") && (
              <div className="space-y-3">
                <FormLabel>Opções de Resposta</FormLabel>
                {fields.map((item, index) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name={`opcoesMultiplas.${index}.texto`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormControl>
                            <Input
                              placeholder={`Opção ${index + 1}`}
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            onClick={() => remove(index)}
                            disabled={fields.length <= 1}
                          >
                            <X className="h-4 w-4 text-red-700" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ texto: "" })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Opção
                </Button>
              </div>
            )}

            {tipoSelecionado === "GRADE_MULTIPLA_ESCOLHA" && (
              <div className="space-y-4">
                {/* Inputs para as Linhas */}
                <div className="space-y-2 p-4 border rounded-md">
                  <FormLabel>Linhas (Sub-perguntas)</FormLabel>
                  {fieldsLinhas.map((item, index) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name={`opcoesLinhas.${index}.texto`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input
                                placeholder={`Linha ${index + 1}`}
                                {...field}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              onClick={() => removeLinha(index)}
                              disabled={fieldsLinhas.length <= 1}
                            >
                              <X className="h-4 w-4 text-red-700" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendLinha({ texto: "" })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Linha
                  </Button>
                </div>
                {/* Inputs para as Colunas */}
                <div className="space-y-2 p-4 border rounded-md">
                  <FormLabel>Colunas (Opções de Resposta)</FormLabel>
                  {fieldsColunas.map((item, index) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name={`opcoesColunas.${index}.texto`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input
                                placeholder={`Coluna ${index + 1}`}
                                {...field}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              onClick={() => removeColuna(index)}
                              disabled={fieldsColunas.length <= 1}
                            >
                              <X className="h-4 w-4 text-red-700" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendColuna({ texto: "" })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Coluna
                  </Button>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="obrigatoria"
              render={({ field }) => (
                <FormItem className="rounded-lg border p-4">
                  <div className="flex gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Resposta Obrigatória</FormLabel>
                      <FormDescription>
                        Marque se o usuário deve obrigatoriamente responder esta
                        pergunta.
                      </FormDescription>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              variant="create"
              disabled={form.formState.isSubmitting}
              className="w-full border"
            >
              {form.formState.isSubmitting ? "Criando..." : "Criar Pergunta"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
