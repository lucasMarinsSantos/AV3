import api from './api';

export interface Relatorio {
id: number;
aeronaveId: string;
nomeCliente: string;
dataEntrega: string;
conteudo: string;
}

export interface CreateRelatorioDTO {
aeronaveId: string;
nomeCliente: string;
dataEntrega: string;
}

const relatorioService = {
getAll: async (): Promise<Relatorio[]> => {
const response = await api.get('/relatorios');
return response.data;
},

getById: async (id: number): Promise<Relatorio> => {
const response = await api.get(`/relatorios/${id}`);
return response.data;
},

create: async (data: CreateRelatorioDTO): Promise<Relatorio> => {
const response = await api.post('/relatorios', data);
return response.data;
}
};

export default relatorioService;