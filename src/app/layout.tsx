import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'sonner'
import AuthProvider from "@/components/auth-provider";

// Define os metadados padrao compartilhados por todas as paginas da aplicacao.
export const metadata: Metadata = {
  title: "SETUR - Pesquisas",
  description: "SETUR Pesquisas",
};

// Layout raiz: mantem os providers globais montados durante a navegacao.
// O SessionProvider fica aqui para que componentes clientes possam consultar a sessao.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className="antialiased"
      >
        <Toaster />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
