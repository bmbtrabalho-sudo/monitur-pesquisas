'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormularioTipo } from "@prisma/client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Schema de validação para o formulário
const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome do formulário é obrigatório." }),
  tipo: z.nativeEnum(FormularioTipo),
  descricao: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CriarFormularioModalProps {
  pesquisaId: string;
  onFormularioCriado: () => void;
}

export function CriarFormularioModal({ pesquisaId, onFormularioCriado }: CriarFormularioModalProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      tipo: FormularioTipo.PARTICIPANTE,
      descricao: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch('/api/admin/formularios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, pesquisaId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao criar formulário.");
      }

      toast.success("Formulário criado com sucesso!");
      setOpen(false);
      form.reset();
      onFormularioCriado();

    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='openModal'>Criar Novo Formulário</Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Criar Novo Formulário</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Formulário</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Formulário de Satisfação do Participante" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Formulário</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      <SelectItem value={FormularioTipo.PARTICIPANTE}>Participante</SelectItem>
                      <SelectItem value={FormularioTipo.EXPOSITOR}>Expositor</SelectItem>
                      <SelectItem value={FormularioTipo.ORGANIZADOR}>Organizador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Breve descrição do propósito deste formulário..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" variant='create' disabled={form.formState.isSubmitting} className="w-full">
              {form.formState.isSubmitting ? "Criando..." : "Criar Formulário"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}