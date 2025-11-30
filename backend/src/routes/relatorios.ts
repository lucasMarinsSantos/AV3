import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import PDFDocument from 'pdfkit';
import { metricsMiddleware } from '../middlewares/metrics';
import { authMiddleware } from '../middlewares/auth';
import { permissionsMiddleware } from '../middlewares/permissions';

const router = Router();
const prisma = new PrismaClient();

router.use(metricsMiddleware);
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  try {
    const relatorios = await prisma.relatorio.findMany({
      include: { aeronave: true }
    });
    res.json(relatorios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar relatórios' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const relatorio = await prisma.relatorio.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: { aeronave: true }
    });

    if (!relatorio) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    res.json(relatorio);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar relatório' });
  }
});

router.get('/:id/export-pdf', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    const relatorio = await prisma.relatorio.findUnique({
      where: { id },
      include: {
        aeronave: {
          include: {
            pecas: true,
            etapas: { include: { funcionarios: true } },
            testes: true
          }
        }
      }
    });

    if (!relatorio || !relatorio.aeronave) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    let parsed: any | null = null;
    if (relatorio.conteudo) {
      try {
        parsed = JSON.parse(relatorio.conteudo);
      } catch {
        parsed = null;
      }
    }

    const aeronaveData =
      parsed && parsed.aeronave
        ? parsed.aeronave
        : {
            codigo: relatorio.aeronave.codigo,
            modelo: relatorio.aeronave.modelo,
            tipo: relatorio.aeronave.tipo,
            capacidade: relatorio.aeronave.capacidade,
            alcance: relatorio.aeronave.alcance
          };

    const pecasData =
      parsed && parsed.pecas ? parsed.pecas : relatorio.aeronave.pecas;

    const etapasData =
      parsed && parsed.etapas ? parsed.etapas : relatorio.aeronave.etapas;

    const testesData =
      parsed && parsed.testes ? parsed.testes : relatorio.aeronave.testes;

    const doc = new PDFDocument({ margin: 40, bufferPages: true });
    const filename = `Relatorio_${relatorio.aeronaveId}_${relatorio.id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('AEROCODE', { align: 'center' })
      .moveDown(0.3);

    doc
      .fontSize(16)
      .text('Relatório de Qualidade de Aeronave', { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Relatório ID: ${relatorio.id}`, { align: 'center' })
      .text(
        `Data de geração: ${new Date().toLocaleDateString('pt-BR')}`,
        { align: 'center' }
      );

    doc.moveDown(0.7);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.7);

    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .text('Dados da aeronave', { underline: true });
    doc.moveDown(0.3);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(
        `Código: ${aeronaveData.codigo} | Modelo: ${aeronaveData.modelo}`
      )
      .text(
        `Tipo: ${aeronaveData.tipo} | Capacidade: ${aeronaveData.capacidade} passageiros`
      )
      .text(`Alcance: ${aeronaveData.alcance} km`);

    doc.moveDown(0.7);

    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .text('Cliente e entrega', { underline: true });
    doc.moveDown(0.3);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Cliente: ${relatorio.nomeCliente}`)
      .text(
        `Data de entrega: ${new Date(relatorio.dataEntrega).toLocaleDateString(
          'pt-BR'
        )}`
      );

    if (pecasData && pecasData.length > 0) {
      doc.moveDown(0.7);
      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .text('Peças utilizadas', { underline: true });
      doc.moveDown(0.3);

      pecasData.forEach((p: any) => {
        doc
          .fontSize(9)
          .font('Helvetica')
          .text(
            `• ${p.nome} | Tipo: ${p.tipo} | Fornecedor: ${p.fornecedor} | Status: ${p.status}`
          );
      });
    }

    if (etapasData && etapasData.length > 0) {
      doc.moveDown(0.7);
      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .text('Etapas de produção', { underline: true });
      doc.moveDown(0.3);

      etapasData.forEach((e: any) => {
        const prazo = e.prazo
          ? new Date(e.prazo).toLocaleDateString('pt-BR')
          : '-';
        const responsaveis =
          e.funcionarios && e.funcionarios.length > 0
            ? e.funcionarios.map((f: any) => f.nome).join(', ')
            : 'Não definido';

        doc
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(e.nome);
        doc
          .fontSize(8)
          .font('Helvetica')
          .text(`Status: ${e.status} | Prazo: ${prazo}`)
          .text(`Responsáveis: ${responsaveis}`);
        doc.moveDown(0.2);
      });
    }

    if (testesData && testesData.length > 0) {
      doc.moveDown(0.7);
      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .text('Testes realizados', { underline: true });
      doc.moveDown(0.3);

      testesData.forEach((t: any) => {
        const data = t.data
          ? new Date(t.data).toLocaleDateString('pt-BR')
          : 'N/A';
        const rotulo =
          t.resultado === 'APROVADO' ? 'Aprovado' : 'Reprovado';

        doc
          .fontSize(9)
          .font('Helvetica')
          .text(`• ${t.tipo} | Resultado: ${rotulo} | Data: ${data}`);
      });
    }

    doc.moveDown(1);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.4);

    doc
      .fontSize(8)
      .font('Helvetica')
      .text(
        'Relatório gerado automaticamente pelo Sistema Aerocode. Documento confidencial de garantia de qualidade.',
        { align: 'center' }
      );

    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar PDF do relatório' });
  }
});

router.post(
  '/',
  permissionsMiddleware(['ADMINISTRADOR', 'ENGENHEIRO']),
  [
    body('aeronaveId').notEmpty().withMessage('ID da aeronave é obrigatório'),
    body('nomeCliente').notEmpty().withMessage('Nome do cliente é obrigatório'),
    body('dataEntrega')
      .isISO8601()
      .withMessage('Data de entrega deve ser válida')
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { aeronaveId, nomeCliente, dataEntrega } = req.body;

      const aeronave = await prisma.aeronave.findUnique({
        where: { codigo: aeronaveId },
        include: {
          pecas: true,
          etapas: {
            include: { funcionarios: true }
          },
          testes: true
        }
      });

      if (!aeronave) {
        return res.status(404).json({ error: 'Aeronave não encontrada' });
      }

      // Garante apenas 1 relatório por aeronave (constraint Relatorio_aeronaveId_key)
      const relatorioExistente = await prisma.relatorio.findUnique({
        where: { aeronaveId }
      });

      if (relatorioExistente) {
        return res.status(409).json({
          error:
            'Já existe um relatório cadastrado para esta aeronave. Edite o relatório existente ou escolha outra aeronave.'
        });
      }

      const conteudo = JSON.stringify({
        aeronave: {
          codigo: aeronave.codigo,
          modelo: aeronave.modelo,
          tipo: aeronave.tipo,
          capacidade: aeronave.capacidade,
          alcance: aeronave.alcance
        },
        pecas: aeronave.pecas,
        etapas: aeronave.etapas,
        testes: aeronave.testes,
        nomeCliente,
        dataEntrega
      });

      const relatorio = await prisma.relatorio.create({
        data: {
          aeronaveId,
          nomeCliente,
          dataEntrega: new Date(dataEntrega),
          conteudo
        },
        include: { aeronave: true }
      });

      res.status(201).json(relatorio);
    } catch (error) {
      console.error('ERRO AO CRIAR RELATÓRIO:', error);
      res.status(500).json({ error: 'Erro ao criar relatório' });
    }
  }
);

export default router;
