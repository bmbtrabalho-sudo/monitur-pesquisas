import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster, toast } from 'sonner'
import AuthProvider from "@/components/auth-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

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
        className={`${inter.className} antialiased`}
      >
        <Toaster />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
