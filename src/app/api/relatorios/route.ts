import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server'

export async function GET() {
  // Número total de respostas
  const total = await prisma.pesquisa.count()

  // Função auxiliar para agrupar um campo
  async function distBy(field: string) {
    return prisma.pesquisa.groupBy({
      by: [field as any],
      _count: { _all: true },
    })
  }

  // Campos a agrupar
  const campos = [
    'perfil',
    'comoSoube',
    'veioOutraCidade',
    'hospedagem',
    'gasto',
    'beneficiosEconomicos',
    'maiorImpacto',
    'organizacao',
    'acessibilidade',
    'turismo',
    'impactoAmbiental',
    'sustentabilidade',
    'visitaTuristica',
    'recomendaria',
  ] as const

  // Executa todos os agrupamentos em paralelo
  const resultados = await Promise.all(
    campos.map((campo) => distBy(campo))
  )

  // Monta o objeto de resposta, mapeando campo → dados
  const relatorio: Record<string, any> = { total }
  campos.forEach((campo, i) => {
    relatorio[campo] = resultados[i]
  })

  return NextResponse.json(relatorio)
}
