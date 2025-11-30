import api from './api';

export interface Funcionario {
  id: number;
  nome: string;
  telefone: string;
  endereco: string;
  usuario: string;
  nivelPermissao: 'ADMINISTRADOR' | 'ENGENHEIRO' | 'OPERADOR';
}

export interface CreateFuncionarioDTO {
  nome: string;
  telefone: string;
  endereco: string;
  usuario: string;
  senha: string;
  nivelPermissao: 'ADMINISTRADOR' | 'ENGENHEIRO' | 'OPERADOR';
}

export interface UpdateFuncionarioDTO {
  nome?: string;
  telefone?: string;
  endereco?: string;
  usuario?: string;
  senha?: string;
  nivelPermissao?: 'ADMINISTRADOR' | 'ENGENHEIRO' | 'OPERADOR';
}

const funcionarioService = {
  getAll: async (): Promise<Funcionario[]> => {
    const response = await (api as any).get('/funcionarios');
    return response.data;
  },

  getById: async (id: number): Promise<Funcionario> => {
    const response = await (api as any).get(`/funcionarios/${id}`);
    return response.data;
  },

  create: async (data: CreateFuncionarioDTO): Promise<Funcionario> => {
    const response = await (api as any).post('/funcionarios', data);
    return response.data;
  },

  update: async (id: number, data: UpdateFuncionarioDTO): Promise<Funcionario> => {
    const response = await (api as any).put(`/funcionarios/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await (api as any).delete(`/funcionarios/${id}`);
  }
};

export default funcionarioService;