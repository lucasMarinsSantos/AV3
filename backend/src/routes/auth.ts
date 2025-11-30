import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'aerocode-secret-key';

router.post('/login',
  [
    body('usuario').notEmpty().withMessage('Usuário é obrigatório'),
    body('senha').notEmpty().withMessage('Senha é obrigatória')
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { usuario, senha } = req.body;

      const funcionario = await prisma.funcionario.findUnique({
        where: { usuario }
      });

      if (!funcionario) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const senhaValida = await bcrypt.compare(senha, funcionario.senha);

      if (!senhaValida) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: funcionario.id, nivelPermissao: funcionario.nivelPermissao },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        usuario: {
          id: funcionario.id,
          nome: funcionario.nome,
          usuario: funcionario.usuario,
          nivelPermissao: funcionario.nivelPermissao
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao realizar login' });
    }
  }
);

export default router;