// app/admin/templates/page.tsx
import TemplatesList from "@/components/admin/templates/templates-list";
import { prisma } from "@/lib/prisma";
import { FormularioTemplate } from "@prisma/client";

async function getTemplates(): Promise<FormularioTemplate[]> {
  try {
    return await prisma.formularioTemplate.findMany({
      orderBy: { nome: "asc" },
    });
  } catch (error) {
    console.error("Falha ao buscar templates:", error);
    return [];
  }
}

export default async function PaginaTemplates() {
  const templatesIniciais = await getTemplates();
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <TemplatesList templatesIniciais={templatesIniciais} />
    </div>
  );
}