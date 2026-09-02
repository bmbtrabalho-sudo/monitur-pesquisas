'use client';

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl } from "@/components/ui/form";

interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

interface Municipio {
  id: number;
  nome: string;
}

export function LocalidadeSelector({ field }: { field: any }) {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [selectedEstado, setSelectedEstado] = useState('');
  const [isLoadingMunicipios, setIsLoadingMunicipios] = useState(false);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
        const data = await response.json();
        setEstados(data);
      } catch (error) {
        console.error("Falha ao buscar estados do IBGE:", error);
      }
    };
    fetchEstados();
  }, []);

  useEffect(() => {
    if (!selectedEstado) {
      setMunicipios([]);
      return;
    }
    const fetchMunicipios = async () => {
      setIsLoadingMunicipios(true);
      try {
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedEstado}/municipios`);
        const data = await response.json();
        setMunicipios(data);
      } catch (error) {
        console.error("Falha ao buscar municípios do IBGE:", error);
      } finally {
        setIsLoadingMunicipios(false);
      }
    };
    fetchMunicipios();
  }, [selectedEstado]);
  
  return (
    <div className="grid grid-cols-1 w-full md:grid-cols-2 gap-4">
      {/* Seletor de Estados */}
      <Select onValueChange={setSelectedEstado}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o Estado" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {estados.map(estado => (
            <SelectItem key={estado.id} value={estado.sigla}>
              {estado.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Seletor de Municípios */}
      <Select 
        onValueChange={field.onChange} // Atualiza o estado do react-hook-form
        defaultValue={field.value}
        disabled={!selectedEstado || isLoadingMunicipios}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder={isLoadingMunicipios ? "Carregando..." : "Selecione o Município"} />
          </SelectTrigger>
        </FormControl>
        <SelectContent className="bg-white">
          {municipios.map(municipio => (
            <SelectItem key={municipio.id} value={municipio.nome}>
              {municipio.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}