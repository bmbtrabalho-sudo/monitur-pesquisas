-- Adiciona as categorias usadas para classificar cada pesquisa.
CREATE TYPE "PesquisaCategoria" AS ENUM ('EVENTOS', 'FEIRAS', 'MOTOCROSS', 'PESCA_ESPORTIVA');

ALTER TABLE "pesquisas"
ADD COLUMN "categoria" "PesquisaCategoria" NOT NULL DEFAULT 'EVENTOS';