'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

// Disponibiliza a sessao do NextAuth para componentes clientes.
// A validacao de acesso no servidor continua sendo feita com getServerSession.
export default function AuthProvider({ children }: Props) {
  return <SessionProvider>{children}</SessionProvider>;
}