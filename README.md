# Letícia & Guilherme · Site do casamento

Site estático (HTML, CSS e JavaScript) para o GitHub Pages.

## Estrutura
- index.html: conteúdo das 5 páginas (Início, Nossa história, Manual, Guia, Presença)
- style.css: visual, cores e animações
- script.js: troca de páginas, abertura com o brasão se desenhando, contagem em mostradores, mapa da rota, abas e formulário
- assets/: brasão (PNG e SVG vetorizado), moldura e ornamentos barrocos, nomes (assinatura do convite), igreja, capa-desk.jpg e capa-mob.jpg (a capa: a igreja e o horizonte de Minas em gravura noturna), carro-noivos.webp (o carrinho com os noivos no Guia), gravura-noite.jpg (a mesma gravura em versão noturna, nos topos das páginas e no rodapé) e ilustrações dos trajes

## Publicar
1. Suba todos os arquivos num repositório, mantendo a pasta assets (não suba preview.html).
2. Settings > Pages > branch main, pasta / (root).
3. Domínio próprio: Settings > Pages > Custom domain + registro CNAME no DNS.

## Editar
- Confirmação e lista de presentes: no topo do script.js (rsvpEndpoint e giftsUrl).
- Trocar ilustração de traje: substitua o arquivo em assets/trajes/ com o mesmo nome
  (fundo de papel claro; o site funde o papel com o fundo).
- Cores: no início do style.css (:root).

## Tipografia
A mesma do noivado: Cormorant Garamond nos textos e a assinatura em Slight nos
nomes (imagem assets/nomes.png). Títulos em Pinyon Script, a caligrafia legível
mais próxima da Slight. As duas fontes vêm do Google Fonts.

## Fotos
Todas as fotos já estão dentro do site, em assets/fotos/ (uma por lugar, com o
mesmo nome do card). O fundo da seção da festa é assets/fotos/vila-gale-jardim.jpg e a foto da seção "Onde Minas nasceu", no fim do Guia de viagem, é assets/fotos/ouro-preto.jpg.
Para trocar uma foto, basta substituir o arquivo mantendo o mesmo nome.
Créditos: Diário do Comércio, The Hotel Guru, Mala de Aventuras, Melhores Destinos,
Dicas de Viagem e Eating the World.

## Testar no computador
O brasão animado é carregado por JavaScript e não funciona abrindo o arquivo com
dois cliques. Teste pelo GitHub Pages ou com um servidor local
(python3 -m http.server na pasta do site). Sem servidor, aparece o brasão estático.
