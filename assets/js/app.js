/* Mockup navegável — renderiza cabeçalho, rodapé e o conteúdo de cada página.
   Sem back-end: o "login" é simulado pelo seletor "Visualizar como". */
(function () {
  const { ENT, ROLES, CATS, BODY, POSTS, EVENTS, DOCS, MEMBERS, USERS, PERFIS } = window.DATA;
  const qs = new URLSearchParams(location.search);
  const page = document.body.dataset.page;

  /* ---------- estado do simulador ---------- */
  const store = {
    get(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  let roleKey = store.get('adh-role', 'visitante');
  if (!ROLES[roleKey]) roleKey = 'visitante';
  const role = ROLES[roleKey];
  const logged = roleKey !== 'visitante';
  const isMaster = role.perfil === 'master';
  const isAdmin = role.perfil === 'admin' || isMaster;
  const canWrite = isAdmin || role.perfil === 'autor';

  const canSee = (it) => {
    if (!it.vis) return true;
    if (!logged) return false;
    if (isMaster) return true;
    return role.ent === it.ent && role.nivel >= it.vis;
  };
  const canAdminEnt = (ent) => isMaster || (role.perfil === 'admin' && role.ent === ent);

  /* ---------- utilidades ---------- */
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ICONS = {
    lock: '<rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="1"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    cam: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    folder: '<path d="M3 6h6l2 2h10v11H3z"/>',
    pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c.8-3.5 3.2-5.5 6-5.5s5.2 2 6 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21 20c-.5-2.5-1.8-4.2-3.5-5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    left: '<path d="M15 6l-6 6 6 6"/>', right: '<path d="M9 6l6 6-6 6"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v6H4V6h6"/>',
    heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    gift: '<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M12 9v11M4 13h16M12 9c-2-4-6-4-6-1s6 1 6 1 6 2 6-1-4-3-6 1"/>',
    key: '<circle cx="8" cy="14" r="4"/><path d="M11 11l9-9M17 5l2 2"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
  };
  const icon = (n, s = 20, extra = '') => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${ICONS[n]}</svg>`;
  const initials = (n) => { const p = n.split(' '); return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase(); };
  const logoOf = (e, cls = '') => e.logo ? `<img src="${e.logo}" alt="Logo ${esc(e.name)}" class="${cls}">` : `<span class="mono ${cls}" aria-hidden="true">${e.mono}</span>`;

  const nivelLabel = (ent, v) => (ENT[ent].niveis.find((n) => n[0] === v) || [0, 'Público'])[1];
  const visBadge = (it) => {
    if (!it.vis) return '<span class="badge pub">Público</span>';
    const cls = it.ent === 'adonhiram' ? 'g' + it.vis : 'mem';
    return `<span class="badge ${cls}">${icon('lock', 12)} ${nivelLabel(it.ent, it.vis)}</span>`;
  };
  const entBadge = (ent) => `<span class="badge ent">${esc(ENT[ent].short)}</span>`;
  const url = (p, params) => p + (params ? '?' + new URLSearchParams(params).toString() : '');

  const toast = (msg) => {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2800);
  };

  const hiddenCount = (list) => list.filter((x) => !canSee(x)).length;
  const lockedNote = (n, what = 'conteúdos') => n ? `<div class="locked-note">${icon('lock')}<span><strong>${n} ${what} restrito${n > 1 ? 's' : ''}</strong> ${logged ? 'para graus/entidades acima do seu acesso.' : `— <a href="login.html">entre na Área do Irmão</a> para ver o que o seu grau permite.`}</span></div>` : '';

  /* ---------- cabeçalho e rodapé ---------- */
  const NAV = [
    ['home', 'Início', 'index.html'],
    ['loja', 'A Loja', url('entidade.html', { ent: 'adonhiram' })],
    ['blog', 'Blog', 'blog.html'],
    ['agenda', 'Agenda', 'agenda.html'],
    ['fotos', 'Fotos', 'fotos.html'],
    ['documentos', 'Documentos', 'documentos.html', true],
    ['irmaos', 'Irmãos', 'irmaos.html', true]
  ];
  const activeNav = page === 'entidade' ? (qs.get('ent') === 'adonhiram' || !qs.get('ent') ? 'loja' : 'coirmas') : page === 'post' ? 'blog' : page;

  function header() {
    const L = ENT.adonhiram;
    const roleOpts = Object.entries(ROLES).map(([k, r]) => `<option value="${k}" ${k === roleKey ? 'selected' : ''}>${esc(r.label)}</option>`).join('');
    const navLinks = NAV.map(([k, label, href, lock]) => `<a href="${href}" ${activeNav === k ? 'aria-current="page"' : ''}>${label}${lock ? ` <span class="lock" title="restrito">${icon('lock', 13)}</span>` : ''}</a>`).join('');
    const coirmas = ['frafem', 'damasco'].map((id) => { const e = ENT[id]; return `<a href="${url('entidade.html', { ent: id })}">${logoOf(e)}<span><span class="k">${e.kind}</span><span class="n">${esc(e.name)}</span></span></a>`; }).join('');
    const topRight = logged
      ? `<span>Olá, <span class="who">${esc(role.nome)}</span></span>${canWrite ? `<a href="admin.html">${icon(isAdmin ? 'users' : 'pen', 15)} ${isAdmin ? 'Administração' : 'Publicar'}</a>` : ''}<button type="button" data-logout>Sair</button>`
      : `<a href="login.html">${icon('lock', 15)} Área do Irmão</a>`;
    return `
<a class="skip" href="#conteudo">Pular para o conteúdo</a>
<div class="demo" role="region" aria-label="Controles do protótipo">
  <div class="wrap">
    <strong>Protótipo</strong><span>— visualizar como</span>
    <label class="sr" for="demo-role">Perfil simulado</label>
    <select id="demo-role">${roleOpts}</select>
    <span class="grow"></span>
    <a href="projeto.html">Sobre o projeto e perguntas →</a>
  </div>
</div>
<div class="topbar"><div class="wrap">
  <span>Oriente de Praia Grande · Grande Oriente de São Paulo · Grande Oriente do Brasil</span>
  <span class="links">${topRight}</span>
</div></div>
<header class="site" id="site-header">
  <div class="wrap bar">
    <a class="brand" href="index.html" aria-label="${esc(L.name)} — início">${logoOf(L)}<span><span class="t1">${esc(L.name)}</span><span class="t2">A.R.L.S. nº 2503 · Praia Grande</span></span></a>
    <nav class="main" aria-label="Principal">${navLinks}
      <div class="drop" id="drop"><button type="button" aria-expanded="false" aria-haspopup="true" ${activeNav === 'coirmas' ? 'style="border-bottom-color:var(--accent);color:#fff"' : ''}>Coirmãs ${icon('down', 14)}</button><div class="drop-panel">${coirmas}</div></div>
    </nav>
    <div class="potencias" aria-label="Potências">
      <img src="assets/img/gob-sp.png" alt="Grande Oriente do Brasil — São Paulo" title="GOB-SP">
      <img src="assets/img/gob.png" alt="Grande Oriente do Brasil" title="GOB">
    </div>
    <button class="menu-btn" type="button" aria-label="Abrir menu" aria-expanded="false" data-menu>${icon('menu', 22)}</button>
  </div>
  <nav class="mobile" aria-label="Principal (celular)">
    ${NAV.map(([k, label, href, lock]) => `<a href="${href}">${label}${lock ? '&nbsp;' + icon('lock', 13) : ''}</a>`).join('')}
    <span class="sec">Coirmãs</span>
    ${['frafem', 'damasco'].map((id) => `<a href="${url('entidade.html', { ent: id })}">${esc(ENT[id].name)}</a>`).join('')}
    <span class="sec">Conta</span>
    ${logged ? `${canWrite ? '<a href="admin.html">Administração</a>' : ''}<a href="#" data-logout>Sair</a>` : '<a href="login.html">Área do Irmão</a>'}
  </nav>
  <div class="checker" style="height:8px"></div>
</header>`;
  }

  function footer() {
    return `
<footer class="site">
  <div class="wrap">
    <div><h2>${esc(ENT.adonhiram.full)}</h2><p style="margin:0;line-height:1.7">Rua Pedro Américo, 146 — Parque das Américas<br>Praia Grande · SP<br>Jurisdicionada ao GOB-SP · Federada ao GOB</p></div>
    <div><h2>Entidades</h2>${Object.values(ENT).map((e) => `<a href="${url('entidade.html', { ent: e.id })}">${esc(e.name)}</a>`).join('')}</div>
    <div><h2>Links</h2><a href="https://www.gob.org.br" rel="noopener">Grande Oriente do Brasil</a><a href="#">GOB Conecta</a><a href="projeto.html">Sobre este protótipo</a></div>
  </div>
  <div class="legal">Protótipo para validação — conteúdos entre [colchetes] e nomes de pessoas são fictícios.</div>
</footer>`;
  }

  /* ---------- componentes ---------- */
  const postCard = (p) => `
<a class="card" href="${url('post.html', { id: p.id })}">
  <span class="ph r169">${icon(p.gallery ? 'cam' : 'doc', 32)}<span>[${p.gallery ? 'Foto de capa do álbum' : 'Imagem de capa'}]</span></span>
  <span class="body">
    <span class="meta"><span class="eyebrow">${esc(p.cat)}</span>${visBadge(p)}</span>
    <h3>${esc(p.title)}</h3>
    <span class="muted" style="font-size:14px;line-height:1.5">${esc(p.excerpt)}</span>
    <span class="meta" style="margin-top:auto">${esc(p.date)} · ${esc(p.author)} ${entBadge(p.ent)}</span>
  </span>
</a>`;
  const eventRow = (e) => `
<div class="event">
  <div class="date"><b>${e.d}</b><span>${e.m}</span></div>
  <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px">
    <span class="t">${esc(e.t)}</span>
    <span class="meta">${e.h} · ${esc(e.local)} · ${esc(ENT[e.ent].short)} ${visBadge(e)}</span>
  </div>
</div>`;
  const pageHead = (eyebrow, title, desc, ent) => `
<section class="page-head"><div class="wrap">
  ${ent ? logoOf(ENT[ent]) : ''}
  <div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1>${desc ? `<p>${desc}</p>` : ''}</div>
</div><div class="checker" style="height:8px"></div></section>`;
  const entChips = (current, base, extra = {}) => `<div class="chips" role="group" aria-label="Filtrar por entidade">${[['', 'Todas']].concat(Object.values(ENT).map((e) => [e.id, e.short])).map(([id, l]) => `<a class="chip ${current === id ? 'on' : ''}" href="${url(base, Object.assign({}, extra, id ? { ent: id } : {}))}">${l}</a>`).join('')}</div>`;
  const restricted = (title, msg) => `
${pageHead('Restrito', title, '')}
<div class="wrap section"><div class="login" style="min-height:auto;padding:0"><div class="panel"><div class="in">
  <span class="ico gold">${icon('lock', 22)}</span>
  <h2 class="serif" style="font-size:22px">Área restrita</h2>
  <p class="muted" style="margin:0">${msg}</p>
  <a class="btn pri" href="login.html">Entrar na Área do Irmão</a>
  <p class="muted" style="margin:0;font-size:13px">No protótipo, use o seletor "Visualizar como" no topo.</p>
</div></div></div></div>`;

  /* ---------- páginas ---------- */
  const PAGES = {};

  PAGES.home = () => {
    const visPosts = POSTS.filter(canSee);
    const slides = [
      { eb: 'Informe semanal do GOB', t: 'O que importa do boletim da semana, em cinco minutos', p: 'O secretário resume o boletim do GOB em formato de notícia — sem precisar abrir o PDF de 100 páginas.', cta: ['Ler o informe', url('post.html', { id: 'p1' })], img: '[Imagem do informe]' },
      { eb: 'Próximo evento', t: 'Festa de fim de ano com as famílias — 13 de dezembro', p: 'Irmãos, cunhadas, sobrinhos e as entidades coirmãs. Confirme presença pela agenda.', cta: ['Ver agenda', 'agenda.html'], img: '[Foto do salão de festas]' },
      { eb: 'Nossa história', t: 'A memória e a vida da nossa Loja, em um só lugar', p: 'Trabalhos, eventos, fotos e a história da Fraternidade Adonhiram e das entidades coirmãs, numa linha do tempo fácil de navegar.', cta: ['Conhecer a Loja', url('entidade.html', { ent: 'adonhiram' })], img: '[Foto do templo ou do quadro de Irmãos]' }
    ];
    return `
<section class="hero"><div class="wrap">
  <div class="carousel" id="carousel" aria-roledescription="carrossel" aria-label="Destaques">
    ${slides.map((s, i) => `<div class="slide ${i === 0 ? 'on' : ''}" role="group" aria-roledescription="slide" aria-label="${i + 1} de ${slides.length}">
      <div class="txt"><span class="eyebrow" style="color:var(--accent-soft)">${s.eb}</span><h1>${s.t}</h1><p>${s.p}</p><div><a class="btn gold" href="${s.cta[1]}">${s.cta[0]}</a></div></div>
      <div class="ph">${icon('cam', 40)}<span>${s.img}</span></div></div>`).join('')}
    <div class="dots">${slides.map((_, i) => `<button type="button" aria-label="Ir para destaque ${i + 1}" ${i === 0 ? 'aria-current="true"' : ''} data-dot="${i}"></button>`).join('')}</div>
    <div class="arrows"><button type="button" aria-label="Anterior" data-step="-1">${icon('left', 18)}</button><button type="button" aria-label="Próximo" data-step="1">${icon('right', 18)}</button></div>
  </div>
</div></section>

<section class="quick" aria-labelledby="atalhos"><div class="wrap" style="padding-top:30px;padding-bottom:30px">
  <h2 id="atalhos" class="eyebrow" style="color:var(--muted);margin-bottom:14px">Acesso rápido</h2>
  <div class="grid g4">
    <a href="agenda.html"><span class="ico">${icon('cal')}</span><span><strong>Agenda</strong><br><span class="muted" style="font-size:14px">Sessões, festividades e convites</span></span></a>
    <a href="${url('blog.html', { cat: 'Trabalhos' })}"><span class="ico">${icon('pen')}</span><span><strong>Trabalhos</strong><br><span class="muted" style="font-size:14px">Peças apresentadas pelos Irmãos</span></span></a>
    <a href="fotos.html"><span class="ico">${icon('cam')}</span><span><strong>Fotos</strong><br><span class="muted" style="font-size:14px">Álbuns de sessões e eventos</span></span></a>
    <a href="documentos.html"><span class="ico gold">${icon('folder')}</span><span><strong>Documentos</strong><br><span class="muted" style="font-size:14px">Acervo e estatutos · restrito</span></span></a>
  </div>
</div></section>

<section class="section"><div class="wrap grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:36px">
  <div><div class="section-head"><h2>Próximas sessões e eventos</h2><a class="lnk" href="agenda.html">Ver agenda →</a></div>
    <div class="stack">${EVENTS.slice(0, 5).filter(canSee).map(eventRow).join('')}${lockedNote(hiddenCount(EVENTS.slice(0, 5)), 'evento')}</div></div>
  <div><div class="section-head"><h2>Aniversários do mês</h2>${logged ? '<a class="lnk" href="irmaos.html">Diretório →</a>' : ''}</div>
    ${logged ? `<div class="stack">${MEMBERS.filter((m) => m.fam && /\/11$/.test(m.fam.niver)).map((m) => `<div class="event"><span class="ico gold">${icon('gift')}</span><div><span class="t">${esc(m.fam.n)}</span><div class="meta">${m.fam.niver} · cunhada, esposa do Ir∴ ${esc(m.n)}</div></div></div>`).join('')}</div>`
      : `<div class="locked-note">${icon('lock')}<span>Aniversários de Irmãos e cunhadas aparecem para quem está logado.</span></div>`}
  </div>
</div></section>

<section class="section" style="padding-top:0"><div class="wrap">
  <div class="section-head"><h2>Últimas do blog</h2><a class="lnk" href="blog.html">Todos os artigos →</a></div>
  <div class="grid g3">${visPosts.slice(0, 6).map(postCard).join('')}</div>
  <div style="margin-top:16px">${lockedNote(hiddenCount(POSTS))}</div>
</div></section>

<section class="section" style="padding-top:0"><div class="wrap">
  <div class="section-head"><h2>A Loja e as coirmãs</h2></div>
  <div class="grid g3">${Object.values(ENT).map((e) => `<a class="card ent-card" href="${url('entidade.html', { ent: e.id })}">${logoOf(e)}<span style="display:flex;flex-direction:column;gap:4px"><span class="eyebrow">${e.kind}</span><strong class="serif" style="font-size:17px;color:var(--primary-dark)">${esc(e.name)}</strong><span class="muted" style="font-size:13px">${esc(e.tag)}</span></span></a>`).join('')}</div>
</div></section>`;
  };

  PAGES.blog = () => {
    const cat = qs.get('cat') || '', ent = qs.get('ent') || '';
    const base = POSTS.filter((p) => (!cat || p.cat === cat) && (!ent || p.ent === ent));
    const list = base.filter(canSee);
    const catChips = [['', 'Todos']].concat(CATS.map((c) => [c, c])).map(([c, l]) => `<a class="chip ${cat === c ? 'on' : ''}" href="${url('blog.html', Object.assign(c ? { cat: c } : {}, ent ? { ent } : {}))}">${l}</a>`).join('');
    return `
${pageHead('Artigos e notícias', 'Blog', 'Trabalhos dos Irmãos, informes do GOB, eventos e a história da Loja — em ordem cronológica, do mais novo para o mais antigo.')}
<div class="wrap section">
  <div class="toolbar"><div class="chips" role="group" aria-label="Categorias">${catChips}</div>${canWrite ? `<a class="btn pri sm" href="${url('admin.html', { tab: 'editor' })}">${icon('pen', 16)} Novo post</a>` : ''}</div>
  <div class="toolbar">${entChips(ent, 'blog.html', cat ? { cat } : {})}</div>
  ${list.length ? `<div class="grid g3">${list.map(postCard).join('')}</div>` : '<p class="muted">Nenhum artigo nesta combinação de filtros.</p>'}
  <div style="margin-top:16px">${lockedNote(hiddenCount(base))}</div>
</div>`;
  };

  PAGES.post = () => {
    const p = POSTS.find((x) => x.id === qs.get('id')) || POSTS[0];
    document.body.dataset.ent = p.ent;
    if (!canSee(p)) return restricted(esc(p.title), `Este conteúdo é visível para: <strong>${nivelLabel(p.ent, p.vis)}</strong>${p.ent === 'adonhiram' && p.vis < 3 ? ' e graus acima' : ''} (${esc(ENT[p.ent].short)}).`);
    const others = POSTS.filter((x) => x.id !== p.id && canSee(x));
    const body = BODY.map((l) => l.startsWith('## ') ? `<h2>${esc(l.slice(3))}</h2>` : l.startsWith('> ') ? `<blockquote>${esc(l.slice(2))}</blockquote>` : `<p>${esc(l)}</p>`).join('');
    return `
<div class="wrap"><div class="article">
  <article>
    <a class="lnk" href="${url('blog.html', { cat: p.cat })}">← ${esc(p.cat)}</a>
    <div class="meta" style="margin:14px 0 10px">${visBadge(p)} ${entBadge(p.ent)}</div>
    <h1>${esc(p.title)}</h1>
    <p class="muted" style="font-size:19px;line-height:1.6">${esc(p.excerpt)}</p>
    <div class="author" style="margin:18px 0 24px"><span class="avatar">${initials(p.author)}</span><span><strong>${esc(p.author)}</strong><br><span class="meta">Publicado em ${p.date} · ${p.gallery ? p.gallery + ' fotos' : '4 min de leitura'}</span></span></div>
    <div class="ph r169" style="border-radius:12px">${icon('cam', 40)}<span>[Imagem de capa]</span></div>
    ${p.gallery ? `<h2 class="serif" style="font-size:22px;margin-top:28px">Galeria do evento</h2><div class="gallery">${Array.from({ length: p.gallery }, (_, i) => `<span class="ph r11" style="border-radius:8px">${icon('cam', 22)}<span>Foto ${i + 1}</span></span>`).join('')}</div><p class="muted" style="font-size:14px">${icon('ext', 14)} Vídeos do evento ficam na <a href="#">pasta do Drive</a> (sem custo de armazenamento).</p>` : ''}
    <div class="prose">${body}</div>
    <div class="reactions"><button class="btn sec sm" type="button" data-toast="Curtidas — previsto para a fase 3">${icon('heart', 16)} Curtir</button><button class="btn sec sm" type="button" data-toast="Comentários — previsto para a fase 3">${icon('chat', 16)} Comentar</button><span class="muted" style="font-size:13px;align-self:center">Curtidas e comentários: fase 3 (a confirmar)</span></div>
  </article>
  <aside class="side">
    <div class="box"><h2>Categorias</h2>${CATS.map((c) => `<a href="${url('blog.html', { cat: c })}">${c}</a>`).join('')}</div>
    <div class="box"><h2>Leia também</h2>${others.slice(0, 4).map((o) => `<a href="${url('post.html', { id: o.id })}">${esc(o.title)}<br><span class="meta">${o.date}</span></a>`).join('')}</div>
  </aside>
</div></div>`;
  };

  PAGES.agenda = () => {
    const tab = qs.get('tab') || 'eventos', ent = qs.get('ent') || '';
    const base = EVENTS.filter((e) => (tab === 'convites' ? e.tipo === 'Convite' : e.tipo !== 'Convite') && (!ent || e.ent === ent));
    return `
${pageHead('Calendário', 'Agenda', 'Sessões, festividades e convites da Loja e das coirmãs.')}
<div class="wrap section">
  <div class="tabs" role="tablist">${[['eventos', 'Sessões e eventos'], ['convites', 'Convites']].map(([k, l]) => `<a role="tab" aria-selected="${tab === k}" href="${url('agenda.html', Object.assign({ tab: k }, ent ? { ent } : {}))}">${l}</a>`).join('')}</div>
  <div class="toolbar">${entChips(ent, 'agenda.html', { tab })}${canWrite ? `<button class="btn pri sm" type="button" data-toast="Cadastro de evento — fase 2">${icon('cal', 16)} Novo evento</button>` : ''}</div>
  <div class="stack">${base.filter(canSee).map(eventRow).join('') || '<p class="muted">Nada agendado.</p>'}${lockedNote(hiddenCount(base), 'evento')}</div>
</div>`;
  };

  PAGES.fotos = () => {
    const ent = qs.get('ent') || '';
    const base = POSTS.filter((p) => p.gallery && (!ent || p.ent === ent));
    return `
${pageHead('Acervo', 'Fotos', 'Álbuns de sessões, eventos e festividades. Cada álbum é um post com carrossel de fotos e descrição; vídeos ficam no Drive.')}
<div class="wrap section">
  <div class="toolbar">${entChips(ent, 'fotos.html')}${canWrite ? `<a class="btn pri sm" href="${url('admin.html', { tab: 'editor' })}">${icon('cam', 16)} Novo álbum</a>` : ''}</div>
  <div class="grid g3">${base.filter(canSee).map((p) => `<a class="card" href="${url('post.html', { id: p.id })}"><span class="ph r54">${icon('cam', 34)}<span>[${p.gallery} fotos]</span></span><span class="body"><h3>${esc(p.title)}</h3><span class="meta">${p.date} ${entBadge(p.ent)} ${visBadge(p)}</span></span></a>`).join('')}</div>
  <div style="margin-top:16px">${lockedNote(hiddenCount(base), 'álbum')}</div>
</div>`;
  };

  PAGES.documentos = () => {
    if (!logged) return restricted('Documentos', 'Estatutos, regimentos, atas digitalizadas e relatórios ficam disponíveis conforme o seu grau e a sua entidade.');
    const ent = qs.get('ent') || '';
    const base = DOCS.filter((d) => !ent || d.ent === ent);
    return `
${pageHead('Restrito', 'Documentos', 'Acervo digitalizado e documentos oficiais. Os arquivos ficam no Google Drive; o site organiza e controla quem vê. Atas novas continuam no GOB Conecta.')}
<div class="wrap section">
  <div class="toolbar">${entChips(ent, 'documentos.html')}${isAdmin ? `<button class="btn pri sm" type="button" data-toast="Adicionar link do Drive — fase 2">${icon('folder', 16)} Adicionar documento</button>` : ''}</div>
  <div class="table-wrap"><table><thead><tr><th>Documento</th><th>Tipo</th><th>Entidade</th><th>Quem vê</th><th></th></tr></thead><tbody>
  ${base.filter(canSee).map((d) => `<tr><td><span class="cellp"><span class="ico">${icon('doc', 18)}</span><strong>${esc(d.t)}</strong></span></td><td>${d.tipo}</td><td>${esc(ENT[d.ent].short)}</td><td>${visBadge(d)}</td><td><a class="lnk" href="#" data-toast="Abre o arquivo no Google Drive">Abrir no Drive ${icon('ext', 14)}</a></td></tr>`).join('')}
  </tbody></table></div>
  <div style="margin-top:16px">${lockedNote(hiddenCount(base), 'documento')}</div>
</div>`;
  };

  PAGES.irmaos = () => {
    if (!logged || !(isMaster || role.ent === 'adonhiram')) return restricted('Diretório de Irmãos', 'O diretório com os contatos dos Irmãos e familiares é visível apenas para os membros da Loja. [Confirmar com o grupo quem pode ver esses dados.]');
    const graus = { 1: 'Aprendiz', 2: 'Companheiro', 3: 'Mestre' };
    return `
${pageHead('Restrito · Loja', 'Diretório de Irmãos', 'Contatos dos Irmãos e das famílias, para lembrar aniversários e organizar ações como a do Dia dos Pais.')}
<div class="wrap section">
  <div class="toolbar"><label class="sr" for="busca">Buscar</label><input id="busca" type="search" placeholder="Buscar por nome" style="max-width:340px" data-filter-table="dir">
    <span class="meta">${icon('eye', 16)} Telefones mascarados no protótipo</span></div>
  <div class="table-wrap"><table id="dir"><thead><tr><th>Irmão</th><th>Grau</th><th>Cargo</th><th>Telefone</th><th>Cunhada</th><th>Telefone</th><th>Aniversário</th></tr></thead><tbody>
  ${MEMBERS.map((m) => `<tr><td><span class="cellp"><span class="avatar">${initials(m.n)}</span><strong>${esc(m.n)}</strong></span></td><td><span class="badge g${m.g}">${graus[m.g]}</span></td><td>${esc(m.cargo)}</td><td>${m.tel}</td><td>${m.fam ? esc(m.fam.n) : '<span class="muted">—</span>'}</td><td>${m.fam ? m.fam.tel : ''}</td><td>${m.fam ? m.fam.niver : ''}</td></tr>`).join('')}
  </tbody></table></div>
  <p class="muted" style="font-size:14px">Campos sugeridos na reunião: nome da cunhada, telefone, data de nascimento (e endereço). [Confirmar lista final.]</p>
</div>`;
  };

  PAGES.entidade = () => {
    const e = ENT[qs.get('ent')] || ENT.adonhiram;
    const tab = qs.get('tab') || 'historia';
    document.body.dataset.ent = e.id;
    document.title = e.name + ' — Portal Fraternidade Adonhiram';
    const posts = POSTS.filter((p) => p.ent === e.id);
    const tabs = [['historia', 'História'], ['diretoria', 'Diretoria e cargos'], ['galeria', e.galeria], ['conteudo', 'Publicações']];
    let inner = '';
    if (tab === 'historia') inner = `
<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));gap:36px;align-items:start">
  <div class="prose" style="font-size:17px">
    <p>${esc(e.desc)}</p>
    <p>[Texto de história: fundação, primeiros membros, marcos importantes. Enviar pelo grupo.]</p>
    <h2>Marcos</h2>
    <div class="stack" style="font-size:15px">${['[Ano] — Fundação', '[Ano] — Inauguração da sede na Rua Pedro Américo, 146', '[Ano] — [Marco importante]'].map((m) => `<div class="event"><span class="ico gold">${icon('cal', 18)}</span><span>${m}</span></div>`).join('')}</div>
  </div>
  <div class="stack"><span class="ph r54" style="border-radius:12px">${icon('cam', 40)}<span>[Foto da ${e.id === 'adonhiram' ? 'Loja / templo' : 'entidade'}]</span></span>
    ${canAdminEnt(e.id) ? `<div class="notice info">Você administra esta entidade: pode editar esta página, publicar e gerenciar membros. <a href="admin.html">Ir para a administração →</a></div>` : ''}</div>
</div>`;
    if (tab === 'diretoria') inner = `
<p class="muted">${esc(e.cargosNota)}</p>
<div class="grid g4">${e.cargos.map((c) => `<div class="card"><span class="body" style="align-items:center;text-align:center"><span class="avatar" style="width:64px;height:64px">${icon('users', 26)}</span><span class="eyebrow">${esc(c)}</span><strong>[Nome]</strong><span class="meta">Gestão [20xx–20xx]</span></span></div>`).join('')}</div>`;
    if (tab === 'galeria') inner = `
<p class="muted">${e.galeria} — nome, período e foto. [Lista a enviar pelo grupo.]</p>
<div class="grid g4">${Array.from({ length: 8 }, (_, i) => `<div class="card"><span class="ph r11">${icon('users', 30)}<span>[Retrato]</span></span><span class="body"><strong>[Nome]</strong><span class="meta">[${2003 + i * 2}–${2005 + i * 2}]</span></span></div>`).join('')}</div>`;
    if (tab === 'conteudo') inner = `
<div class="grid g3">${posts.filter(canSee).map(postCard).join('')}</div><div style="margin-top:16px">${lockedNote(hiddenCount(posts))}</div>`;
    return `
<section class="page-head"><div class="wrap">${logoOf(e)}<div><span class="eyebrow">${e.kind}</span><h1>${esc(e.name)}</h1><p>${esc(e.tag)}${e.full !== e.name ? ` · <em>${esc(e.full)}</em>` : ''}</p></div></div><div class="checker" style="height:8px"></div></section>
<div class="wrap section">
  <div class="tabs" role="tablist">${tabs.map(([k, l]) => `<a role="tab" aria-selected="${tab === k}" href="${url('entidade.html', { ent: e.id, tab: k })}">${l}</a>`).join('')}</div>
  ${inner}
  <div class="notice" style="margin-top:28px">Cada entidade usa a mesma estrutura com cor e logo próprios (white label). ${e.id === 'frafem' ? 'Cor da Frafem provisória — aguardando identidade visual e logo.' : e.id === 'damasco' ? 'Cor tirada do logo da Associação.' : 'Emblema da Loja provisório — confirmar se a águia é da Loja ou só da Associação.'}</div>
</div>`;
  };

  PAGES.login = () => `
<div class="login"><div class="panel">
  <div class="checker" style="height:8px"></div>
  <form class="in" id="login-form">
    <div style="display:flex;gap:12px;align-items:center">${logoOf(ENT.adonhiram)}<div><span class="eyebrow">Área do Irmão</span><h1 class="serif" style="font-size:24px">Entrar</h1></div></div>
    <div class="field"><label for="em">E-mail</label><input id="em" type="email" autocomplete="username" placeholder="seu@email.com"></div>
    <div class="field"><label for="pw">Senha</label><input id="pw" type="password" autocomplete="current-password" placeholder="••••••••"></div>
    <button class="btn pri" type="submit">Entrar</button>
    <a class="lnk" href="#" data-toast="O administrador da sua entidade gera uma nova senha provisória">Esqueci minha senha</a>
    <div class="notice info">Não há cadastro aberto. Sua conta é criada pelo administrador da sua entidade, que envia uma senha provisória. No primeiro acesso você escolhe a sua senha.</div>
    <p class="muted" style="margin:0;font-size:13px">Protótipo: ao entrar você vê o site como <strong>Irmão Mestre</strong>. Use o seletor do topo para testar outros perfis.</p>
  </form>
</div></div>`;

  PAGES.admin = () => {
    if (!canWrite) return restricted('Administração', 'A administração é para autores e administradores. No protótipo, escolha "Irmão Companheiro" (autor), "Admin da Loja" ou "Admin master" no seletor do topo.');
    const tabs = isAdmin ? [['usuarios', 'Usuários'], ['conteudo', 'Conteúdo'], ['editor', 'Novo post'], ['permissoes', 'Acessos por grau']] : [['conteudo', 'Meus posts'], ['editor', 'Novo post']];
    let tab = qs.get('tab') || tabs[0][0];
    if (!tabs.some((t) => t[0] === tab)) tab = tabs[0][0];
    const scopeEnt = isMaster ? null : role.ent;
    const scopeLabel = isMaster ? 'Todas as entidades' : ENT[role.ent].name;
    const nav = `<nav class="admin-nav" aria-label="Administração">${tabs.map(([k, l]) => `<a class="${tab === k ? 'on' : ''}" href="${url('admin.html', { tab: k })}">${l}</a>`).join('')}<div class="notice info" style="margin-top:12px;font-size:13px"><strong>${esc(PERFIS[role.perfil])}</strong><br>Escopo: ${esc(scopeLabel)}</div></nav>`;
    let inner = '';

    if (tab === 'usuarios') {
      const users = USERS.filter((u) => !scopeEnt || u.ent === scopeEnt);
      const stBadge = { ativo: '<span class="badge pub">Ativo</span>', pendente: '<span class="badge g3">1º acesso pendente</span>', inativo: '<span class="badge off">Inativo</span>' };
      inner = `
<div class="toolbar"><div><h1 class="serif" style="font-size:28px">Usuários</h1><p class="muted" style="margin:4px 0 0">Contas criadas só pelo administrador. Inativar remove o acesso, mas mantém as publicações.</p></div><button class="btn pri" type="button" data-open="dlg-user">${icon('users', 18)} Novo membro</button></div>
<div class="stats">${[['Total', users.length], ['Ativos', users.filter((u) => u.st === 'ativo').length], ['1º acesso pendente', users.filter((u) => u.st === 'pendente').length], ['Inativos', users.filter((u) => u.st === 'inativo').length]].map(([l, v]) => `<div class="stat"><span class="muted" style="font-size:13px">${l}</span><b>${v}</b></div>`).join('')}</div>
<div class="toolbar"><label class="sr" for="busca-u">Buscar</label><input id="busca-u" type="search" placeholder="Buscar por nome, e-mail ou CIM" style="max-width:360px" data-filter-table="tbl-users"></div>
<div class="table-wrap"><table id="tbl-users"><thead><tr><th>Nome</th>${isMaster ? '<th>Entidade</th>' : ''}<th>Grau / nível</th><th>Cargo</th><th>Perfil</th><th>Status</th><th>Último acesso</th><th></th></tr></thead><tbody>
${users.map((u) => `<tr><td><span class="cellp"><span class="avatar">${initials(u.n)}</span><span><strong>${esc(u.n)}</strong><br><span class="meta">${esc(u.email)}${u.cim ? ' · CIM ' + u.cim : ''}</span></span></span></td>${isMaster ? `<td>${esc(ENT[u.ent].short)}</td>` : ''}<td>${visBadge({ ent: u.ent, vis: u.nivel })}</td><td>${esc(u.cargo || '—')}</td><td><label class="sr" for="pf-${u.email}">Perfil</label><select id="pf-${u.email}" style="min-width:150px" data-toast-change="Perfil alterado (simulação)">${Object.entries(PERFIS).filter(([k]) => isMaster || k !== 'master').map(([k, l]) => `<option value="${k}" ${u.perfil === k ? 'selected' : ''}>${l}</option>`).join('')}</select></td><td>${stBadge[u.st]}</td><td class="meta">${u.last}</td><td><button class="btn sec sm" type="button" data-toast="${u.st === 'inativo' ? 'Reativado' : u.st === 'pendente' ? 'Nova senha provisória gerada' : 'Inativado — publicações continuam no ar'} (simulação)">${u.st === 'inativo' ? 'Reativar' : u.st === 'pendente' ? 'Nova senha' : 'Inativar'}</button></td></tr>`).join('')}
</tbody></table></div>`;
    }

    if (tab === 'conteudo') {
      const STS = ['publicado', 'publicado', 'revisao', 'publicado', 'agendado', 'publicado', 'rascunho', 'publicado', 'publicado', 'publicado', 'publicado'];
      const stB = { publicado: '<span class="badge pub">Publicado</span>', revisao: '<span class="badge g3">Em revisão</span>', agendado: '<span class="badge g1">Agendado</span>', rascunho: '<span class="badge off">Rascunho</span>' };
      const list = POSTS.map((p, i) => Object.assign({}, p, { st: STS[i] })).filter((p) => isMaster || (isAdmin ? p.ent === role.ent : p.author === role.nome));
      inner = `
<div class="toolbar"><div><h1 class="serif" style="font-size:28px">${isAdmin ? 'Conteúdo' : 'Meus posts'}</h1><p class="muted" style="margin:4px 0 0">${isAdmin ? 'Posts de autores chegam "Em revisão" para você aprovar.' : 'Seus posts vão para revisão do administrador antes de publicar.'}</p></div><a class="btn pri" href="${url('admin.html', { tab: 'editor' })}">${icon('pen', 18)} Novo post</a></div>
<div class="table-wrap"><table><thead><tr><th>Título</th><th>Categoria</th><th>Entidade</th><th>Quem vê</th><th>Status</th><th>Data</th><th></th></tr></thead><tbody>
${list.map((p) => `<tr><td><strong>${esc(p.title)}</strong><br><span class="meta">${esc(p.author)}${p.home ? ' · destaque na Início' : ''}</span></td><td>${p.cat}</td><td>${esc(ENT[p.ent].short)}</td><td>${visBadge(p)}</td><td>${stB[p.st]}</td><td class="meta">${p.date}</td><td><a class="btn sec sm" href="${url('admin.html', { tab: 'editor', id: p.id })}">${p.st === 'revisao' && isAdmin ? 'Revisar' : 'Editar'}</a></td></tr>`).join('') || '<tr><td colspan="7" class="muted">Nenhum post ainda.</td></tr>'}
</tbody></table></div>`;
    }

    if (tab === 'editor') {
      const ed = POSTS.find((p) => p.id === qs.get('id'));
      const entOpts = Object.values(ENT).filter((e) => isMaster || e.id === role.ent);
      const curEnt = ed ? ed.ent : entOpts[0].id;
      inner = `
<form id="editor"><div class="toolbar"><div><a class="lnk" href="${url('admin.html', { tab: 'conteudo' })}">← Conteúdo</a><h1 class="serif" style="font-size:28px;margin-top:6px">${ed ? 'Editar post' : 'Novo post'}</h1></div>
<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn sec" type="button" data-toast="Rascunho salvo (simulação)">Salvar rascunho</button><button class="btn pri" type="submit">${isAdmin ? 'Publicar' : 'Enviar para revisão'}</button></div></div>
<div class="editor">
  <div class="form">
    <div class="field"><label for="f-title">Título</label><input id="f-title" type="text" value="${ed ? esc(ed.title) : ''}" placeholder="Ex.: O silêncio como instrumento de trabalho"></div>
    <div class="field"><label for="f-exc">Resumo</label><input id="f-exc" type="text" value="${ed ? esc(ed.excerpt) : ''}" placeholder="Uma ou duas frases para a listagem e para compartilhar no WhatsApp"></div>
    <div class="field"><label for="f-body">Texto</label><span class="hint">Cole o texto do trabalho ou do informe. Use ## para subtítulo e &gt; para citação.</span><textarea id="f-body">${ed ? esc(BODY.join('\n')) : ''}</textarea></div>
    <div class="field"><span style="font-weight:600;font-size:14px">Imagens</span><div class="ph r169" style="border:2px dashed #CFC8B8;border-radius:12px;aspect-ratio:auto;min-height:150px">${icon('cam', 32)}<span>Arraste a capa e as fotos do álbum aqui<br><small>As imagens são comprimidas no envio. Vídeos: cole o link do Drive.</small></span></div></div>
  </div>
  <div class="form" style="align-content:start">
    <div class="box form">
      <div class="field"><label for="f-ent">Entidade</label><select id="f-ent">${entOpts.map((e) => `<option value="${e.id}" ${curEnt === e.id ? 'selected' : ''}>${esc(e.name)}</option>`).join('')}</select></div>
      <div class="field"><label for="f-cat">Categoria</label><select id="f-cat">${CATS.map((c) => `<option ${ed && ed.cat === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
      <fieldset><legend>Quem pode ver</legend><div id="vis-opts">${visOptions(curEnt, ed ? ed.vis : 0)}</div></fieldset>
      <label class="radio"><input type="checkbox" class="check" ${ed && ed.home ? 'checked' : ''}><span>Destacar no carrossel da Início<small>Só para conteúdo público</small></span></label>
      <div class="field"><label for="f-when">Publicação</label><select id="f-when"><option>Publicar agora</option><option>Agendar…</option></select></div>
      ${isAdmin ? `<div class="field"><label for="f-author">Autor</label><select id="f-author">${USERS.filter((u) => !scopeEnt || u.ent === scopeEnt).map((u) => `<option ${u.n === (ed ? ed.author : role.nome) ? 'selected' : ''}>${esc(u.n)}</option>`).join('')}</select><span class="hint">O admin pode publicar em nome de um Irmão.</span></div>` : ''}
    </div>
  </div>
</div></form>`;
    }

    if (tab === 'permissoes') {
      const rows = [['Conteúdo público', [1, 1, 1, 1, 1]], ['Conteúdo de Aprendiz', [0, 1, 1, 1, 1]], ['Conteúdo de Companheiro', [0, 0, 1, 1, 1]], ['Conteúdo de Mestre', [0, 0, 0, 1, 1]], ['Diretório de Irmãos', [0, 1, 1, 1, 1]], ['Documentos', [0, 'grau', 'grau', 'grau', 1]]];
      const acts = [['Publicar (vai para revisão)', [0, 0, 1, 1, 1]], ['Aprovar e publicar', [0, 0, 0, 1, 1]], ['Criar/inativar contas da entidade', [0, 0, 0, 1, 1]], ['Gerenciar todas as entidades', [0, 0, 0, 0, 1]]];
      const cell = (v) => v === 1 ? '<td class="yes">✓</td>' : v === 0 ? '<td class="no">—</td>' : `<td>${v}</td>`;
      inner = `
<h1 class="serif" style="font-size:28px">Acessos por grau</h1>
<p class="muted">Cascata definida na reunião: cada grau vê o seu conteúdo e o dos graus anteriores. Frafem e Associação têm "Público" e "Membros" (a confirmar).</p>
<h2 style="font-size:18px;margin:22px 0 10px">O que cada um vê (Loja)</h2>
<div class="table-wrap"><table class="matrix"><thead><tr><th></th><th>Visitante</th><th>Aprendiz</th><th>Companheiro</th><th>Mestre</th><th>Admin master</th></tr></thead><tbody>${rows.map(([l, v]) => `<tr><td>${l}</td>${v.map(cell).join('')}</tr>`).join('')}</tbody></table></div>
<h2 style="font-size:18px;margin:22px 0 10px">O que cada perfil pode fazer</h2>
<div class="table-wrap"><table class="matrix"><thead><tr><th></th><th>Visitante</th><th>Membro</th><th>Autor</th><th>Admin da entidade</th><th>Admin master</th></tr></thead><tbody>${acts.map(([l, v]) => `<tr><td>${l}</td>${v.map(cell).join('')}</tr>`).join('')}</tbody></table></div>
<div class="notice" style="margin-top:20px"><strong>Em aberto:</strong> um Mestre da Loja vê o conteúdo restrito da Frafem e da Associação? As fraternas veem algo restrito da Loja?</div>`;
    }

    return `
${pageHead(isAdmin ? 'Administração' : 'Área do autor', isAdmin ? 'Painel administrativo' : 'Publicar', '')}
<div class="wrap"><div class="admin">${nav}<div style="min-width:0">${inner}</div></div></div>
${isAdmin ? userDialog(scopeEnt) : ''}`;
  };

  function visOptions(ent, sel) {
    return ENT[ent].niveis.map(([v, l]) => `<label class="radio"><input type="radio" name="vis" value="${v}" ${v === sel ? 'checked' : ''}><span>${l}${v ? (ent === 'adonhiram' && v < 3 ? ' e acima' : '') : ''}<small>${v === 0 ? 'Qualquer pessoa, sem login' : ent === 'adonhiram' ? `Irmãos de grau ${v} ou superior` : 'Apenas membros logados da entidade'}</small></span></label>`).join('');
  }

  function userDialog(scopeEnt) {
    const ents = Object.values(ENT).filter((e) => !scopeEnt || e.id === scopeEnt);
    return `
<dialog id="dlg-user" aria-labelledby="dlg-user-t"><form method="dialog" id="user-form">
  <div class="dlg-head"><h2 id="dlg-user-t" class="serif" style="font-size:22px">Novo membro</h2><button class="btn sec sm" value="cancel" aria-label="Fechar">✕</button></div>
  <div class="dlg-body form">
    <div class="two"><div class="field"><label for="u-n">Nome completo</label><input id="u-n" type="text" required></div><div class="field"><label for="u-e">E-mail</label><input id="u-e" type="email" required></div></div>
    <div class="two"><div class="field"><label for="u-ent">Entidade</label><select id="u-ent">${ents.map((e) => `<option value="${e.id}">${esc(e.name)}</option>`).join('')}</select></div>
      <div class="field"><label for="u-niv">Grau / nível</label><select id="u-niv">${ENT[ents[0].id].niveis.filter((n) => n[0]).map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></div></div>
    <div class="two"><div class="field"><label for="u-cim">CIM <span class="muted">(Irmãos)</span></label><input id="u-cim" type="text"></div><div class="field"><label for="u-cargo">Cargo</label><input id="u-cargo" type="text" placeholder="Opcional"></div></div>
    <div class="two"><div class="field"><label for="u-tel">Telefone</label><input id="u-tel" type="tel"></div><div class="field"><label for="u-nas">Aniversário</label><input id="u-nas" type="date"></div></div>
    <div class="field"><label for="u-pf">Perfil</label><select id="u-pf">${Object.entries(PERFIS).filter(([k]) => isMaster || k !== 'master').map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></div>
    <fieldset><legend>Família (opcional)</legend><div class="form"><div class="two"><div class="field"><label for="u-fn">Nome da cunhada / esposa</label><input id="u-fn" type="text"></div><div class="field"><label for="u-ft">Telefone</label><input id="u-ft" type="tel"></div></div><div class="field"><label for="u-fd">Aniversário</label><input id="u-fd" type="date"></div></div></fieldset>
    <div class="notice info">${icon('key', 16)} Ao salvar, o sistema gera uma <strong>senha provisória</strong> para você enviar ao membro (WhatsApp ou e-mail). No primeiro acesso ele escolhe a própria senha.</div>
  </div>
  <div class="dlg-foot"><button class="btn sec" value="cancel">Cancelar</button><button class="btn pri" value="ok" data-toast-submit="Membro criado — senha provisória: Adh-7K2Q (simulação)">Criar conta</button></div>
</form></dialog>`;
  }

  /* ---------- montagem ---------- */
  const existing = document.querySelector('main');
  const content = PAGES[page] ? PAGES[page]() : (existing ? existing.innerHTML : '');
  document.body.innerHTML = header() + `<main id="conteudo">${content}</main>` + footer();

  /* ---------- comportamento ---------- */
  document.getElementById('demo-role').addEventListener('change', (ev) => { store.set('adh-role', ev.target.value); location.reload(); });
  document.querySelectorAll('[data-logout]').forEach((b) => b.addEventListener('click', (ev) => { ev.preventDefault(); store.set('adh-role', 'visitante'); location.href = 'index.html'; }));
  const hdr = document.getElementById('site-header');
  const mb = document.querySelector('[data-menu]');
  mb.addEventListener('click', () => { const o = hdr.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
  const drop = document.getElementById('drop');
  drop.querySelector('button').addEventListener('click', (ev) => { const o = drop.classList.toggle('open'); ev.currentTarget.setAttribute('aria-expanded', o); });
  document.addEventListener('click', (ev) => { if (!drop.contains(ev.target)) drop.classList.remove('open'); });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') drop.classList.remove('open'); });

  document.querySelectorAll('[data-toast]').forEach((el) => el.addEventListener('click', (ev) => { ev.preventDefault(); toast(el.dataset.toast); }));
  document.querySelectorAll('[data-toast-change]').forEach((el) => el.addEventListener('change', () => toast(el.dataset.toastChange)));
  document.querySelectorAll('[data-open]').forEach((el) => el.addEventListener('click', () => document.getElementById(el.dataset.open).showModal()));
  document.querySelectorAll('[data-toast-submit]').forEach((el) => el.addEventListener('click', () => setTimeout(() => toast(el.dataset.toastSubmit), 50)));
  document.querySelectorAll('[data-filter-table]').forEach((inp) => inp.addEventListener('input', () => {
    const q = inp.value.trim().toLowerCase();
    document.querySelectorAll('#' + inp.dataset.filterTable + ' tbody tr').forEach((tr) => { tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none'; });
  }));

  const uEnt = document.getElementById('u-ent');
  if (uEnt) uEnt.addEventListener('change', () => { document.getElementById('u-niv').innerHTML = ENT[uEnt.value].niveis.filter((n) => n[0]).map(([v, l]) => `<option value="${v}">${l}</option>`).join(''); });
  const fEnt = document.getElementById('f-ent');
  if (fEnt) fEnt.addEventListener('change', () => { document.getElementById('vis-opts').innerHTML = visOptions(fEnt.value, 0); });
  const ed = document.getElementById('editor');
  if (ed) ed.addEventListener('submit', (ev) => { ev.preventDefault(); toast(isAdmin ? 'Post publicado (simulação)' : 'Enviado para revisão do administrador (simulação)'); });
  const lf = document.getElementById('login-form');
  if (lf) lf.addEventListener('submit', (ev) => { ev.preventDefault(); store.set('adh-role', 'mestre'); location.href = 'index.html'; });

  const car = document.getElementById('carousel');
  if (car) {
    const slides = car.querySelectorAll('.slide'), dots = car.querySelectorAll('[data-dot]');
    let i = 0, timer;
    const show = (n) => { i = (n + slides.length) % slides.length; slides.forEach((s, k) => s.classList.toggle('on', k === i)); dots.forEach((d, k) => d.setAttribute('aria-current', k === i ? 'true' : 'false')); };
    const auto = () => { clearInterval(timer); timer = setInterval(() => show(i + 1), 7000); };
    dots.forEach((d) => d.addEventListener('click', () => { show(+d.dataset.dot); auto(); }));
    car.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => { show(i + +b.dataset.step); auto(); }));
    car.addEventListener('focusin', () => clearInterval(timer));
    auto();
  }
})();
