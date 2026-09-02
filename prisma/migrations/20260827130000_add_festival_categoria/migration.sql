-- Adiciona Festival sem alterar a migration de criacao ja aplicada.
ALTER TYPE "PesquisaCategoria" ADD VALUE IF NOT EXISTS 'FESTIVAL';