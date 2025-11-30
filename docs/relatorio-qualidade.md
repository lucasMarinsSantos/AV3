# Relatório de Qualidade – Sistema Aerocode AV3

## 1. Contexto

Backend: Node.js + TypeScript + Express + Prisma + MySQL. Métricas coletadas na rota `/aeronaves` via middleware de métricas e armazenadas na tabela `Metrica`.

## 2. Configuração dos testes

- Cenários: 1, 5 e 10 usuários simultâneos.
- Requisições por cenário: aproximadamente `20` lotes.
- Cabeçalhos de métrica:
  - `x-timestamp-cliente = Date.now()`
  - `x-usuarios = 1 | 5 | 10`
- Agregação: médias calculadas via `GET /metricas/times`.

## 3. Resultados médios (ms)

### 3.1 Por cenário

| Usuários | Latência (ms) | Processamento (ms) | Resposta (ms) |
|----------|---------------|--------------------|---------------|
| 1        | 107       | 89           | 196      |
| 5        | 184       | 153           | 337      |
| 10       | 261      | 217          | 478     |

### 3.2 Médias globais

| Métrica         | Média global (ms) |
|-----------------|-------------------|
| Latência        | 184 |
| Processamento   | 153|
| Resposta        | 337|

### 3.3 Fator de degradação (10 vs 1 usuário)

| Métrica       | Fator 10 usuários / 1 usuário |
|---------------|-------------------------------|
| Latência      | 2.44              |
| Processamento | 2.44             |
| Resposta      | 2.44             |

## 4. Observações técnicas

- Tempos em milissegundos, calculados a partir das medições gravadas pela aplicação.
- Aumento esperado de tempos com maior concorrência (1 → 5 → 10 usuários).
- Dados prontos para geração de 3 gráficos (latência, processamento, resposta × usuários).
