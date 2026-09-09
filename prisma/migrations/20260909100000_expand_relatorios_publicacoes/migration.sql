CREATE TYPE "TipoPublicacao" AS ENUM ('RELATORIO_EVENTO', 'BOLETIM_MENSAL');

ALTER TABLE "relatorios_eventos"
  ADD COLUMN "tipo" "TipoPublicacao" NOT NULL DEFAULT 'RELATORIO_EVENTO',
  ADD COLUMN "data_inicio" DATE,
  ADD COLUMN "data_fim" DATE,
  ADD COLUMN "mes_ano" VARCHAR(7),
  ADD COLUMN "imagem_capa" BYTEA,
  ADD COLUMN "nome_imagem_capa" VARCHAR(255),
  ADD COLUMN "mime_imagem_capa" VARCHAR(100),
  ADD COLUMN "tamanho_capa" INTEGER;

ALTER TABLE "relatorios_eventos"
  ALTER COLUMN "categoria" DROP NOT NULL,
  ALTER COLUMN "data_evento" DROP NOT NULL,
  ALTER COLUMN "descricao" DROP NOT NULL;

UPDATE "relatorios_eventos"
SET "data_inicio" = "data_evento", "data_fim" = "data_evento"
WHERE "data_evento" IS NOT NULL;

DROP INDEX IF EXISTS "relatorios_eventos_data_evento_idx";
ALTER TABLE "relatorios_eventos" DROP COLUMN "data_evento";
CREATE INDEX "relatorios_eventos_data_inicio_idx" ON "relatorios_eventos"("data_inicio");