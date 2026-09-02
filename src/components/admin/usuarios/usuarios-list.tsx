'use client';

import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import CriarUsuariosModal from "./criar-usuarios-modal";
import { TabelaUsuarios } from "./tabela-usuarios";

type SafeUser = Omit<User, 'password' | 'emailVerified'>;

interface UsuariosListProps {
  usuariosIniciais: SafeUser[];
}

export default function UsuariosList({ usuariosIniciais }: UsuariosListProps) {
  // O estado é inicializado com os dados vindos do servidor
  const [users, setUsers] = useState(usuariosIniciais || []);
  const [isLoading, setIsLoading] = useState(false);

  // Esta função agora serve apenas para RECARREGAR os dados após uma ação
  const refetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/usuarios');
      if (!response.ok) throw new Error('Erro ao buscar usuários');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Falha ao recarregar usuários", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Este useEffect garante que se a prop mudar, o estado é atualizado
  useEffect(() => {
    setUsers(usuariosIniciais || []);
  }, [usuariosIniciais]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between items-center sm:flex-row">
        <h1 className="text-lg font-bold">Gerenciamento de Usuários</h1>
        <CriarUsuariosModal onUserCreated={refetchUsers} />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Atualizando tabela...</p>}
      
      {/* O componente da tabela só recebe os dados e a função de recarga */}
      <TabelaUsuarios
        users={users} 
        onUserListChange={refetchUsers} 
      />
    </div>
  );
}