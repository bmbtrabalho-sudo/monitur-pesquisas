-- As pesquisas agora sao classificadas somente pela categoria.
ALTER TABLE "pesquisas" DROP COLUMN "tipo";
DROP TYPE "PesquisaTipo";