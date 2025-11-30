import Logout from './Logout';
import authService from '../services/authService';

export default function Header() {
  if (!authService.isAuthenticated()) return null;

  return (
    <header
      style={{
        padding: '14px 24px',
        backgroundColor: '#0a4fb0',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.2)',
        position: 'relative',
        zIndex: 10
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: '1.25rem',
          fontWeight: 600,
          letterSpacing: '0.03em',
          color: '#ffffff'
        }}
      >
          ~~ SISTEMA AERO ~~
      </h1>
      <Logout />
    </header>
  );
}
