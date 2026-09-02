"use client";

import Link from "next/link";
import { Pesquisa, PesquisaStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { useSession } from "next-auth/react";
import { DeletarPesquisaModal } from "./deletar-pesquisa-modal";
import { EditarPesquisaModal } from "./editar-pesquisa-modal";
import { CATEGORIAS_PESQUISA } from "@/lib/pesquisa-options";

interface PesquisaCardProps {
  pesquisa: Pesquisa;
  onListChange: () => void;
}

export function PesquisaCard({ pesquisa, onListChange }: PesquisaCardProps) {
  const { data: session } = useSession();

  return (
    <Card className="bg-gray-100 flex flex-col justify-between border-none shadow-xl-t shadow-black transition transform hover:scale-105">
      <CardHeader>
        <CardTitle className="text-xl mb-1">{pesquisa.titulo}</CardTitle>
        <CardDescription className="hidden sm:block">
          {pesquisa.descricao || "Esta pesquisa não tem uma descrição."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {pesquisa.status === "PLANEJADO" ? (
          <Badge className="bg-amber-400">Planejado</Badge>
        ) : pesquisa.status === "CANCELADO" ? (
          <Badge className="bg-red-400">Cancelado</Badge>
        ) : pesquisa.status === "CONCLUIDO" ? (
          <Badge className="bg-green-400">Concluído</Badge>
        ) : (
          <Badge className="bg-blue-400">Em andamento</Badge>
        )}
        <div className="flex items-center">
          <Badge variant="outline">
            {CATEGORIAS_PESQUISA.find((categoria) => categoria.value === pesquisa.categoria)?.label ?? pesquisa.categoria}
          </Badge>
        </div>
        {pesquisa.municipio && (
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{pesquisa.municipio}</span>
          </div>
        )}
        {pesquisa.dataInicio && (
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>
              {new Date(pesquisa.dataInicio).toLocaleDateString("pt-BR", {timeZone: 'UTC'})} {" a "}
              {pesquisa.dataFim
                ? new Date(pesquisa.dataFim).toLocaleDateString("pt-BR", {timeZone: 'UTC'})
                : ""}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-2 ">
        <Link href={`/pesquisas/${pesquisa.id}`}>
          <Button className="bg-zinc-400/60 border border-zinc-500 transition transform hover:cursor-pointer hover:scale-110 ">
            Gerenciar
          </Button>
        </Link>
        <div className="space-x-2">
            <EditarPesquisaModal
              pesquisa={pesquisa}
              onPesquisaEditada={onListChange}
            />
            {session?.user?.role === "ADMIN" && (
              <DeletarPesquisaModal
                pesquisaId={pesquisa.id}
                onPesquisaDeleted={onListChange}
              />
            )}
        </div>
      </CardFooter>
    </Card>
  );
}
