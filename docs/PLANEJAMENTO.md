# Portal Fraternidade Adonhiram — Planejamento

> Fontes: reunião "Site <> Fraternidade Adoniran" (09/11/2026), Estatuto da Fraternidade Feminina Cruzeiro do Sul, Estatuto da Sociedade Beneficente Estrada de Damasco, logos enviados e o protótipo "Site Fraternidade Adoniran" no Claude Design.
>
> Este documento tem três partes: **1. Planejamento** (o que é o site e como funciona), **2. Organização** (o que será feito e em que ordem) e **3. Informações necessárias** (o que o grupo precisa enviar).

---

## 1. Planejamento

### 1.1 Problema e objetivo

Hoje os trabalhos, fotos, informes e a história da Loja ficam espalhados em pastas do Drive e grupos de WhatsApp — "fica salvo, mas ninguém olha". O GOB Conecta já cobre a parte administrativa (atas, presença), mas não tem lugar para os **trabalhos dos Irmãos**, os **eventos** e a **história** da Loja.

**Objetivo:** um portal em formato de **blog**, leve, responsivo (a maioria vai acessar pelo celular), com uma **linha do tempo** de tudo que acontece na Loja e nas entidades coirmãs, com acesso controlado por grau.

**Não é objetivo:** substituir o GOB Conecta (atas, presença, controle de loja) nem virar repositório de vídeos pesados.

### 1.2 Entidades (white label)

Uma única aplicação, mesma estrutura, com páginas e cor própria para cada entidade:

| Entidade | Nome oficial (estatuto) | Quem participa | Níveis de acesso |
|---|---|---|---|
| **A Loja** | A.R.L.S. Fraternidade Adonhiram nº 2503 — GOB-SP / GOB | Irmãos | Público → Aprendiz (1) → Companheiro (2) → Mestre (3) |
| **Fraternidade Feminina** | Fraternidade Feminina Cruzeiro do Sul de Praia Grande (Frafem) | Fraternas: esposas, mães, viúvas, irmãs, filhas e familiares de maçons, maiores de 18 | Público → Fraternas *(a confirmar)* |
| **Associação** | Sociedade Beneficente Estrada de Damasco (logo: "Associação Beneficente") | Sócios: fundadores, efetivos, remidos, honorários, beneméritos, colaboradores | Público → Sócios *(a confirmar)* |

Sede comum: Rua Pedro Américo, 146 — Parque das Américas, Praia Grande/SP.

### 1.3 Funcionalidades (do que foi falado na reunião)

**Público (sem login)**
- Início com carrossel de destaques, próximas sessões/eventos, últimas do blog e fotos recentes.
- Blog com categorias: Trabalhos (peças de arquitetura), Informes do GOB, Eventos, Atas, História/TBT, Notícias, Filantropia.
- Agenda (sessões, festividades, convites).
- Fotos (álbuns dos eventos — carrossel de imagens + descrição; vídeos ficam no Drive, só com link).
- Página de cada entidade: história, diretoria/cargos, galeria de Veneráveis/Presidentes.

**Restrito (com login)**
- Conteúdo por grau, em cascata: Aprendiz vê público + grau 1; Companheiro vê até grau 2; Mestre vê tudo.
- Documentos (acervo histórico digitalizado, links para o Drive).
- Diretório de Irmãos com dados da família: nome da cunhada, telefone, aniversário (pedido do Tullio/Maurício — campanha do dia dos pais, lembrete de aniversário das cunhadas).
- Publicar o próprio trabalho (o autor loga e posta; ou um admin posta por ele).

**Administração**
- **Sem cadastro público.** Conta criada só por administrador → senha provisória → troca no primeiro acesso.
- Membro que sai: marcado como **inativo** (perde o acesso, mas os posts dele continuam no ar).
- **Admin de entidade:** gerencia membros e conteúdo da sua entidade.
- **Admin master:** vê e mexe em tudo.
- Ao publicar: escolher entidade, categoria, **visibilidade** (Público / Aprendiz / Companheiro / Mestre) e se aparece em destaque na Início.

### 1.4 Modelo de acesso

```
Visitante ──► Público
Aprendiz  ──► Público + Grau 1
Companheiro► Público + Grau 1 + Grau 2
Mestre    ──► Público + Grau 1 + Grau 2 + Grau 3
Fraterna  ──► Público + conteúdo "Fraternas" da Frafem
Sócio     ──► Público + conteúdo "Sócios" da Estrada de Damasco
Admin da entidade ► tudo da sua entidade + gestão de usuários dela
Admin master ► tudo
```

Perfis de **permissão** (o que a pessoa pode *fazer*) são separados do **grau** (o que ela pode *ver*):

| Perfil | Pode |
|---|---|
| Membro | Ler o que o grau permite; editar o próprio perfil |
| Autor | + Publicar trabalhos e álbuns (vão para revisão) |
| Admin da entidade | + Aprovar/publicar, criar e desativar contas da entidade |
| Admin master | + Tudo, em todas as entidades |

### 1.5 Arquitetura proposta (custo ≈ só o domínio)

| Camada | Escolha | Por quê |
|---|---|---|
| Protótipo (agora) | HTML estático no **GitHub Pages** | Validar telas rápido, sem custo, link para mandar no WhatsApp |
| App | **Next.js** na **Vercel** (plano Hobby) | Gratuito, deploy automático a cada commit |
| Banco | **Turso** (libSQL/SQLite) plano free + Drizzle ORM | Sugestão do Murilo; suficiente para blog + usuários |
| Login | Usuário e senha próprios (Auth.js/credentials, senha com hash) | Decisão da reunião: gestão dentro do site, não pelo Google |
| Imagens | Vercel Blob ou Cloudinary free, com compressão no upload | Fotos de evento leves |
| Arquivos pesados / vídeos | **Google Drive** da Loja, só com link | Evita custo de armazenamento |
| Código | GitHub (repo pessoal agora → repo oficial da associação depois) | Continuidade quando a gestão mudar |

> Atenção: a Vercel Hobby é para uso não comercial — ok para a Loja. Se o Turso ficar pequeno no futuro, migrar para Postgres (Neon/Supabase free) é direto com Drizzle.

### 1.6 Estrutura de dados (rascunho)

- `entidades` (id, nome, tipo, cores, logo)
- `usuarios` (nome, e-mail, CIM, entidade, grau, cargo, perfil, status ativo/inativo, senha_hash, deve_trocar_senha)
- `familiares` (usuario_id, nome, parentesco, telefone, nascimento, e-mail)
- `posts` (título, resumo, corpo, categoria, entidade, autor, visibilidade, destaque_home, status rascunho/revisão/agendado/publicado, publicado_em)
- `midias` (post_id, url, legenda, ordem)
- `eventos` (título, data, local, entidade, tipo sessão/festividade/convite, visibilidade)
- `documentos` (título, tipo, entidade, link_drive, visibilidade)

---

## 2. Organização do que será feito

### Fase 0 — Protótipo navegável *(esta entrega)*
- [x] Repositório no GitHub
- [x] Mockup em HTML de todas as páginas, publicado no GitHub Pages
- [x] Simulador "Visualizar como" (visitante, aprendiz, companheiro, mestre, fraterna, sócio, admins) para validar a cascata de acesso
- [ ] Feedback do grupo pelo WhatsApp → ajustes

### Fase 1 — MVP (blog + login)
1. Projeto Next.js + Turso + Drizzle; deploy na Vercel
2. Login, troca de senha no primeiro acesso, sair
3. Cadastro de usuários pelo admin (entidade, grau, perfil, ativo/inativo)
4. Blog: criar/editar/publicar post com visibilidade por grau e entidade
5. Início, Blog, Post, páginas das entidades
6. Domínio próprio apontado para a Vercel

### Fase 2 — Comunidade
7. Agenda e convites
8. Álbuns de fotos (upload com compressão, carrossel)
9. Diretório de Irmãos + dados da família + aniversariantes do mês
10. Fluxo de revisão (autor envia → admin aprova)
11. Documentos (links do Drive) por visibilidade

### Fase 3 — Extras (se fizer sentido)
- Curtidas e comentários nos posts
- Aviso por e-mail/WhatsApp de post novo ou aniversário
- "TBT" semanal: post de evento antigo
- Migrar repositório para a conta oficial da associação (Murilo)

### Responsáveis (da reunião)

| Quem | O quê |
|---|---|
| Cauê | Repositório, protótipo, desenvolvimento, páginas das entidades |
| Grupo | Logos em PNG, cores, identidade visual |
| Grupo | Hierarquias e permissões por escrito |
| Roberto | Estatutos/atas (✓ Frafem e Damasco recebidos) |
| Murilo | Criar GitHub oficial da associação e adicionar o Cauê |

---

## 3. Informações que preciso do grupo

### 3.1 Confirmações urgentes (afetam o protótipo)
1. **Grafia do nome:** o estatuto da Frafem escreve **"Fraternidade Adonhiram, nº 2503"**; a conversa e o design usam "Adoniran". Qual é a oficial para o site?
2. **Nome da associação:** o estatuto diz **"Sociedade Beneficente Estrada de Damasco"** (fundada 18/09/2002); o logo diz **"Associação Beneficente Estrada de Damasco"** (19/02/2003). Qual usar? *(O estatuto também cita a "Loja Maçônica Fraternidade Mongaguá" como origem dos sócios — está atualizado?)*
3. **Logo da Loja:** a águia com a coluna/esquadro é o emblema da Loja ou só da Associação? Não recebi logo da Loja nem da Frafem.
4. **Cores da Frafem** (usei um vinho provisório).
5. Onde a Loja se reúne é "Oriente de Praia Grande"? (O design dizia "Oriente de São Paulo".)

### 3.2 Permissões
6. Um Mestre da Loja vê o conteúdo restrito da Frafem e da Associação? E as fraternas veem algo restrito da Loja?
7. A Frafem e a Associação precisam de níveis internos (ex.: só Diretoria) ou basta "membros"?
8. Quem são os **administradores** de cada entidade e o **admin master**?
9. Qualquer Irmão pode publicar (vai para revisão) ou só alguns autores?

### 3.3 Conteúdo
10. Lista de membros de cada entidade: nome, e-mail, CIM, grau/cargo (planilha).
11. Dados da família que entram no cadastro (proposta: nome da cunhada, telefone, aniversário, data de casamento, filhos?) — **e quem pode ver** esses dados.
12. Cargos atuais da Loja (os 7 eletivos), da Frafem e da Associação, com nomes.
13. Galeria de Veneráveis Mestres / Presidentes (nome + período + foto se houver).
14. Texto de história de cada entidade + data de fundação + fotos do templo.
15. Calendário de sessões (dia da semana/horário) e próximos eventos.
16. 3 a 5 posts reais para o lançamento (um trabalho, um informe GOB, um evento com fotos).
17. Link da pasta do Drive para documentos e vídeos.

### 3.4 Infra
18. Domínio desejado (ex.: `adonhiram2503.org.br`) e quem vai pagar/registrar.
19. E-mail institucional para ser dono das contas (GitHub, Vercel, Turso) — Murilo sugeriu criar a partir do Gmail da Loja.

---

## 4. Ajustes em relação ao protótipo do Claude Design

O protótipo original foi a base visual (azul-marinho, dourado, piso xadrez, Cinzel + Inter). Mudanças aplicadas no mockup para seguir as decisões da reunião:

| No design original | No mockup | Motivo |
|---|---|---|
| Coirmã "Para Frente" | Fraternidade Feminina Cruzeiro do Sul | Era a Frafem (nome do estatuto) |
| Perfis Secretaria/Editor/Irmão/Convidado | Grau (1/2/3) + perfil (Membro/Autor/Admin entidade/Admin master) | Reunião definiu acesso por grau em cascata |
| Tela "Solicitações de acesso" | Removida; "Novo membro" criado pelo admin | Sem cadastro público |
| Post Público / Somente Irmãos | Público / Aprendiz / Companheiro / Mestre | Cascata por grau |
| — | Diretório de Irmãos (família) | Pedido na reunião |
| — | Página de cada entidade com cor própria | White label |
| — | Logos GOB e GOB-SP nas laterais do cabeçalho | Pedido do Roberto |
