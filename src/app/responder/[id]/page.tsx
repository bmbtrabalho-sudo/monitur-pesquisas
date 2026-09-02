"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Formulario, Pergunta, TipoResposta } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import Image from "next/image";
import { LocalidadeSelector } from "@/components/public/localidade-selector";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FormularioComPerguntas = Formulario & { perguntas: Pergunta[] };

function RenderizarPergunta({
  pergunta,
  control,
  watch,
}: {
  pergunta: Pergunta;
  control: any;
  watch: any;
}) {
  const opcoes = pergunta.opcoesJson as {
    opcoes?: string[];
    linhas: string[];
    colunas: string[];
  };
  const valorSelecionado = watch(`respostas.${pergunta.id}`);

  return (
    <FormField
      control={control}
      name={`respostas.${pergunta.id}`}
      render={({ field }) => (
        <FormItem className="bg-white rounded-lg">
          <FormLabel className="text-base font-semibold">
            {pergunta.obrigatoria && (
              <span className="text-red-500 ml-1">*</span>
            )}
            {pergunta.texto}
          </FormLabel>

          <FormControl>
            {(() => {
              switch (pergunta.tipoResposta) {
                case TipoResposta.TEXTO:
                  return <Textarea {...field} />;
                case TipoResposta.NUMERO:
                  return (
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? null
                            : parseInt(e.target.value)
                        )
                      }
                    />
                  );

                case TipoResposta.OPCAO:
                  if (!opcoes?.opcoes) return null;
                  return (
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-2"
                    >
                      {opcoes.opcoes.map((opcao) => (
                        <FormItem
                          key={opcao}
                          className="grid grid-cols-[auto_1fr] items-center space-x-2"
                        >
                          <FormControl>
                            <RadioGroupItem value={opcao} />
                          </FormControl>
                          <FormLabel className="font-normal">{opcao}</FormLabel>
                        </FormItem>
                      ))}

                      {pergunta.incluirOpcaoOutro && (
                        <div className="flex items-center space-x-3">
                          <FormControl>
                            <RadioGroupItem value="outro_texto" />
                          </FormControl>
                          <FormLabel className="font-normal">Outro:</FormLabel>
                          {/* O campo de texto só aparece se "Outro" estiver selecionado */}
                          {valorSelecionado === "outro_texto" && (
                            <FormField
                              control={control}
                              name={`respostas.${pergunta.id}_outro`} // Campo separado para o texto
                              render={({ field: outroField }) => (
                                <FormControl>
                                  <Input
                                    placeholder="Qual?"
                                    {...outroField}
                                    className="flex-1"
                                  />
                                </FormControl>
                              )}
                            />
                          )}
                        </div>
                      )}
                    </RadioGroup>
                  );
                case TipoResposta.MULTIPLA:
                  if (!opcoes?.opcoes) return null;
                  return (
                    <div className="space-y-2">
                      {opcoes.opcoes.map((opcao) => (
                        <FormField
                          key={opcao}
                          control={control}
                          name={`respostas.${pergunta.id}`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(opcao)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...(field.value || []),
                                          opcao,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value: string) => value !== opcao
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {opcao}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  );
                case TipoResposta.LOCALIDADE_MUNICIPIO:
                  return <LocalidadeSelector field={field} />;
                case TipoResposta.GRADE_MULTIPLA_ESCOLHA:
                  if (!opcoes?.linhas || !opcoes?.colunas) return null;
                  return (
                    <div className="overflow-x-auto rounded-lg border">
                      <Table className="min-w-full relative">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="sticky left-0 z-10 w-[200px] bg-white font-medium">
                              Segmento
                            </TableHead>
                            {opcoes.colunas.map((coluna) => (
                              <TableHead key={coluna} className="text-center">
                                {coluna}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {opcoes.linhas.map((linha) => (
                            <FormField
                              key={linha}
                              control={control}
                              name={`respostas.${pergunta.id}.${linha.replace(
                                /\s+/g,
                                "_"
                              )}`}
                              render={({ field: linhaField }) => (
                                <TableRow>
                                  <TableHead className="sticky left-0 z-10 bg-white font-medium">
                                    {linha}
                                  </TableHead>
                                  {opcoes.colunas.map((coluna) => (
                                    <TableCell
                                      key={coluna}
                                      className="text-center "
                                    >
                                      <FormControl>
                                        <RadioGroup
                                          onValueChange={linhaField.onChange}
                                          value={linhaField.value}
                                          className="flex justify-center"
                                        >
                                          <RadioGroupItem value={coluna} />
                                        </RadioGroup>
                                      </FormControl>
                                    </TableCell>
                                  ))}
                                </TableRow>
                              )}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  );

                default:
                  return <Input {...field} />; // fallback seguro
              }
            })()}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default function PaginaDeResposta() {
  const [formulario, setFormulario] = useState<FormularioComPerguntas | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const params = useParams();
  const formId = Array.isArray(params.id) ? params.id[0] : params.id;

  const form = useForm();

  useEffect(() => {
    const fetchFormulario = async () => {
      try {
        const response = await fetch(`/api/public/formularios/${formId}`);
        if (!response.ok)
          throw new Error(
            "Este formulário não foi encontrado ou não está mais ativo."
          );
        const data = await response.json();
        setFormulario(data);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFormulario();
  }, [formId]);

  const onSubmit = async (data: any) => {
    if (!formulario) return;

    try {
      const respostasProcessadas = { ...data.respostas };
      Object.keys(respostasProcessadas).forEach((key) => {
        if (key.endsWith("_outro") && respostasProcessadas[key]) {
          const perguntaId = key.split("_")[0];
          if (respostasProcessadas[perguntaId] === "outro_texto") {
            respostasProcessadas[perguntaId] = respostasProcessadas[key];
          }
        }
      });

      const payload = {
        formularioId: formulario.id,
        respostas: respostasProcessadas,
      };

      const response = await fetch("/api/public/respostas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Houve um erro ao enviar suas respostas."
        );
      }

      setSuccess(true);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        Carregando formulário...
      </div>
    );
  if (success)
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-8">
        <h1 className="text-3xl font-bold text-green-600">
          Obrigado por responder!
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Suas respostas foram enviadas com sucesso.
        </p>
      </div>
    );
  if (!formulario)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Erro: Formulário não encontrado.
      </div>
    );

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="w-full flex justify-center p-2 bg-blue-600/70">
        <Image
          src={"/governo-do-estado-ro.svg"}
          alt="Governo do Estado de Rondônia"
          width={160}
          height={100}
        />
      </div>
      <div className="container mx-auto max-w-3xl bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <header className="border-b pb-4 mb-8 ">
          <h1 className="text-center text-xl font-bold tracking-tight">
            {formulario.nome}
          </h1>
          {formulario.descricao && (
            <p className="text-sm text-muted mt-2">{formulario.descricao}</p>
          )}
        </header>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {formulario.perguntas.map((pergunta) => (
              <RenderizarPergunta
                key={pergunta.id}
                pergunta={pergunta}
                control={form.control}
                watch={form.watch}
              />
            ))}
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full text-lg bg-blue-400"
            >
              {form.formState.isSubmitting ? "Enviando..." : "Enviar Respostas"}
            </Button>
          </form>
        </Form>
      </div>
    </main>
  );
}
