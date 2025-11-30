import {
  TipoAeronave,
  TipoPeca,
  StatusPeca,
  StatusEtapa,
  NivelPermissao,
  TipoTeste,
  ResultadoTeste
} from './enums';

export interface Aeronave {
  codigo: string;
  modelo: string;
  tipo: TipoAeronave;
  capacidade: number;
  alcance: number;
  pecas?: Peca[];
  etapas?: Etapa[];
  testes?: Teste[];
  relatorio?: Relatorio;
}

export interface Peca {
  id: number;
  nome: string;
  tipo: TipoPeca;
  fornecedor: string;
  status: StatusPeca;
  aeronaveId: string;
  aeronave?: Aeronave;
}

export interface Etapa {
  id: number;
  nome: string;
  prazo: string;
  status: StatusEtapa;
  aeronaveId: string;
  aeronave?: Aeronave;
  funcionarios?: Funcionario[];
}

export interface Funcionario {
  id: number;
  nome: string;
  telefone: string;
  endereco: string;
  usuario: string;
  senha?: string;
  nivelPermissao: NivelPermissao;
  etapas?: Etapa[];
}

export interface Teste {
  id: number;
  tipo: TipoTeste;
  resultado: ResultadoTeste;
  data: string;
  aeronaveId: string;
  aeronave?: Aeronave;
}

export interface Relatorio {
  id: number;
  aeronaveId: string;
  nomeCliente: string;
  dataEntrega: string;
  conteudo: string;
  aeronave?: Aeronave;
}

export interface Metrica {
  id: number;
  rota: string;
  metodo: string;
  latencia: number;
  tempoProcessamento: number;
  tempoResposta: number;
  timestamp: string;
  usuarios: number;
}
