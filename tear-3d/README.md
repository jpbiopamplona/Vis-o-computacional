# Tear de pedal – modelo 3D interativo

Modelo 3D de um tear de pedal para tapete de retalho, reconstruído a partir de fotos de uma oficina.

| Página | Para quê | Endereço depois de publicado |
|---|---|---|
| `index.html` | Versão completa para computador: modelo 3D, explicação das peças, ciclo de tecelagem, contagem de produção, ajuste de medidas e controle por gestos (webcam) | `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/` |
| `celular.html` | Versão para celular: modelo 3D e explicação de cada peça, sem visão computacional | `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/celular.html` |

O menu (☰) da versão completa mostra um QR code que leva direto para a versão de celular.

## Estrutura

```
index.html          versão completa
celular.html        versão para celular
assets/tear.css     visual compartilhado
assets/tear.js      modelo 3D, peças, animação e produção (usado pelas duas páginas)
assets/gestos.js    visão computacional (MediaPipe), só na versão completa
abrir_local.bat     abre o site no próprio computador (Windows)
.nojekyll           avisa o GitHub Pages para publicar os arquivos como estão
```

## Publicar no GitHub Pages (sem usar linha de comando)

1. Entre em github.com e clique em **New repository**. Dê um nome (ex.: `tear-3d`), deixe **Public** e crie.
2. Na página do repositório, clique em **uploading an existing file** (ou **Add file → Upload files**).
3. Arraste **todo o conteúdo desta pasta** (incluindo a pasta `assets` e o arquivo `.nojekyll`) e clique em **Commit changes**.
   - Se o `.nojekyll` não aparecer por ser arquivo oculto, pode seguir sem ele; o site funciona do mesmo jeito.
4. Vá em **Settings → Pages**. Em **Source**, escolha **Deploy from a branch**, branch **main**, pasta **/ (root)**, e salve.
5. Espere de 1 a 2 minutos. O endereço aparece no topo da página de Settings → Pages.

Para atualizar depois, é só subir os arquivos novos do mesmo jeito (o GitHub substitui os antigos).

## Rodar no computador sem publicar

Dê dois cliques em `abrir_local.bat` (precisa do Python instalado). Ele sobe um servidor local e abre o site no navegador.
Abrir o `index.html` direto com dois cliques não funciona por completo, porque o navegador bloqueia scripts e câmera fora de um servidor.

## Controle por gestos (versão completa)

Clique em **Gestos** e permita o uso da câmera. Funciona em `https` (GitHub Pages) ou `localhost`.

- Uma mão aberta: gira o tear.
- Duas mãos abertas: afastar aproxima, juntar afasta; mover as duas juntas gira.
- Indicador esticado: move o cursor e mostra o nome da peça.
- Pinça (polegar + indicador): seleciona a peça.
- Punho fechado: descanso.

## Contagem de produção

A simulação tece mais rápido que uma pessoa, então o painel **Produção** (tecla P) mostra:

1. o que foi tecido na simulação (passadas ÷ passadas por cm);
2. quanto tempo esse pedaço levaria de verdade com uma artesã e com um tear automatizado;
3. quanto cada um produz numa jornada.

Valores iniciais (editáveis em "Parâmetros e referências"):

- 2 passadas por cm: tapete de retalho costuma ter de 4 a 8 passadas por polegada.
- Artesã: 30 cm de tapete por hora de tecelagem, conforme relatos de tecelãs de tapete de retalho em tear de pedal.
- Automatizado: 300 m por dia, média da faixa de 240 a 360 m lineares por dia anunciada por um fabricante nacional de tear mecanizado para tapete de malha.

O ideal é substituir por medições feitas na oficina.

## Tecnologias

- [three.js r128](https://threejs.org/) para o 3D
- [MediaPipe Hand Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker) para a detecção das mãos
- [qrcodejs](https://github.com/davidshimjs/qrcodejs) para o QR code
