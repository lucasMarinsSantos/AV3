import api from './api';

export interface Teste {
  id: number;
  tipo: 'ELETRICO' | 'HIDRAULICO' | 'AERODINAMICO';
  resultado: 'APROVADO' | 'REPROVADO';
  aeronaveId: string;
  data: string;
}

export interface CreateTesteDTO {
  tipo: 'ELETRICO' | 'HIDRAULICO' | 'AERODINAMICO';
  resultado: 'APROVADO' | 'REPROVADO';
  aeronaveId: string;
  data: string;
}

export interface UpdateTesteDTO extends Partial<CreateTesteDTO> {}

const testeService = {
  getAll: async (): Promise<Teste[]> => {
    const response = await api.get('/testes');
    return response.data;
  },

  getById: async (id: number): Promise<Teste> => {
    const response = await api.get(`/testes/${id}`);
    return response.data;
  },

  create: async (data: CreateTesteDTO): Promise<Teste> => {
    const response = await api.post('/testes', data);
    return response.data;
  },

  update: async (id: number, data: UpdateTesteDTO): Promise<Teste> => {
    const response = await api.put(`/testes/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/testes/${id}`);
  }
};

export default testeService;