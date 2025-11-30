import api from './api';

export interface LoginDTO {
  usuario: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  funcionario: {
    id: number;
    nome: string;
    usuario: string;
    nivelPermissao: 'ADMINISTRADOR' | 'ENGENHEIRO' | 'OPERADOR';
  };
}

const authService = {
  login: async (credentials: LoginDTO): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    const { token, funcionario } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(funcionario));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: (): boolean => {
    return !!authService.getToken();
  }
};

export default authService;
