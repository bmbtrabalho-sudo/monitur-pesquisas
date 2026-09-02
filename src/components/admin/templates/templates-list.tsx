"use client";

import { FormularioTemplate } from "@prisma/client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { CriarTemplateModal } from "./criar-template-modal";
import { DeletarTemplateBotao } from "./deletar-template-modal";
import { EditarTemplateModal } from "./editar-template-modal";
import { FileText } from "lucide-react";
import { useSession } from "next-auth/react";

export default function TemplatesList({
  templatesIniciais,
}: {
  templatesIniciais: FormularioTemplate[];
}) {
  const { data: session } = useSession();
  const [templates, setTemplates] = useState(templatesIniciais || []);

  const refetchTemplates = async () => {
    try {
      const response = await fetch("/api/admin/templates");
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error("Falha ao recarregar templates", error);
    }
  };
  useEffect(() => {
    setTemplates(templatesIniciais || []);
  }, [templatesIniciais]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between items-center sm:flex-row">
        <h1 className="text-xl font-bold">Modelos de Formulários</h1>
        <CriarTemplateModal onTemplateCriado={refetchTemplates} />
      </div>

      {templates.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-xl font-semibold">
            Nenhum modelo encontrado
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Clique em "Criar Novo Modelo" para começar.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="bg-gray-100 flex flex-col justify-between border-none shadow-xl-t shadow-black transition transform hover:scale-105"
          >
            <CardHeader>
              <CardTitle>{template.nome}</CardTitle>
              <CardDescription>
                {template.descricao || "Sem descrição"}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between gap-2">
              <Link href={`/templates/${template.id}`}>
                <Button className="bg-zinc-400/60 border border-zinc-500 transition transform hover:cursor-pointer hover:scale-110">
                  Gerenciar
                </Button>
              </Link>
              <div className="space-x-2">
                <EditarTemplateModal
                  template={template}
                  onTemplateEditado={refetchTemplates}
                />
                {session?.user?.role === "ADMIN" && (
                  <DeletarTemplateBotao
                    templateId={template.id}
                    onTemplateDeleted={refetchTemplates}
                  />
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
