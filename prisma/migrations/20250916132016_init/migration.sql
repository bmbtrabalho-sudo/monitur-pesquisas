-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PesquisaTipo" AS ENUM ('EVENTO', 'GERAL');

-- CreateEnum
CREATE TYPE "PesquisaStatus" AS ENUM ('PLANEJADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "FormularioTipo" AS ENUM ('PARTICIPANTE', 'EXPOSITOR', 'ORGANIZADOR');

-- CreateEnum
CREATE TYPE "TipoResposta" AS ENUM ('TEXTO', 'NUMERO', 'OPCAO', 'MULTIPLA', 'LOCALIDADE_MUNICIPIO');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesquisas" (
    "id" UUID NOT NULL,
    "tipo" "PesquisaTipo" NOT NULL DEFAULT 'EVENTO',
    "titulo" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "local_aplicacao" VARCHAR(255),
    "titulo_projeto" VARCHAR(255),
    "objetivo_geral" TEXT,
    "objetivos_especificos" TEXT,
    "justificativa" TEXT,
    "publico_alvo" TEXT,
    "metodologia" TEXT,
    "produtos_esperados" TEXT,
    "proponente" VARCHAR(255),
    "cnpj_proponente" VARCHAR(20),
    "municipio" VARCHAR(100),
    "area_abrangencia" TEXT,
    "processo_sei" VARCHAR(50),
    "valor_total" DECIMAL(12,2),
    "fonte_recurso" VARCHAR(255),
    "elemento_despesa" VARCHAR(50),
    "data_inicio" DATE,
    "data_fim" DATE,
    "status" "PesquisaStatus" NOT NULL DEFAULT 'PLANEJADO',
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pesquisas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formularios" (
    "id" UUID NOT NULL,
    "pesquisa_id" UUID NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "tipo" "FormularioTipo" NOT NULL DEFAULT 'PARTICIPANTE',
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formularios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perguntas" (
    "id" UUID NOT NULL,
    "formulario_id" UUID NOT NULL,
    "texto" TEXT NOT NULL,
    "tipo_resposta" "TipoResposta" NOT NULL,
    "opcoes_json" JSONB,
    "obrigatoria" BOOLEAN NOT NULL DEFAULT false,
    "incluir_opcao_outro" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perguntas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respostas" (
    "id" UUID NOT NULL,
    "formulario_id" UUID NOT NULL,
    "pesquisa_id" UUID NOT NULL,
    "data_resposta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" INET,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "respostas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respostas_detalhes" (
    "id" UUID NOT NULL,
    "resposta_id" UUID NOT NULL,
    "pergunta_id" UUID NOT NULL,
    "valor_texto" TEXT,
    "valor_numero" DECIMAL(10,2),
    "valor_data" DATE,
    "valor_opcao" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "respostas_detalhes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formularios_templates" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "tipo" "FormularioTipo" NOT NULL DEFAULT 'PARTICIPANTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formularios_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perguntas_templates" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "texto" TEXT NOT NULL,
    "tipo_resposta" "TipoResposta" NOT NULL,
    "opcoes_json" JSONB,
    "obrigatoria" BOOLEAN NOT NULL DEFAULT false,
    "incluir_opcao_outro" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perguntas_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "pesquisas" ADD CONSTRAINT "pesquisas_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios" ADD CONSTRAINT "formularios_pesquisa_id_fkey" FOREIGN KEY ("pesquisa_id") REFERENCES "pesquisas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perguntas" ADD CONSTRAINT "perguntas_formulario_id_fkey" FOREIGN KEY ("formulario_id") REFERENCES "formularios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas" ADD CONSTRAINT "respostas_formulario_id_fkey" FOREIGN KEY ("formulario_id") REFERENCES "formularios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas" ADD CONSTRAINT "respostas_pesquisa_id_fkey" FOREIGN KEY ("pesquisa_id") REFERENCES "pesquisas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_detalhes" ADD CONSTRAINT "respostas_detalhes_resposta_id_fkey" FOREIGN KEY ("resposta_id") REFERENCES "respostas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_detalhes" ADD CONSTRAINT "respostas_detalhes_pergunta_id_fkey" FOREIGN KEY ("pergunta_id") REFERENCES "perguntas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perguntas_templates" ADD CONSTRAINT "perguntas_templates_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "formularios_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
