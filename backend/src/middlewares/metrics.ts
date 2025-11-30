import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface MetricsRequest extends Request {
  startTime?: number;
}

export const metricsMiddleware = (req: MetricsRequest, res: Response, next: NextFunction) => {
  const timestampClienteHeader = req.headers['x-timestamp-cliente'];
  const timestampCliente =
    typeof timestampClienteHeader === 'string' ? parseInt(timestampClienteHeader, 10) : 0;

  const timestampServidorRecebe = Date.now();
  const latencia = timestampCliente && timestampCliente > 0 ? timestampServidorRecebe - timestampCliente : 0;

  req.startTime = Date.now();

  res.on('finish', async () => {
    try {
      const inicio = req.startTime || Date.now();
      const tempoProcessamento = Date.now() - inicio;
      const tempoResposta = latencia + tempoProcessamento;

      const usuariosHeader = req.headers['x-usuarios'];
      const usuariosValor =
        typeof usuariosHeader === 'string' ? parseInt(usuariosHeader, 10) : Number(usuariosHeader);
      const usuarios = Number.isFinite(usuariosValor) && usuariosValor > 0 ? usuariosValor : 1;

      await prisma.metrica.create({
        data: {
          rota: req.path,
          metodo: req.method,
          latencia,
          tempoProcessamento,
          tempoResposta,
          usuarios
        }
      });
    } catch (error) {
      console.error('Erro ao salvar métricas:', error);
    }
  });

  next();
};
