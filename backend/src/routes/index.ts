import { Router } from 'express';
import aeronavesRoutes from './aeronaves';
import pecasRoutes from './pecas';
import etapasRoutes from './etapas';
import funcionariosRoutes from './funcionarios';
import testesRoutes from './testes';
import relatoriosRoutes from './relatorios';
import metricasRoutes from './metricas';
import authRoutes from './auth';

const router = Router();

router.use('/auth', authRoutes);
router.use('/aeronaves', aeronavesRoutes);
router.use('/pecas', pecasRoutes);
router.use('/etapas', etapasRoutes);
router.use('/funcionarios', funcionariosRoutes);
router.use('/testes', testesRoutes);
router.use('/relatorios', relatoriosRoutes);
router.use('/metricas', metricasRoutes);

export default router;
