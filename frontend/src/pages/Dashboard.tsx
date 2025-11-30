import { useEffect, useState } from 'react';
import aeronaveService from '../services/aeronaveService';
import etapaService from '../services/etapaService';
import testeService from '../services/testeService';
import metricasService from '../services/metricasService';

type ResumoValor = string | number;

interface AeronaveLike {
  status?: string;
  estado?: string;
  tipo?: string;
}

interface EtapaLike {
  status?: string;
}

interface TesteLike {
  resultado?: string;
  tipo?: string;
}

function Dashboard() {
  const [aeronavesTotal, setAeronavesTotal] = useState<ResumoValor>('–');
  const [aeronavesEmProducao, setAeronavesEmProducao] = useState<ResumoValor>('–');
  const [aeronavesComerciais, setAeronavesComerciais] = useState<ResumoValor>('–');

  const [etapasPendentes, setEtapasPendentes] = useState<ResumoValor>('–');
  const [etapasAndamento, setEtapasAndamento] = useState<ResumoValor>('–');

  const [testesTotais, setTestesTotais] = useState<ResumoValor>('–');
  const [testesAprovados, setTestesAprovados] = useState<ResumoValor>('–');
  const [testesReprovados, setTestesReprovados] = useState<ResumoValor>('–');

  const [metricasTotal, setMetricasTotal] = useState<ResumoValor>('–');
  const [metricasLatencia, setMetricasLatencia] = useState<ResumoValor>('–');
  const [metricasResposta, setMetricasResposta] = useState<ResumoValor>('–');

  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const calcularPercentual = (parte: number, total: number) => {
    if (!total || total <= 0) return '0%';
    const p = (parte / total) * 100;
    return `${p.toFixed(0)}%`;
  };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);

        const aeroSrv: any = aeronaveService;
        let aeronaves: AeronaveLike[] = [];

        if (aeroSrv.getAll) {
          aeronaves = await aeroSrv.getAll();
        } else if (aeroSrv.list) {
          aeronaves = await aeroSrv.list();
        } else if (aeroSrv.get) {
          const resposta = await aeroSrv.get();
          aeronaves = Array.isArray(resposta) ? resposta : [];
        }

        setAeronavesTotal(aeronaves.length || 0);

        const emProducao = aeronaves.filter((a) => {
          const status = (a.status || a.estado || '').toString().toLowerCase();
          return status.includes('produc') || status.includes('andamento');
        }).length;
        setAeronavesEmProducao(emProducao);

        const comerciais = aeronaves.filter((a) => {
          const tipo = (a.tipo || '').toString().toLowerCase();
          return tipo.includes('comercial');
        }).length;
        setAeronavesComerciais(comerciais);

        const etapaSrv: any = etapaService;
        let etapas: EtapaLike[] = [];

        if (etapaSrv.getAll) {
          etapas = await etapaSrv.getAll();
        } else if (etapaSrv.list) {
          etapas = await etapaSrv.list();
        } else if (etapaSrv.get) {
          const resposta = await etapaSrv.get();
          etapas = Array.isArray(resposta) ? resposta : [];
        }

        const pendentes = etapas.filter((e) => {
          const s = (e.status || '').toString().toLowerCase();
          return s.includes('pendente');
        }).length;
        const andamento = etapas.filter((e) => {
          const s = (e.status || '').toString().toLowerCase();
          return s.includes('andamento');
        }).length;

        setEtapasPendentes(pendentes);
        setEtapasAndamento(andamento);

        const testeSrv: any = testeService;
        let testes: TesteLike[] = [];

        if (testeSrv.getAll) {
          testes = await testeSrv.getAll();
        } else if (testeSrv.list) {
          testes = await testeSrv.list();
        } else if (testeSrv.get) {
          const resposta = await testeSrv.get();
          testes = Array.isArray(resposta) ? resposta : [];
        }

        setTestesTotais(testes.length || 0);

        const aprovados = testes.filter((t) => {
          const r = (t.resultado || '').toString().toLowerCase();
          return r.includes('aprov');
        }).length;
        const reprovados = testes.filter((t) => {
          const r = (t.resultado || '').toString().toLowerCase();
          return r.includes('reprov');
        }).length;

        setTestesAprovados(aprovados);
        setTestesReprovados(reprovados);

        const metSrv: any = metricasService;
        let metricas: any[] = [];

        if (metSrv.getAll) {
          metricas = await metSrv.getAll();
        } else if (metSrv.list) {
          metricas = await metSrv.list();
        } else if (metSrv.get) {
          const resposta = await metSrv.get();
          metricas = Array.isArray(resposta) ? resposta : [];
        }

        setMetricasTotal(metricas.length || 0);

        if (metricas.length > 0) {
          const somaLatencia = metricas.reduce((acc, m) => acc + (Number(m.latencia) || 0), 0);
          const somaResposta = metricas.reduce((acc, m) => acc + (Number(m.tempoResposta) || 0), 0);
          const mediaLat = somaLatencia / metricas.length;
          const mediaResp = somaResposta / metricas.length;

          setMetricasLatencia(`${mediaLat.toFixed(0)} ms`);
          setMetricasResposta(`${mediaResp.toFixed(0)} ms`);
        } else {
          setMetricasLatencia('–');
          setMetricasResposta('–');
        }

        setUltimaAtualizacao(new Date().toLocaleString());
      } catch {
        setAeronavesTotal('erro');
        setAeronavesEmProducao('erro');
        setAeronavesComerciais('erro');
        setEtapasPendentes('erro');
        setEtapasAndamento('erro');
        setTestesTotais('erro');
        setTestesAprovados('erro');
        setTestesReprovados('erro');
        setMetricasTotal('erro');
        setMetricasLatencia('erro');
        setMetricasResposta('erro');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const percentualReprovados =
    typeof testesTotais === 'number' && typeof testesReprovados === 'number'
      ? calcularPercentual(testesReprovados, testesTotais)
      : '0%';

  const percentualAprovados =
    typeof testesTotais === 'number' && typeof testesAprovados === 'number'
      ? calcularPercentual(testesAprovados, testesTotais)
      : '0%';

  const percentualEtapasPendentes =
    typeof etapasPendentes === 'number' && typeof etapasAndamento === 'number'
      ? calcularPercentual(etapasPendentes, etapasPendentes + etapasAndamento)
      : '0%';

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
          gap: 24
        }}
      >
        <header
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '1.7rem',
              fontWeight: 600,
              color: '#111827'
            }}
          >
            Visão geral do sistema
          </h1>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: 12,
              flexWrap: 'wrap'
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '0.95rem',
                color: '#4b5563'
              }}
            >
              Produção de aeronaves, andamento das etapas, testes realizados e desempenho da aplicação.
            </p>
            {ultimaAtualizacao && (
              <span
                style={{
                  fontSize: '0.8rem',
                  color: '#6b7280'
                }}
              >
                Última atualização: {ultimaAtualizacao}
              </span>
            )}
          </div>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1.1fr)',
            gap: 18
          }}
        >
          <div
            style={{
              borderRadius: 14,
              border: '1px solid rgba(37,99,235,0.28)',
              backgroundColor: '#dde9ff',
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#1d4ed8'
              }}
            >
              Indicadores de risco
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: 10
              }}
            >
              <div
                style={{
                  borderRadius: 10,
                  backgroundColor: '#fef2f2',
                  padding: '8px 10px',
                  border: '1px solid rgba(248,113,113,0.8)'
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#b91c1c'
                  }}
                >
                  Testes reprovados
                </div>
                <div
                  style={{
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 6
                  }}
                >
                  <span
                    style={{
                      fontSize: '1.3rem',
                      fontWeight: 600,
                      color: '#b91c1c'
                    }}
                  >
                    {testesReprovados}
                  </span>
                  <span
                    style={{
                      fontSize: '0.86rem',
                      color: '#9ca3af'
                    }}
                  >
                    {percentualReprovados}
                  </span>
                </div>
              </div>

              <div
                style={{
                  borderRadius: 10,
                  backgroundColor: '#fffbeb',
                  padding: '8px 10px',
                  border: '1px solid rgba(245,158,11,0.7)'
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#92400e'
                  }}
                >
                  Etapas pendentes
                </div>
                <div
                  style={{
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 6
                  }}
                >
                  <span
                    style={{
                      fontSize: '1.3rem',
                      fontWeight: 600,
                      color: '#92400e'
                    }}
                  >
                    {etapasPendentes}
                  </span>
                  <span
                    style={{
                      fontSize: '0.86rem',
                      color: '#9ca3af'
                    }}
                  >
                    {percentualEtapasPendentes}
                  </span>
                </div>
              </div>

              <div
                style={{
                  borderRadius: 10,
                  backgroundColor: '#eef2ff',
                  padding: '8px 10px',
                  border: '1px solid rgba(37,99,235,0.35)'
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#1d4ed8'
                  }}
                >
                  Latência média
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    color: '#111827'
                  }}
                >
                  {metricasLatencia}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 10,
                  backgroundColor: '#eef2ff',
                  padding: '8px 10px',
                  border: '1px solid rgba(37,99,235,0.25)'
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#1d4ed8'
                  }}
                >
                  Tempo de resposta médio
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    color: '#111827'
                  }}
                >
                  {metricasResposta}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              borderRadius: 14,
              border: '1px solid rgba(15,23,42,0.12)',
              backgroundColor: '#ffffff',
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#6b7280'
                }}
              >
                Resumo rápido
              </span>
              {loading && (
                <span
                  style={{
                    fontSize: '0.85rem',
                    color: '#6b7280'
                  }}
                >
                  Carregando...
                </span>
              )}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: 10
              }}
            >
              <div
                style={{
                  borderRadius: 10,
                  backgroundColor: '#f9fafb',
                  padding: '8px 10px'
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#6b7280'
                  }}
                >
                  Aeronaves cadastradas
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: '1.4rem',
                    fontWeight: 600
                  }}
                >
                  {aeronavesTotal}
                </div>
              </div>
              <div
                style={{
                  borderRadius: 10,
                  backgroundColor: '#f9fafb',
                  padding: '8px 10px'
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#6b7280'
                  }}
                >
                  Em produção
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: '1.4rem',
                    fontWeight: 600
                  }}
                >
                  {aeronavesEmProducao}
                </div>
              </div>
              <div
                style={{
                  borderRadius: 10,
                  backgroundColor: '#f9fafb',
                  padding: '8px 10px'
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#6b7280'
                  }}
                >
                  Aeronaves comerciais
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: '1.4rem',
                    fontWeight: 600
                  }}
                >
                  {aeronavesComerciais}
                </div>
              </div>
              <div
                style={{
                  borderRadius: 10,
                  backgroundColor: '#f9fafb',
                  padding: '8px 10px'
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#6b7280'
                  }}
                >
                  Testes registrados
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: '1.4rem',
                    fontWeight: 600
                  }}
                >
                  {testesTotais}
                </div>
              </div>
              <div
                style={{
                  borderRadius: 10,
                  backgroundColor: '#f9fafb',
                  padding: '8px 10px'
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#6b7280'
                  }}
                >
                  Testes aprovados
                </div>
                <div
                  style={{
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 6
                  }}
                >
                  <span
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 600
                    }}
                  >
                    {testesAprovados}
                  </span>
                  <span
                    style={{
                      fontSize: '0.86rem',
                      color: '#16a34a'
                    }}
                  >
                    {percentualAprovados}
                  </span>
                </div>
              </div>
              <div
                style={{
                  borderRadius: 10,
                  backgroundColor: '#f9fafb',
                  padding: '8px 10px'
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#6b7280'
                  }}
                >
                  Registros de métricas
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: '1.4rem',
                    fontWeight: 600
                  }}
                >
                  {metricasTotal}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
