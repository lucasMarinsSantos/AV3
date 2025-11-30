import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import testeService, { Teste, CreateTesteDTO } from '../services/testeService';
import aeronaveService from '../services/aeronaveService';
import { Aeronave } from '../types';

type FiltroTipoTeste = 'todos' | 'ELETRICO' | 'HIDRAULICO' | 'AERODINAMICO';
type FiltroResultadoTeste = 'todos' | 'APROVADO' | 'REPROVADO';

const ITENS_POR_PAGINA = 8;

function formatTipoLabel(tipo: 'ELETRICO' | 'HIDRAULICO' | 'AERODINAMICO') {
  if (tipo === 'ELETRICO') return 'Elétrico';
  if (tipo === 'HIDRAULICO') return 'Hidráulico';
  return 'Aerodinâmico';
}

function formatResultadoLabel(resultado: 'APROVADO' | 'REPROVADO') {
  return resultado === 'APROVADO' ? 'Aprovado' : 'Reprovado';
}

function getResultadoStyle(resultado: 'APROVADO' | 'REPROVADO') {
  if (resultado === 'APROVADO') {
    return {
      color: '#16a34a',
      backgroundColor: 'rgba(22,163,74,0.08)',
      borderColor: '#16a34a20'
    };
  }
  return {
    color: '#b91c1c',
    backgroundColor: 'rgba(254,226,226,0.8)',
    borderColor: '#b91c1c20'
  };
}

export default function Testes() {
  const [testes, setTestes] = useState<Teste[]>([]);
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipoTeste>('todos');
  const [filtroResultado, setFiltroResultado] = useState<FiltroResultadoTeste>('todos');
  const [formData, setFormData] = useState<CreateTesteDTO>({
    tipo: 'ELETRICO',
    resultado: 'APROVADO',
    aeronaveId: '',
    data: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadTestes();
    loadAeronaves();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtroTipo, filtroResultado, searchTerm]);

  const loadTestes = async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await testeService.getAll();
      setTestes(data);
    } catch {
      setErro('Não foi possível carregar os testes no momento.');
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    try {
      if (editingId) {
        await testeService.update(editingId, formData);
      } else {
        await testeService.create(formData);
      }
      resetForm();
      setShowModal(false);
      loadTestes();
    } catch {
      setErro('Não foi possível salvar o teste. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (teste: Teste) => {
    setEditingId(teste.id);
    setFormData({
      tipo: teste.tipo,
      resultado: teste.resultado,
      aeronaveId: teste.aeronaveId,
      data: teste.data.split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir este teste?')) return;
    setLoading(true);
    setErro(null);
    try {
      await testeService.delete(id);
      loadTestes();
    } catch {
      setErro('Não foi possível excluir o teste.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof CreateTesteDTO
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      tipo: 'ELETRICO',
      resultado: 'APROVADO',
      aeronaveId: '',
      data: ''
    });
  };

  const total = testes.length;
  const totalAprovados = testes.filter((t) => t.resultado === 'APROVADO').length;
  const totalReprovados = testes.filter((t) => t.resultado === 'REPROVADO').length;

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const testesFiltrados = testes.filter((t) => {
    if (filtroTipo !== 'todos' && t.tipo !== filtroTipo) return false;
    if (filtroResultado !== 'todos' && t.resultado !== filtroResultado) return false;

    if (normalizedSearch) {
      const idMatch = String(t.id).includes(normalizedSearch);
      const aeronaveMatch = String(t.aeronaveId ?? '').toLowerCase().includes(normalizedSearch);
      const tipoMatch = t.tipo.toLowerCase().includes(normalizedSearch);
      const resultadoMatch = t.resultado.toLowerCase().includes(normalizedSearch);
      return idMatch || aeronaveMatch || tipoMatch || resultadoMatch;
    }

    return true;
  });

  const totalFiltrados = testesFiltrados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalFiltrados / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(currentPage, totalPaginas);
  const startIndex = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const endIndex = startIndex + ITENS_POR_PAGINA;
  const testesPaginados = testesFiltrados.slice(startIndex, endIndex);

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
              Testes
            </h1>
            <p
              style={{
                margin: 0,
                marginTop: 4,
                fontSize: '0.95rem',
                color: '#4b5563'
              }}
            >
              Ensaios elétricos, hidráulicos e aerodinâmicos realizados nas aeronaves.
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
            Novo teste
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
              Testes registrados
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
              border: '1px solid rgba(22,163,74,0.4)'
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: '#166534'
              }}
            >
              Aprovados
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: '1.4rem',
                fontWeight: 600,
                color: '#166534'
              }}
            >
              {totalAprovados}
            </div>
          </div>

          <div
            style={{
              borderRadius: 14,
              backgroundColor: '#fef2f2',
              padding: '12px 16px',
              border: '1px solid rgba(220,38,38,0.4)'
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: '#b91c1c'
              }}
            >
              Reprovados
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: '1.4rem',
                fontWeight: 600,
                color: '#b91c1c'
              }}
            >
              {totalReprovados}
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
                htmlFor="buscaTestes"
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: '#4b5563'
                }}
              >
                Buscar
              </label>
              <input
                id="buscaTestes"
                type="text"
                placeholder="ID, aeronave, tipo ou resultado"
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
                  onChange={(e) => setFiltroTipo(e.target.value as FiltroTipoTeste)}
                  style={{
                    minWidth: 170
                  }}
                >
                  <option value="todos">Todos</option>
                  <option value="ELETRICO">Elétrico</option>
                  <option value="HIDRAULICO">Hidráulico</option>
                  <option value="AERODINAMICO">Aerodinâmico</option>
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
                  htmlFor="filtroResultado"
                  style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    color: '#4b5563'
                  }}
                >
                  Resultado
                </label>
                <select
                  id="filtroResultado"
                  value={filtroResultado}
                  onChange={(e) =>
                    setFiltroResultado(e.target.value as FiltroResultadoTeste)
                  }
                  style={{
                    minWidth: 170
                  }}
                >
                  <option value="todos">Todos</option>
                  <option value="APROVADO">Aprovado</option>
                  <option value="REPROVADO">Reprovado</option>
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
          ) : testesFiltrados.length === 0 ? (
            <p
              style={{
                margin: 0,
                fontSize: '0.95rem',
                color: '#6b7280'
              }}
            >
              Nenhum teste encontrado para os filtros atuais.
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
                      <th>Tipo</th>
                      <th>Resultado</th>
                      <th>Aeronave</th>
                      <th>Data</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testesPaginados.map((teste) => {
                      const resultadoStyle = getResultadoStyle(teste.resultado);
                      return (
                        <tr key={teste.id}>
                          <td>{teste.id}</td>
                          <td>{formatTipoLabel(teste.tipo)}</td>
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
                                color: resultadoStyle.color,
                                backgroundColor: resultadoStyle.backgroundColor,
                                border: `1px solid ${resultadoStyle.borderColor}`,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {formatResultadoLabel(teste.resultado)}
                            </span>
                          </td>
                          <td>{teste.aeronaveId}</td>
                          <td>{new Date(teste.data).toLocaleDateString()}</td>
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
                                onClick={() => handleEdit(teste)}
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
                                onClick={() => handleDelete(teste.id)}
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
                  {editingId ? 'Editar teste' : 'Novo teste'}
                </h2>
                <p
                  style={{
                    margin: 0,
                    marginTop: 4,
                    fontSize: '0.9rem',
                    color: '#4b5563'
                  }}
                >
                  Registre o tipo, resultado e data do teste associado à aeronave.
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
                <label htmlFor="tipo">Tipo</label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => handleChange(e, 'tipo')}
                >
                  <option value="ELETRICO">Elétrico</option>
                  <option value="HIDRAULICO">Hidráulico</option>
                  <option value="AERODINAMICO">Aerodinâmico</option>
                </select>
              </div>

              <div>
                <label htmlFor="resultado">Resultado</label>
                <select
                  id="resultado"
                  value={formData.resultado}
                  onChange={(e) => handleChange(e, 'resultado')}
                >
                  <option value="APROVADO">Aprovado</option>
                  <option value="REPROVADO">Reprovado</option>
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

              <div>
                <label htmlFor="data">Data</label>
                <input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => handleChange(e, 'data')}
                  required
                />
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
                  {editingId ? 'Atualizar teste' : 'Salvar teste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
