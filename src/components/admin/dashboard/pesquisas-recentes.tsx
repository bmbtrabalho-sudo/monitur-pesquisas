import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pesquisa } from "@prisma/client";

type PesquisaRecente = Pick<Pesquisa, "id" | "titulo" | "status" | "createdAt">;

interface PesquisasRecentesProps {
  pesquisas: PesquisaRecente[];
}

export function PesquisasRecentes({ pesquisas }: PesquisasRecentesProps) {
  return (
    <Card className="border border-zinc-300 shadow-xl shadow-zinc-400">
      <CardHeader>
        <CardTitle>Pesquisas Recentes</CardTitle>
        <CardDescription>
          As 5 últimas pesquisas criadas na plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pesquisas.length > 0 ? (
          <div className="space-y-4 ">
            {pesquisas.map((pesquisa) => (
              <div key={pesquisa.id} className="flex items-center bg-zinc-300 p-2 rounded-md">
                <div className="ml-4 space-y-4 ">
                  <p className="text-sm font-medium leading-none">
                    {pesquisa.titulo}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Criada em{" "}
                    {new Date(pesquisa.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  {pesquisa.status === "PLANEJADO" ? (
                    <Badge className="bg-amber-400">Planejado</Badge>
                  ) : pesquisa.status === "CANCELADO" ? (
                    <Badge className="bg-red-400">Cancelado</Badge>
                  ) : pesquisa.status === "CONCLUIDO" ? (
                    <Badge className="bg-green-400">Concluído</Badge>
                  ) : (
                    <Badge className="bg-blue-400">Em andamento</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma pesquisa criada recentemente.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
