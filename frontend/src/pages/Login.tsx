import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      await authService.login({ usuario, senha });
      navigate('/dashboard');
    } catch {
      setError('Usuário ou senha inválidos');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background:
          'radial-gradient(circle at 10% 0%, rgba(56,189,248,0.18), transparent 55%), radial-gradient(circle at 80% 120%, rgba(37,99,235,0.45), #020617)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: '#ffffff',
          borderRadius: 16,
          padding: '32px 28px',
          boxShadow: '0 24px 55px rgba(15,23,42,0.7)',
          border: '1px solid rgba(15,23,42,0.35)'
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              margin: 0,
              fontSize: '1.4rem',
              fontWeight: 600,
              color: '#0b63ce',
              letterSpacing: '0.03em',
              textTransform: 'uppercase'
            }}
          >
            Aerocode Sistema
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: '0.9rem',
              color: '#4b5563'
            }}
          >
            Acesse o painel de gestão de produção aeronáutica.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label htmlFor="usuario">Usuário</label>
            <input
              id="usuario"
              type="text"
              placeholder="Digite seu usuário"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {error && (
            <div
              style={{
                marginTop: 4,
                padding: '8px 10px',
                borderRadius: 8,
                backgroundColor: 'rgba(220,38,38,0.06)',
                border: '1px solid rgba(220,38,38,0.4)',
                color: '#b91c1c',
                fontSize: '0.88rem'
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              marginTop: 10,
              width: '100%',
              padding: '10px 0',
              borderRadius: 999,
              fontSize: '0.98rem'
            }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}