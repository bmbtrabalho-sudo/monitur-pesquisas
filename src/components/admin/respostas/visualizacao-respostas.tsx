"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PerguntaInfo {
  texto: string;
  tipoResposta: string;
}
interface DetalheResposta {
  valorTexto: string | null;
  valorNumero: number | null;
  valorOpcao: string | null;
  pergunta: PerguntaInfo;
}
interface RespostaCompleta {
  id: string;
  dataResposta: string;
  detalhes: DetalheResposta[];
}

interface VisualizacaoDeRespostasProps {
  respostasIniciais: RespostaCompleta[];
}


const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#ff4d4d",
  "#AF19FF",
];

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent * 100 < 5) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function VisualizacaoDeRespostas({
  respostasIniciais,
}: VisualizacaoDeRespostasProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dadosAgregados = useMemo(() => {
    if (!respostasIniciais || respostasIniciais.length === 0) return [];

    const agregador: { [perguntaTexto: string]: any } = {};

    respostasIniciais.forEach((resposta) => {
      resposta.detalhes.forEach((detalhe) => {
        const { pergunta, valorTexto, valorNumero, valorOpcao } = detalhe;
        if (!agregador[pergunta.texto]) {
          agregador[pergunta.texto] = {
            tipo: pergunta.tipoResposta,
            respostas: [],
          };
        }
        const valor = valorTexto ?? valorNumero ?? valorOpcao;
        if (valor !== null) {
          agregador[pergunta.texto].respostas.push(valor);
        }
      });
    });

    return Object.entries(agregador).map(([perguntaTexto, dados]) => {
      if (dados.tipo === "LOCALIDADE_MUNICIPIO") {
        const contagem = dados.respostas.reduce(
          (acc: { [key: string]: number }, municipio: string) => {
            acc[municipio] = (acc[municipio] || 0) + 1;
            return acc;
          },
          {}
        );
        const dataForChart = Object.entries(contagem)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => Number(b.value) - Number(a.value));
        return {
          pergunta: perguntaTexto,
          tipo: "grafico_localidade",
          data: dataForChart,
        };
      } else if (dados.tipo === "GRADE_MULTIPLA_ESCOLHA") {
        const contagem: { [linha: string]: { [coluna: string]: number } } = {};
        let todasColunas = new Set<string>();

        dados.respostas.forEach((respostaJson: string) => {
          try {
            const respostaObjeto = JSON.parse(respostaJson);
            Object.entries(respostaObjeto).forEach(
              ([linha, coluna]: [string, any]) => {
                if (!contagem[linha]) contagem[linha] = {};
                contagem[linha][coluna] = (contagem[linha][coluna] || 0) + 1;
                todasColunas.add(coluna);
              }
            );
          } catch (e) {
            console.error(
              "Erro ao parsear JSON da resposta da grade:",
              respostaJson
            );
          }
        });

        const dataForChart = Object.entries(contagem).map(
          ([linha, colunas]) => ({
            name: linha, // O 'name' será o segmento (Alimentação, etc.)
            ...colunas,
          })
        );

        return {
          pergunta: perguntaTexto,
          tipo: "grafico_barras_agrupadas",
          data: dataForChart,
          colunas: Array.from(todasColunas), // Passa os nomes das colunas para renderizar as barras
        };
      } else if (dados.tipo === "OPCAO" || dados.tipo === "MULTIPLA") {
        const contagem = dados.respostas.reduce(
          (acc: { [key: string]: number }, val: string) => {
            val.split(", ").forEach((opt) => {
              acc[opt] = (acc[opt] || 0) + 1;
            });
            return acc;
          },
          {}
        );
        const dataForChart = Object.entries(contagem).map(([name, value]) => ({
          name,
          value,
        }));
        const isBinaryChoice =
          dataForChart.length <= 3 &&
          dataForChart.some((d) =>
            ["sim", "não", "nao"].includes(d.name.toLowerCase())
          );
        const tipoGrafico =
          dataForChart.length >= 4 || !isBinaryChoice
            ? "grafico_pizza"
            : "grafico_barra";
        return {
          pergunta: perguntaTexto,
          tipo: tipoGrafico,
          data: dataForChart,
        };
      } else if (dados.tipo === "ESCALA" || dados.tipo === "NUMERO") {
        const numeros = dados.respostas.filter(
          (n: any) => typeof n === "number"
        );
        const media =
          numeros.reduce((a: number, b: number) => a + b, 0) /
          (numeros.length || 1);
        return {
          pergunta: perguntaTexto,
          tipo: "estatistica",
          data: { titulo: "Média", valor: media.toFixed(2) },
        };
      } else {
        return {
          pergunta: perguntaTexto,
          tipo: "texto",
          data: dados.respostas,
        };
      }
    });
  }, [respostasIniciais]);

  const totalRespostas = respostasIniciais.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Resultados da Pesquisa</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total de Respostas Recebidas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{totalRespostas}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {dadosAgregados.map((item, index) => (
          <Card key={index} className="flex flex-col border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {item.pergunta}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center p-0">
              {item.tipo === "grafico_localidade" && isMounted && (
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(300, item.data.length * 40)}
                >
                  <BarChart
                    layout="horizontal"
                    data={item.data}
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    
                    <XAxis type="category"
                      dataKey="name"
                      width={150}
                      fontSize={12} />

                    <YAxis
                      type="number"
                      allowDecimals={false}
                    />
                    
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid #ccc",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" name="Quantidade por municipio" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {item.tipo === "grafico_barras_agrupadas" && isMounted && (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={item.data}
                    margin={{ top: 5, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid #ccc",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Legend />
                    {/* Cria uma <Bar> para cada coluna (faixa de gasto) */}
                    {item.colunas &&
                      item.colunas.map((coluna: string, idx: number) => (
                        <Bar
                          key={coluna}
                          dataKey={coluna}
                          fill={COLORS[idx % COLORS.length]}
                        />
                      ))}
                  </BarChart>
                </ResponsiveContainer>
              )}

              {item.tipo === "grafico_barra" && isMounted && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={item.data}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      fontSize={12}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid #ccc",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Bar dataKey="value" name="Contagem">
                      {item.data.map((entry: any, idx: number) => {
                        const nameLower = entry.name.toLowerCase();
                        let color = "#3b82f6"; // Azul
                        if (nameLower === "sim") color = "#22c55e"; // Verde
                        if (nameLower === "não" || nameLower === "nao")
                          color = "#ef4444"; // Vermelho
                        return <Cell key={`cell-${idx}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              {item.tipo === "grafico_pizza" && isMounted && (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={item.data}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      labelLine={false}
                      label={renderCustomizedLabel}
                    >
                      {item.data.map((entry: any, idx: number) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={COLORS[idx % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid #ccc",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}

              {item.tipo === "estatistica" && (
                <p className="text-4xl font-bold">
                  {item.data.valor}{" "}
                  <span className="text-xl text-muted-foreground">
                    ({item.data.titulo})
                  </span>
                </p>
              )}

              {item.tipo === "texto" && (
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  <ul className="space-y-3">
                    {item.data.map((texto: string, i: number) => (
                      <li
                        key={i}
                        className="text-sm border-b pb-2 italic text-gray-700"
                      >
                        "{texto}"
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
