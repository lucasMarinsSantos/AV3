import { NavLink } from 'react-router-dom';
import authService from '../services/authService';

export default function Sidebar() {
  if (!authService.isAuthenticated()) return null;

  const linkStyle: React.CSSProperties = {
    display: 'block',
    padding: '10px 16px',
    textDecoration: 'none',
    color: '#ffffff',
    fontSize: '0.95rem',
    borderRadius: 8,
    margin: '4px 8px'
  };

  const activeStyle: React.CSSProperties = {
    fontWeight: 600,
    backgroundColor: 'rgba(15, 23, 42, 0.18)'
  };

  return (
    <nav
      style={{
        padding: '16px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}
    >
      <NavLink
        to="/dashboard"
        style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
      >
        Dashboard
      </NavLink>
      <NavLink
        to="/aeronaves"
        style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
      >
        Aeronaves
      </NavLink>
      <NavLink
        to="/pecas"
        style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
      >
        Peças
      </NavLink>
      <NavLink
        to="/etapas"
        style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
      >
        Etapas
      </NavLink>
      <NavLink
        to="/testes"
        style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
      >
        Testes
      </NavLink>
      <NavLink
        to="/funcionarios"
        style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
      >
        Funcionários
      </NavLink>
      <NavLink
        to="/relatorios"
        style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
      >
        Relatórios
      </NavLink>
      <NavLink
        to="/metricas"
        style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
      >
        Métricas
      </NavLink>
    </nav>
  );
}