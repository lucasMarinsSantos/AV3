import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { metricsMiddleware } from '../middlewares/metrics';

const router = Router();
const prisma = new PrismaClient();

router.use(metricsMiddleware);

router.get('/', async (req: Request, res: Response) => {
  try {
    const metricas = await prisma.metrica.findMany({
      orderBy: { timestamp: 'desc' }
    });
    res.json(metricas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar métricas' });
  }
});

router.get('/rota/:rota', async (req: Request, res: Response) => {
  try {
    const metricas = await prisma.metrica.findMany({
      where: { rota: req.params.rota },
      orderBy: { timestamp: 'desc' }
    });
    res.json(metricas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar métricas' });
  }
});

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const metricas = await prisma.metrica.findMany();

    type MetricaType = (typeof metricas)[number];

    const stats = [
      {
        status: 'ALTA_LATENCIA',
        count: metricas.filter((m: MetricaType) => m.latencia > 1000).length
      },
      {
        status: 'BAIXA_LATENCIA',
        count: metricas.filter((m: MetricaType) => m.latencia <= 1000).length
      }
    ];

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular estatísticas' });
  }
});

router.get('/times', async (req: Request, res: Response) => {
  try {
    const metricas = await prisma.metrica.findMany();

    type MetricaType = (typeof metricas)[number];

    const cenarios = [1, 5, 10];

    const buildSerie = (campo: keyof MetricaType): { usuarios: number; valorMs: number }[] =>
      cenarios.map((usuarios: number) => {
        const grupo = metricas.filter((m: MetricaType) => m.usuarios === usuarios);
        if (grupo.length === 0) {
          return { usuarios, valorMs: 0 };
        }
        const soma = grupo.reduce((acc: number, m: MetricaType) => acc + (m[campo] as number), 0);
        const media = soma / grupo.length;
        return { usuarios, valorMs: Math.round(media) };
      });

    const resposta = {
      latencia: buildSerie('latencia'),
      tempoResposta: buildSerie('tempoResposta'),
      tempoProcessamento: buildSerie('tempoProcessamento')
    };

    res.json(resposta);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular tempos de métricas' });
  }
});

export default router;
