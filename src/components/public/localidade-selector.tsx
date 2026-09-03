'use client';

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl } from "@/components/ui/form";
import { MUNICIPIOS_RONDONIA } from "@/lib/pesquisa-options";

interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

const ESTADO_RONDONIA: Estado = { id: 11, sigla: "RO", nome: "Rondônia" };

export function LocalidadeSelector({ field }: { field: any }) {
  const [selectedEstado, setSelectedEstado] = useState(ESTADO_RONDONIA.sigla);
  
  return (
    <div className="grid grid-cols-1 w-full md:grid-cols-2 gap-4">
      <Select value={selectedEstado} onValueChange={setSelectedEstado}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o Estado" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value={ESTADO_RONDONIA.sigla}>{ESTADO_RONDONIA.nome}</SelectItem>
        </SelectContent>
      </Select>

      <FormControl>
      <Select
        value={field.value ?? ""}
        onValueChange={field.onChange}
        disabled={!selectedEstado}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione o Município" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {MUNICIPIOS_RONDONIA.map((municipio) => (
            <SelectItem key={municipio} value={municipio}>{municipio}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      </FormControl>
    </div>
  );
}