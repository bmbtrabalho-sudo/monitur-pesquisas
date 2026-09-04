"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl } from "@/components/ui/form";

type Estado = {
  id: number;
  sigla: string;
  nome: string;
};

type Municipio = {
  id: number;
  nome: string;
};

const IBGE_API = "https://servicodados.ibge.gov.br/api/v1/localidades";

export function LocalidadeSelector({ field }: { field: any }) {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [selectedEstado, setSelectedEstado] = useState("");
  const [isLoadingEstados, setIsLoadingEstados] = useState(true);
  const [isLoadingMunicipios, setIsLoadingMunicipios] = useState(false);

  useEffect(() => {
    fetch(`${IBGE_API}/estados?orderBy=nome`)
      .then((response) => {
        if (!response.ok) throw new Error("Falha ao carregar estados");
        return response.json() as Promise<Estado[]>;
      })
      .then(setEstados)
      .catch(() => setEstados([]))
      .finally(() => setIsLoadingEstados(false));
  }, []);

  useEffect(() => {
    if (!selectedEstado) {
      setMunicipios([]);
      return;
    }

    setIsLoadingMunicipios(true);
    fetch(`${IBGE_API}/estados/${selectedEstado}/municipios?orderBy=nome`)
      .then((response) => {
        if (!response.ok) throw new Error("Falha ao carregar municípios");
        return response.json() as Promise<Municipio[]>;
      })
      .then(setMunicipios)
      .catch(() => setMunicipios([]))
      .finally(() => setIsLoadingMunicipios(false));
  }, [selectedEstado]);

  const alterarEstado = (estadoId: string) => {
    setSelectedEstado(estadoId);
    field.onChange("");
  };

  return (
    <div className="grid grid-cols-1 w-full md:grid-cols-2 gap-4">
      <Select value={selectedEstado} onValueChange={alterarEstado} disabled={isLoadingEstados}>
        <SelectTrigger>
          <SelectValue placeholder={isLoadingEstados ? "Carregando estados..." : "Selecione o Estado"} />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {estados.map((estado) => (
            <SelectItem key={estado.id} value={String(estado.id)}>
              {estado.nome} ({estado.sigla})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <FormControl>
      <Select
        value={field.value ?? ""}
        onValueChange={field.onChange}
        disabled={!selectedEstado || isLoadingMunicipios}
      >
        <SelectTrigger>
          <SelectValue placeholder={isLoadingMunicipios ? "Carregando municípios..." : "Selecione o Município"} />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {municipios.map((municipio) => (
            <SelectItem key={municipio.id} value={municipio.nome}>
              {municipio.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      </FormControl>
    </div>
  );
}