import api from './api';

export interface Peca {
  id: number;
  nome: string;
  tipo: 'NACIONAL' | 'IMPORTADA';
  fornecedor: string;
  status: 'EMPRODUCAO' | 'EMTRANSPORTE' | 'PRONTA';
  aeronaveId: string;
}

export interface CreatePecaDTO {
  nome: string;
  tipo: 'NACIONAL' | 'IMPORTADA';
  fornecedor: string;
  status: 'EMPRODUCAO' | 'EMTRANSPORTE' | 'PRONTA';
  aeronaveId: string;
}

export interface UpdatePecaDTO extends Partial<CreatePecaDTO> {}

const pecaService = {
  getAll: async (): Promise<Peca[]> => {
    const response = await api.get('/pecas');
    return response.data;
  },

  getById: async (id: number): Promise<Peca> => {
    const response = await api.get(`/pecas/${id}`);
    return response.data;
  },

  create: async (data: CreatePecaDTO): Promise<Peca> => {
    const response = await api.post('/pecas', data);
    return response.data;
  },

  update: async (id: number, data: UpdatePecaDTO): Promise<Peca> => {
    const response = await api.put(`/pecas/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/pecas/${id}`);
  }
};


export default pecaService;