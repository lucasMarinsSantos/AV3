import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export default function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/Login');
  };

  return <button onClick={handleLogout}>Logout</button>;
}