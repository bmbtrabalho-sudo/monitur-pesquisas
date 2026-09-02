import { FormularioTipo } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Esquema Zod para validar os dados ao criar um novo Formulário
const createFormularioSchema = z.object({
    pesquisaId: z.string().min(1, 'ID da pesquisa é obrigatório.'),
    nome: z.string().min(1, 'Nome do formulário é obrigatório.'),
    tipo: z.nativeEnum(FormularioTipo).default(FormularioTipo.PARTICIPANTE),
    descricao: z.string().optional().nullable(),
    ativo: z.boolean().default(true),
});

// Handler para criar uma nova definição de Formulário
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }
    
    try {
        const data = await request.json();

        //Verificar se a pesquisaId existe
        const pesquisaExists = await prisma.pesquisa.findUnique({ where: { id: data.pesquisaId } });
        if (!pesquisaExists) {
            return NextResponse.json({ message: 'Pesquisa (evento) com o ID fornecido não encontrada.' }, { status: 404 });
        }

        const novoFormulario = await prisma.formulario.create({
            data: {
                pesquisaId: data.pesquisaId,
                nome: data.nome,
                tipo: data.tipo,
                descricao: data.descricao,
                ativo: data.ativo,
            },
        });

        return NextResponse.json(novoFormulario, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Erro de validação Zod ao criar Formulário:', error.errors);
            return NextResponse.json({ errors: error.errors, message: 'Dados de entrada inválidos.' }, { status: 400 });
        }
        console.error('Erro ao criar Formulário:', error);
        return NextResponse.json({ message: 'Erro interno do servidor ao criar Formulário.' }, { status: 500 });
    }
}

// Handler para listar Formulários 
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pesquisaId = searchParams.get('pesquisaId'); // Permite filtrar por pesquisaId

    try {
        const formularios = await prisma.formulario.findMany({
            where: pesquisaId ? { pesquisaId } : {},
            orderBy: { createdAt: 'desc' },
            include: {
                pesquisa: { // Inclui os dados da Pesquisa para contexto
                    select: { id: true, titulo: true }
                }
            }
        });
        return NextResponse.json(formularios);
    } catch (error) {
        console.error('Erro ao buscar Formulários:', error);
        return NextResponse.json({ message: 'Erro ao buscar Formulários.' }, { status: 500 });
    }
}