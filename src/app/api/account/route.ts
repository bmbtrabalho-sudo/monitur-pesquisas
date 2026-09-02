import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import bcrypt from "bcrypt";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Formato de email inválido."),
  currentPassword: z.string().optional(),
  password: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres.").optional().or(z.literal("")),
  confirmPassword: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
}).refine((data) => !data.password || data.currentPassword, {
  message: "Informe a senha atual para definir uma nova senha.",
  path: ["currentPassword"],
});

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user;
}

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ message: "Usuário não encontrado." }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const data = profileSchema.parse(await request.json());
    const existingUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
    });

    if (!existingUser) {
      return NextResponse.json({ message: "Usuário não encontrado." }, { status: 404 });
    }

    if (data.email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailInUse && emailInUse.id !== existingUser.id) {
        return NextResponse.json({ message: "Este e-mail já está em uso." }, { status: 409 });
      }
    }

    if (data.password) {
      if (!existingUser.password || !data.currentPassword || !(await bcrypt.compare(data.currentPassword, existingUser.password))) {
        return NextResponse.json({ message: "A senha atual está incorreta." }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: data.name,
        email: data.email,
        ...(data.password ? { password: await bcrypt.hash(data.password, 10) } : {}),
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Dados inválidos", issues: error.issues }, { status: 400 });
    }
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}
