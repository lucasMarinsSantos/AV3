import axios from 'axios';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL_API || 'http://localhost:3000/api';
const ROTA_TESTE = process.env.METRICS_TARGET_ROUTE || '/aeronaves';
const DOCS_DIR = path.resolve(__dirname, '..', '..', 'docs');
const RELATORIO_PATH = path.join(DOCS_DIR, 'relatorio-qualidade.md');

const REQS_POR_CENARIO = Number(process.env.METRICS_REQS_POR_CENARIO || 20);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function enviarRequisicao(usuarios: number, token?: string) {
  const url = `${BASE_URL}${ROTA_TESTE}`;
  const timestampCliente = Date.now();

  const headers: Record<string, string> = {
    'x-timestamp-cliente': String(timestampCliente),
    'x-usuarios': String(usuarios)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    await axios.get(url, { headers });
  } catch {}
}

async function rodarCenario(usuarios: number, token?: string) {
  console.log(`Executando cenário com ${usuarios} usuário(s)...`);

  const promessas: Promise<void>[] = [];

  for (let i = 0; i < REQS_POR_CENARIO; i++) {
    for (let u = 0; u < usuarios; u++) {
      promessas.push(enviarRequisicao(usuarios, token));
    }
    await sleep(100);
  }

  await Promise.all(promessas);
  console.log(`Cenário ${usuarios} usuário(s) concluído.`);
}

async function obterTemposMedios() {
  const url = `${BASE_URL}/metricas/times`;
  const resp = await axios.get(url);
  return resp.data as {
    latencia: { usuarios: number; valorMs: number }[];
    tempoResposta: { usuarios: number; valorMs: number }[];
    tempoProcessamento: { usuarios: number; valorMs: number }[];
  };
}

function gerarMarkdownRelatorio(
  tempos: Awaited<ReturnType<typeof obterTemposMedios>>
): string {
  const getValor = (serie: { usuarios: number; valorMs: number }[], usuarios: number) =>
    serie.find((item) => item.usuarios === usuarios)?.valorMs ?? 0;

  const lat1 = getValor(tempos.latencia, 1);
  const lat5 = getValor(tempos.latencia, 5);
  const lat10 = getValor(tempos.latencia, 10);

  const proc1 = getValor(tempos.tempoProcessamento, 1);
  const proc5 = getValor(tempos.tempoProcessamento, 5);
  const proc10 = getValor(tempos.tempoProcessamento, 10);

  const resp1 = getValor(tempos.tempoResposta, 1);
  const resp5 = getValor(tempos.tempoResposta, 5);
  const resp10 = getValor(tempos.tempoResposta, 10);

  const latMediaGlobal = Math.round((lat1 + lat5 + lat10) / 3);
  const procMediaGlobal = Math.round((proc1 + proc5 + proc10) / 3);
  const respMediaGlobal = Math.round((resp1 + resp5 + resp10) / 3);

  const latFator10vs1 = lat1 > 0 ? (lat10 / lat1).toFixed(2) : 'N/A';
  const procFator10vs1 = proc1 > 0 ? (proc10 / proc1).toFixed(2) : 'N/A';
  const respFator10vs1 = resp1 > 0 ? (resp10 / resp1).toFixed(2) : 'N/A';

  return `# Relatório de Qualidade – Sistema Aerocode AV3

## 1. Contexto

Backend: Node.js + TypeScript + Express + Prisma + MySQL. Métricas coletadas na rota \`${ROTA_TESTE}\` via middleware de métricas e armazenadas na tabela \`Metrica\`.

## 2. Configuração dos testes

- Cenários: 1, 5 e 10 usuários simultâneos.
- Requisições por cenário: aproximadamente \`${REQS_POR_CENARIO}\` lotes.
- Cabeçalhos de métrica:
  - \`x-timestamp-cliente = Date.now()\`
  - \`x-usuarios = 1 | 5 | 10\`
- Agregação: médias calculadas via \`GET /metricas/times\`.

## 3. Resultados médios (ms)

### 3.1 Por cenário

| Usuários | Latência (ms) | Processamento (ms) | Resposta (ms) |
|----------|---------------|--------------------|---------------|
| 1        | ${lat1}       | ${proc1}           | ${resp1}      |
| 5        | ${lat5}       | ${proc5}           | ${resp5}      |
| 10       | ${lat10}      | ${proc10}          | ${resp10}     |

### 3.2 Médias globais

| Métrica         | Média global (ms) |
|-----------------|-------------------|
| Latência        | ${latMediaGlobal} |
| Processamento   | ${procMediaGlobal}|
| Resposta        | ${respMediaGlobal}|

### 3.3 Fator de degradação (10 vs 1 usuário)

| Métrica       | Fator 10 usuários / 1 usuário |
|---------------|-------------------------------|
| Latência      | ${latFator10vs1}              |
| Processamento | ${procFator10vs1}             |
| Resposta      | ${respFator10vs1}             |

## 4. Observações técnicas

- Tempos em milissegundos, calculados a partir das medições gravadas pela aplicação.
- Aumento esperado de tempos com maior concorrência (1 → 5 → 10 usuários).
- Dados prontos para geração de 3 gráficos (latência, processamento, resposta × usuários).
`;
}

async function main() {
  try {
    console.log('Iniciando testes de métricas AV3...');

    const token = process.env.METRICS_AUTH_TOKEN;

    await rodarCenario(1, token);
    await rodarCenario(5, token);
    await rodarCenario(10, token);

    console.log('Buscando tempos médios em /metricas/times...');
    const tempos = await obterTemposMedios();

    if (!fs.existsSync(DOCS_DIR)) {
      fs.mkdirSync(DOCS_DIR, { recursive: true });
    }

    const markdown = gerarMarkdownRelatorio(tempos);
    fs.writeFileSync(RELATORIO_PATH, markdown, 'utf-8');

    console.log(`Relatório de qualidade gerado em: ${RELATORIO_PATH}`);
  } catch (error) {
    console.error('Erro ao executar testes de métricas e gerar relatório:', error);
    process.exit(1);
  }
}

main();
