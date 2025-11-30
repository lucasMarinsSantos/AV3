import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { metricsMiddleware } from '../middlewares/metrics';
import { authMiddleware } from '../middlewares/auth';
import { permissionsMiddleware } from '../middlewares/permissions';

const router = Router();
const prisma = new PrismaClient();

router.use(metricsMiddleware);
router.use(authMiddleware);

const ORDEM_STATUS = ['PENDENTE', 'ANDAMENTO', 'CONCLUIDA'] as const;
type StatusEtapaTipo = (typeof ORDEM_STATUS)[number];

function podeTransicionarStatus(
  atual: StatusEtapaTipo,
  novo: StatusEtapaTipo
): boolean {
  if (atual === novo) return true;
  const idxAtual = ORDEM_STATUS.indexOf(atual);
  const idxNovo = ORDEM_STATUS.indexOf(novo);
  return idxNovo === idxAtual + 1;
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const etapas = await prisma.etapa.findMany({
      include: {
        aeronave: true,
        funcionarios: true
      }
    });
    res.json(etapas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar etapas' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const etapa = await prisma.etapa.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        aeronave: true,
        funcionarios: true
      }
    });

    if (!etapa) {
      return res.status(404).json({ error: 'Etapa não encontrada' });
    }

    res.json(etapa);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar etapa' });
  }
});

router.post(
  '/',
  permissionsMiddleware(['ADMINISTRADOR', 'ENGENHEIRO']),
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('prazo').isISO8601().withMessage('Prazo deve ser uma data válida'),
    body('aeronaveId').notEmpty().withMessage('ID da aeronave é obrigatório')
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { nome, prazo, aeronaveId } = req.body;

      const etapa = await prisma.etapa.create({
        data: {
          nome,
          prazo: new Date(prazo),
          status: 'PENDENTE',
          aeronaveId
        },
        include: {
          aeronave: true,
          funcionarios: true
        }
      });
      res.status(201).json(etapa);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar etapa' });
    }
  }
);

router.put(
  '/:id',
  permissionsMiddleware(['ADMINISTRADOR', 'ENGENHEIRO']),
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);

      const etapaAtual = await prisma.etapa.findUnique({
        where: { id }
      });

      if (!etapaAtual) {
        return res.status(404).json({ error: 'Etapa não encontrada' });
      }

      const dadosAtualizacao: any = { ...req.body };

      if (dadosAtualizacao.status) {
        const statusAtual = etapaAtual.status as StatusEtapaTipo;
        const novoStatus = dadosAtualizacao
          .status as StatusEtapaTipo;

        if (!ORDEM_STATUS.includes(novoStatus)) {
          return res
            .status(400)
            .json({ error: 'Status de etapa inválido' });
        }

        const transicaoValida = podeTransicionarStatus(
          statusAtual,
          novoStatus
        );

        if (!transicaoValida) {
          return res.status(400).json({
            error:
              'Transição de status inválida. Ordem permitida: PENDENTE → ANDAMENTO → CONCLUIDA'
          });
        }
      }

      const etapa = await prisma.etapa.update({
        where: { id },
        data: dadosAtualizacao,
        include: {
          aeronave: true,
          funcionarios: true
        }
      });
      res.json(etapa);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar etapa' });
    }
  }
);

router.delete(
  '/:id',
  permissionsMiddleware(['ADMINISTRADOR']),
  async (req: Request, res: Response) => {
    try {
      await prisma.etapa.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar etapa' });
    }
  }
);

router.post(
  '/:id/funcionarios',
  permissionsMiddleware(['ADMINISTRADOR', 'ENGENHEIRO']),
  [body('funcionarioId').isInt().withMessage('ID do funcionário é obrigatório')],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const etapa = await prisma.etapa.update({
        where: { id: parseInt(req.params.id) },
        data: {
          funcionarios: {
            connect: { id: req.body.funcionarioId }
          }
        },
        include: { funcionarios: true }
      });
      res.json(etapa);
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Erro ao adicionar funcionário à etapa' });
    }
  }
);

export default router;
