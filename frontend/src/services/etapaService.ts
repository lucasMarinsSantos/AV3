import api from './api';

export interface Etapa {
  id: number;
  nome: string;
  prazo: string;
  status: 'PENDENTE' | 'ANDAMENTO' | 'CONCLUIDA';
  aeronaveId: string;
  funcionarios?: Funcionario[];
}

export interface Funcionario {
  id: number;
  nome: string;
  telefone: string;
  endereco: string;
  usuario: string;
  nivelPermissao: 'ADMINISTRADOR' | 'ENGENHEIRO' | 'OPERADOR';
}

export interface CreateEtapaDTO {
  nome: string;
  prazo: string;
  status: 'PENDENTE' | 'ANDAMENTO' | 'CONCLUIDA';
  aeronaveId: string;
}

export interface UpdateEtapaDTO extends Partial<CreateEtapaDTO> {}

export interface AddFuncionarioDTO {
  funcionarioId: number;
}

const etapaService = {
  getAll: async (): Promise<Etapa[]> => {
    const response = await api.get('/etapas');
    return response.data;
  },

  getById: async (id: number): Promise<Etapa> => {
    const response = await api.get(`/etapas/${id}`);
    return response.data;
  },

  create: async (data: CreateEtapaDTO): Promise<Etapa> => {
    const response = await api.post('/etapas', data);
    return response.data;
  },

  update: async (id: number, data: UpdateEtapaDTO): Promise<Etapa> => {
    const response = await api.put(`/etapas/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/etapas/${id}`);
  },

  addFuncionario: async (id: number, data: AddFuncionarioDTO): Promise<Etapa> => {
    const response = await api.post(`/etapas/${id}/funcionarios`, data);
    return response.data;
  }
};

export default etapaService;