import { useEffect, useState, type CSSProperties } from 'react';
import metricasService, {
  MetricasTempos,
  PontoMetrica
} from '../services/metricasService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const pageWrapperStyle: CSSProperties = {
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  paddingRight: 0,
  backgroundColor: 'transparent',
  minHeight: '100%'
};

const contentWrapperStyle: CSSProperties = {
  maxWidth: 1120,
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 20
};

const headerRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  flexWrap: 'wrap'
};

const pageTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1.8rem',
  fontWeight: 700,
  color: '#0f172a'
};

const pageSubtitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.95rem',
  color: '#4b5563',
  maxWidth: 520,
  lineHeight: 1.4
};

const lastUpdatedStyle: CSSProperties = {
  marginTop: 4,
  fontSize: '0.78rem',
  color: '#9ca3af'
};

const primaryButtonStyle = (loading: boolean): CSSProperties => ({
  padding: '8px 18px',
  borderRadius: 999,
  fontSize: '0.9rem',
  fontWeight: 500,
  border: '1px solid rgba(37,99,235,0.9)',
  backgroundColor: loading ? '#e5e7eb' : '#2563eb',
  color: loading ? '#4b5563' : '#f9fafb',
  cursor: loading ? 'not-allowed' : 'pointer',
  transition:
    'background-color 150ms ease, box-shadow 150ms ease, transform 80ms ease',
  boxShadow: loading ? 'none' : '0 8px 20px rgba(37,99,235,0.45)',
  whiteSpace: 'nowrap'
});

const summaryGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 14
};

const summaryCardBase: CSSProperties = {
  borderRadius: 14,
  padding: '14px 16px',
  border: '1px solid rgba(15,23,42,0.12)',
  boxShadow: '0 4px 14px rgba(15,23,42,0.06)',
  display: 'flex',
  flexDirection: 'column',
  gap: 4
};

const summaryLabelStyle: CSSProperties = {
  fontSize: '0.8rem',
  color: '#6b7280'
};

const summaryValueStyle: CSSProperties = {
  fontSize: '1.7rem',
  fontWeight: 700,
  color: '#111827'
};

const sectionCardStyle: CSSProperties = {
  borderRadius: 0,
  border: 'none',
  backgroundColor: 'transparent',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  boxShadow: 'none'
};

const scenarioHeaderContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: 4
};

const scenarioTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: 600,
  color: '#111827'
};

const scenarioSubtitleStyle: CSSProperties = {
  fontSize: '0.8rem',
  color: '#6b7280'
};

const scenarioStatsRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 24,
  fontSize: '0.86rem',
  color: '#4b5563',
  justifyContent: 'center',
  marginTop: 10,
  textAlign: 'left'
};

const scenarioColumnStyle: CSSProperties = {
  minWidth: 220
};

const scenarioColumnTitleStyle: CSSProperties = {
  display: 'block',
  marginBottom: 4,
  color: '#111827',
  fontWeight: 600,
  fontSize: '0.9rem'
};

const tableWrapperStyle: CSSProperties = {
  width: '100%',
  overflowX: 'auto',
  borderRadius: 10,
  border: '1px solid #e5e7eb',
  marginTop: 8
};

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: 560
};

const headerCellStyle: CSSProperties = {
  padding: '10px 12px',
  fontSize: '0.78rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  textAlign: 'left',
  color: '#111827',
  borderBottom: '1px solid #e5e7eb',
  whiteSpace: 'nowrap',
  backgroundColor: '#f9fafb'
};

const bodyCellStyle: CSSProperties = {
  padding: '8px 12px',
  fontSize: '0.86rem',
  color: '#111827',
  borderBottom: '1px solid #e5e7eb'
};

const chartsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 16,
  alignItems: 'stretch',
  marginTop: 8
};

const chartCardStyle: CSSProperties = {
  borderRadius: 12,
  padding: 12,
  backgroundColor: '#f9fafb',
  border: '1px solid rgba(148,163,184,0.5)',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  minHeight: 220
};

const chartTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#111827'
};

const chartBodyStyle: CSSProperties = {
  flex: 1,
  minHeight: 160
};

const errorBoxStyle: CSSProperties = {
  padding: '10px 12px',
  borderRadius: 10,
  backgroundColor: 'rgba(220,38,38,0.06)',
  border: '1px solid rgba(220,38,38,0.55)',
  color: '#b91c1c',
  fontSize: '0.9rem'
};

interface LinhaCenario {
  usuarios: number;
  latencia: number;
  resposta: number;
  processamento: number;
}

export default function Metricas() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [times, setTimes] = useState<MetricasTempos | null>(null);
  const [totalAmostras, setTotalAmostras] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadMetricas();
  }, []);

  const loadMetricas = async () => {
    setLoading(true);
    setErro(null);

    try {
      const [statsData, timesData] = await Promise.all([
        metricasService.getStats(),
        metricasService.getTimes()
      ]);

      setTotalAmostras(
        (statsData || []).reduce(
          (acc: number, item: { count: number }) => acc + item.count,
          0
        )
      );
      setTimes(timesData || null);
      setLastUpdated(new Date());
    } catch {
      setErro('Não foi possível carregar as métricas no momento.');
      setTotalAmostras(0);
      setTimes(null);
    } finally {
      setLoading(false);
    }
  };

  const latenciaSerie = times?.latencia || [];
  const respostaSerie = times?.tempoResposta || [];
  const processamentoSerie = times?.tempoProcessamento || [];

  const hasTimes =
    latenciaSerie.length > 0 ||
    respostaSerie.length > 0 ||
    processamentoSerie.length > 0;

  const buildBarData = (serie: PontoMetrica[], label: string) => ({
    labels: serie.map(
      p => `${p.usuarios} usuário${p.usuarios > 1 ? 's' : ''}`
    ),
    datasets: [
      {
        label: `${label} (ms)`,
        data: serie.map(p => p.valorMs),
        backgroundColor: 'rgba(37,99,235,0.85)',
        hoverBackgroundColor: 'rgba(37,99,235,1)',
        borderRadius: 6,
        barThickness: 32
      }
    ]
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false as const,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.y} ms`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(148,163,184,0.35)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  const buildResumoTempo = (serie: PontoMetrica[]) => {
    if (!serie.length) {
      return { min: 0, max: 0, media: 0 };
    }

    const valores = serie.map(p => p.valorMs);
    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const media = valores.reduce((acc, v) => acc + v, 0) / valores.length;

    return { min, max, media: Math.round(media) };
  };

  const resumoLatencia = buildResumoTempo(latenciaSerie);
  const resumoResposta = buildResumoTempo(respostaSerie);
  const resumoProcessamento = buildResumoTempo(processamentoSerie);

  const usuariosCenarios = [1, 5, 10];

  const linhasCenarios: LinhaCenario[] = usuariosCenarios.map(usuarios => {
    const lat =
      latenciaSerie.find(p => p.usuarios === usuarios)?.valorMs || 0;
    const resp =
      respostaSerie.find(p => p.usuarios === usuarios)?.valorMs || 0;
    const proc =
      processamentoSerie.find(p => p.usuarios === usuarios)?.valorMs || 0;

    return {
      usuarios,
      latencia: lat,
      resposta: resp,
      processamento: proc
    };
  });

  const linha1 = linhasCenarios.find(l => l.usuarios === 1);
  const linha10 = linhasCenarios.find(l => l.usuarios === 10);

  const fatorLatencia =
    linha1 && linha10 && linha1.latencia > 0
      ? (linha10.latencia / linha1.latencia).toFixed(2)
      : '—';

  const fatorResposta =
    linha1 && linha10 && linha1.resposta > 0
      ? (linha10.resposta / linha1.resposta).toFixed(2)
      : '—';

  const fatorProcessamento =
    linha1 && linha10 && linha1.processamento > 0
      ? (linha10.processamento / linha1.processamento).toFixed(2)
      : '—';

  const lastUpdatedText =
    lastUpdated != null
      ? `${lastUpdated.toLocaleDateString()} ${lastUpdated.toLocaleTimeString()}`
      : '—';

  return (
    <div style={pageWrapperStyle}>
      <div style={contentWrapperStyle}>
        <header style={headerRowStyle}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              minWidth: 260
            }}
          >
            <h1 style={pageTitleStyle}>Métricas</h1>
            <p style={pageSubtitleStyle}>
              Monitoramento de latência, tempo de resposta e processamento do
              backend em diferentes cargas de usuários.
            </p>
            <span style={lastUpdatedStyle}>
              Última atualização: {lastUpdatedText}
            </span>
          </div>

          <button
            type="button"
            onClick={loadMetricas}
            disabled={loading}
            style={primaryButtonStyle(loading)}
          >
            {loading ? 'Atualizando...' : 'Atualizar métricas'}
          </button>
        </header>

        {erro && <div style={errorBoxStyle}>{erro}</div>}

        <section style={summaryGridStyle}>
          <div style={summaryCardBase}>
            <span style={summaryLabelStyle}>Amostras registradas</span>
            <span style={summaryValueStyle}>{totalAmostras}</span>
          </div>

          <div
            style={{
              ...summaryCardBase,
              backgroundColor: '#e0ecff',
              border: '1px solid rgba(37,99,235,0.35)'
            }}
          >
            <span
              style={{
                ...summaryLabelStyle,
                color: '#1d4ed8'
              }}
            >
              Latência média (global)
            </span>
            <span style={summaryValueStyle}>{resumoLatencia.media} ms</span>
          </div>

          <div
            style={{
              ...summaryCardBase,
              backgroundColor: '#ecfdf3',
              border: '1px solid rgba(22,163,74,0.35)'
            }}
          >
            <span
              style={{
                ...summaryLabelStyle,
                color: '#166534'
              }}
            >
              Tempo resposta médio (global)
            </span>
            <span
              style={{
                ...summaryValueStyle,
                color: '#14532d'
              }}
            >
              {resumoResposta.media} ms
            </span>
          </div>

          <div
            style={{
              ...summaryCardBase,
              backgroundColor: '#fefce8',
              border: '1px solid rgba(234,179,8,0.35)'
            }}
          >
            <span
              style={{
                ...summaryLabelStyle,
                color: '#854d0e'
              }}
            >
              Tempo processamento médio (global)
            </span>
            <span
              style={{
                ...summaryValueStyle,
                color: '#713f12'
              }}
            >
              {resumoProcessamento.media} ms
            </span>
          </div>
        </section>

        <section style={sectionCardStyle}>
          <div style={scenarioHeaderContainerStyle}>
            <h2 style={scenarioTitleStyle}>Cenários 1 / 5 / 10 usuários</h2>
            {hasTimes && !loading && (
              <span style={scenarioSubtitleStyle}>
                Todas as métricas em milissegundos (ms)
              </span>
            )}
          </div>

          {loading || !hasTimes ? (
            <p
              style={{
                margin: 0,
                fontSize: '0.95rem',
                color: '#6b7280',
                textAlign: 'center'
              }}
            >
              {loading
                ? 'Carregando tempos de métricas...'
                : 'Ainda não há dados registrados para os cenários de usuários.'}
            </p>
          ) : (
            <>
              <div style={scenarioStatsRowStyle}>
                <div style={scenarioColumnStyle}>
                  <span style={scenarioColumnTitleStyle}>Mín / Máx (ms)</span>
                  <div>
                    Latência: {resumoLatencia.min} / {resumoLatencia.max}
                  </div>
                  <div>
                    Resposta: {resumoResposta.min} / {resumoResposta.max}
                  </div>
                  <div>
                    Processamento: {resumoProcessamento.min} /{' '}
                    {resumoProcessamento.max}
                  </div>
                </div>

                <div style={scenarioColumnStyle}>
                  <span style={scenarioColumnTitleStyle}>
                    Fator 10 usuários / 1 usuário
                  </span>
                  <div>Latência: {fatorLatencia}x</div>
                  <div>Resposta: {fatorResposta}x</div>
                  <div>Processamento: {fatorProcessamento}x</div>
                </div>
              </div>

              <div style={tableWrapperStyle}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={headerCellStyle}>Usuários</th>
                      <th style={headerCellStyle}>Latência (ms)</th>
                      <th style={headerCellStyle}>Tempo resposta (ms)</th>
                      <th style={headerCellStyle}>Tempo processamento (ms)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhasCenarios.map((linha, index) => (
                      <tr
                        key={linha.usuarios}
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? '#ffffff' : '#f9fafb'
                        }}
                      >
                        <td style={bodyCellStyle}>{linha.usuarios}</td>
                        <td style={bodyCellStyle}>{linha.latencia}</td>
                        <td style={bodyCellStyle}>{linha.resposta}</td>
                        <td style={bodyCellStyle}>{linha.processamento}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={chartsGridStyle}>
                <div style={chartCardStyle}>
                  <h3 style={chartTitleStyle}>Latência (ms)</h3>
                  <div style={chartBodyStyle}>
                    <Bar
                      data={buildBarData(latenciaSerie, 'Latência')}
                      options={chartOptions}
                    />
                  </div>
                </div>

                <div style={chartCardStyle}>
                  <h3 style={chartTitleStyle}>Tempo de resposta (ms)</h3>
                  <div style={chartBodyStyle}>
                    <Bar
                      data={buildBarData(
                        respostaSerie,
                        'Tempo de resposta'
                      )}
                      options={chartOptions}
                    />
                  </div>
                </div>

                <div style={chartCardStyle}>
                  <h3 style={chartTitleStyle}>Tempo de processamento (ms)</h3>
                  <div style={chartBodyStyle}>
                    <Bar
                      data={buildBarData(
                        processamentoSerie,
                        'Tempo de processamento'
                      )}
                      options={chartOptions}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
