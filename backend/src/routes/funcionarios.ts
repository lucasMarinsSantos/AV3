import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { metricsMiddleware } from '../middlewares/metrics';

const router = Router();
const prisma = new PrismaClient();

router.use(metricsMiddleware);

router.get('/', async (req: Request, res: Response) => {
try {
const funcionarios = await prisma.funcionario.findMany({
select: {
id: true,
nome: true,
telefone: true,
endereco: true,
usuario: true,
nivelPermissao: true
}
});
res.json(funcionarios);
} catch (error) {
console.error('Erro ao buscar funcionários:', error);
res.status(500).json({ error: 'Erro ao buscar funcionários' });
}
});

router.get('/:id', async (req: Request, res: Response) => {
try {
const funcionario = await prisma.funcionario.findUnique({
where: { id: parseInt(req.params.id, 10) },
select: {
id: true,
nome: true,
telefone: true,
endereco: true,
usuario: true,
nivelPermissao: true,
etapas: true
}
});

if (!funcionario) {
  return res.status(404).json({ error: 'Funcionário não encontrado' });
}

res.json(funcionario);
} catch (error) {
console.error('Erro ao buscar funcionário:', error);
res.status(500).json({ error: 'Erro ao buscar funcionário' });
}
});

router.post(
'/',
[
body('nome').notEmpty().withMessage('Nome é obrigatório'),
body('telefone').notEmpty().withMessage('Telefone é obrigatório'),
body('endereco').notEmpty().withMessage('Endereço é obrigatório'),
body('usuario').notEmpty().withMessage('Usuário é obrigatório'),
body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
body('nivelPermissao')
.isIn(['ADMINISTRADOR', 'ENGENHEIRO', 'OPERADOR'])
.withMessage('Nível de permissão inválido')
],
async (req: Request, res: Response) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(400).json({ errors: errors.array() });
}

try {
  const { nome, telefone, endereco, usuario, senha, nivelPermissao } = req.body;

  const usuarioExiste = await prisma.funcionario.findUnique({
    where: { usuario }
  });

  if (usuarioExiste) {
    return res.status(400).json({ error: 'Usuário já existe' });
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const funcionario = await prisma.funcionario.create({
    data: {
      nome,
      telefone,
      endereco,
      usuario,
      senha: senhaHash,
      nivelPermissao
    }
  });

  res.status(201).json({
    id: funcionario.id,
    nome: funcionario.nome,
    telefone: funcionario.telefone,
    endereco: funcionario.endereco,
    usuario: funcionario.usuario,
    nivelPermissao: funcionario.nivelPermissao
  });
} catch (error) {
  console.error('Erro ao criar funcionário:', error);
  res.status(500).json({ error: 'Erro ao criar funcionário' });
}
}
);

router.put('/:id', async (req: Request, res: Response) => {
try {
const { senha, ...data } = req.body;

const updateData: any = data;

if (senha) {
  updateData.senha = await bcrypt.hash(senha, 10);
}

const funcionario = await prisma.funcionario.update({
  where: { id: parseInt(req.params.id, 10) },
  data: updateData,
  select: {
    id: true,
    nome: true,
    telefone: true,
    endereco: true,
    usuario: true,
    nivelPermissao: true
  }
});

res.json(funcionario);
} catch (error) {
console.error('Erro ao atualizar funcionário:', error);
res.status(500).json({ error: 'Erro ao atualizar funcionário' });
}
});

router.delete('/:id', async (req: Request, res: Response) => {
try {
await prisma.funcionario.delete({
where: { id: parseInt(req.params.id, 10) }
});
res.status(204).send();
} catch (error) {
console.error('Erro ao deletar funcionário:', error);
res.status(500).json({ error: 'Erro ao deletar funcionário' });
}
});

export default router;