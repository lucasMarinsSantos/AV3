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
    const aeronaves = await prisma.aeronave.findMany({
      include: {
        pecas: true,
        etapas: true,
        testes: true,
        relatorio: true
      }
    });
    res.json(aeronaves);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar aeronaves' });
  }
});

router.get('/:codigo', async (req: Request, res: Response) => {
  try {
    const aeronave = await prisma.aeronave.findUnique({
      where: { codigo: req.params.codigo },
      include: {
        pecas: true,
        etapas: {
          include: { funcionarios: true }
        },
        testes: true,
        relatorio: true
      }
    });
    
    if (!aeronave) {
      return res.status(404).json({ error: 'Aeronave não encontrada' });
    }
    
    res.json(aeronave);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar aeronave' });
  }
});

router.post('/',
  permissionsMiddleware(['ADMINISTRADOR', 'ENGENHEIRO']),
  [
    body('codigo').notEmpty().withMessage('Código é obrigatório'),
    body('modelo').notEmpty().withMessage('Modelo é obrigatório'),
    body('tipo').isIn(['COMERCIAL', 'MILITAR']).withMessage('Tipo inválido'),
    body('capacidade').isInt({ min: 1 }).withMessage('Capacidade deve ser maior que 0'),
    body('alcance').isInt({ min: 1 }).withMessage('Alcance deve ser maior que 0')
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const aeronave = await prisma.aeronave.create({
        data: req.body
      });
      res.status(201).json(aeronave);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar aeronave' });
    }
  }
);

router.put('/:codigo',
  permissionsMiddleware(['ADMINISTRADOR', 'ENGENHEIRO']),
  async (req: Request, res: Response) => {
    try {
      const aeronave = await prisma.aeronave.update({
        where: { codigo: req.params.codigo },
        data: req.body
      });
      res.json(aeronave);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar aeronave' });
    }
  }
);

router.delete('/:codigo',
  permissionsMiddleware(['ADMINISTRADOR']),
  async (req: Request, res: Response) => {
    try {
      await prisma.aeronave.delete({
        where: { codigo: req.params.codigo }
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar aeronave' });
    }
  }
);

export default router;
