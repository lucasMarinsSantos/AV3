import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { metricsMiddleware } from '../middlewares/metrics';

const router = Router();
const prisma = new PrismaClient();

router.use(metricsMiddleware);

router.get('/', async (req: Request, res: Response) => {
try {
const testes = await prisma.teste.findMany({
include: { aeronave: true }
});
res.json(testes);
} catch (error) {
console.error('Erro ao buscar testes:', error);
res.status(500).json({ error: 'Erro ao buscar testes' });
}
});

router.get('/:id', async (req: Request, res: Response) => {
try {
const teste = await prisma.teste.findUnique({
where: { id: parseInt(req.params.id, 10) },
include: { aeronave: true }
});

if (!teste) {
  return res.status(404).json({ error: 'Teste não encontrado' });
}

res.json(teste);
} catch (error) {
console.error('Erro ao buscar teste:', error);
res.status(500).json({ error: 'Erro ao buscar teste' });
}
});

router.post(
'/',
[
body('tipo').isIn(['ELETRICO', 'HIDRAULICO', 'AERODINAMICO']).withMessage('Tipo inválido'),
body('resultado').isIn(['APROVADO', 'REPROVADO']).withMessage('Resultado inválido'),
body('aeronaveId').notEmpty().withMessage('ID da aeronave é obrigatório'),
body('data').isISO8601().withMessage('Data deve ser válida')
],
async (req: Request, res: Response) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(400).json({ errors: errors.array() });
}
try {
const { tipo, resultado, aeronaveId, data } = req.body;

  const teste = await prisma.teste.create({
    data: {
      tipo,
      resultado,
      aeronaveId,
      data: new Date(data)
    },
    include: { aeronave: true }
  });

  res.status(201).json(teste);
} catch (error) {
  console.error('ERRO AO CRIAR TESTE:', error);
  res.status(500).json({ error: String(error) });
}
}
);

router.put('/:id', async (req: Request, res: Response) => {
try {
const { data, ...rest } = req.body as { data?: string };

const updateData: any = {
  ...rest
};

if (data) {
  updateData.data = new Date(data);
}

const teste = await prisma.teste.update({
  where: { id: parseInt(req.params.id, 10) },
  data: updateData,
  include: { aeronave: true }
});

res.json(teste);
} catch (error) {
console.error('Erro ao atualizar teste:', error);
res.status(500).json({ error: 'Erro ao atualizar teste' });
}
});

router.delete('/:id', async (req: Request, res: Response) => {
try {
await prisma.teste.delete({
where: { id: parseInt(req.params.id, 10) }
});
res.status(204).send();
} catch (error) {
console.error('Erro ao deletar teste:', error);
res.status(500).json({ error: 'Erro ao deletar teste' });
}
});

export default router;