import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Aeronaves from './pages/Aeronaves';
import Pecas from './pages/Pecas';
import Etapas from './pages/Etapas';
import Testes from './pages/Testes';
import Funcionarios from './pages/Funcionarios';
import Relatorios from './pages/Relatorios';
import Metricas from './pages/Metricas';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname.toLowerCase().startsWith('/login');

  if (isLoginPage) {
    return <Login />;
  }

  return (
    <div className="app-root">
      <Header />

      <div className="app-layout">
        <aside className="app-sidebar">
          <Sidebar />
        </aside>

        <main className="app-main">
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/aeronaves"
              element={
                <ProtectedRoute>
                  <Aeronaves />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pecas"
              element={
                <ProtectedRoute>
                  <Pecas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/etapas"
              element={
                <ProtectedRoute>
                  <Etapas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/testes"
              element={
                <ProtectedRoute>
                  <Testes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/funcionarios"
              element={
                <ProtectedRoute>
                  <Funcionarios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/relatorios"
              element={
                <ProtectedRoute>
                  <Relatorios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/metricas"
              element={
                <ProtectedRoute>
                  <Metricas />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;