import { useState, useEffect } from 'react';
import aeronaveService from '../services/aeronaveService';
import { Aeronave } from '../types';
import { TipoAeronave } from '../types/enums';

type FiltroTipo = 'todos' | TipoAeronave;

const ITENS_POR_PAGINA = 8;

function getStatusProducao(codigo: string): 'Planejada' | 'Em produção' | 'Concluída' {
  let soma = 0;
  for (let i = 0; i < codigo.length; i++) {
    soma += codigo.charCodeAt(i);
  }
  const mod = soma % 3;
  if (mod === 0) return 'Planejada';
  if (mod === 1) return 'Em produção';
  return 'Concluída';
}

function Aeronaves() {
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos');
  const [erro, setErro] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    modelo: '',
    tipo: TipoAeronave.COMERCIAL,
    capacidade: 0,
    alcance: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadAeronaves();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtroTipo, searchTerm]);

  const loadAeronaves = async () => {
    try {
      setErro(null);
      setLoading(true);
      const data = await aeronaveService.getAll();
      setAeronaves(data);
    } catch (error) {
      console.error('Erro ao carregar aeronaves:', error);
      setErro('Não foi possível carregar as aeronaves no momento.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setErro(null);
      await aeronaveService.create(formData);
      setShowModal(false);
      setFormData({
        codigo: '',
        modelo: '',
        tipo: TipoAeronave.COMERCIAL,
        capacidade: 0,
        alcance: 0
      });
      loadAeronaves();
    } catch (error) {
      console.error('Erro ao criar aeronave:', error);
      setErro('Não foi possível criar a aeronave. Verifique os dados e tente novamente.');
    }
  };

  const handleDelete = async (codigo: string) => {
    if (window.confirm('Deseja realmente excluir esta aeronave?')) {
      try {
        setErro(null);
        await aeronaveService.delete(codigo);
        loadAeronaves();
      } catch (error) {
        console.error('Erro ao excluir aeronave:', error);
        setErro('Não foi possível excluir a aeronave.');
      }
    }
  };

  const total = aeronaves.length;
  const totalComerciais = aeronaves.filter((a) => a.tipo === TipoAeronave.COMERCIAL).length;
  const totalMilitares = aeronaves.filter((a) => a.tipo === TipoAeronave.MILITAR).length;

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const aeronavesPorTipo =
    filtroTipo === 'todos' ? aeronaves : aeronaves.filter((a) => a.tipo === filtroTipo);

  const aeronavesFiltradas = aeronavesPorTipo.filter((a) => {
    if (!normalizedSearch) return true;
    const codigoMatch = a.codigo.toLowerCase().includes(normalizedSearch);
    const modeloMatch = a.modelo.toLowerCase().includes(normalizedSearch);
    const tipoMatch = String(a.tipo).toLowerCase().includes(normalizedSearch);
    return codigoMatch || modeloMatch || tipoMatch;
  });

  const totalFiltradas = aeronavesFiltradas.length;
  const totalPaginas = Math.max(1, Math.ceil(totalFiltradas / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(currentPage, totalPaginas);
  const startIndex = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const endIndex = startIndex + ITENS_POR_PAGINA;
  const aeronavesPaginadas = aeronavesFiltradas.slice(startIndex, endIndex);

  if (loading) {
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
            paddingTop: 20,
            fontSize: '0.95rem',
            color: '#4b5563'
          }}
        >
          Carregando aeronaves...
        </div>
      </div>
    );
  }

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
              Aeronaves
            </h1>
            <p
              style={{
                margin: 0,
                marginTop: 4,
                fontSize: '0.95rem',
                color: '#4b5563'
              }}
            >
              Cadastro e acompanhamento das aeronaves da produção.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              fontSize: '0.9rem'
            }}
          >
            Nova aeronave
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
              Aeronaves cadastradas
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
              Comerciais
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: '1.4rem',
                fontWeight: 600,
                color: '#14532d'
              }}
            >
              {totalComerciais}
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
              Militares
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: '1.4rem',
                fontWeight: 600,
                color: '#991b1b'
              }}
            >
              {totalMilitares}
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
                htmlFor="buscaAeronaves"
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: '#4b5563'
                }}
              >
                Buscar
              </label>
              <input
                id="buscaAeronaves"
                type="text"
                placeholder="Código, modelo ou tipo"
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
                htmlFor="filtroTipo"
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: '#4b5563'
                }}
              >
                Filtrar por tipo
              </label>
              <select
                id="filtroTipo"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as FiltroTipo)}
                style={{
                  minWidth: 160
                }}
              >
                <option value="todos">Todos</option>
                <option value={TipoAeronave.COMERCIAL}>Comercial</option>
                <option value={TipoAeronave.MILITAR}>Militar</option>
              </select>
            </div>
          </div>

          {aeronavesFiltradas.length === 0 ? (
            <p
              style={{
                margin: 0,
                fontSize: '0.95rem',
                color: '#6b7280'
              }}
            >
              Nenhuma aeronave encontrada para os filtros atuais.
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
                      <th>Código</th>
                      <th>Modelo</th>
                      <th>Tipo</th>
                      <th>Status produção</th>
                      <th>Capacidade</th>
                      <th>Alcance (km)</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aeronavesPaginadas.map((aeronave) => {
                      const status = getStatusProducao(aeronave.codigo);
                      const statusColor =
                        status === 'Concluída'
                          ? '#16a34a'
                          : status === 'Em produção'
                          ? '#1d4ed8'
                          : '#92400e';

                      const statusBg =
                        status === 'Concluída'
                          ? 'rgba(22,163,74,0.08)'
                          : status === 'Em produção'
                          ? 'rgba(37,99,235,0.08)'
                          : 'rgba(234,179,8,0.1)';

                      return (
                        <tr key={aeronave.codigo}>
                          <td>{aeronave.codigo}</td>
                          <td>{aeronave.modelo}</td>
                          <td>{aeronave.tipo}</td>
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
                                color: statusColor,
                                backgroundColor: statusBg,
                                border: `1px solid ${statusColor}20`
                              }}
                            >
                              {status}
                            </span>
                          </td>
                          <td>{aeronave.capacidade}</td>
                          <td>{aeronave.alcance}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleDelete(aeronave.codigo)}
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
                  Nova aeronave
                </h2>
                <p
                  style={{
                    margin: 0,
                    marginTop: 4,
                    fontSize: '0.9rem',
                    color: '#4b5563'
                  }}
                >
                  Preencha os dados principais da aeronave para cadastro.
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
                <label htmlFor="codigo">Código</label>
                <input
                  id="codigo"
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="modelo">Modelo</label>
                <input
                  id="modelo"
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="tipo">Tipo</label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value as TipoAeronave })
                  }
                >
                  <option value={TipoAeronave.COMERCIAL}>Comercial</option>
                  <option value={TipoAeronave.MILITAR}>Militar</option>
                </select>
              </div>

              <div>
                <label htmlFor="capacidade">Capacidade</label>
                <input
                  id="capacidade"
                  type="number"
                  value={formData.capacidade}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacidade: parseInt(e.target.value, 10) || 0
                    })
                  }
                  required
                />
              </div>

              <div>
                <label htmlFor="alcance">Alcance (km)</label>
                <input
                  id="alcance"
                  type="number"
                  value={formData.alcance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      alcance: parseInt(e.target.value, 10) || 0
                    })
                  }
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
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    borderRadius: 999,
                    fontSize: '0.9rem'
                  }}
                >
                  Salvar aeronave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Aeronaves;
