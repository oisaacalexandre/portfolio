# Isaac Alexandre — Creative Copywriter

Portfólio estático (HTML + CSS + JS puros, sem build).

## Páginas
| Arquivo | Conteúdo |
|---|---|
| `index.html` | Home: abre direto na vitrine de trabalhos |
| `voz-aos-leoes.html` | 01 · Voz aos Leões |
| `every-beat-counts.html` | 02 · Every Beat Counts (Beats) |
| `victoria-brasil.html` | 03 · Victoria Brasil (abas: Aracaju 170 anos, VIC Club, VIC Summer) |
| `aracaju-169-anos.html` | 04 · Aracaju 169 anos (Governo de Sergipe) |
| `stuff.html` | 05 · Stuff (abas: Tomateverso, Te vejo na final, iFood Invasion) |
| `sobre.html` | Sobre, widget do Letterboxd (4 fitas VHS), experiência, educação e contato |

O card 06 (Bracelete Cash Banese) leva para o case no Behance.

## Letterboxd (atualização automática)
- O widget da página Sobre mostra os 4 últimos filmes, que vêm de `data/letterboxd.js`, gerado a partir do RSS público de `letterboxd.com/isaacalexandre`.
- No GitHub, a Action `.github/workflows/letterboxd.yml` roda `scripts/update-letterboxd.mjs` a cada 6 horas e só faz commit quando há filme novo.
- Para forçar agora: aba **Actions → Atualizar Letterboxd → Run workflow**.

## Identidade (v4)
- Cores: azul elétrico `#0811F4` (home, Sobre, abertura e fechamento dos projetos), branco `#FAFAFA` e preto `#171827`.
- Fontes (Google Fonts, 2 famílias): **Archivo** (leitura em largura normal; títulos em versão condensada e pesada) e **Silkscreen** (pixel: etiquetas, menu, navegação, indicadores e títulos da vitrine).
- A largura do nome na home é calculada em `.intro-name { --r: 4.314 }`. Se trocar a fonte do nome, meça de novo.
- Favicon: `favicon.ico` (raiz), `assets/img/favicon-star.svg` e `assets/img/apple-touch-icon-star.png` — estrela ✶ branca sobre o azul.
- Faixa animada: o JS (`fitMarquees`) completa cópias do grupo de palavras e anda exatamente um grupo por ciclo, por isso o loop não tem emenda.
- Carrossel de fotos do Sobre: troca sozinho a cada 7 s (`data-autoplay="7000"`), pausa com mouse/teclado e mantém as setas e os indicadores. A foto acompanha a altura do texto ao lado.

## Capas animadas
- `assets/img/gif/`: um GIF de 4 s por cartão da home (640×360), montado com as peças de cada trabalho.
- A capa estática (`.still`) fica por baixo: aparece enquanto o GIF carrega, se ele falhar ou se o sistema estiver com "reduzir movimento"/"efeitos de animação" desligados.

## Como editar
- **Textos**: cada texto existe em duas versões, `data-l="pt"` e `data-l="en"`. Edite as duas.
- **Menu e rodapé**: estão repetidos em todas as páginas; ao mudar um link, mude em todas.
- **Cores e fontes**: variáveis no topo de `assets/css/style.css`.
- **Imagens**: `assets/img/`.

## Publicar no GitHub Pages
Settings → Pages → Branch `main` / pasta raiz.
