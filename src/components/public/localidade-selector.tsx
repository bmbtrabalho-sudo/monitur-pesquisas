"use client";

import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl } from "@/components/ui/form";
import { allStates } from "brazilian-cities";

type Estado = {
  cod: string;
  label: string;
  cities: { label: string }[];
};

const ESTADOS = allStates() as unknown as Estado[];

export function LocalidadeSelector({ field }: { field: any }) {
  const [selectedEstado, setSelectedEstado] = useState("");
  const municipios = useMemo(
    () => ESTADOS.find((estado) => estado.cod === selectedEstado)?.cities ?? [],
    [selectedEstado]
  );
  const estadoSelecionado = ESTADOS.find((estado) => estado.cod === selectedEstado);

  const alterarEstado = (estado: string) => {
    setSelectedEstado(estado);
    field.onChange("");
  };

  return (
    <div className="grid grid-cols-1 w-full md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <span className="text-sm font-medium">Estado de origem</span>
        <Select value={selectedEstado} onValueChange={alterarEstado}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o estado" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {ESTADOS.map((estado) => (
            <SelectItem key={estado.cod} value={estado.cod}>
              {estado.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium">Município de origem</span>
        <FormControl>
          <Select
            value={field.value ?? ""}
            onValueChange={field.onChange}
            disabled={!selectedEstado}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o município" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {municipios.map((municipio) => (
                <SelectItem
                  key={municipio.label}
                  value={`${municipio.label} - ${estadoSelecionado?.label ?? ""}`}
                >
                  {municipio.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormControl>
      </div>
    </div>
  );
}