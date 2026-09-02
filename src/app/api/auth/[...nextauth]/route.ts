import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Adaptador da rota do NextAuth. GET e POST sao necessarios para consultar a
// sessao e processar o login com credenciais.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };