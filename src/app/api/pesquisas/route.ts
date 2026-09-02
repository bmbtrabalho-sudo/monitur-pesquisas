import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        const pesquisas = await prisma.pesquisa.findMany({
            orderBy: {
                createdAt: 'desc' // Ordenar pelas mais recentes
            },
            select: { // Seleciona apenas os campos que geralmente precisa na listagem
                id: true,
                titulo: true,
                categoria: true,
                municipio: true,
                dataInicio: true,
                dataFim: true,
                status: true,
                descricao: true, // Inclui descrição para cards na UI
                // pode-se incluir outros campos que queira exibir na listagem de eventos
            }
        });
        return NextResponse.json(pesquisas);
    } catch (error) {
        console.error('Erro ao buscar pesquisas:', error);
        return NextResponse.json({ message: 'Erro ao buscar pesquisas' }, { status: 500 });
    } 
}