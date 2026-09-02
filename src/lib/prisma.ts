import { PrismaClient } from '@prisma/client';

// Reutiliza uma unica instancia durante o hot reload e entre invocacoes aquecidas
// da Vercel, evitando abrir conexoes demais no Supabase.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || createPrismaInstance();

function createPrismaInstance() {
  // Logs detalhados ajudam no desenvolvimento, mas nao devem expor consultas em producao.
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

if (process.env.NODE_ENV !== 'production') {
  // O Next.js recarrega modulos durante o desenvolvimento; guardar a instancia
  // no objeto global impede a criacao de varios clientes.
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma;
  } else {
    
  }
}