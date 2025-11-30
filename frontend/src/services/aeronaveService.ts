import api from './api';
import { Aeronave } from '../types';

export interface CreateAeronaveDTO {
  codigo: string;
  modelo: string;
  tipo: 'COMERCIAL' | 'MILITAR';
  capacidade: number;
  alcance: number;
}

export interface UpdateAeronaveDTO extends Partial<CreateAeronaveDTO> {}

const aeronaveService = {
  getAll: async (): Promise<Aeronave[]> => {
    const response = await api.get('/aeronaves');
    return response.data;
  },

  getById: async (codigo: string): Promise<Aeronave> => {
    const response = await api.get(`/aeronaves/${codigo}`);
    return response.data;
  },

  create: async (data: CreateAeronaveDTO): Promise<Aeronave> => {
    const response = await api.post('/aeronaves', data);
    return response.data;
  },

  update: async (codigo: string, data: UpdateAeronaveDTO): Promise<Aeronave> => {
    const response = await api.put(`/aeronaves/${codigo}`, data);
    return response.data;
  },

  delete: async (codigo: string): Promise<void> => {
    await api.delete(`/aeronaves/${codigo}`);
  }
};

export default aeronaveService;