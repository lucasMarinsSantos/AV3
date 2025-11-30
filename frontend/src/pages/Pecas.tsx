import { useState, useEffect } from 'react';
import pecaService, { Peca, CreatePecaDTO } from '../services/pecaService';
import aeronaveService from '../services/aeronaveService';
import { Aeronave } from '../types';

type FiltroTipoPeca = 'todos' | 'NACIONAL' | 'IMPORTADA';
type FiltroStatusPeca = 'todos' | 'EMPRODUCAO' | 'EMTRANSPORTE' | 'PRONTA';

const ITENS_POR_PAGINA = 8;

function formatTipoPecaLabel(tipo: 'NACIONAL' | 'IMPORTADA') {
  if (tipo === 'NACIONAL') return 'Nacional';
  return 'Importada';
}

function formatStatusPecaLabel(status: 'EMPRODUCAO' | 'EMTRANSPORTE' | 'PRONTA') {
  if (status === 'EMPRODUCAO') return 'Em produção';
  if (status === 'EMTRANSPORTE') return 'Em transporte';
  return 'Pronta';
}

function getStatusPecaStyle(status: 'EMPRODUCAO' | 'EMTRANSPORTE' | 'PRONTA') {
  if (status === 'PRONTA') {
    return {
      color: '#16a34a',
      backgroundColor: 'rgba(22,163,74,0.08)',
      borderColor: '#16a34a20'
    };
  }
  if (status === 'EMTRANSPORTE') {
    return {
      color: '#1d4ed8',
      backgroundColor: 'rgba(37,99,235,0.08)',
      borderColor: '#1d4ed820'
    };
  }
  return {
    color: '#92400e',
    backgroundColor: 'rgba(234,179,8,0.1)',
    borderColor: '#92400e20'
  };
}

export default function Pecas() {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipoPeca>('todos');
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatusPeca>('todos');
  const [formData, setFormData] = useState<CreatePecaDTO>({
    nome: '',
    tipo: 'NACIONAL',
    fornecedor: '',
    status: 'EMPRODUCAO',
    aeronaveId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadPecas();
    loadAeronaves();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtroTipo, filtroStatus, searchTerm]);

  const loadPecas = async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await pecaService.getAll();
      setPecas(data);
    } catch (error) {
      console.error('Erro ao carregar peças:', error);
      setErro('Não foi possível carregar as peças no momento.');
    } finally {
      setLoading(false);
    }
  };

  const loadAeronaves = async () => {
    try {
      const data = await aeronaveService.getAll();
      setAeronaves(data);
    } catch (error) {
      console.error('Erro ao carregar aeronaves:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    try {
      if (editingId !== null) {
        await pecaService.update(editingId, formData);
      } else {
        await pecaService.create(formData);
      }
      resetForm();
      setShowModal(false);
      loadPecas();
    } catch (error) {
      console.error('Erro ao salvar peça:', error);
      setErro('Não foi possível salvar a peça. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (peca: Peca) => {
    setEditingId(peca.id);
    setFormData({
      nome: peca.nome,
      tipo: peca.tipo,
      fornecedor: peca.fornecedor,
      status: peca.status,
      aeronaveId: peca.aeronaveId
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir esta peça?')) return;
    setLoading(true);
    setErro(null);
    try {
      await pecaService.delete(id);
      loadPecas();
    } catch (error) {
      console.error('Erro ao excluir peça:', error);
      setErro('Não foi possível excluir a peça.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      nome: '',
      tipo: 'NACIONAL',
      fornecedor: '',
      status: 'EMPRODUCAO',
      aeronaveId: ''
    });
  };

  const total = pecas.length;
  const totalNacionais = pecas.filter((p) => p.tipo === 'NACIONAL').length;
  const totalImportadas = pecas.filter((p) => p.tipo === 'IMPORTADA').length;

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const pecasFiltradas = pecas.filter((p) => {
    if (filtroTipo !== 'todos' && p.tipo !== filtroTipo) return false;
    if (filtroStatus !== 'todos' && p.status !== filtroStatus) return false;

    if (normalizedSearch) {
      const nomeMatch = p.nome.toLowerCase().includes(normalizedSearch);
      const fornecedorMatch = p.fornecedor.toLowerCase().includes(normalizedSearch);
      const aeronaveMatch = String(p.aeronaveId ?? '').toLowerCase().includes(normalizedSearch);
      const idMatch = String(p.id).includes(normalizedSearch);
      return nomeMatch || fornecedorMatch || aeronaveMatch || idMatch;
    }

    return true;
  });

  const totalFiltradas = pecasFiltradas.length;
  const totalPaginas = Math.max(1, Math.ceil(totalFiltradas / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(currentPage, totalPaginas);
  const startIndex = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const endIndex = startIndex + ITENS_POR_PAGINA;
  const pecasPaginadas = pecasFiltradas.slice(startIndex, endIndex);

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
              Peças
            </h1>
            <p
              style={{
                margin: 0,
                marginTop: 4,
                fontSize: '0.95rem',
                color: '#4b5563'
              }}
            >
              Controle das peças utilizadas na produção das aeronaves.
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
            Nova peça
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
              Peças cadastradas
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
              backgroundColor: '#ecfdf3',
              padding: '12px 16px',
              border: '1px solid rgba(22,163,74,0.35)'
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: '#166534'
              }}
            >
              Nacionais
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: '1.4rem',
                fontWeight: 600,
                color: '#14532d'
              }}
            >
              {totalNacionais}
            </div>
          </div>

          <div
            style={{
              borderRadius: 14,
              backgroundColor: '#fef2f2',
              padding: '12px 16px',
              border: '1px solid rgba(220,38,38,0.35)'
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: '#b91c1c'
              }}
            >
              Importadas
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: '1.4rem',
                fontWeight: 600,
                color: '#991b1b'
              }}
            >
              {totalImportadas}
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
                htmlFor="buscaPecas"
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: '#4b5563'
                }}
              >
                Buscar
              </label>
              <input
                id="buscaPecas"
                type="text"
                placeholder="Nome, fornecedor, ID ou aeronave"
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
                gap: 10,
                flexWrap: 'wrap',
                alignItems: 'flex-end'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}
              >
                <label
                  htmlFor="filtroTipo"
                  style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    color: '#4b5563'
                  }}
                >
                  Tipo
                </label>
                <select
                  id="filtroTipo"
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value as FiltroTipoPeca)}
                  style={{
                    minWidth: 160
                  }}
                >
                  <option value="todos">Todos</option>
                  <option value="NACIONAL">Nacional</option>
                  <option value="IMPORTADA">Importada</option>
                </select>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}
              >
                <label
                  htmlFor="filtroStatus"
                  style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    color: '#4b5563'
                  }}
                >
                  Status
                </label>
                <select
                  id="filtroStatus"
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value as FiltroStatusPeca)}
                  style={{
                    minWidth: 180
                  }}
                >
                  <option value="todos">Todos</option>
                  <option value="EMPRODUCAO">Em produção</option>
                  <option value="EMTRANSPORTE">Em transporte</option>
                  <option value="PRONTA">Pronta</option>
                </select>
              </div>
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
          ) : pecasFiltradas.length === 0 ? (
            <p
              style={{
                margin: 0,
                fontSize: '0.95rem',
                color: '#6b7280'
              }}
            >
              Nenhuma peça encontrada para os filtros atuais.
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
                      <th>Tipo</th>
                      <th>Fornecedor</th>
                      <th>Status</th>
                      <th>Aeronave</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pecasPaginadas.map((peca) => {
                      const statusStyle = getStatusPecaStyle(peca.status);
                      return (
                        <tr key={peca.id}>
                          <td>{peca.id}</td>
                          <td>{peca.nome}</td>
                          <td>{formatTipoPecaLabel(peca.tipo)}</td>
                          <td>{peca.fornecedor}</td>
                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '2px 10px',
                                borderRadius: 999,
                                fontSize: '0.78rem',
                                fontWeight: 500,
                                color: statusStyle.color,
                                backgroundColor: statusStyle.backgroundColor,
                                border: `1px solid ${statusStyle.borderColor}`
                              }}
                            >
                              {formatStatusPecaLabel(peca.status)}
                            </span>
                          </td>
                          <td>{peca.aeronaveId}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleEdit(peca)}
                              style={{
                                padding: '4px 10px',
                                fontSize: '0.82rem',
                                borderRadius: 999,
                                marginRight: 6
                              }}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(peca.id)}
                              style={{
                                padding: '4px 10px',
                                fontSize: '0.82rem',
                                borderRadius: 999,
                                backgroundColor: '#ffffff',
                                color: '#dc2626',
                                border: '1px solid rgba(220,38,38,0.7)'
                              }}
                            >
                              Excluir
                            </button>
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
                  Mostrando {totalFiltradas === 0 ? 0 : startIndex + 1}-
                  {Math.min(endIndex, totalFiltradas)} de {totalFiltradas} registros
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
              maxWidth: 520,
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
                  {editingId ? 'Editar peça' : 'Nova peça'}
                </h2>
                <p
                  style={{
                    margin: 0,
                    marginTop: 4,
                    fontSize: '0.9rem',
                    color: '#4b5563'
                  }}
                >
                  Preencha os dados principais da peça vinculada à aeronave.
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
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="tipo">Tipo</label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tipo: e.target.value as 'NACIONAL' | 'IMPORTADA'
                    })
                  }
                >
                  <option value="NACIONAL">Nacional</option>
                  <option value="IMPORTADA">Importada</option>
                </select>
              </div>

              <div>
                <label htmlFor="fornecedor">Fornecedor</label>
                <input
                  id="fornecedor"
                  type="text"
                  value={formData.fornecedor}
                  onChange={(e) =>
                    setFormData({ ...formData, fornecedor: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'EMPRODUCAO' | 'EMTRANSPORTE' | 'PRONTA'
                    })
                  }
                >
                  <option value="EMPRODUCAO">Em produção</option>
                  <option value="EMTRANSPORTE">Em transporte</option>
                  <option value="PRONTA">Pronta</option>
                </select>
              </div>

              <div>
                <label htmlFor="aeronaveId">Aeronave</label>
                <select
                  id="aeronaveId"
                  value={formData.aeronaveId}
                  onChange={(e) =>
                    setFormData({ ...formData, aeronaveId: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione uma aeronave</option>
                  {aeronaves.map((a) => (
                    <option key={a.codigo} value={a.codigo}>
                      {a.codigo} - {a.modelo}
                    </option>
                  ))}
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
                  {editingId ? 'Atualizar peça' : 'Salvar peça'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
