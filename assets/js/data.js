/* Dados fictícios do mockup. Nomes de pessoas são inventados.
   [colchetes] = conteúdo que o grupo ainda precisa enviar. */
window.DATA = (function () {
  const ENT = {
    adonhiram: {
      id: 'adonhiram', short: 'Adonhiram', kind: 'A Loja',
      name: 'Fraternidade Adonhiram', full: 'A.R.L.S. Fraternidade Adonhiram nº 2503',
      tag: 'Oriente de Praia Grande · GOB-SP',
      logo: 'assets/img/aguia.jpg', mono: 'FA',
      desc: 'Augusta e Respeitável Loja Simbólica jurisdicionada ao Grande Oriente do Estado de São Paulo e federada ao Grande Oriente do Brasil.',
      galeria: 'Galeria de Veneráveis Mestres',
      niveis: [[0, 'Público'], [1, 'Aprendiz'], [2, 'Companheiro'], [3, 'Mestre']],
      cargos: ['Venerável Mestre', '1º Vigilante', '2º Vigilante', 'Orador', 'Secretário', 'Tesoureiro', 'Chanceler'],
      cargosNota: 'Os sete cargos eletivos da administração — [confirmar lista e nomes atuais].'
    },
    frafem: {
      id: 'frafem', short: 'Frafem', kind: 'Fraternidade Feminina',
      name: 'Fraternidade Feminina Cruzeiro do Sul', full: 'Fraternidade Feminina Cruzeiro do Sul de Praia Grande',
      tag: 'Entidade paramaçônica feminina · vinculada à Loja',
      logo: null, mono: 'FF',
      desc: 'Associação civil sem fins lucrativos, entidade paramaçônica feminina não iniciática vinculada à Loja Fraternidade Adonhiram nº 2503. Promove trabalhos culturais, educativos, sociais e filantrópicos e o bem-estar das famílias.',
      galeria: 'Galeria de Presidentes',
      niveis: [[0, 'Público'], [1, 'Fraternas']],
      cargos: ['Presidente', 'Vice-Presidente', 'Diretora Secretária', 'Diretora de Finanças', 'Diretora Social e Cultural'],
      cargosNota: 'Diretoria Executiva (Art. 30 do estatuto), cada cargo com Adjunta. Há ainda Conselho Fiscal e Conselho Consultivo.'
    },
    damasco: {
      id: 'damasco', short: 'Estrada de Damasco', kind: 'Associação',
      name: 'Associação Beneficente Estrada de Damasco', full: 'Sociedade Beneficente Estrada de Damasco',
      tag: 'Por uma sociedade mais justa · Praia Grande',
      logo: 'assets/img/damasco.jpg', mono: 'ED',
      desc: 'Sociedade cultural, beneficente e filantrópica, sem fins lucrativos. Presta auxílio aos carentes, notadamente à infância necessitada, e apoia entidades de assistência social da Baixada Santista.',
      galeria: 'Galeria de Presidentes',
      niveis: [[0, 'Público'], [1, 'Sócios']],
      cargos: ['Presidente', 'Vice-Presidente', '1º Secretário', '2º Secretário', '1º Tesoureiro', '2º Tesoureiro', 'Diretor Social', 'Diretor de Patrimônio', 'Diretor Cultural'],
      cargosNota: 'Diretoria Executiva (Art. 32 do estatuto). Há ainda Conselho Deliberativo (15 membros + 5 suplentes) e Conselho Fiscal.'
    }
  };

  /* Perfis do simulador "Visualizar como" */
  const ROLES = {
    visitante:   { label: 'Visitante (sem login)', ent: null, nivel: 0, perfil: null },
    aprendiz:    { label: 'Irmão Aprendiz', ent: 'adonhiram', nivel: 1, perfil: 'membro', nome: 'Rafael Couto' },
    companheiro: { label: 'Irmão Companheiro', ent: 'adonhiram', nivel: 2, perfil: 'autor', nome: 'Paulo Duarte' },
    mestre:      { label: 'Irmão Mestre', ent: 'adonhiram', nivel: 3, perfil: 'autor', nome: 'José Fontana' },
    fraterna:    { label: 'Fraterna (Frafem)', ent: 'frafem', nivel: 1, perfil: 'membro', nome: 'Helena Prado' },
    socio:       { label: 'Sócio (Estrada de Damasco)', ent: 'damasco', nivel: 1, perfil: 'membro', nome: 'Ricardo Tavares' },
    adminEnt:    { label: 'Admin da Loja', ent: 'adonhiram', nivel: 3, perfil: 'admin', nome: 'Marcelo Siqueira' },
    master:      { label: 'Admin master', ent: 'adonhiram', nivel: 3, perfil: 'master', nome: 'Antônio Ribeiro' }
  };

  const CATS = ['Trabalhos', 'Informes GOB', 'Eventos', 'História', 'Filantropia', 'Notícias', 'Atas'];

  const BODY = [
    'Para quem chega à Loja, o silêncio é uma das primeiras lições. [Texto de exemplo — aqui entra o trabalho completo, colado pelo autor ou por um administrador.]',
    '## Aprender a ouvir',
    'Nas primeiras sessões, o aprendiz observa mais do que fala, e é nesse tempo que começa a entender o ritmo dos trabalhos.',
    '> Quem sabe ouvir, aprende duas vezes.',
    '## O trabalho continua fora do templo',
    'Este trabalho foi apresentado em sessão e agora fica guardado na linha do tempo da Loja, para quem faltou e para quem chegar depois.'
  ];

  /* vis: nível mínimo dentro da entidade (0 = público) */
  const POSTS = [
    { id: 'p1', ent: 'adonhiram', cat: 'Informes GOB', vis: 0, home: true, title: 'Informe semanal do GOB — resumo da semana', date: '10/11/2026', author: 'Marcelo Siqueira', excerpt: 'O que saiu no boletim do GOB e interessa à Loja, em cinco minutos de leitura — sem precisar abrir as 100 páginas.' },
    { id: 'p2', ent: 'adonhiram', cat: 'Eventos', vis: 0, home: true, gallery: 8, title: 'Jantar de confraternização com as famílias', date: '08/11/2026', author: 'Paulo Duarte', excerpt: 'Registro da noite com Irmãos, cunhadas e sobrinhos. Fotos do evento e agradecimentos.' },
    { id: 'p3', ent: 'adonhiram', cat: 'Trabalhos', vis: 1, title: 'O silêncio como instrumento de trabalho', date: '07/11/2026', author: 'José Fontana', excerpt: 'Trabalho apresentado em sessão sobre o papel do silêncio na formação do aprendiz.' },
    { id: 'p4', ent: 'adonhiram', cat: 'Trabalhos', vis: 2, title: '[Título de trabalho do grau de Companheiro]', date: '31/10/2026', author: 'Paulo Duarte', excerpt: 'Visível para Companheiros e Mestres.' },
    { id: 'p5', ent: 'adonhiram', cat: 'Trabalhos', vis: 3, title: '[Título de trabalho do grau de Mestre]', date: '24/10/2026', author: 'Antônio Ribeiro', excerpt: 'Visível apenas para Mestres.' },
    { id: 'p6', ent: 'adonhiram', cat: 'História', vis: 0, home: true, gallery: 6, title: 'TBT: a fundação do nosso templo', date: '23/10/2026', author: 'Antônio Ribeiro', excerpt: 'Fotos antigas digitalizadas e a história de como o templo da Rua Pedro Américo foi erguido. [história real a enviar]' },
    { id: 'p7', ent: 'adonhiram', cat: 'Atas', vis: 3, title: 'Resumo da sessão de [dd/mm]', date: '18/10/2026', author: 'Marcelo Siqueira', excerpt: 'Para quem faltou. A ata oficial continua no GOB Conecta.' },
    { id: 'p8', ent: 'frafem', cat: 'Filantropia', vis: 0, gallery: 5, title: 'Campanha do agasalho 2026', date: '05/11/2026', author: 'Helena Prado', excerpt: 'Balanço da arrecadação e entrega às entidades parceiras.' },
    { id: 'p9', ent: 'frafem', cat: 'Notícias', vis: 1, title: 'Reunião da Diretoria Executiva — pauta de novembro', date: '02/11/2026', author: 'Helena Prado', excerpt: 'Conteúdo exclusivo para as fraternas.' },
    { id: 'p10', ent: 'damasco', cat: 'Filantropia', vis: 0, gallery: 7, title: 'Natal solidário: entrega de brinquedos', date: '28/10/2026', author: 'Ricardo Tavares', excerpt: 'A Associação levou brinquedos e alimentos a [nome da instituição] da Baixada Santista.' },
    { id: 'p11', ent: 'damasco', cat: 'Notícias', vis: 1, title: 'Prestação de contas do trimestre', date: '20/10/2026', author: 'Ricardo Tavares', excerpt: 'Balancete e parecer do Conselho Fiscal — somente sócios.' }
  ];

  const EVENTS = [
    { d: '21', m: 'nov', ent: 'adonhiram', t: 'Sessão ordinária', h: '20h', local: 'Templo', vis: 1, tipo: 'Sessão' },
    { d: '28', m: 'nov', ent: 'adonhiram', t: 'Sessão de iniciação', h: '20h', local: 'Templo', vis: 3, tipo: 'Sessão' },
    { d: '30', m: 'nov', ent: 'frafem', t: 'Chá beneficente das fraternas', h: '15h', local: 'Salão de festas', vis: 0, tipo: 'Festividade' },
    { d: '06', m: 'dez', ent: 'damasco', t: 'Arrecadação de Natal', h: '9h', local: 'Sede', vis: 0, tipo: 'Festividade' },
    { d: '13', m: 'dez', ent: 'adonhiram', t: 'Festa de fim de ano com as famílias', h: '19h', local: 'Salão de festas', vis: 0, tipo: 'Festividade' },
    { d: '19', m: 'dez', ent: 'adonhiram', t: 'Sessão magna de posse', h: '20h', local: 'Templo', vis: 0, tipo: 'Convite' }
  ];

  const DOCS = [
    { t: 'Estatuto da Fraternidade Feminina Cruzeiro do Sul', tipo: 'Estatuto', ent: 'frafem', vis: 1 },
    { t: 'Estatuto Social da Sociedade Beneficente Estrada de Damasco', tipo: 'Estatuto', ent: 'damasco', vis: 1 },
    { t: 'Regimento interno da Loja — [versão]', tipo: 'Regimento', ent: 'adonhiram', vis: 1 },
    { t: 'Atas digitalizadas 2003–2010', tipo: 'Atas', ent: 'adonhiram', vis: 3 },
    { t: 'Atas digitalizadas 2011–2025', tipo: 'Atas', ent: 'adonhiram', vis: 3 },
    { t: 'Relatório anual da Diretoria — 2025', tipo: 'Relatório', ent: 'damasco', vis: 1 },
    { t: 'Balanço do exercício 2025', tipo: 'Relatório', ent: 'frafem', vis: 1 },
    { t: 'Vídeos de eventos (pasta)', tipo: 'Vídeos', ent: 'adonhiram', vis: 1 }
  ];

  /* Diretório — dados fictícios */
  const MEMBERS = [
    { n: 'Antônio Ribeiro', g: 3, cargo: 'Venerável Mestre', tel: '(13) 9 •••• 1201', fam: { n: 'Lúcia Ribeiro', tel: '(13) 9 •••• 4410', niver: '14/11' } },
    { n: 'Marcelo Siqueira', g: 3, cargo: 'Secretário', tel: '(13) 9 •••• 2290', fam: { n: 'Cláudia Siqueira', tel: '(13) 9 •••• 7781', niver: '02/12' } },
    { n: 'José Fontana', g: 3, cargo: 'Orador', tel: '(13) 9 •••• 0034', fam: { n: 'Márcia Fontana', tel: '(13) 9 •••• 9012', niver: '27/11' } },
    { n: 'Paulo Duarte', g: 2, cargo: '—', tel: '(13) 9 •••• 5521', fam: { n: 'Renata Duarte', tel: '(13) 9 •••• 3376', niver: '09/03' } },
    { n: 'Henrique Vasconcelos', g: 3, cargo: 'Tesoureiro', tel: '(13) 9 •••• 8812', fam: null },
    { n: 'Rafael Couto', g: 1, cargo: '—', tel: '(13) 9 •••• 6645', fam: { n: 'Juliana Couto', tel: '(13) 9 •••• 1123', niver: '21/11' } },
    { n: 'Luiz Prado', g: 2, cargo: '—', tel: '(13) 9 •••• 4478', fam: { n: 'Helena Prado', tel: '(13) 9 •••• 5590', niver: '30/07' } }
  ];

  const USERS = [
    { n: 'Antônio Ribeiro', email: 'antonio@exemplo.com', cim: '100231', ent: 'adonhiram', nivel: 3, cargo: 'Venerável Mestre', perfil: 'master', st: 'ativo', last: 'Hoje, 09:12' },
    { n: 'Marcelo Siqueira', email: 'marcelo@exemplo.com', cim: '100587', ent: 'adonhiram', nivel: 3, cargo: 'Secretário', perfil: 'admin', st: 'ativo', last: 'Ontem, 21:40' },
    { n: 'José Fontana', email: 'jose@exemplo.com', cim: '098876', ent: 'adonhiram', nivel: 3, cargo: 'Orador', perfil: 'autor', st: 'ativo', last: '05/11/2026' },
    { n: 'Paulo Duarte', email: 'paulo@exemplo.com', cim: '101142', ent: 'adonhiram', nivel: 2, cargo: '', perfil: 'autor', st: 'ativo', last: '02/11/2026' },
    { n: 'Rafael Couto', email: 'rafael@exemplo.com', cim: '103502', ent: 'adonhiram', nivel: 1, cargo: '', perfil: 'membro', st: 'pendente', last: '—' },
    { n: 'Fernando Moraes', email: 'fernando@exemplo.com', cim: '097012', ent: 'adonhiram', nivel: 3, cargo: '', perfil: 'membro', st: 'inativo', last: '14/03/2026' },
    { n: 'Helena Prado', email: 'helena@exemplo.com', cim: '', ent: 'frafem', nivel: 1, cargo: 'Presidente', perfil: 'admin', st: 'ativo', last: '07/11/2026' },
    { n: 'Juliana Couto', email: 'juliana@exemplo.com', cim: '', ent: 'frafem', nivel: 1, cargo: 'Diretora Secretária', perfil: 'autor', st: 'ativo', last: '01/11/2026' },
    { n: 'Ricardo Tavares', email: 'ricardo@exemplo.com', cim: '', ent: 'damasco', nivel: 1, cargo: 'Presidente', perfil: 'admin', st: 'ativo', last: '28/10/2026' },
    { n: 'Eduardo Lacerda', email: 'eduardo@exemplo.com', cim: '', ent: 'damasco', nivel: 1, cargo: '1º Tesoureiro', perfil: 'membro', st: 'ativo', last: '07/11/2026' }
  ];

  const PERFIS = {
    membro: 'Membro', autor: 'Autor', admin: 'Admin da entidade', master: 'Admin master'
  };

  return { ENT, ROLES, CATS, BODY, POSTS, EVENTS, DOCS, MEMBERS, USERS, PERFIS };
})();
