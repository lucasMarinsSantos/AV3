import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import etapaService, { Etapa, CreateEtapaDTO } from '../services/etapaService';
import funcionarioService, { Funcionario } from '../services/funcionarioService';
import aeronaveService from '../services/aeronaveService';
import { Aeronave } from '../types';

type FiltroStatusEtapa = 'todos' | 'PENDENTE' | 'ANDAMENTO' | 'CONCLUIDA';

const ITENS_POR_PAGINA = 8;

function formatStatusEtapaLabel(status: 'PENDENTE' | 'ANDAMENTO' | 'CONCLUIDA') {
  if (status === 'PENDENTE') return 'Pendente';
  if (status === 'ANDAMENTO') return 'Em andamento';
  return 'Concluída';
}

function getStatusEtapaStyle(status: 'PENDENTE' | 'ANDAMENTO' | 'CONCLUIDA') {
  if (status === 'CONCLUIDA') {
    return {
      color: '#16a34a',
      backgroundColor: 'rgba(22,163,74,0.08)',
      borderColor: '#16a34a20'
    };
  }
  if (status === 'ANDAMENTO') {
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

function getAllowedStatusOptions(
  currentStatus: 'PENDENTE' | 'ANDAMENTO' | 'CONCLUIDA',
  isEditing: boolean
): Array<'PENDENTE' | 'ANDAMENTO' | 'CONCLUIDA'> {
  if (!isEditing) {
    return ['PENDENTE'];
  }
  if (currentStatus === 'PENDENTE') {
    return ['PENDENTE', 'ANDAMENTO'];
  }
  if (currentStatus === 'ANDAMENTO') {
    return ['ANDAMENTO', 'CONCLUIDA'];
  }
  return ['CONCLUIDA'];
}

export default function Etapas() {
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedEtapa, setSelectedEtapa] = useState<number | null>(null);
  const [selectedFuncionario, setSelectedFuncionario] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAssociarModal, setShowAssociarModal] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatusEtapa>('todos');
  const [formData, setFormData] = useState<CreateEtapaDTO>({
    nome: '',
    prazo: '',
    status: 'PENDENTE',
    aeronaveId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadEtapas();
    loadAeronaves();
    loadFuncionarios();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtroStatus, searchTerm]);

  const loadEtapas = async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await etapaService.getAll();
      setEtapas(data);
    } catch {
      setErro('Não foi possível carregar as etapas no momento.');
    } finally {
      setLoading(false);
    }
  };

  const loadAeronaves = async () => {
    try {
      const data = await aeronaveService.getAll();
      setAeronaves(data);
    } catch {
      console.error('Erro ao carregar aeronaves');
    }
  };

  const loadFuncionarios = async () => {
    try {
      const data = await funcionarioService.getAll();
      setFuncionarios(data);
    } catch {
      console.error('Erro ao carregar funcionários');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    try {
      if (editingId) {
        await etapaService.update(editingId, formData);
      } else {
        await etapaService.create({ ...formData, status: 'PENDENTE' });
      }
      resetForm();
      setShowModal(false);
      loadEtapas();
    } catch {
      setErro('Não foi possível salvar a etapa. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (etapa: Etapa) => {
    setEditingId(etapa.id);
    setFormData({
      nome: etapa.nome,
      prazo: etapa.prazo.split('T')[0],
      status: etapa.status,
      aeronaveId: etapa.aeronaveId
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir esta etapa?')) return;
    setLoading(true);
    setErro(null);
    try {
      await etapaService.delete(id);
      setShowModal(false);
      loadEtapas();
    } catch {
      setErro('Não foi possível excluir a etapa.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFuncionario = async () => {
    if (!selectedEtapa || !selectedFuncionario) {
      alert('Selecione um funcionário para associar à etapa.');
      return;
    }
    setLoading(true);
    setErro(null);
    try {
      await etapaService.addFuncionario(selectedEtapa, { funcionarioId: selectedFuncionario });
      loadEtapas();
      setSelectedFuncionario(null);
      setShowAssociarModal(false);
    } catch {
      setErro('Não foi possível adicionar o funcionário à etapa.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof CreateEtapaDTO
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      nome: '',
      prazo: '',
      status: 'PENDENTE',
      aeronaveId: ''
    });
  };

  const total = etapas.length;
  const totalPendentes = etapas.filter((e) => e.status === 'PENDENTE').length;
  const totalAndamento = etapas.filter((e) => e.status === 'ANDAMENTO').length;
  const totalConcluidas = etapas.filter((e) => e.status === 'CONCLUIDA').length;

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const etapasFiltradas = etapas.filter((e) => {
    if (filtroStatus !== 'todos' && e.status !== filtroStatus) return false;

    if (normalizedSearch) {
      const nomeMatch = e.nome.toLowerCase().includes(normalizedSearch);
      const aeronaveMatch = String(e.aeronaveId ?? '').toLowerCase().includes(normalizedSearch);
      const idMatch = String(e.id).includes(normalizedSearch);
      return nomeMatch || aeronaveMatch || idMatch;
    }

    return true;
  });

  const totalFiltradas = etapasFiltradas.length;
  const totalPaginas = Math.max(1, Math.ceil(totalFiltradas / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(currentPage, totalPaginas);
  const startIndex = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const endIndex = startIndex + ITENS_POR_PAGINA;
  const etapasPaginadas = etapasFiltradas.slice(startIndex, endIndex);

  const statusOptions = getAllowedStatusOptions(formData.status, editingId !== null);

  const etapaSelecionada = selectedEtapa
    ? etapas.find((e) => e.id === selectedEtapa) ?? null
    : null;

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
              Etapas
            </h1>
            <p
              style={{
                margin: 0,
                marginTop: 4,
                fontSize: '0.95rem',
                color: '#4b5563'
              }}
            >
              Fases do processo de produção vinculadas às aeronaves.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              justifyContent: 'flex-end'
            }}
          >
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
              Nova etapa
            </button>
          </div>
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
              Etapas cadastradas
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
              Pendentes
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: '1.4rem',
                fontWeight: 600,
                color: '#854d0e'
              }}
            >
              {totalPendentes}
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
              Em andamento
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: '1.4rem',
                fontWeight: 600,
                color: '#1d4ed8'
              }}
            >
              {totalAndamento}
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
              Concluídas
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: '1.4rem',
                fontWeight: 600,
                color: '#166534'
              }}
            >
              {totalConcluidas}
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
                htmlFor="buscaEtapas"
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: '#4b5563'
                }}
              >
                Buscar
              </label>
              <input
                id="buscaEtapas"
                type="text"
                placeholder="Nome, ID ou aeronave"
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
                htmlFor="filtroStatus"
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: '#4b5563'
                }}
              >
                Filtrar por status
              </label>
              <select
                id="filtroStatus"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as FiltroStatusEtapa)}
                style={{
                  minWidth: 160
                }}
              >
                <option value="todos">Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="ANDAMENTO">Em andamento</option>
                <option value="CONCLUIDA">Concluída</option>
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
          ) : etapasFiltradas.length === 0 ? (
            <p
              style={{
                margin: 0,
                fontSize: '0.95rem',
                color: '#6b7280'
              }}
            >
              Nenhuma etapa encontrado para os filtros atuais.
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
                      <th>Prazo</th>
                      <th>Status</th>
                      <th>Aeronave</th>
                      <th>Funcionários</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {etapasPaginadas.map((etapa) => {
                      const statusStyle = getStatusEtapaStyle(etapa.status);
                      return (
                        <tr key={etapa.id}>
                          <td>{etapa.id}</td>
                          <td>{etapa.nome}</td>
                          <td>{new Date(etapa.prazo).toLocaleDateString()}</td>
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
                                color: statusStyle.color,
                                backgroundColor: statusStyle.backgroundColor,
                                border: `1px solid ${statusStyle.borderColor}`,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {formatStatusEtapaLabel(etapa.status)}
                            </span>
                          </td>
                          <td>{etapa.aeronaveId}</td>
                          <td>{etapa.funcionarios?.map((f) => f.nome).join(', ') || '-'}</td>
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
                                onClick={() => handleEdit(etapa)}
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
                                onClick={() => {
                                  setSelectedEtapa(etapa.id);
                                  setSelectedFuncionario(null);
                                  setShowAssociarModal(true);
                                }}
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '0.82rem',
                                  borderRadius: 999,
                                  backgroundColor: '#ffffff',
                                  color: '#1d4ed8',
                                  border: '1px solid rgba(37,99,235,0.8)',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                Associar
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
                  {editingId ? 'Editar etapa' : 'Nova etapa'}
                </h2>
                <p
                  style={{
                    margin: 0,
                    marginTop: 4,
                    fontSize: '0.9rem',
                    color: '#4b5563'
                  }}
                >
                  Defina o nome, prazo e status da etapa vinculada a uma aeronave.
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
                  onChange={(e) => handleChange(e, 'nome')}
                  required
                />
              </div>

              <div>
                <label htmlFor="prazo">Prazo</label>
                <input
                  id="prazo"
                  type="date"
                  value={formData.prazo}
                  onChange={(e) => handleChange(e, 'prazo')}
                  required
                />
              </div>

              <div>
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleChange(e, 'status')}
                  disabled={editingId === null}
                >
                  {statusOptions.map((value) => (
                    <option key={value} value={value}>
                      {formatStatusEtapaLabel(value)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="aeronaveId">Aeronave</label>
                <select
                  id="aeronaveId"
                  value={formData.aeronaveId}
                  onChange={(e) => handleChange(e, 'aeronaveId')}
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
                  gridColumn: '1 / -1',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 6,
                  flexWrap: 'wrap'
                }}
              >
                {editingId && (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingId)}
                    disabled={loading}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 999,
                      fontSize: '0.9rem',
                      backgroundColor: '#ffffff',
                      color: '#dc2626',
                      border: '1px solid rgba(220,38,38,0.7)'
                    }}
                  >
                    Excluir etapa
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 999,
                    fontSize: '0.9rem',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    minWidth: 140
                  }}
                >
                  {editingId ? 'Atualizar etapa' : 'Salvar etapa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssociarModal && (
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
          onClick={() => setShowAssociarModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
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
                    fontSize: '1.05rem',
                    fontWeight: 600
                  }}
                >
                  Associar funcionário à etapa
                </h2>
                <p
                  style={{
                    margin: 0,
                    marginTop: 4,
                    fontSize: '0.9rem',
                    color: '#4b5563'
                  }}
                >
                  {etapaSelecionada
                    ? `Selecione um funcionário para associar à etapa "${etapaSelecionada.nome}".`
                    : 'Selecione um funcionário para associar à etapa selecionada.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAssociarModal(false)}
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

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                marginTop: 4
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 4,
                    fontSize: '0.85rem',
                    color: '#4b5563'
                  }}
                >
                  Atividade selecionada
                </label>
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 999,
                    backgroundColor: '#eff6ff',
                    border: '1px solid rgba(59,130,246,0.5)',
                    fontSize: '0.9rem',
                    color: '#1d4ed8',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {etapaSelecionada ? etapaSelecionada.nome : 'Nenhuma etapa selecionada'}
                </div>
              </div>

              <div>
                <label
                  htmlFor="selectFuncionario"
                  style={{
                    display: 'block',
                    marginBottom: 4,
                    fontSize: '0.85rem',
                    color: '#4b5563'
                  }}
                >
                  Funcionário
                </label>
                <select
                  id="selectFuncionario"
                  value={selectedFuncionario ?? ''}
                  onChange={(e) =>
                    setSelectedFuncionario(e.target.value ? Number(e.target.value) : null)
                  }
                >
                  <option value="">Selecione um funcionário</option>
                  {funcionarios.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddFuncionario}
                disabled={loading || !selectedEtapa}
                style={{
                  marginTop: 4,
                  alignSelf: 'flex-start',
                  padding: '8px 16px',
                  borderRadius: 999,
                  fontSize: '0.9rem'
                }}
              >
                Adicionar à etapa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
