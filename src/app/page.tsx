'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface LoginFormData {
    email: string;
    password: string;
}

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const form = useForm<LoginFormData>({
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const { isSubmitting } = form.formState;

    const handleLogin = async (data: LoginFormData) => {
        setError(null);
        try {
            const res = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (res?.error) {
                setError("Email ou senha inválidos.");
                return;
            }

            router.replace("/dashboard");

        } catch (error) {
            console.error("Erro inesperado ao fazer login:", error);
            setError("Ocorreu um erro. Tente novamente.");
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                <Image
                    className="mx-auto mb-4"
                    src={"/brasao_ro.svg"}
                    width={110}
                    height={110}
                    alt="Brasão do Estado de Rondônia"
                />
                <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
                <form onSubmit={form.handleSubmit(handleLogin)}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2" htmlFor="email">E-mail</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            required
                            {...form.register("email")}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2" htmlFor="password">Senha</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            required
                            {...form.register("password")}
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Entrando..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    )
}