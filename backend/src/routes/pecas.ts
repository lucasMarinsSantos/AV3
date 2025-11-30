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

router.get('/', async (req: Request, res: Response) => {
  try {
    const pecas = await prisma.peca.findMany({
      include: { aeronave: true }
    });
    res.json(pecas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar peças' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const peca = await prisma.peca.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { aeronave: true }
    });
    
    if (!peca) {
      return res.status(404).json({ error: 'Peça não encontrada' });
    }
    
    res.json(peca);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar peça' });
  }
});

router.post('/',
  permissionsMiddleware(['ADMINISTRADOR', 'ENGENHEIRO']),
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('tipo').isIn(['NACIONAL', 'IMPORTADA']).withMessage('Tipo inválido'),
    body('fornecedor').notEmpty().withMessage('Fornecedor é obrigatório'),
    body('status').isIn(['EMPRODUCAO', 'EMTRANSPORTE', 'PRONTA']).withMessage('Status inválido'),
    body('aeronaveId').notEmpty().withMessage('ID da aeronave é obrigatório')
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const peca = await prisma.peca.create({
        data: req.body,
        include: { aeronave: true }
      });
      res.status(201).json(peca);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar peça' });
    }
  }
);

router.put('/:id',
  permissionsMiddleware(['ADMINISTRADOR', 'ENGENHEIRO']),
  async (req: Request, res: Response) => {
    try {
      const peca = await prisma.peca.update({
        where: { id: parseInt(req.params.id) },
        data: req.body,
        include: { aeronave: true }
      });
      res.json(peca);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar peça' });
    }
  }
);

router.delete('/:id',
  permissionsMiddleware(['ADMINISTRADOR']),
  async (req: Request, res: Response) => {
    try {
      await prisma.peca.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar peça' });
    }
  }
);

export default router;