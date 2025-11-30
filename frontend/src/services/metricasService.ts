import api from './api';

export interface Estatistica {
  status: string;
  count: number;
}

export interface PontoMetrica {
  usuarios: number;
  valorMs: number;
}

export interface MetricasTempos {
  latencia: PontoMetrica[];
  tempoResposta: PontoMetrica[];
  tempoProcessamento: PontoMetrica[];
}

const metricasService = {
  getAll: async () => {
    const response = await api.get('/metricas');
    return response.data;
  },

  getByRota: async (rota: string) => {
    const response = await api.get(`/metricas/rota/${rota}`);
    return response.data;
  },

  getStats: async (): Promise<Estatistica[]> => {
    const response = await api.get('/metricas/stats');
    return response.data;
  },

  getTimes: async (): Promise<MetricasTempos> => {
    const response = await api.get('/metricas/times');
    return response.data;
  }
};

export default metricasService;
