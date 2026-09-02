"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Formato de email inválido."),
  currentPassword: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => !data.password || data.password.length >= 6, {
  message: "A nova senha deve ter pelo menos 6 caracteres.",
  path: ["password"],
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof profileSchema>;

export default function PerfilForm({ usuarioInicial }: { usuarioInicial: Pick<FormValues, "name" | "email"> }) {
  const { update } = useSession();
  const [apiError, setApiError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { ...usuarioInicial, currentPassword: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(data: FormValues) {
    setApiError(null);
    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || "Não foi possível atualizar o perfil.");

      await update({ name: responseData.name, email: responseData.email });
      form.reset({ ...data, currentPassword: "", password: "", confirmPassword: "" });
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar perfil.";
      setApiError(message);
      toast.error(message);
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>Meu perfil</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>E-mail</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="border-t pt-5 space-y-4">
              <p className="text-sm font-medium">Alterar senha</p>
              <FormField control={form.control} name="currentPassword" render={({ field }) => (
                <FormItem><FormLabel>Senha atual</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>Nova senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem><FormLabel>Confirmar nova senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            {apiError && <p className="text-sm text-destructive">{apiError}</p>}
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
              {form.formState.isSubmitting ? "Salvando..." : "Salvar alterações"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
