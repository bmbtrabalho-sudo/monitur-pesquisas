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

interface DeletarPesquisaBotaoProps {
    pesquisaId: string;
    onPesquisaDeleted: () => void
}

export function DeletarPesquisaModal({ pesquisaId, onPesquisaDeleted }: DeletarPesquisaBotaoProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);
        try {
            const response = await fetch(`/api/admin/pesquisas/${pesquisaId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erro ao excluir pesquisa.");
            }
            toast.success('Pesquisa excluida com sucesso!', { position: 'top-center' })
            onPesquisaDeleted()
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
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente a pesquisa.
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