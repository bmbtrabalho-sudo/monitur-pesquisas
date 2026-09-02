// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from 'bcrypt';
import { UserRole } from "@prisma/client";

// Schema Zod para validar os dados de entrada do novo usuário
const createUserSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Formato de email inválido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  confirmPassword: z.string().min(6, "A confirmação de senha deve ter pelo menos 6 caracteres."),
  role: z.nativeEnum(UserRole).default(UserRole.USER), // Define USER como padrão
}).
refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"], 
});

export async function POST(request: NextRequest) {
  // Proteger o endpoint: Apenas admins podem criar usuários
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const json = await request.json();
    
    // Validar os dados de entrada com Zod
    const data = createUserSchema.parse(json);

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Já existe um usuário com este e-mail.' },
        { status: 409 } // 409 Conflict
      );
    }

    // Criptografar a senha 
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Criar o usuário no banco de dados
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      }
    });

    // Retornar o usuário criado
    const { password, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 }); // 201 Created

  } catch (error) {
    // Tratamento de erros de validação do Zod e outros erros
    if (error instanceof z.ZodError) {
      return NextResponse.json({error: "Dados de entrada inválidos" ,  issues: error.issues }, { status: 400 });
    }
    
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
    // Proteger o endpoint: Apenas admins podem listar usuários
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    try {
        // Buscar todos os usuários, excluindo a senha
        const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
        });
    
        return NextResponse.json(users, { status: 200 }); // 200 OK
    
    } catch (error) {
        console.error("Erro ao listar usuários:", error);
        return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
    }

}