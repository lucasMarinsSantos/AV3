import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import relatorioService, {
  Relatorio,
  CreateRelatorioDTO
} from '../services/relatorioService';
import aeronaveService from '../services/aeronaveService';
import api from '../services/api';
import { Aeronave } from '../types';

type TipoPeca = 'NACIONAL' | 'IMPORTADA';
type StatusPeca = 'EMPRODUCAO' | 'EMTRANSPORTE' | 'PRONTA';
type StatusEtapa = 'PENDENTE' | 'ANDAMENTO' | 'CONCLUIDA';
type TipoTeste = 'ELETRICO' | 'HIDRAULICO' | 'AERODINAMICO';
type ResultadoTeste = 'APROVADO' | 'REPROVADO';

const ITENS_POR_PAGINA = 8;

type RelatorioConteudoAeronave = {
  codigo: string;
  modelo: string;
  tipo: string;
  capacidade: number;
  alcance: number;
};

type RelatorioConteudoPeca = {
  id?: number;
  nome: string;
  tipo: TipoPeca;
  fornecedor: string;
  status: StatusPeca;
};

type RelatorioConteudoEtapa = {
  id?: number;
  nome: string;
  prazo: string;
  status: StatusEtapa;
  funcionarios?: { id?: number; nome: string }[];
};

type RelatorioConteudoTeste = {
  id?: number;
  tipo: TipoTeste;
  resultado: ResultadoTeste;
  data?: string;
};

type RelatorioConteudo = {
  aeronave: RelatorioConteudoAeronave;
  pecas: RelatorioConteudoPeca[];
  etapas: RelatorioConteudoEtapa[];
  testes: RelatorioConteudoTeste[];
  nomeCliente: string;
  dataEntrega: string;
};

function formatStatusEtapa(status: StatusEtapa) {
  if (status === 'PENDENTE') return 'Pendente';
  if (status === 'ANDAMENTO') return 'Em andamento';
  return 'Concluída';
}

function formatStatusPeca(status: StatusPeca) {
  if (status === 'EMPRODUCAO') return 'Em produção';
  if (status === 'EMTRANSPORTE') return 'Em transporte';
  return 'Pronta para uso';
}

function formatTipoPeca(tipo: TipoPeca) {
  return tipo === 'NACIONAL' ? 'Nacional' : 'Importada';
}

function formatTipoTeste(tipo: TipoTeste) {
  if (tipo === 'ELETRICO') return 'Elétrico';
  if (tipo === 'HIDRAULICO') return 'Hidráulico';
  return 'Aerodinâmico';
}

function formatResultadoTeste(resultado: ResultadoTeste) {
  return resultado === 'APROVADO' ? 'Aprovado' : 'Reprovado';
}

export default function Relatorios() {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetalhe, setShowDetalhe] = useState(false);
  const [relatorioSelecionado, setRelatorioSelecionado] =
    useState<Relatorio | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [filtroAeronave, setFiltroAeronave] = useState<string>('todas');
  const [formData, setFormData] = useState<CreateRelatorioDTO>({
    aeronaveId: '',
    nomeCliente: '',
    dataEntrega: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadRelatorios();
    loadAeronaves();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtroAeronave, searchTerm]);

  const loadRelatorios = async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await relatorioService.getAll();
      setRelatorios(data);
    } catch {
      setErro('Não foi possível carregar os relatórios no momento.');
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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof CreateRelatorioDTO
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    try {
      await relatorioService.create(formData);
      await loadRelatorios();
      setFormData({ aeronaveId: '', nomeCliente: '', dataEntrega: '' });
      setShowModal(false);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setErro('Já existe um relatório cadastrado para esta aeronave.');
      } else {
        setErro(
          'Não foi possível criar o relatório. Verifique os dados e tente novamente.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async (relatorio: Relatorio) => {
    try {
      const response = await api.get(`/relatorios/${relatorio.id}/export-pdf`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `Relatorio_${relatorio.aeronaveId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Não foi possível exportar o relatório em PDF no momento.');
    }
  };

  const total = relatorios.length;
  const totalAeronaves = new Set(relatorios.map((r) => r.aeronaveId)).size;

  let ultimaEntregaTexto: string | null = null;
  if (relatorios.length > 0) {
    const maxTime = Math.max(
      ...relatorios.map((r) => new Date(r.dataEntrega).getTime())
    );
    ultimaEntregaTexto = new Date(maxTime).toLocaleDateString();
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const relatoriosFiltrados = relatorios.filter((r) => {
    if (filtroAeronave !== 'todas' && r.aeronaveId !== filtroAeronave) {
      return false;
    }

    if (normalizedSearch) {
      const idMatch = String(r.id).includes(normalizedSearch);
      const clienteMatch = r.nomeCliente.toLowerCase().includes(normalizedSearch);
      const aeronaveMatch = String(r.aeronaveId ?? '')
        .toLowerCase()
        .includes(normalizedSearch);
      const dataMatch = new Date(r.dataEntrega)
        .toLocaleDateString()
        .toLowerCase()
        .includes(normalizedSearch);
      return idMatch || clienteMatch || aeronaveMatch || dataMatch;
    }

    return true;
  });

  const totalFiltrados = relatoriosFiltrados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalFiltrados / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(currentPage, totalPaginas);
  const startIndex = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const endIndex = startIndex + ITENS_POR_PAGINA;
  const relatoriosPaginados = relatoriosFiltrados.slice(startIndex, endIndex);

  const parsedConteudo: RelatorioConteudo | null = (() => {
    if (!relatorioSelecionado?.conteudo) return null;
    try {
      const obj = JSON.parse(relatorioSelecionado.conteudo) as RelatorioConteudo;
      if (!obj.aeronave || !obj.pecas || !obj.etapas || !obj.testes) {
        return null;
      }
      return obj;
    } catch {
      return null;
    }
  })();

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
              Relatórios
            </h1>
            <p
              style={{
                margin: 0,
                marginTop: 4,
                fontSize: '0.95rem',
                color: '#4b5563'
              }}
            >
              Documentos finais de qualidade gerados para cada aeronave entregue.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setFormData({ aeronaveId: '', nomeCliente: '', dataEntrega: '' });
              setShowModal(true);
            }}
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              fontSize: '0.9rem'
            }}
          >
            Novo relatório
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
              Relatórios gerados
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
              Aeronaves atendidas
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: '1.4rem',
                fontWeight: 600,
                color: '#166534'
              }}
            >
              {totalAeronaves}
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
              Última entrega
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#111827'
              }}
            >
              {ultimaEntregaTexto || '-'}
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
                htmlFor="buscaRelatorios"
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: '#4b5563'
                }}
              >
                Buscar
              </label>
              <input
                id="buscaRelatorios"
                type="text"
                placeholder="ID, aeronave, cliente ou data"
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
                htmlFor="filtroAeronave"
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: '#4b5563'
                }}
              >
                Filtrar por aeronave
              </label>
              <select
                id="filtroAeronave"
                value={filtroAeronave}
                onChange={(e) => setFiltroAeronave(e.target.value)}
                style={{
                  minWidth: 220
                }}
              >
                <option value="todas">Todas</option>
                {aeronaves.map((a) => (
                  <option key={a.codigo} value={a.codigo}>
                    {a.codigo} - {a.modelo}
                  </option>
                ))}
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
          ) : relatoriosFiltrados.length === 0 ? (
            <p
              style={{
                margin: 0,
                fontSize: '0.95rem',
                color: '#6b7280'
              }}
            >
              Nenhum relatório encontrado para os filtros atuais.
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
                      <th>Aeronave</th>
                      <th>Cliente</th>
                      <th>Data de entrega</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatoriosPaginados.map((relatorio) => (
                      <tr key={relatorio.id}>
                        <td>{relatorio.id}</td>
                        <td>{relatorio.aeronaveId}</td>
                        <td>{relatorio.nomeCliente}</td>
                        <td>
                          {new Date(relatorio.dataEntrega).toLocaleDateString()}
                        </td>
                        <td>
                          <div
                            style={{
                              display: 'flex',
                              gap: 8,
                              flexWrap: 'wrap'
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setRelatorioSelecionado(relatorio);
                                setShowDetalhe(true);
                              }}
                              style={{
                                padding: '4px 10px',
                                fontSize: '0.82rem',
                                borderRadius: 999,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Detalhes
                            </button>

                            <button
                              type="button"
                              onClick={() => handleExportPdf(relatorio)}
                              style={{
                                padding: '4px 10px',
                                fontSize: '0.82rem',
                                borderRadius: 999,
                                whiteSpace: 'nowrap',
                                backgroundColor: '#dbeafe',
                                color: '#0c4a6e',
                                border: '1px solid rgba(59,130,246,0.5)',
                                cursor: 'pointer'
                              }}
                            >
                              Exportar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
                  Novo relatório
                </h2>
                <p
                  style={{
                    margin: 0,
                    marginTop: 4,
                    fontSize: '0.9rem',
                    color: '#4b5563'
                  }}
                >
                  Selecione a aeronave e defina os dados de entrega ao cliente.
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
                <label htmlFor="nomeCliente">Nome do cliente</label>
                <input
                  id="nomeCliente"
                  type="text"
                  value={formData.nomeCliente}
                  onChange={(e) => handleChange(e, 'nomeCliente')}
                  required
                />
              </div>

              <div>
                <label htmlFor="dataEntrega">Data de entrega</label>
                <input
                  id="dataEntrega"
                  type="date"
                  value={formData.dataEntrega}
                  onChange={(e) => handleChange(e, 'dataEntrega')}
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
                  Salvar relatório
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetalhe && relatorioSelecionado && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15,23,42,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            zIndex: 45
          }}
          onClick={() => setShowDetalhe(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 760,
              maxHeight: '80vh',
              overflowY: 'auto',
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: 18,
              boxShadow: '0 24px 60px rgba(15,23,42,0.5)',
              border: '1px solid rgba(15,23,42,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10
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
                  Relatório {relatorioSelecionado.aeronaveId}
                </h2>
                <p
                  style={{
                    margin: 0,
                    marginTop: 4,
                    fontSize: '0.9rem',
                    color: '#4b5563'
                  }}
                >
                  Cliente: {relatorioSelecionado.nomeCliente} · Entrega:{' '}
                  {new Date(relatorioSelecionado.dataEntrega).toLocaleDateString()}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDetalhe(false)}
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

            {parsedConteudo ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  marginTop: 6
                }}
              >
                <section>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: '#111827'
                    }}
                  >
                    Dados da aeronave
                  </h3>
                  <p
                    style={{
                      margin: '4px 0 0',
                      fontSize: '0.9rem',
                      color: '#374151'
                    }}
                  >
                    Código: {parsedConteudo.aeronave.codigo} · Modelo:{' '}
                    {parsedConteudo.aeronave.modelo} · Tipo:{' '}
                    {parsedConteudo.aeronave.tipo} · Capacidade:{' '}
                    {parsedConteudo.aeronave.capacidade} passageiros · Alcance:{' '}
                    {parsedConteudo.aeronave.alcance} km
                  </p>
                </section>

                <section>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: '#111827'
                    }}
                  >
                    Peças utilizadas
                  </h3>
                  {parsedConteudo.pecas.length === 0 ? (
                    <p
                      style={{
                        margin: '4px 0 0',
                        fontSize: '0.9rem',
                        color: '#6b7280'
                      }}
                    >
                      Nenhuma peça registrada para esta aeronave.
                    </p>
                  ) : (
                    <ul
                      style={{
                        margin: '6px 0 0',
                        paddingLeft: 18,
                        maxHeight: 140,
                        overflowY: 'auto',
                        fontSize: '0.9rem',
                        color: '#374151'
                      }}
                    >
                      {parsedConteudo.pecas.map((p) => (
                        <li key={p.id ?? `${p.nome}-${p.fornecedor}`}>
                          {p.nome} · {formatTipoPeca(p.tipo)} · Fornecedor:{' '}
                          {p.fornecedor} · {formatStatusPeca(p.status)}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: '#111827'
                    }}
                  >
                    Etapas de produção
                  </h3>
                  {parsedConteudo.etapas.length === 0 ? (
                    <p
                      style={{
                        margin: '4px 0 0',
                        fontSize: '0.9rem',
                        color: '#6b7280'
                      }}
                    >
                      Nenhuma etapa registrado para esta aeronave.
                    </p>
                  ) : (
                    <div
                      style={{
                        marginTop: 6,
                        maxHeight: 170,
                        overflowY: 'auto',
                        borderRadius: 10,
                        border: '1px solid #e5e7eb',
                        padding: 8
                      }}
                    >
                      {parsedConteudo.etapas.map((e) => (
                        <div
                          key={e.id ?? e.nome}
                          style={{
                            padding: '6px 6px',
                            borderBottom: '1px solid #e5e7eb',
                            fontSize: '0.88rem',
                            color: '#374151'
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: 8,
                              flexWrap: 'wrap'
                            }}
                          >
                            <span style={{ fontWeight: 500 }}>{e.nome}</span>
                            <span
                              style={{
                                fontSize: '0.78rem',
                                padding: '1px 8px',
                                borderRadius: 999,
                                border: '1px solid rgba(148,163,184,0.7)',
                                backgroundColor: '#f9fafb'
                              }}
                            >
                              {formatStatusEtapa(e.status)}
                            </span>
                          </div>
                          <div
                            style={{
                              marginTop: 2,
                              fontSize: '0.8rem',
                              color: '#6b7280'
                            }}
                          >
                            Prazo:{' '}
                            {e.prazo
                              ? new Date(e.prazo).toLocaleDateString()
                              : '-'}
                            {e.funcionarios && e.funcionarios.length > 0 && (
                              <>
                                {' '}
                                · Responsáveis:{' '}
                                {e.funcionarios.map((f) => f.nome).join(', ')}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: '#111827'
                    }}
                  >
                    Testes realizados
                  </h3>
                  {parsedConteudo.testes.length === 0 ? (
                    <p
                      style={{
                        margin: '4px 0 0',
                        fontSize: '0.9rem',
                        color: '#6b7280'
                      }}
                    >
                      Nenhum teste registrado para esta aeronave.
                    </p>
                  ) : (
                    <div
                      style={{
                        marginTop: 6,
                        maxHeight: 130,
                        overflowY: 'auto',
                        borderRadius: 10,
                        border: '1px solid #e5e7eb',
                        padding: 8,
                        fontSize: '0.88rem',
                        color: '#374151'
                      }}
                    >
                      {parsedConteudo.testes.map((t) => (
                        <div
                          key={t.id ?? `${t.tipo}-${t.data}`}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 10,
                            padding: '4px 4px',
                            borderBottom: '1px solid #e5e7eb',
                            flexWrap: 'wrap'
                          }}
                        >
                          <span>{formatTipoTeste(t.tipo)}</span>
                          <span>
                            Resultado:{' '}
                            <strong>{formatResultadoTeste(t.resultado)}</strong>
                            {t.data && (
                              <>
                                {' '}
                                · Data:{' '}
                                {new Date(t.data).toLocaleDateString()}
                              </>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            ) : (
              <div
                style={{
                  marginTop: 8,
                  padding: 12,
                  borderRadius: 10,
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {relatorioSelecionado.conteudo}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
