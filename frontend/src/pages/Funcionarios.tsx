import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import funcionarioService, {
  Funcionario,
  CreateFuncionarioDTO
} from '../services/funcionarioService';

type FiltroNivel = 'todos' | 'ADMINISTRADOR' | 'ENGENHEIRO' | 'OPERADOR';

const ITENS_POR_PAGINA = 8;

function formatNivelLabel(nivel: 'ADMINISTRADOR' | 'ENGENHEIRO' | 'OPERADOR') {
  if (nivel === 'ADMINISTRADOR') return 'Administrador';
  if (nivel === 'ENGENHEIRO') return 'Engenheiro';
  return 'Operador';
}

function getNivelStyle(nivel: 'ADMINISTRADOR' | 'ENGENHEIRO' | 'OPERADOR') {
  if (nivel === 'ADMINISTRADOR') {
    return {
      color: '#b45309',
      backgroundColor: 'rgba(251,191,36,0.1)',
      borderColor: '#b4530920'
    };
  }
  if (nivel === 'ENGENHEIRO') {
    return {
      color: '#1d4ed8',
      backgroundColor: 'rgba(59,130,246,0.08)',
      borderColor: '#1d4ed820'
    };
  }
  return {
    color: '#16a34a',
    backgroundColor: 'rgba(22,163,74,0.08)',
    borderColor: '#16a34a20'
  };
}

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [filtroNivel, setFiltroNivel] = useState<FiltroNivel>('todos');
  const [formData, setFormData] = useState<CreateFuncionarioDTO>({
    nome: '',
    telefone: '',
    endereco: '',
    usuario: '',
    senha: '',
    nivelPermissao: 'OPERADOR'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadFuncionarios();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtroNivel, searchTerm]);

  const loadFuncionarios = async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await funcionarioService.getAll();
      setFuncionarios(data);
    } catch {
      setErro('Não foi possível carregar os funcionários no momento.');
    } finally {
      setLoading(false);
    }
  };

  const parseApiError = (err: any): string => {
    const resp = err?.response;
    if (!resp) return 'Não foi possível salvar o funcionário. Verifique os dados e tente novamente.';
    
    if (Array.isArray(resp.data?.errors)) {
      const msgs = resp.data.errors
        .map((e: any) => e?.msg)
        .filter(Boolean);
      if (msgs.length) return msgs.join(' -  ');
    }
    if (typeof resp.data?.error === 'string') {
      return resp.data.error;
    }
    return 'Não foi possível salvar o funcionário. Verifique os dados e tente novamente.';
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    try {
      if (editingId) {
        await funcionarioService.update(editingId, formData);
      } else {
        await funcionarioService.create(formData);
      }
      resetForm();
      setShowModal(false);
      loadFuncionarios();
    } catch (err) {
      setErro(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (funcionario: Funcionario) => {
    setEditingId(funcionario.id);
    setFormData({
      nome: funcionario.nome,
      telefone: funcionario.telefone,
      endereco: funcionario.endereco,
      usuario: funcionario.usuario,
      senha: '',
      nivelPermissao: funcionario.nivelPermissao
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir este funcionário?')) return;
    setLoading(true);
    setErro(null);
    try {
      await funcionarioService.delete(id);
      loadFuncionarios();
    } catch {
      setErro('Não foi possível excluir o funcionário.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof CreateFuncionarioDTO
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      nome: '',
      telefone: '',
      endereco: '',
      usuario: '',
      senha: '',
      nivelPermissao: 'OPERADOR'
    });
  };

  const total = funcionarios.length;
  const totalAdmins = funcionarios.filter(
    (f) => f.nivelPermissao === 'ADMINISTRADOR'
  ).length;
  const totalEngenheiros = funcionarios.filter(
    (f) => f.nivelPermissao === 'ENGENHEIRO'
  ).length;
  const totalOperadores = funcionarios.filter(
    (f) => f.nivelPermissao === 'OPERADOR'
  ).length;

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const funcionariosFiltrados = funcionarios.filter((f) => {
    if (filtroNivel !== 'todos' && f.nivelPermissao !== filtroNivel) return false;

    if (normalizedSearch) {
      const nomeMatch = f.nome.toLowerCase().includes(normalizedSearch);
      const telefoneMatch = f.telefone.toLowerCase().includes(normalizedSearch);
      const enderecoMatch = f.endereco.toLowerCase().includes(normalizedSearch);
      const usuarioMatch = f.usuario.toLowerCase().includes(normalizedSearch);
      const idMatch = String(f.id).includes(normalizedSearch);
      return (
        nomeMatch || telefoneMatch || enderecoMatch || usuarioMatch || idMatch
      );
    }

    return true;
  });

  const totalFiltrados = funcionariosFiltrados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalFiltrados / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(currentPage, totalPaginas);
  const startIndex = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const endIndex = startIndex + ITENS_POR_PAGINA;
  const funcionariosPaginados = funcionariosFiltrados.slice(startIndex, endIndex);

  return (
    <div
      style={{
        paddingTop: 8,
        paddingBottom: 24
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 18
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            flexWrap: 'wrap'
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '1.7rem',
                fontWeight: 700
              }}
            >
              Funcionários
            </h1>
            <p
              style={{
                margin: 0,
                marginTop: 4,
                fontSize: '0.95rem',
                color: '#4b5563'
              }}
            >
              Equipe responsável pelas etapas de produção e testes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              fontSize: '0.9rem'
            }}
          >
            Novo funcionário
          </button>
        </header>

        {erro && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              backgroundColor: 'rgba(220,38,38,0.06)',
              border: '1px solid rgba(220,38,38,0.55)',
              color: '#b91c1c',
              fontSize: '0.9rem'
            }}
          >
            {erro}
          </div>
        )}

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 12
          }}
        >
          <div
            style={{
              borderRadius: 14,
              backgroundColor: '#ffffff',
              padding: '12px 16px',
              border: '1px solid rgba(37,99,235,0.35)',
              boxShadow: '0 6px 18px rgba(15,23,42,0.05)'
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: '#1d4ed8'
              }}
            >
              Funcionários cadastrados
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: '1.6rem',
                fontWeight: 700,
                color: '#111827'
              }}
            >
              {total}
            </div>
          </div>

          <div
            style={{
              borderRadius: 14,
              backgroundColor: '#fefce8',
              padding: '12px 16px',
              border: '1px solid rgba(234,179,8,0.5)'
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: '#854d0e'
              }}
            >
              Administradores
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: '1.4rem',
                fontWeight: 600,
                color: '#854d0e'
              }}
            >
              {totalAdmins}
            </div>
          </div>

          <div
            style={{
              borderRadius: 14,
              backgroundColor: '#eff6ff',
              padding: '12px 16px',
              border: '1px solid rgba(59,130,246,0.5)'
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: '#1d4ed8'
              }}
            >
              Engenheiros
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: '1.4rem',
                fontWeight: 600,
                color: '#1d4ed8'
              }}
            >
              {totalEngenheiros}
            </div>
          </div>

          <div
            style={{
              borderRadius: 14,
              backgroundColor: '#ecfdf3',
              padding: '12px 16px',
              border: '1px solid rgba(22,163,74,0.4)'
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: '#166534'
              }}
            >
              Operadores
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: '1.4rem',
                fontWeight: 600,
                color: '#166534'
              }}
            >
              {totalOperadores}
            </div>
          </div>
        </section>

        <section
          style={{
            borderRadius: 14,
            border: '1px solid rgba(15,23,42,0.12)',
            backgroundColor: '#ffffff',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            boxShadow: '0 10px 28px rgba(15,23,42,0.06)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: 12,
              flexWrap: 'wrap'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                maxWidth: 320
              }}
            >
              <label
                htmlFor="buscaFuncionarios"
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: '#4b5563'
                }}
              >
                Buscar
              </label>
              <input
                id="buscaFuncionarios"
                type="text"
                placeholder="Nome, usuário, telefone ou ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  fontSize: '0.85rem',
                  padding: '6px 10px'
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}
            >
              <label
                htmlFor="filtroNivel"
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: '#4b5563'
                }}
              >
                Filtrar por nível
              </label>
              <select
                id="filtroNivel"
                value={filtroNivel}
                onChange={(e) => setFiltroNivel(e.target.value as FiltroNivel)}
                style={{
                  minWidth: 200
                }}
              >
                <option value="todos">Todos</option>
                <option value="ADMINISTRADOR">Administrador</option>
                <option value="ENGENHEIRO">Engenheiro</option>
                <option value="OPERADOR">Operador</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p
              style={{
                margin: 0,
                fontSize: '0.95rem',
                color: '#6b7280'
              }}
            >
              Carregando...
            </p>
          ) : funcionariosFiltrados.length === 0 ? (
            <p
              style={{
                margin: 0,
                fontSize: '0.95rem',
                color: '#6b7280'
              }}
            >
              Nenhum funcionário encontrado para os filtros atuais.
            </p>
          ) : (
            <>
              <div
                style={{
                  width: '100%',
                  overflowX: 'auto'
                }}
              >
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nome</th>
                      <th>Telefone</th>
                      <th>Endereço</th>
                      <th>Usuário</th>
                      <th>Nível permissão</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {funcionariosPaginados.map((funcionario) => {
                      const nivelStyle = getNivelStyle(funcionario.nivelPermissao);
                      return (
                        <tr key={funcionario.id}>
                          <td>{funcionario.id}</td>
                          <td>{funcionario.nome}</td>
                          <td>{funcionario.telefone}</td>
                          <td>{funcionario.endereco}</td>
                          <td>{funcionario.usuario}</td>
                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '2px 12px',
                                borderRadius: 999,
                                fontSize: '0.78rem',
                                fontWeight: 500,
                                color: nivelStyle.color,
                                backgroundColor: nivelStyle.backgroundColor,
                                border: `1px solid ${nivelStyle.borderColor}`,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {formatNivelLabel(funcionario.nivelPermissao)}
                            </span>
                          </td>
                          <td>
                            <div
                              style={{
                                display: 'flex',
                                flexWrap: 'nowrap',
                                gap: 6
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => handleEdit(funcionario)}
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '0.82rem',
                                  borderRadius: 999,
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(funcionario.id)}
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '0.82rem',
                                  borderRadius: 999,
                                  backgroundColor: '#ffffff',
                                  color: '#dc2626',
                                  border: '1px solid rgba(220,38,38,0.7)',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                  fontSize: '0.85rem',
                  color: '#4b5563'
                }}
              >
                <span>
                  Mostrando {totalFiltrados === 0 ? 0 : startIndex + 1}-
                  {Math.min(endIndex, totalFiltrados)} de {totalFiltrados} registros
                </span>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={paginaAtual === 1}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: '0.85rem'
                    }}
                  >
                    Anterior
                  </button>
                  <span>
                    Página {paginaAtual} de {totalPaginas}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPaginas, prev + 1))
                    }
                    disabled={paginaAtual === totalPaginas}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: '0.85rem'
                    }}
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15,23,42,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            zIndex: 40
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 560,
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 24px 60px rgba(15,23,42,0.45)',
              border: '1px solid rgba(15,23,42,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    fontWeight: 600
                  }}
                >
                  {editingId ? 'Editar funcionário' : 'Novo funcionário'}
                </h2>
                <p
                  style={{
                    margin: 0,
                    marginTop: 4,
                    fontSize: '0.9rem',
                    color: '#4b5563'
                  }}
                >
                  Preencha os dados de acesso e contato do funcionário.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  backgroundColor: '#f3f4f6',
                  color: '#111827',
                  border: '1px solid rgba(15,23,42,0.08)',
                  fontSize: '0.85rem'
                }}
              >
                Fechar
              </button>
            </div>

            {erro && (
              <div
                style={{
                  marginBottom: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  backgroundColor: 'rgba(220,38,38,0.06)',
                  border: '1px solid rgba(220,38,38,0.55)',
                  color: '#b91c1c',
                  fontSize: '0.9rem'
                }}
              >
                {erro}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 14,
                marginTop: 4
              }}
            >
              <div>
                <label htmlFor="nome">Nome</label>
                <input
                  id="nome"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleChange(e, 'nome')}
                  required
                  autoComplete="name"
                />
              </div>

              <div>
                <label htmlFor="telefone">Telefone</label>
                <input
                  id="telefone"
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => handleChange(e, 'telefone')}
                  required
                  autoComplete="tel"
                />
              </div>

              <div>
                <label htmlFor="endereco">Endereço</label>
                <input
                  id="endereco"
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => handleChange(e, 'endereco')}
                  required
                  autoComplete="street-address"
                />
              </div>

              <div>
                <label htmlFor="usuario">Usuário</label>
                <input
                  id="usuario"
                  type="text"
                  value={formData.usuario}
                  onChange={(e) => handleChange(e, 'usuario')}
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <label htmlFor="senha">Senha</label>
                <input
                  id="senha"
                  type="password"
                  value={formData.senha}
                  onChange={(e) => handleChange(e, 'senha')}
                  required={!editingId}
                  minLength={!editingId ? 6 : undefined}
                  autoComplete={editingId ? 'current-password' : 'new-password'}
                />
              </div>

              <div>
                <label htmlFor="nivelPermissao">Nível de permissão</label>
                <select
                  id="nivelPermissao"
                  value={formData.nivelPermissao}
                  onChange={(e) => handleChange(e, 'nivelPermissao')}
                >
                  <option value="ADMINISTRADOR">Administrador</option>
                  <option value="ENGENHEIRO">Engenheiro</option>
                  <option value="OPERADOR">Operador</option>
                </select>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 8
                }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    borderRadius: 999,
                    fontSize: '0.9rem'
                  }}
                >
                  {editingId ? 'Atualizar funcionário' : 'Salvar funcionário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}