"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormularioTemplate, FormularioTipo } from "@prisma/client";
import { toast } from "sonner";
import { Edit } from "lucide-react";

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

const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome do template é obrigatório." }),
  tipo: z.nativeEnum(FormularioTipo),
  descricao: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditarTemplateModalProps {
  template: FormularioTemplate;
  onTemplateEditado: () => void;
}

export function EditarTemplateModal({
  template,
  onTemplateEditado,
}: EditarTemplateModalProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: template.nome,
      tipo: template.tipo,
      descricao: template.descricao ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        nome: template.nome,
        tipo: template.tipo,
        descricao: template.descricao ?? "",
      });
    }
  }, [open, template, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch(`/api/admin/templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao editar o template.");
      }

      toast.success("Template atualizado com sucesso!");
      setOpen(false);
      onTemplateEditado();
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="transform transition hover:scale-125">
        <Edit />
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Editar Template de Formulário</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Template</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={FormularioTipo.PARTICIPANTE}>
                        Participante
                      </SelectItem>
                      <SelectItem value={FormularioTipo.EXPOSITOR}>
                        Expositor
                      </SelectItem>
                      <SelectItem value={FormularioTipo.ORGANIZADOR}>
                        Organizador
                      </SelectItem>
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
                    <Textarea {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full"
            >
              {form.formState.isSubmitting
                ? "Salvando..."
                : "Salvar Alterações"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
