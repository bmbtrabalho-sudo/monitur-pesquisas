'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMemo } from "react";

interface RespostasChartProps {
  respostas: { dataResposta: Date }[];
}

export function RespostasChart({ respostas }: RespostasChartProps) {
  // Processa os dados para agrupar as respostas por dia
  const data = useMemo(() => {
    const contagemPorDia: { [key: string]: number } = {};
    const hoje = new Date();
    
    // Inicializa os últimos 7 dias com 0 respostas
    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() - i);
      const diaFormatado = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      contagemPorDia[diaFormatado] = 0;
    }
    
    // Preenche com as respostas reais
    respostas.forEach(r => {
      const dia = new Date(r.dataResposta).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (dia in contagemPorDia) {
        contagemPorDia[dia]++;
      }
    });

    return Object.entries(contagemPorDia).map(([name, total]) => ({ name, total }));
  }, [respostas]);

  return (
    <Card className="border border-zinc-300 shadow-xl shadow-zinc-400">
      <CardHeader>
        <CardTitle>Respostas na Última Semana</CardTitle>
        <CardDescription>
          Volume de respostas recebidas nos últimos 7 dias.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-0">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={true} axisLine={true} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={true} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "white", border: "1px solid #ccc", borderRadius: "0.5rem" }}
              labelStyle={{ color: "black" }}
            />
            <Bar dataKey="total" fill="#3b82f6" barSize={40} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}