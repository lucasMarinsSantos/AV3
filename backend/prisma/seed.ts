import { PrismaClient } from '@prisma/client';
import {
  TipoAeronave,
  TipoPeca,
  StatusPeca,
  StatusEtapa,
  TipoTeste,
  ResultadoTeste,
  NivelPermissao
} from '../src/types/enums';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.metrica.deleteMany();
  await prisma.relatorio.deleteMany();
  await prisma.teste.deleteMany();
  await prisma.etapa.deleteMany();
  await prisma.peca.deleteMany();
  await prisma.aeronave.deleteMany();
  await prisma.funcionario.deleteMany();

  const passwordHashAdmin = await bcrypt.hash('admin', 10);
  const passwordHashEng = await bcrypt.hash('engenheiro', 10);
  const passwordHashOp = await bcrypt.hash('operador', 10);

  await prisma.funcionario.create({
    data: {
      nome: 'Administrador do Sistema',
      telefone: '11999990000',
      endereco: 'Av. Paulista, 1000 - São Paulo/SP',
      usuario: 'admin',
      senha: passwordHashAdmin,
      nivelPermissao: NivelPermissao.ADMINISTRADOR
    }
  });

  const nomesEngenheiros = [
    'Ana Paula Ribeiro',
    'Bruno Costa',
    'Carla Menezes',
    'Diego Almeida',
    'Eduardo Freitas',
    'Fernanda Silva',
    'Gustavo Carvalho',
    'Helena Ferreira',
    'Igor Santos',
    'Juliana Rocha',
    'Leonardo Barros',
    'Mariana Castro',
    'Paulo Henrique Souza',
    'Renata Martins',
    'Ricardo Lima',
    'Sabrina Oliveira',
    'Thiago Moreira',
    'Vanessa Teixeira',
    'William Nogueira',
    'Yasmin Figueiredo'
  ];

  const nomesOperadores = [
    'Alex Souza',
    'Bianca Gomes',
    'Caio Pereira',
    'Daniela Lopes',
    'Everton Machado',
    'Fabiana Azevedo',
    'Gabriel Pires',
    'Heloísa Duarte',
    'Isabela Correia',
    'João Vitor Cardoso',
    'Kamila Santos',
    'Lucas Batista',
    'Marcelo Pinto',
    'Natália Rezende',
    'Otávio Ramos',
    'Patrícia Correia',
    'Rafael Cunha',
    'Simone Araújo',
    'Tulio Ribeiro',
    'Vitória Prado',
    'André Fernandes',
    'Beatriz Melo',
    'César Nascimento',
    'Debora Assis',
    'Enzo Barcellos',
    'Flávia Baroni',
    'Henrique Matos',
    'Isadora Lopes',
    'João Pedro Carvalho',
    'Karina Braga',
    'Larissa Paiva',
    'Matheus Andrade',
    'Nicole Cardoso',
    'Otávia Freire',
    'Pedro Augusto Martins',
    'Rafaela Queiroz',
    'Samuel Dias',
    'Tatiane Moraes',
    'Viviane Almeida'
  ];

  const engenheiros: { id: number }[] = [];
  const operadores: { id: number }[] = [];

  for (let i = 0; i < nomesEngenheiros.length; i++) {
    const eng = await prisma.funcionario.create({
      data: {
        nome: nomesEngenheiros[i],
        telefone: `11988${String(30000 + i)}`,
        endereco: `Centro de Engenharia - Hangar ${((i % 4) + 1).toString()}`,
        usuario: `engenheiro${i + 1}`,
        senha: passwordHashEng,
        nivelPermissao: NivelPermissao.ENGENHEIRO
      }
    });
    engenheiros.push({ id: eng.id });
  }

  for (let i = 0; i < nomesOperadores.length; i++) {
    const op = await prisma.funcionario.create({
      data: {
        nome: nomesOperadores[i],
        telefone: `11977${String(40000 + i)}`,
        endereco: `Linha de Montagem ${((i % 8) + 1).toString()} - São José dos Campos/SP`,
        usuario: `operador${i + 1}`,
        senha: passwordHashOp,
        nivelPermissao: NivelPermissao.OPERADOR
      }
    });
    operadores.push({ id: op.id });
  }

  const modelosBase: {
    modelo: string;
    tipo: TipoAeronave;
    capacidade: number;
    alcance: number;
  }[] = [
    { modelo: 'Embraer E190-E2', tipo: TipoAeronave.COMERCIAL, capacidade: 114, alcance: 3500 },
    { modelo: 'Embraer E195-E2', tipo: TipoAeronave.COMERCIAL, capacidade: 146, alcance: 4300 },
    { modelo: 'KC-390 Millenium', tipo: TipoAeronave.MILITAR, capacidade: 80, alcance: 5200 },
    { modelo: 'Airbus A320neo', tipo: TipoAeronave.COMERCIAL, capacidade: 180, alcance: 6300 },
    { modelo: 'Airbus A321XLR', tipo: TipoAeronave.COMERCIAL, capacidade: 220, alcance: 8700 },
    { modelo: 'COMAC C919', tipo: TipoAeronave.COMERCIAL, capacidade: 168, alcance: 5555 },
    { modelo: 'Boeing 737 MAX 8', tipo: TipoAeronave.COMERCIAL, capacidade: 178, alcance: 6570 },
    { modelo: 'Legacy 650E', tipo: TipoAeronave.COMERCIAL, capacidade: 14, alcance: 7200 },
    { modelo: 'Caça F-39 Gripen E', tipo: TipoAeronave.MILITAR, capacidade: 2, alcance: 2500 },
    { modelo: 'Transporte Tático C-130J', tipo: TipoAeronave.MILITAR, capacidade: 120, alcance: 4100 }
  ];

  const aeronavesCodigos: string[] = [];

  for (let i = 0; i < 50; i++) {
    const base = modelosBase[i % modelosBase.length];
    const codigo = `AC${2000 + i}`;
    aeronavesCodigos.push(codigo);
    await prisma.aeronave.create({
      data: {
        codigo,
        modelo: `${base.modelo} - Lote ${Math.floor(i / modelosBase.length) + 1}`,
        tipo: base.tipo,
        capacidade: base.capacidade + (i % 3) * 4,
        alcance: base.alcance + (i % 4) * 150
      }
    });
  }

  const fornecedores = [
    'Safran',
    'Collins Aerospace',
    'GE Aerospace',
    'Rolls-Royce',
    'HydroTech Systems',
    'AvioParts do Brasil',
    'SkyComponents',
    'Embraer Supplier',
    'AeroSystems Global',
    'GlobalParts Aviation'
  ];

  const nomesPecas = [
    'Motor turbofan',
    'Trem de pouso principal',
    'Sistema hidráulico',
    'Painel de controle central',
    'Flap interno',
    'Flap externo',
    'Spoiler de asa',
    'Radar meteorológico',
    'Tanque central de combustível',
    'Porta de carga lateral',
    'Sistema de navegação inercial',
    'Assento de passageiro classe econômica',
    'Janela lateral',
    'Compartimento de bagagem superior',
    'Módulo de controle de combustível'
  ];

  const pecas: {
    nome: string;
    tipo: TipoPeca;
    fornecedor: string;
    status: StatusPeca;
    aeronaveId: string;
  }[] = [];

  for (const codigo of aeronavesCodigos) {
    for (let i = 0; i < nomesPecas.length; i++) {
      const tipo = i % 2 === 0 ? TipoPeca.IMPORTADA : TipoPeca.NACIONAL;
      const statusIndex = i % 3;
      const status =
        statusIndex === 0
          ? StatusPeca.EMPRODUCAO
          : statusIndex === 1
          ? StatusPeca.EMTRANSPORTE
          : StatusPeca.PRONTA;
      const fornecedor = fornecedores[(i + codigo.length) % fornecedores.length];

      pecas.push({
        nome: `${nomesPecas[i]} - ${codigo}`,
        tipo,
        fornecedor,
        status,
        aeronaveId: codigo
      });
    }
  }

  await prisma.peca.createMany({ data: pecas });

  const hoje = new Date();
  const dias = (n: number) => new Date(hoje.getTime() + n * 24 * 60 * 60 * 1000);

  const nomesEtapas = [
    'Montagem da fuselagem',
    'Instalação dos sistemas elétricos',
    'Integração dos aviônicos',
    'Aplicação de pintura externa',
    'Execução de testes em solo',
    'Execução de testes em voo',
    'Configuração final da cabine',
    'Inspeção final de qualidade',
    'Preparação para entrega ao cliente'
  ];

  const etapasData: {
    nome: string;
    prazo: Date;
    status: StatusEtapa;
    aeronaveId: string;
    funcionariosConnect: { id: number }[];
  }[] = [];

  for (const codigo of aeronavesCodigos) {
    for (let i = 0; i < nomesEtapas.length; i++) {
      const statusIndex = i % 3;
      const status =
        statusIndex === 0
          ? StatusEtapa.PENDENTE
          : statusIndex === 1
          ? StatusEtapa.ANDAMENTO
          : StatusEtapa.CONCLUIDA;
      const prazo = dias(5 + i * 3 + (codigo.length % 5));
      const funcEng = engenheiros[i % engenheiros.length];
      const funcOp1 = operadores[(i + codigo.length) % operadores.length];
      const funcOp2 = operadores[(i + 7) % operadores.length];

      etapasData.push({
        nome: `${nomesEtapas[i]} - ${codigo}`,
        prazo,
        status,
        aeronaveId: codigo,
        funcionariosConnect: [funcEng, funcOp1, funcOp2]
      });
    }
  }

  for (const etapa of etapasData) {
    await prisma.etapa.create({
      data: {
        nome: etapa.nome,
        prazo: etapa.prazo,
        status: etapa.status,
        aeronaveId: etapa.aeronaveId,
        funcionarios: {
          connect: etapa.funcionariosConnect
        }
      }
    });
  }

  const testesData: {
    tipo: TipoTeste;
    resultado: ResultadoTeste;
    aeronaveId: string;
    data: Date;
  }[] = [];

  for (const codigo of aeronavesCodigos) {
    for (let i = 0; i < 12; i++) {
      const tipoIndex = i % 3;
      const tipo =
        tipoIndex === 0
          ? TipoTeste.ELETRICO
          : tipoIndex === 1
          ? TipoTeste.HIDRAULICO
          : TipoTeste.AERODINAMICO;
      const resultado =
        i % 7 === 0 || i % 11 === 0
          ? ResultadoTeste.REPROVADO
          : ResultadoTeste.APROVADO;
      const data = dias(-30 + i * 2 + (codigo.length % 4));

      testesData.push({
        tipo,
        resultado,
        aeronaveId: codigo,
        data
      });
    }
  }

  await prisma.teste.createMany({ data: testesData });

  const clientes = [
    'Boeing',
    'Airbus',
    'Embraer',
    'Comac',
    'Bombardier',
    'Global Airlines',
    'SkyExpress',
    'CargoWorld',
    'Força Aérea Brasileira',
    'Ministério da Defesa'
  ];

  for (let i = 0; i < aeronavesCodigos.length; i++) {
    const codigo = aeronavesCodigos[i];
    const cliente = clientes[i % clientes.length];
    const dataEntrega = dias(30 + (i % 10) * 4);

    const aeronaveCompleta = await prisma.aeronave.findUnique({
      where: { codigo },
      include: {
        pecas: true,
        etapas: {
          include: { funcionarios: true }
        },
        testes: true
      }
    });

    if (!aeronaveCompleta) continue;

    const conteudo = JSON.stringify({
      aeronave: {
        codigo: aeronaveCompleta.codigo,
        modelo: aeronaveCompleta.modelo,
        tipo: aeronaveCompleta.tipo,
        capacidade: aeronaveCompleta.capacidade,
        alcance: aeronaveCompleta.alcance
      },
      pecas: aeronaveCompleta.pecas.map((p: any) => ({
        id: p.id,
        nome: p.nome,
        tipo: p.tipo,
        fornecedor: p.fornecedor,
        status: p.status
      })),
      etapas: aeronaveCompleta.etapas.map((e: any) => ({
        id: e.id,
        nome: e.nome,
        prazo: e.prazo.toISOString(),
        status: e.status,
        funcionarios: e.funcionarios.map((f: any) => ({
          id: f.id,
          nome: f.nome
        }))
      })),
      testes: aeronaveCompleta.testes.map((t: any) => ({
        id: t.id,
        tipo: t.tipo,
        resultado: t.resultado,
        data: t.data.toISOString()
      })),
      nomeCliente: cliente,
      dataEntrega: dataEntrega.toISOString()
    });

    await prisma.relatorio.create({
      data: {
        aeronaveId: codigo,
        nomeCliente: cliente,
        dataEntrega,
        conteudo
      }
    });
  }

  const rotasBase = [
    '/aeronaves',
    '/aeronaves/detalhe',
    '/relatorios',
    '/metricas',
    '/etapas',
    '/funcionarios',
    '/pecas',
    '/testes'
  ];

  const cenarios = [1, 5, 10];

  const metricasData: {
    rota: string;
    metodo: string;
    latencia: number;
    tempoProcessamento: number;
    tempoResposta: number;
    usuarios: number;
  }[] = [];

  for (const usuarios of cenarios) {
    const fatorCarga = usuarios === 1 ? 1 : usuarios === 5 ? 1.8 : 2.7;

    for (let amostra = 0; amostra < 400; amostra++) {
      for (const rota of rotasBase) {
        const baseLatencia =
          rota === '/metricas'
            ? 120
            : rota === '/relatorios'
            ? 160
            : rota === '/aeronaves/detalhe'
            ? 140
            : 90;
        const baseProc =
          rota === '/relatorios'
            ? 130
            : rota === '/metricas'
            ? 110
            : 80;
        const ruidoLat = Math.random() * 40 - 20;
        const ruidoProc = Math.random() * 35 - 17;

        const latencia = Math.max(15, baseLatencia * fatorCarga + ruidoLat);
        const tempoProcessamento = Math.max(
          15,
          baseProc * fatorCarga + ruidoProc
        );
        const tempoResposta = latencia + tempoProcessamento;

        metricasData.push({
          rota,
          metodo: 'GET',
          latencia,
          tempoProcessamento,
          tempoResposta,
          usuarios
        });
      }
    }
  }

  await prisma.metrica.createMany({ data: metricasData });

  console.log('Seed massiva executada com grande volume de dados.');
  console.log('Funcionários:', 1 + engenheiros.length + operadores.length);
  console.log('Aeronaves:', aeronavesCodigos.length);
  console.log('Peças:', pecas.length);
  console.log('Etapas:', etapasData.length);
  console.log('Testes:', testesData.length);
  console.log('Relatórios:', aeronavesCodigos.length);
  console.log('Métricas:', metricasData.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
