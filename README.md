# Portal Fraternidade Adonhiram — protótipo

Protótipo navegável do portal da **A.R.L.S. Fraternidade Adonhiram nº 2503** (Praia Grande/SP) e das entidades coirmãs: **Fraternidade Feminina Cruzeiro do Sul** e **Associação Beneficente Estrada de Damasco**.

- **Ver o protótipo:** https://cauecm.github.io/fraternidade-adonhiram/
- **Planejamento, organização e informações pendentes:** [docs/PLANEJAMENTO.md](docs/PLANEJAMENTO.md)

## O que é

Um site em formato de blog para guardar e mostrar os trabalhos dos Irmãos, informes do GOB, eventos, fotos e a história da Loja, com acesso em cascata por grau (Público → Aprendiz → Companheiro → Mestre) e páginas separadas para cada entidade.

Este repositório tem, por enquanto, só o **mockup estático** (HTML/CSS/JS, sem back-end) para validar as telas com o grupo. O seletor **"Visualizar como"** no topo simula os perfis de acesso.

## Estrutura

```
index.html, blog.html, post.html, agenda.html, fotos.html,
documentos.html, irmaos.html, entidade.html, login.html,
admin.html, projeto.html          páginas (cascas; o conteúdo vem do app.js)
assets/css/site.css                estilos e cores por entidade (white label)
assets/js/data.js                  dados de exemplo (fictícios)
assets/js/app.js                   cabeçalho, rodapé, páginas e simulador de acesso
assets/img/                        logos (GOB, GOB-SP, Estrada de Damasco)
docs/PLANEJAMENTO.md               plano do projeto
```

## Rodar localmente

```bash
python3 -m http.server 8000
```

Depois abra http://localhost:8000.

## Próxima etapa

Aplicação real em Next.js + Turso na Vercel (ver o planejamento). O repositório vai para a conta oficial da associação quando ela for criada.
