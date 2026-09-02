'use client';

import { useState } from "react";
import { Trash2 } from "lucide-react";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeletarUsuarioBotaoProps {
    userId: string;
    onUserDeleted: () => void;
}

export function DeletarUsuarioModal({ userId, onUserDeleted }: DeletarUsuarioBotaoProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);
        try {
            const response = await fetch(`/api/admin/usuarios/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Falha ao excluir usuário.");
            }
            toast.success('Usuário excluído com sucesso!', {position: 'top-center'})
            onUserDeleted();
        } catch (err: any) {
            setError(err.message);
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger className="text-red-600 transform transition-all hover:scale-125">
                <Trash2 />
            </DialogTrigger>
            <DialogContent className="bg-white">
                <DialogHeader>
                    <DialogTitle>Você tem certeza?</DialogTitle>
                    <DialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente a conta do usuário.
                        {error && <p className="mt-2 text-sm font-medium text-destructive">{error}</p>}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 flex justify-end gap-2">

                    <DialogClose asChild>
                        <Button variant={'outline'}>Cancelar</Button>
                    </DialogClose>

                    <Button
                        variant={'delete'}
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Excluindo..." : "Excluir"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}