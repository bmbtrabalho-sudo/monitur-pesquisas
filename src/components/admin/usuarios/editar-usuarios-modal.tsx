'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { User, UserRole } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit } from "lucide-react";
import { toast } from "sonner";

type SafeUser = Omit<User, 'password' | 'emailVerified'>;

interface FormValues {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
    confirmPassword?: string;
}

// 1. O modal agora recebe o usuário a ser editado e um callback de sucesso
interface EditarUsuarioModalProps {
    user: SafeUser;
    onUserUpdated: () => void;
}

export default function EditarUsuarioModal({ user, onUserUpdated }: EditarUsuarioModalProps) {
    const [open, setOpen] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const form = useForm<FormValues>();

    useEffect(() => {
        if (open) {
            form.reset({
                name: user.name ?? "",
                email: user.email ?? "",
                role: user.role,
            });
        }
    }, [open, user, form]);

    const onSubmit = async (data: FormValues) => {
        setApiError(null);
        try {
            const response = await fetch(`/api/admin/usuarios/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || "Falha ao atualizar usuário.");
            }

            setOpen(false);
            toast.success('Usuário atualizado com sucesso!', {position: 'top-center'} )
            onUserUpdated();

        } catch (error: any) {
            console.error("Erro na submissão:", error);
            setApiError(error.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="transform transition-all hover:scale-125">
                <Edit />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle>Editar Usuário</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <div className="flex gap-4 justify-between">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Nome</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Função</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent className="bg-white">
                                                <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                                                <SelectItem value={UserRole.USER}>Usuário</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-mail</FormLabel>
                                    <FormControl><Input type="email" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nova senha (opcional)</FormLabel>
                                        <FormControl><Input type="password" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmar nova senha</FormLabel>
                                        <FormControl><Input type="password" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {apiError && <p className="text-sm font-medium text-destructive">{apiError}</p>}
                        <Button type="submit" disabled={form.formState.isSubmitting} className="bg-blue-500 w-full text-white px-4 py-2 rounded hover:bg-blue-600">
                            {form.formState.isSubmitting ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}