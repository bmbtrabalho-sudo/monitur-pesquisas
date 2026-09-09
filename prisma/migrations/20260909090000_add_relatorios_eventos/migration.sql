CREATE TABLE "relatorios_eventos" (
    "id" UUID NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "categoria" "PesquisaCategoria" NOT NULL,
    "data_evento" DATE NOT NULL,
    "descricao" TEXT NOT NULL,
    "arquivo_pdf" BYTEA NOT NULL,
    "nome_arquivo" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    "tamanho_arquivo" INTEGER NOT NULL,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relatorios_eventos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "relatorios_eventos_categoria_idx" ON "relatorios_eventos"("categoria");
CREATE INDEX "relatorios_eventos_data_evento_idx" ON "relatorios_eventos"("data_evento");

ALTER TABLE "relatorios_eventos" ADD CONSTRAINT "relatorios_eventos_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;