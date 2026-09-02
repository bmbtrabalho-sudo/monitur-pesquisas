// Tipos para dados que vêm do backend (definição da pesquisa e formulário)
export enum PesquisaTipo {
  EVENTO = 'EVENTO',
  GERAL = 'GERAL',
}

// Enum para o status da pesquisa
export enum PesquisaStatus {
  PLANEJADO = 'PLANEJADO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
}

// Enum para o tipo de formulário
export enum FormularioTipo {
  PARTICIPANTE = 'PARTICIPANTE',
  EXPOSITOR = 'EXPOSITOR',
  ORGANIZADOR = 'ORGANIZADOR',
}

// Enum para o tipo de resposta
export enum TipoResposta {
  TEXTO = 'TEXTO',
  NUMERO = 'NUMERO',
  OPCAO = 'OPCAO', // Para rádio buttons (uma única escolha)
  MULTIPLA = 'MULTIPLA', // Para checkboxes (múltiplas escolhas)
}

export interface BackendPesquisa {
  id: string;
  titulo: string;
  descricao?: string;
  localAplicacao?: string;
  tituloProjeto?: string;

  // Campos específicos de evento/projeto (podem ser nulos se tipo for 'geral')
  objetivoGeral?: string; 
  objetivosEspecificos?: string; 
  justificativa?: string; 
  publicoAlvo?: string;
  metodologia?: string; 
  produtosEsperados?: string; 
  proponente?: string; 
  cnpjProponente?: string; 
  municipio?: string; 
  areaAbrangencia?: string; 
  processoSei?: string; 
  valorTotal?: number; 
  fonteRecurso?: string; 
  elementoDespesa?: string; 
  dataInicio?: string; 
  dataFim?: string; 

  // Campos de status e metadados de auditoria
  status?: PesquisaStatus; // 'planejado' | 'em_andamento' | 'concluido' | 'cancelado'
}

export interface BackendFormulario {
  id: string;
  nome: string;
  tipo: FormularioTipo;
  descricao?: string;
  perguntas: BackendPergunta[]; // Inclui as perguntas do formulário
}

export interface BackendPergunta {
  id: string;
  texto: string;
  tipoResposta: TipoResposta;
  opcoesJson?: { value: string; label: string }[] | string[]; // Exemplo de estrutura para opções
  obrigatoria: boolean;
  ordem?: number;
}

// Tipagem para os dados do formulário que o usuário PREENCHE no frontend
// Isso será um Record dinâmico, pois as chaves são os IDs das perguntas
export type DynamicFormData = Record<number, string | number | string[] | null | undefined>;

// Tipagem para os dados que serão ENVIADOS ao backend para Resposta e RespostaDetalhe
export interface FrontendSubmissionData {
  formularioId: string; // ID do formulário preenchido
  pesquisaId: string;   // ID da pesquisa (evento) a que o formulário pertence
  ip?: string; // Opcional, pode ser coletado no backend
  userAgent?: string; // Opcional, pode ser coletado no backend
  // Detalhes das respostas, mapeados para RespostaDetalhe
  respostasDetalhes: {
    perguntaId: string;
    valorTexto?: string;
    valorNumero?: number;
    valorData?: string; // Ou Date, dependendo do parse
    valorOpcao?: string; // Para rádio ou string concatenada de múltiplos
  }[];
}