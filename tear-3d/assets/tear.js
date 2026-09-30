/* Tear de pedal – modelo 3D interativo (motor compartilhado entre computador e celular) */
(function(){
const NIL = document.createElement('div');           // elemento “vazio” para páginas sem certos controles
const $ = s => document.querySelector(s) || NIL;
const IS_MOBILE_PAGE = document.body.classList.contains('m');
const view = $('#view');
if (typeof THREE === 'undefined'){
  view.insertAdjacentHTML('beforeend','<div class="err">Não foi possível carregar o motor 3D. Verifique a conexão e recarregue a página.</div>');
  return;
}

/* ---------- parâmetros (cm) ---------- */
const DEF = {W:112, D:115, H:165, L:78, s:7};
const P = Object.assign({}, DEF);
const DIMS = [
  ['W','Largura total',90,160],
  ['D','Profundidade',90,150],
  ['H','Altura do castelo',140,200],
  ['L','Largura de tecelagem',50,120],
  ['s','Seção das madeiras',5,10],
];

const PARTS = {
  estrutura:{n:'Estrutura', g:'Estrutura',
    o:'O corpo do tear: quatro pés, travessas e reforços diagonais, tudo em madeira maciça.',
    f:'Sustenta todas as outras peças e aguenta a tensão dos fios e as batidas do pente sem sair do lugar.',
    c:'Na oficina, as uniões são parafusadas e reforçadas com amarrações de tecido. Quanto mais firme a estrutura, mais regular sai o tapete.'},
  castelo:{n:'Castelo', g:'Estrutura',
    o:'A parte alta do tear, formada por duas travessas acima da área de trabalho.',
    f:'É o ponto de apoio dos quadros de liços, que ficam pendurados nele pelos cordões.',
    c:'As alças de couro nas travessas funcionam como roldanas simples: quando um quadro é puxado para baixo, o outro sobe.'},
  rolo_urdume:{n:'Rolo de urdume', g:'Mecanismo',
    o:'Cilindro na parte de trás, onde fica enrolado o urdume (o fio cinza das fotos).',
    f:'Guarda o fio que ainda vai ser tecido e vai soltando conforme o tapete cresce.',
    c:'Os discos brancos perfurados são a trava: um pino entra num dos furos e impede o rolo de girar, o que mantém os fios esticados.'},
  encosto:{n:'Encosto traseiro', g:'Estrutura',
    o:'Tubo horizontal no alto da parte de trás do tear.',
    f:'Guia os fios que saem do rolo de urdume e os deixa na altura certa para entrar nos liços.',
    c:'Como todos os fios passam por cima dele, a tensão fica igual de uma ponta à outra do tapete.'},
  urdume:{n:'Urdume', g:'Fios e tecido',
    o:'O conjunto de fios esticados no sentido do comprimento do tapete.',
    f:'É a base do tecido: a trama se entrelaça nele, por cima e por baixo.',
    c:'Sai do rolo de urdume, passa pelo encosto, pelos liços e pelo pente, e termina no tapete já tecido.'},
  quadros:{n:'Quadros de liços', g:'Mecanismo',
    o:'Duas molduras cheias de liços, que são fios verticais com um olhal no meio.',
    f:'Separam o urdume em dois grupos: os fios pares passam por um quadro e os ímpares pelo outro.',
    c:'Quando um quadro sobe e o outro desce, os fios formam duas camadas com um vão entre elas, chamado cala. É por esse vão que a trama passa.'},
  cordoes:{n:'Cordões', g:'Mecanismo',
    o:'Cordas que ligam o castelo aos quadros e os quadros às pontas dos pedais.',
    f:'Levam o movimento do pé do tecelão até os quadros.',
    c:'Ao pisar um pedal, o cordão puxa um quadro para baixo; pelas alças do castelo, o outro quadro sobe ao mesmo tempo.'},
  pedais:{n:'Pedais', g:'Mecanismo',
    o:'Duas tábuas no chão presas a um eixo. O apoio do eixo fica na frente, fora da estrutura do tear.',
    f:'São o comando do tear: o tecelão escolhe com o pé qual quadro desce.',
    c:'As pontas de trás ficam embaixo dos quadros, onde os cordões são amarrados. Ao pisar, a ponta desce e puxa o quadro. Alternando esquerdo e direito, cada fio fica uma vez por cima e uma vez por baixo da trama: é o tafetá.'},
  navete:{n:'Naveta', g:'Mecanismo',
    o:'Peça de madeira alongada que carrega a tira de retalho enrolada.',
    f:'Leva a trama de um lado ao outro por dentro da cala aberta.',
    c:'Em cada passada ela atravessa num sentido; na passada seguinte, volta pelo outro lado.'},
  tiras:{n:'Tiras de retalho', g:'Fios e tecido',
    o:'Retalhos de tecido cortados em tiras longas.',
    f:'São a trama: o material que a naveta passa entre os fios do urdume.',
    c:'Ficam pendurados no próprio tear, como na oficina, para trocar de cor rápido. É isso que dá ao tapete as listras e reaproveita tecido que seria descartado.'},
  batente:{n:'Batente com pente', g:'Mecanismo',
    o:'Moldura móvel articulada perto do chão, com um pente de lâminas finas por onde passam os fios do urdume.',
    f:'Empurra cada passada de trama contra o tecido já feito, deixando o tapete firme e uniforme.',
    c:'Depois que a naveta atravessa, o tecelão puxa o batente na sua direção (a batida) e depois o devolve para abrir espaço de novo.'},
  tecido:{n:'Tapete em produção', g:'Fios e tecido',
    o:'O resultado do processo: urdume e trama já entrelaçados.',
    f:'É o produto final, o tapete de retalho.',
    c:'Avança um pouco a cada passada, passa por cima do peitoral e é enrolado no rolo de tecido.'},
  peito:{n:'Peitoral', g:'Estrutura',
    o:'Tubo horizontal na frente, do lado de quem tece.',
    f:'Apoia o tapete pronto e o desvia para baixo, em direção ao rolo de tecido.',
    c:'Tem superfície lisa para o tapete deslizar sem prender e marca a altura de trabalho do tecelão.'},
  rolo_tecido:{n:'Rolo de tecido', g:'Mecanismo',
    o:'Cilindro na frente, abaixo do peitoral.',
    f:'Enrola o tapete à medida que ele fica pronto.',
    c:'A catraca na lateral só deixa o rolo girar num sentido. Junto com a trava do rolo de urdume, é ela que mantém os fios sempre esticados.'},
};
const TOUR = ['estrutura','castelo','rolo_urdume','encosto','urdume','quadros','cordoes','pedais','navete','tiras','batente','tecido','peito','rolo_tecido'];
const GROUPS = ['Estrutura','Mecanismo','Fios e tecido'];
const EXPL = {
  estrutura:[0,0,0], castelo:[0,80,0], quadros:[0,42,0], cordoes:[0,42,0], batente:[0,12,45],
  navete:[0,62,30], encosto:[0,18,-45], peito:[0,18,45], rolo_urdume:[0,-4,-80],
  rolo_tecido:[0,14,85], pedais:[0,0,0], urdume:[0,10,0], tecido:[0,10,60], tiras:[70,0,0],
};
const vis = {}; for (const k in PARTS) vis[k] = true;

/* ---------- cena ---------- */
const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
view.prepend(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 1, 5000);
scene.add(new THREE.HemisphereLight(0xf4f8ff, 0x3a3f3e, 0.75));
const sun = new THREE.DirectionalLight(0xffffff, 0.85);
sun.position.set(140, 260, 170); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {left:-160, right:160, top:160, bottom:-160, near:10, far:700});
sun.shadow.bias = -0.0006;
scene.add(sun);
const fill = new THREE.DirectionalLight(0xdfe8ff, 0.3); fill.position.set(-160, 120, -120); scene.add(fill);
const rim = new THREE.DirectionalLight(0xffe6d2, 0.35); rim.position.set(-120, 200, -260); scene.add(rim);

function setBg(){ scene.background = null; }
setBg();
if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setBg);

/* ---------- texturas ---------- */
function tex(c, rep){ const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); t.anisotropy = 4; return t; }
function floorTex(){
  // piso de lajotas de 40 cm que se dissolve no fundo (sem bordas duras)
  const N = 12, c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d'), t = 1024/N;
  for (let i=0;i<N;i++) for (let j=0;j<N;j++){
    const v = 46 + Math.random()*14; g.fillStyle = `rgb(${v},${v+7},${v+6})`; g.fillRect(i*t, j*t, t, t);
    for (let k=0;k<40;k++){ g.fillStyle = `rgba(255,255,255,${Math.random()*0.05})`; g.fillRect(i*t+Math.random()*t, j*t+Math.random()*t, Math.random()*26, Math.random()*2.5); }
  }
  g.strokeStyle = '#1b2120'; g.lineWidth = 3;
  for (let i=0;i<=N;i++){ g.beginPath(); g.moveTo(i*t,0); g.lineTo(i*t,1024); g.stroke(); g.beginPath(); g.moveTo(0,i*t); g.lineTo(1024,i*t); g.stroke(); }
  g.globalCompositeOperation = 'destination-in';
  const rg = g.createRadialGradient(512,512,120,512,512,512);
  rg.addColorStop(0,'rgba(0,0,0,1)'); rg.addColorStop(.55,'rgba(0,0,0,.9)'); rg.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle = rg; g.fillRect(0,0,1024,1024);
  return tex(c);
}
function woodTex(){
  const c = document.createElement('canvas'); c.width = 64; c.height = 512; const g = c.getContext('2d');
  g.fillStyle = '#b08256'; g.fillRect(0,0,64,512);
  for (let i=0;i<80;i++){
    g.strokeStyle = `rgba(70,40,18,${0.05+Math.random()*0.14})`; g.lineWidth = 0.5 + Math.random()*1.6;
    g.beginPath(); let x = Math.random()*64; g.moveTo(x,0);
    for (let y=0;y<=512;y+=32){ x += (Math.random()-0.5)*3; g.lineTo(x,y); } g.stroke();
  }
  for (let i=0;i<5;i++){ g.fillStyle='rgba(60,30,10,.18)'; g.beginPath(); g.ellipse(Math.random()*64, Math.random()*512, 3, 9, 0, 0, Math.PI*2); g.fill(); }
  return tex(c);
}
const PICKS_PER_TILE = 85, TILE_LEN = 60;
function clothCanvas(){
  const c = document.createElement('canvas'); c.width = 256; c.height = PICKS_PER_TILE*6; const g = c.getContext('2d');
  const pal = ['#e7c1c7','#d99aa7','#c8d4e6','#f1ede7','#a9bbd6','#e2b3bb','#8ea2c4','#f0dde0'];
  let col = pal[0];
  for (let r=0;r<PICKS_PER_TILE;r++){
    const y = r*6; if (Math.random()<0.28) col = pal[Math.floor(Math.random()*pal.length)];
    g.fillStyle = col; g.fillRect(0,y,256,6);
    for (let x=0;x<256;x+=8){
      g.fillStyle = `rgba(0,0,0,${0.05+Math.random()*0.08})`; g.fillRect(x + (r%2?4:0), y, 2, 6);
      g.fillStyle = `rgba(255,255,255,${Math.random()*0.18})`; g.fillRect(x+3, y+1, 4, 2);
    }
    g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(0, y+5, 256, 1);
  }
  return c;
}
function warpCanvas(){
  const c = document.createElement('canvas'); c.width = 16; c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#7f868b'; g.fillRect(0,0,16,256);
  for (let y=0;y<256;y+=3){ g.fillStyle = `rgba(0,0,0,${0.12+Math.random()*0.1})`; g.fillRect(0,y,16,1); g.fillStyle='rgba(255,255,255,.08)'; g.fillRect(0,y+1,16,1); }
  return c;
}
const TX = { floor:floorTex(), wood:woodTex() };
const clothC = clothCanvas();
TX.cloth = tex(clothC);                       // faixa do tapete
TX.clothRoll = tex(clothC); TX.clothRoll.center.set(.5,.5); TX.clothRoll.rotation = Math.PI/2; TX.clothRoll.repeat.set(1,4);
TX.warp = tex(warpCanvas(), [6, 8]);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(480,480), new THREE.MeshStandardMaterial({map:TX.floor, roughness:.88, transparent:true, depthWrite:false}));
floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; scene.add(floor);

/* ---------- helpers de construção ---------- */
let loom = null, G = {}, partMats = {}, geo = {}, dyn = {};
const V = (x,y,z) => new THREE.Vector3(x,y,z);
function M(part, opts, kind){
  const m = kind === 'line' ? new THREE.LineBasicMaterial(opts) : new THREE.MeshStandardMaterial(Object.assign({roughness:.8, metalness:0}, opts));
  if (kind === 'line') m.userData.base = m.color.clone();
  (partMats[part] = partMats[part] || []).push(m); return m;
}
function tag(o, part, parent, shadow=true){ o.userData.part = part; if (o.isMesh){ o.castShadow = shadow; o.receiveShadow = true; } (parent || G[part]).add(o); return o; }
function box(part, w,h,d, x,y,z, mat, parent){ const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat); m.position.set(x,y,z); return tag(m, part, parent); }
function cylX(part, r, len, x,y,z, mat, parent, seg=36){ const m = new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,seg), mat); m.rotation.z = Math.PI/2; m.position.set(x,y,z); return tag(m, part, parent); }
function strut(part, a, b, t, mat, parent, round){
  const dir = new THREE.Vector3().subVectors(b,a); const len = dir.length();
  const g = round ? new THREE.CylinderGeometry(t,t,len,6) : new THREE.BoxGeometry(t,len,t*.9);
  const m = new THREE.Mesh(g, mat); m.position.copy(a).add(b).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(V(0,1,0), dir.normalize()); return tag(m, part, parent, !round);
}
function lines(part, n, mat, parent){
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n*3), 3));
  const l = new THREE.LineSegments(g, mat); l.frustumCulled = false; return tag(l, part, parent);
}
function ribbon(pts, x0, x1, tileLen){
  const pos=[], uv=[], idx=[]; let acc = 0;
  pts.forEach((p,i) => {
    if (i) acc += Math.hypot(p[0]-pts[i-1][0], p[1]-pts[i-1][1]);
    pos.push(x0,p[0],p[1], x1,p[0],p[1]); uv.push(0, acc/tileLen, 1, acc/tileLen);
    if (i){ const a = (i-1)*2; idx.push(a,a+2,a+1, a+1,a+2,a+3); }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx); g.computeVertexNormals(); return g;
}

/* ---------- construção do tear ---------- */
function build(){
  if (loom){
    scene.remove(loom);
    loom.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  }
  loom = new THREE.Group(); G = {}; partMats = {}; dyn = {};
  for (const k in PARTS){ const g = new THREE.Group(); G[k] = g; loom.add(g); }

  const {W,D,H,L,s} = P;
  const xo = W/2 - s/2, zf = D/2 - s/2, zb = -zf, zc = Math.round(D*0.07);
  const hP = 95, rb = 5, yb = hP + rb - 1, yw = yb + rb;
  const pivotY = 20, pivotZ = zc + 18, reedR = yw - pivotY;
  const th0 = -0.05, th1 = 0.15, zF = pivotZ + reedR*Math.sin(th1);
  const zr = zb + 14, yr = 50, rWarp = 11;
  const zcr = zf - 14, ycr = 42, rCloth = 9;
  const zh = zf + 20;                 // eixo dos pedais: na frente, fora da estrutura
  const n = Math.max(24, Math.round(L*0.8));
  geo = {W,D,H,L,s,xo,zf,zb,zc,hP,rb,yb,yw,pivotZ,th0,th1,zF,zh,n,zr,zcr};

  const wood  = M('estrutura', {map:TX.wood, roughness:.85});
  const pad   = M('estrutura', {color:0xeeeeea, roughness:.6});

  /* estrutura */
  for (const sx of [-1,1]){
    box('estrutura', s,hP,s, sx*xo,hP/2,zf, wood);
    box('estrutura', s,hP,s, sx*xo,hP/2,zb, wood);
    box('estrutura', s,H,s,  sx*xo,H/2,zc, wood);
    box('estrutura', s*.9,s*1.1,D, sx*xo,hP-14,0, wood);
    box('estrutura', s*.9,s*1.1,D, sx*xo,18,0, wood);
    strut('estrutura', V(sx*xo,H-45,zc), V(sx*xo,hP-14,zb+22), s*.8, wood);
    for (const z of [zf,zb,zc]) box('estrutura', s+2,1.2,s+2, sx*xo,.6,z, pad);
  }
  box('estrutura', 2*xo-s, s, s*.9, 0,18,zf, wood);
  box('estrutura', 2*xo-s, s, s*.9, 0,18,zb, wood);

  /* castelo */
  const woodC = M('castelo', {map:TX.wood, roughness:.85});
  const leather = M('castelo', {color:0xc38a5a, roughness:.7});
  box('castelo', W+14, s*.9, s, 0, H-3, zc, woodC);
  box('castelo', 2*xo-s, s*.9, s*.8, 0, H-22, zc, woodC);
  for (const x of [-L*.28, 0, L*.28]) box('castelo', 4, 22, s+2, x, H-11, zc, leather);

  /* quadros de liços */
  const woodQ = M('quadros', {map:TX.wood, roughness:.85});
  const hedMat = M('quadros', {color:0xe8dcc0}, 'line');
  dyn.shafts = [];
  [-3, 3].forEach((dz, k) => {
    const sg = new THREE.Group(); sg.position.set(0, yw, zc+dz); G.quadros.add(sg);
    box('quadros', L+10, 2.5, 1.8, 0, 16, 0, woodQ, sg);
    box('quadros', L+10, 2.5, 1.8, 0, -16, 0, woodQ, sg);
    for (const sx of [-1,1]) box('quadros', 2, 34, 1.8, sx*(L/2+4), 0, 0, woodQ, sg);
    const cnt = Math.ceil(n/2); const hl = lines('quadros', cnt*4, hedMat, sg);
    const a = hl.geometry.attributes.position.array; let j = 0;
    for (let i=k;i<n;i+=2){ const x = -L/2 + (i+.5)*L/n; a.set([x,-15,0, x,-1.1,0, x,1.1,0, x,15,0], j); j += 12; }
    hl.geometry.attributes.position.needsUpdate = true;
    dyn.shafts.push(sg);
  });

  /* cordões (dinâmicos) */
  dyn.cords = lines('cordoes', 12, M('cordoes', {color:0x2f6fb3}, 'line'));

  /* batente */
  const woodB = M('batente', {map:TX.wood, roughness:.85});
  const reedMat = M('batente', {color:0x5b6166}, 'line');
  const pv = new THREE.Group(); pv.position.set(0, pivotY, pivotZ); G.batente.add(pv); dyn.beater = pv;
  cylX('batente', 1.6, 2*xo-s, 0,0,0, woodB, pv, 16);
  for (const sx of [-1,1]) box('batente', 3, reedR+10, 4, sx*(L/2+7), (reedR+10)/2, 0, woodB, pv);
  box('batente', L+16, 4, 6, 0, reedR-12, 0, woodB, pv);
  box('batente', L+20, 5, 5, 0, reedR+10, 0, woodB, pv);
  const dents = lines('batente', (n+1)*2, reedMat, pv); const da = dents.geometry.attributes.position.array;
  for (let i=0;i<=n;i++){ const x = -L/2 + i*L/n; da.set([x,reedR-10,0, x,reedR+7.5,0], i*6); }
  dents.geometry.attributes.position.needsUpdate = true;

  /* navete */
  const nv = new THREE.Group(); G.navete.add(nv); dyn.shuttle = nv;
  box('navete', 28, 2.4, 5, 0,0,0, M('navete', {color:0x6e4a2c, roughness:.5}), nv);
  cylX('navete', 1.8, 14, 0, 2.6, 0, M('navete', {color:0xd9909e, roughness:.9}), nv, 16);

  /* encosto e peitoral */
  const pvc = M('encosto', {color:0xece7da, roughness:.55});
  cylX('encosto', rb, W+4, 0, yb, zb, pvc);
  const pvc2 = M('peito', {color:0xece7da, roughness:.55});
  cylX('peito', rb, W+4, 0, yb, zf, pvc2);

  /* rolo de urdume + discos */
  const rw = new THREE.Group(); rw.position.set(0, yr, zr); G.rolo_urdume.add(rw); dyn.warpRoll = rw;
  const woodR = M('rolo_urdume', {map:TX.wood, roughness:.85});
  cylX('rolo_urdume', 3, W+6, 0,0,0, woodR, rw, 20);
  cylX('rolo_urdume', rWarp, L, 0,0,0, M('rolo_urdume', {map:TX.warp, roughness:.9}), rw);
  const discM = M('rolo_urdume', {color:0xf3f3ef, roughness:.45});
  const holeM = M('rolo_urdume', {color:0x2a2d2f, roughness:.9});
  for (const sx of [-1,1]){
    cylX('rolo_urdume', 24, 1.8, sx*(L/2+5), 0,0, discM, rw, 48);
    for (let i=0;i<16;i++){ const a = i/16*Math.PI*2; cylX('rolo_urdume', 1.1, 2.2, sx*(L/2+5), Math.sin(a)*19, Math.cos(a)*19, holeM, rw, 10); }
    box('rolo_urdume', 3, 8, 8, sx*(L/2+8), 0, 0, woodR, rw);
  }

  /* rolo de tecido + catraca */
  const rc = new THREE.Group(); rc.position.set(0, ycr, zcr); G.rolo_tecido.add(rc);
  const woodT = M('rolo_tecido', {map:TX.wood, roughness:.85});
  cylX('rolo_tecido', 3, W+6, 0,0,0, woodT, rc, 20);
  cylX('rolo_tecido', 10, 2.5, -(L/2+6), 0,0, M('rolo_tecido', {color:0x3b2a1d, roughness:.6}), rc, 24);
  box('rolo_tecido', 2, 12, 2, -(L/2+8.5), 6, 0, woodT, rc);
  const cr = new THREE.Group(); cr.position.set(0, ycr, zcr); G.tecido.add(cr); dyn.clothRoll = cr;
  cylX('tecido', rCloth, L, 0,0,0, M('tecido', {map:TX.clothRoll, roughness:.95}), cr);

  /* tapete (faixa) */
  const path = [[yw, zF], [yw, zf]];
  for (let a=80; a>=-50; a-=10){ const r = a*Math.PI/180; path.push([yb + (rb+.3)*Math.sin(r), zf + (rb+.3)*Math.cos(r)]); }
  path.push([ycr + rCloth*Math.sin(.35), zcr + rCloth*Math.cos(.35)]);
  const clothMesh = new THREE.Mesh(ribbon(path, -L/2, L/2, TILE_LEN), M('tecido', {map:TX.cloth, roughness:.95, side:THREE.DoubleSide}));
  tag(clothMesh, 'tecido');

  /* pedais */
  const woodP = M('pedais', {map:TX.wood, roughness:.85});
  cylX('pedais', 1.8, 44, 0, 4, zh, woodP, null, 12);
  box('pedais', 50, 2, 12, 0, 1, zh, woodP);                          // base do apoio no chão
  for (const sx of [-1,1]) box('pedais', 4, 9, 9, sx*22, 4.5, zh, woodP); // mancais do eixo
  dyn.treadles = [];
  const tlen = zh - (zc - 12);        // do eixo até passar um pouco dos cordões
  [-11, 11].forEach(x => {
    const tg = new THREE.Group(); tg.position.set(x, 4, zh); G.pedais.add(tg);
    box('pedais', 6, 3, tlen, 0, 1.5, -tlen/2, woodP, tg);
    dyn.treadles.push(tg);
  });

  /* urdume */
  const warpMat = M('urdume', {color:0x8d959a}, 'line');
  const st = lines('urdume', n*6, warpMat); const sa = st.geometry.attributes.position.array;
  const pA = [yr + rWarp*.6, zr - rWarp*.8], pB = [yb, zb - rb - .3], pC = [yb + (rb+.3)*.7, zb - (rb+.3)*.7], pD = [yw, zb];
  for (let i=0;i<n;i++){
    const x = -L/2 + (i+.5)*L/n;
    sa.set([x,pA[0],pA[1], x,pB[0],pB[1], x,pB[0],pB[1], x,pC[0],pC[1], x,pC[0],pC[1], x,pD[0],pD[1]], i*18);
  }
  st.geometry.attributes.position.needsUpdate = true;
  dyn.warp = lines('urdume', n*4, warpMat);

  /* tiras de retalho */
  const pal = [0x7fb0e0, 0xb2323f, 0x5c8f4e, 0x22304a, 0xe7dfc9, 0x9a7b4f, 0x3f7fbf, 0x7d2a3c, 0x9fc28a, 0xd0c7b4];
  for (let i=0;i<16;i++){
    const h = 70 + Math.random()*60, w = 2.4 + Math.random()*2.2;
    const m = box('tiras', w, h, .35, W/2 + 1 + Math.random()*6, H-4-h/2, zc - 4 + Math.random()*8, M('tiras', {color:pal[i%pal.length], roughness:.95}));
    m.rotation.y = (Math.random()-.5)*.8;
  }
  const pink = M('tiras', {color:0xd9a39b, roughness:.95});
  for (let i=0;i<28;i++){
    const top = V(-(W/2+1) + Math.random()*2, yb, zf + (Math.random()-.5)*4);
    const bot = V(top.x - 4 - Math.random()*12, 2 + Math.random()*8, top.z + (Math.random()-.3)*16);
    strut('tiras', top, bot, .55, pink, null, true);
  }

  scene.add(loom);
  applyVis(); applyExplode(); highlight();
}

/* ---------- animação ---------- */
const ease = x => x<=0 ? 0 : x>=1 ? 1 : x*x*(3-2*x);
function pose(T){
  const pick = Math.floor(T), f = T - pick, s = pick % 2 === 0 ? 1 : -1;
  const open = f < .22 ? ease(f/.22) : f < .8 ? 1 : 1 - ease((f-.8)/.2);
  const sh = ease((f-.24)/.34);
  const beat = f > .6 && f < .86 ? Math.sin(Math.PI*(f-.6)/.26) : 0;
  const adv = pick + ease((f-.62)/.2);
  return {shed:s*open, sh, dir:s, beat, pick, adv};
}
function applyPose(p){
  const g = geo, d = 7;
  const off = [-d*p.shed, d*p.shed];
  dyn.shafts.forEach((sg,k) => sg.position.y = g.yw + off[k]);
  const rest = 0.075, press = 0.012;   // ponta levantada em repouso; ao pisar, a ponta desce e puxa o quadro
  dyn.treadles[0].rotation.x = rest + (press-rest)*Math.max(p.shed,0);
  dyn.treadles[1].rotation.x = rest + (press-rest)*Math.max(-p.shed,0);
  dyn.beater.rotation.x = g.th0 + (g.th1-g.th0)*p.beat;

  const span = g.L/2 + 20;
  dyn.shuttle.position.set(p.dir*(-span + 2*span*p.sh), g.yw - .6, g.zc + 9);

  // urdume dinâmico
  const a = dyn.warp.geometry.attributes.position.array;
  for (let i=0;i<g.n;i++){
    const k = i%2, x = -g.L/2 + (i+.5)*g.L/g.n, ey = g.yw + off[k], ez = g.zc + (k ? 3 : -3);
    a.set([x,g.yw,g.zb, x,ey,ez, x,ey,ez, x,g.yw,g.zF], i*12);
  }
  dyn.warp.geometry.attributes.position.needsUpdate = true;

  // cordões
  const c = dyn.cords.geometry.attributes.position.array; let j = 0;
  const barY = g.H - 22 - g.s*.45;
  [-3,3].forEach((dz,k) => {
    const z = g.zc + dz, top = g.yw + 16 + off[k], bot = g.yw - 16 + off[k];
    for (const sx of [-1,1]){ c.set([sx*g.L/2, barY, g.zc, sx*g.L/2, top, z], j); j += 6; }
    const tr = dyn.treadles[k].rotation.x, aa = z - g.zh;
    const ty = 4 + 3*Math.cos(tr) - aa*Math.sin(tr), tz = g.zh + 3*Math.sin(tr) + aa*Math.cos(tr);
    const x = k ? 11 : -11;
    c.set([x, bot, z, x, ty, tz], j); j += 6;
  });
  dyn.cords.geometry.attributes.position.needsUpdate = true;

  TX.cloth.offset.y = -p.adv / PICKS_PER_TILE;
  dyn.clothRoll.rotation.x = -p.adv * (TILE_LEN/PICKS_PER_TILE) / 9;
  dyn.warpRoll.rotation.x = -p.adv * (TILE_LEN/PICKS_PER_TILE) / 11;
  picksEl.textContent = `${p.pick} ${p.pick === 1 ? 'passada' : 'passadas'}`;
}

/* ---------- visibilidade, explosão, seleção ---------- */
let explode = 0, selected = null;
function applyVis(){ for (const k in G) G[k].visible = vis[k]; }
function applyExplode(){ for (const k in G){ const e = EXPL[k]; G[k].position.set(e[0]*explode, e[1]*explode, e[2]*explode); } }
const HL = new THREE.Color(0xb8455f);
let fadeCur = 0, fadeGoal = 0, fadeDirty = true, dimKey = null;
function highlight(){
  for (const k in partMats) for (const m of partMats[k]){
    const on = k === selected;
    if (m.isLineBasicMaterial) m.color.copy(on ? HL : m.userData.base);
    else { m.emissive.setHex(on ? 0x7a1f35 : 0x000000); m.emissiveIntensity = on ? .5 : 1; }
  }
  if (selected) dimKey = selected;
  fadeGoal = selected ? 1 : 0; fadeDirty = true;
  document.querySelectorAll('#parts li[data-k]').forEach(li => li.classList.toggle('on', li.dataset.k === selected));
  document.querySelectorAll('#steps li').forEach(li => li.classList.toggle('rel', li.dataset.part === selected));
  const info = $('#info');
  if (selected){
    const p = PARTS[selected];
    $('#info-group').textContent = p.g; $('#info-name').textContent = p.n;
    $('#info-o').textContent = p.o; $('#info-f').textContent = p.f; $('#info-c').textContent = p.c;
    $('#info-count').textContent = `${TOUR.indexOf(selected)+1} de ${TOUR.length}`;
    info.classList.add('show'); info.scrollTop = 0;
  } else info.classList.remove('show');
  if (window.TEAR_ON_SELECT) window.TEAR_ON_SELECT(selected);
}
function applyFade(v){
  for (const k in partMats) for (const m of partMats[k]){
    const o = (dimKey && k !== dimKey) ? 1 - .84*v : 1, tr = o < .999;
    m.opacity = o;
    if (m.transparent !== tr){ m.transparent = tr; m.needsUpdate = true; }
    m.depthWrite = !tr || m.isLineBasicMaterial;
  }
  if (!selected && v < .001) dimKey = null;
}
function setSel(k){
  const prev = selected; selected = k || null; highlight();
  if (selected && selected !== prev) focusPart(selected);
  else if (!selected && prev) tweenTo({theta:ctl.theta, phi:ctl.phi, r:VIEWS.iso.r, tg:V(...VIEWS.iso.t)});
}
function select(k){ setSel(k === selected ? null : k); }
function step(d){
  const list = TOUR.filter(k => vis[k]); if (!list.length) return;
  const i = list.indexOf(selected);
  setSel(list[i < 0 ? (d > 0 ? 0 : list.length-1) : (i + d + list.length) % list.length]);
}
function focusPart(k){
  const b = new THREE.Box3().setFromObject(G[k]); if (b.isEmpty()) return;
  const c = b.getCenter(new THREE.Vector3()), sz = b.getSize(new THREE.Vector3()).length();
  tweenTo({theta:ctl.theta, phi:clamp(ctl.phi, .55, 1.35), r:clamp(sz*1.25 + 170, 230, 520), tg:c});
}

/* ---------- câmera e controles ---------- */
const ctl = {theta:.75, phi:1.1, r:430, target:V(0,82,0)};
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
// estado exibido (camS) persegue o estado pedido (ctl): movimento sempre amortecido
const camS = {theta:ctl.theta + 1.1, phi:1.32, r:780, target:ctl.target.clone()};
function updCam(dt){
  const k = 1 - Math.exp(-(dt || .016)*7);
  camS.theta += (ctl.theta - camS.theta)*k; camS.phi += (ctl.phi - camS.phi)*k; camS.r += (ctl.r - camS.r)*k;
  camS.target.lerp(ctl.target, k);
  const sp = Math.sin(camS.phi);
  camera.position.set(camS.target.x + camS.r*sp*Math.sin(camS.theta), camS.target.y + camS.r*Math.cos(camS.phi), camS.target.z + camS.r*sp*Math.cos(camS.theta));
  camera.lookAt(camS.target);
}
const VIEWS = {
  iso:{theta:.75, phi:1.1, r:430, t:[0,82,0]},
  frente:{theta:0, phi:1.45, r:400, t:[0,90,0]},
  lateral:{theta:Math.PI/2, phi:1.45, r:400, t:[0,90,0]},
  topo:{theta:0, phi:.14, r:440, t:[0,60,0]},
};
let tween = null;
function tweenTo(to){ tween = {t:0, from:{theta:ctl.theta, phi:ctl.phi, r:ctl.r, tg:ctl.target.clone()}, to}; }
function goView(name){
  const v = VIEWS[name]; let dth = v.theta - ctl.theta; dth = Math.atan2(Math.sin(dth), Math.cos(dth));
  tween = {t:0, from:{theta:ctl.theta, phi:ctl.phi, r:ctl.r, tg:ctl.target.clone()}, to:{theta:ctl.theta+dth, phi:v.phi, r:v.r, tg:V(...v.t)}};
}
function stepTween(dt){
  tween.t = Math.min(1, tween.t + dt/0.9); const e = ease(tween.t), f = tween.from, t = tween.to;
  ctl.theta = f.theta + (t.theta-f.theta)*e; ctl.phi = f.phi + (t.phi-f.phi)*e; ctl.r = f.r + (t.r-f.r)*e;
  ctl.target.lerpVectors(f.tg, t.tg, e); if (tween.t >= 1) tween = null;
}
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => goView(b.dataset.view)));

const cv = renderer.domElement, ptrs = new Map(); let down = null;
cv.addEventListener('contextmenu', e => e.preventDefault());
function pan(dx, dy){
  const k = ctl.r*.0016; camera.updateMatrixWorld();
  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
  const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
  ctl.target.addScaledVector(right, -dx*k).addScaledVector(up, dy*k);
  ctl.target.y = clamp(ctl.target.y, 0, 250);
}
cv.addEventListener('pointerdown', e => {
  cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, {x:e.clientX, y:e.clientY}); tween = null;
  if (ptrs.size === 1) down = {x:e.clientX, y:e.clientY, t:performance.now(), btn:e.button, shift:e.shiftKey, moved:0};
  else if (down) down.moved = 99;
});
cv.addEventListener('pointermove', e => {
  const p = ptrs.get(e.pointerId); if (!p) return;
  const dx = e.clientX - p.x, dy = e.clientY - p.y;
  if (ptrs.size === 1){
    if (down) down.moved += Math.abs(dx) + Math.abs(dy);
    if (down && (down.btn === 2 || down.shift)) pan(dx, dy);
    else { ctl.theta -= dx*.006; ctl.phi = clamp(ctl.phi - dy*.006, .12, 1.52); }
  } else if (ptrs.size === 2){
    const other = [...ptrs.entries()].find(([id]) => id !== e.pointerId)[1];
    const d0 = Math.hypot(p.x-other.x, p.y-other.y), d1 = Math.hypot(e.clientX-other.x, e.clientY-other.y);
    if (d0 > 0 && d1 > 0) ctl.r = clamp(ctl.r*d0/d1, 120, 900);
    pan(dx/2, dy/2);
  }
  p.x = e.clientX; p.y = e.clientY;
});
const endPtr = e => {
  if (ptrs.size === 1 && down && down.moved < 6 && performance.now() - down.t < 500) pick(e.clientX, e.clientY);
  ptrs.delete(e.pointerId); if (!ptrs.size) down = null;
};
cv.addEventListener('pointerup', endPtr);
cv.addEventListener('pointercancel', e => { ptrs.delete(e.pointerId); down = null; });
cv.addEventListener('wheel', e => { e.preventDefault(); tween = null; ctl.r = clamp(ctl.r*Math.exp(e.deltaY*.001), 120, 900); }, {passive:false});

const ray = new THREE.Raycaster(); ray.params.Line.threshold = 0.8;
function pick(cx, cy){
  const r = cv.getBoundingClientRect();
  ray.setFromCamera(new THREE.Vector2((cx-r.left)/r.width*2-1, -(cy-r.top)/r.height*2+1), camera);
  const hit = ray.intersectObject(loom, true).find(h => h.object.userData.part && vis[h.object.userData.part]);
  setSel(hit ? hit.object.userData.part : null);
}
function partAtClient(cx, cy){
  const r = cv.getBoundingClientRect();
  ray.setFromCamera(new THREE.Vector2((cx-r.left)/r.width*2-1, -(cy-r.top)/r.height*2+1), camera);
  const hit = ray.intersectObject(loom, true).find(h => h.object.userData.part && vis[h.object.userData.part]);
  return hit ? hit.object.userData.part : null;
}

/* ---------- painel ---------- */
const picksEl = $('#picks');
let playing = true, speed = 1, T = 0.05;
$('#play').addEventListener('click', () => { playing = !playing; $('#play').textContent = playing ? 'Pausar' : 'Tecer'; });
$('#speed').addEventListener('input', e => { speed = +e.target.value; $('#speed-o').textContent = speed.toFixed(1).replace('.', ',') + '×'; });
let explodeGoal = 0;
function setExplode(v){ explodeGoal = v; $('#explode').value = v; $('#explode-o').textContent = Math.round(v*100) + '%'; $('#explode-btn').setAttribute('aria-pressed', v > .05); }
$('#explode').addEventListener('input', e => setExplode(+e.target.value));
$('#explode-btn').addEventListener('click', () => setExplode(explodeGoal > .05 ? 0 : .8));

const dimsEl = $('#dims');
let pending = false;
function schedule(){ if (!pending){ pending = true; requestAnimationFrame(() => { pending = false; build(); }); } }
function maxL(){ return P.W - 2*P.s - 20; }
function renderDims(){
  dimsEl.innerHTML = DIMS.map(([k,label,a,b]) =>
    `<div class="ctl"><label for="d-${k}">${label} <output id="o-${k}">${P[k]} cm</output></label>
     <input type="range" id="d-${k}" min="${a}" max="${b}" step="1" value="${P[k]}"></div>`).join('');
  DIMS.forEach(([k]) => $('#d-'+k).addEventListener('input', e => {
    P[k] = +e.target.value;
    if (P.L > maxL()){ P.L = maxL(); $('#d-L').value = P.L; $('#o-L').textContent = P.L + ' cm'; }
    $('#o-'+k).textContent = P[k] + ' cm';
    $('#dim-note').textContent = 'Medidas ajustadas manualmente.';
    schedule();
  }));
}
$('#reset-dims').addEventListener('click', () => {
  Object.assign(P, DEF); renderDims(); build();
  $('#dim-note').textContent = 'Valores estimados pelas fotos, tomando o piso como ~40 cm. Troque pelas medidas reais do tear.';
});

const partsEl = $('#parts');
partsEl.innerHTML = GROUPS.map(gr => `<li class="grp">${gr}</li>` + TOUR.filter(k => PARTS[k].g === gr).map(k =>
  `<li data-k="${k}"><input type="checkbox" checked aria-label="Mostrar ${PARTS[k].n}"><button type="button">${PARTS[k].n}</button></li>`).join('')).join('');
partsEl.querySelectorAll('li[data-k]').forEach(li => {
  const k = li.dataset.k;
  li.querySelector('input').addEventListener('change', e => { vis[k] = e.target.checked; applyVis(); if (!vis[k] && selected === k) setSel(null); });
  li.querySelector('button').addEventListener('click', () => select(k));
});

/* ---------- API compartilhada (página de celular) ---------- */
window.TEAR = { PARTS, TOUR, GROUPS, setSel: k => setSel(k), get selected(){ return selected; } };

/* ---------- abrir no celular (QR) ---------- */
(function(){
  const box = document.getElementById('qr'); if (!box) return;
  const url = new URL('celular.html', location.href).href;
  const a = document.getElementById('m-link'); if (a){ a.href = url; a.textContent = url.replace(/^https?:\/\//, ''); }
  const local = /^(file:|http:\/\/(localhost|127\.0\.0\.1))/.test(location.href);
  if (local) document.getElementById('qr-note').textContent = 'Você está abrindo pelo computador (localhost). O QR code só funciona no celular depois que o site estiver publicado no GitHub Pages.';
  if (window.QRCode) new QRCode(box, {text:url, width:168, height:168, colorDark:'#1c2427', colorLight:'#ffffff', correctLevel:QRCode.CorrectLevel.M});
  else box.textContent = 'QR indisponível sem internet.';
})();

/* ---------- API para o controle por gestos ---------- */
window.loomAPI = {
  orbit(dth, dph){ tween = null; lastInput = performance.now(); ctl.theta -= dth; ctl.phi = clamp(ctl.phi - dph, .12, 1.52); },
  zoom(f){ tween = null; lastInput = performance.now(); ctl.r = clamp(ctl.r*f, 120, 900); },
  partAt(nx, ny){
    ray.setFromCamera(new THREE.Vector2(nx*2-1, -ny*2+1), camera);
    const hit = ray.intersectObject(loom, true).find(h => h.object.userData.part && vis[h.object.userData.part]);
    return hit ? hit.object.userData.part : null;
  },
  select(k){ lastInput = performance.now(); if (k) select(k); else setSel(null); },
  name(k){ return PARTS[k] ? PARTS[k].n : ''; }
};

/* ---------- interface de apresentação ---------- */
let lastInput = performance.now(), autoRot = true;
const markInput = () => { lastInput = performance.now(); };
cv.addEventListener('pointerdown', markInput); cv.addEventListener('wheel', markInput, {passive:true});
$('#autorot').addEventListener('change', e => { autoRot = e.target.checked; });

const tip = $('#tip'); let hoverT = 0;
cv.addEventListener('pointermove', e => {
  markInput();
  if (e.pointerType !== 'mouse' || ptrs.size){ tip.hidden = true; return; }
  const now = performance.now(); if (now - hoverT < 50) return; hoverT = now;
  const k = partAtClient(e.clientX, e.clientY), r = view.getBoundingClientRect();
  if (k){ tip.textContent = PARTS[k].n; tip.hidden = false; tip.style.left = (e.clientX - r.left) + 'px'; tip.style.top = (e.clientY - r.top) + 'px'; cv.style.cursor = 'pointer'; }
  else { tip.hidden = true; cv.style.cursor = ''; }
});
cv.addEventListener('pointerleave', () => { tip.hidden = true; });

$('#info-close').addEventListener('click', () => setSel(null));
$('#prev').addEventListener('click', () => step(-1));
$('#next').addEventListener('click', () => step(1));
const stepLis = [...document.querySelectorAll('#steps li')];
stepLis.forEach(li => li.addEventListener('click', () => { markInput(); setSel(li.dataset.part); }));

const setPanel = open => {
  document.body.classList.toggle('panel-open', open);
  const b = $('#panel-btn'); b.setAttribute('aria-expanded', open); b.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  $('#panel').setAttribute('aria-hidden', !open);
  if (open) $('#panel-close').focus(); else if (document.activeElement && $('#panel').contains(document.activeElement)) b.focus();
};
$('#panel-close').addEventListener('click', () => setPanel(false));
$('#scrim').addEventListener('click', () => setPanel(false));
$('#panel-btn').addEventListener('click', () => setPanel(!document.body.classList.contains('panel-open')));
setPanel(false);
$('#cam-btn2').addEventListener('click', () => $('#cam-btn').click());
const fullBtn = $('#full-btn');
fullBtn.addEventListener('click', () => {
  if (!document.fullscreenElement){ (document.documentElement.requestFullscreen || (()=>Promise.reject())).call(document.documentElement).catch(()=>{}); }
  else document.exitFullscreen();
});
document.addEventListener('fullscreenchange', () => { fullBtn.textContent = document.fullscreenElement ? 'Sair da tela cheia' : 'Tela cheia'; });

const toast = $('#toast'); let toastT;
const camStatus = document.getElementById('cam-status');
if (camStatus && toast !== NIL) new MutationObserver(() => {      // só existe na versão completa
  toast.textContent = camStatus.textContent; toast.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 3200);
}).observe(camStatus, {childList:true, characterData:true, subtree:true});

document.addEventListener('keydown', e => {
  if (e.target.closest && e.target.closest('input, textarea, select')) return;
  markInput();
  if (e.key === 'ArrowRight'){ e.preventDefault(); step(1); }
  else if (e.key === 'ArrowLeft'){ e.preventDefault(); step(-1); }
  else if (e.key === 'Escape'){ if (document.body.classList.contains('panel-open')) setPanel(false); else setSel(null); }
  else if (e.key === ' ' && !(e.target.closest && e.target.closest('button'))){ e.preventDefault(); $('#play').click(); }
  else if (e.key === 'e' || e.key === 'E') setExplode(explodeGoal > .05 ? 0 : .8);
});

/* ---------- produção de tecido ----------
   A simulação tece muito mais rápido que uma pessoa. Por isso o painel separa:
   1) o que foi tecido na simulação (passadas ÷ passadas por cm);
   2) quanto tempo esse mesmo pedaço levaria na vida real, com uma artesã e com um tear mecanizado;
   3) a produção de uma jornada de trabalho em cada caso.
   Os ritmos reais vêm de referências (ver parâmetros) e podem ser trocados pelo que o grupo medir na oficina. */
const prod = {t:0, T0:T, ppc:2, man:30, autoDay:300, jh:8, upd:0};
const br = (v, d) => v.toFixed(d).replace('.', ',');
const fmtLen = cm => { if (cm < 100) return br(cm, 1) + ' cm'; const m = cm/100; return br(m, m < 10 ? 2 : m < 100 ? 1 : 0) + ' m'; };
const fmtClock = t => { const m = Math.floor(t/60), s = Math.floor(t%60); return String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0'); };
function fmtDur(sec){
  if (!isFinite(sec) || sec <= 0) return '–';
  if (sec < 60) return Math.max(1, Math.round(sec)) + ' s';
  const min = sec/60; if (min < 60) return Math.round(min) + ' min';
  const h = Math.floor(min/60), m = Math.round(min - h*60); return h + ' h' + (m ? ' ' + m + ' min' : '');
}
function readProdParams(){
  const num = id => parseFloat(String($(id).value).replace(',', '.'));
  const a = num('#p-ppc'), b = num('#p-man'), c = num('#p-auto'), d = num('#p-jh');
  if (a > 0) prod.ppc = a; if (b > 0) prod.man = b; if (c > 0) prod.autoDay = c; if (d > 0) prod.jh = d;
  renderProd();
}
['#p-ppc','#p-man','#p-auto','#p-jh'].forEach(id => $(id).addEventListener('input', readProdParams));
$('#p-reset').addEventListener('click', () => { prod.t = 0; prod.T0 = T; renderProd(); });
const prodEl = $('#prod');
function setProd(on){ prodEl.classList.toggle('off', !on); $('#prod-btn').setAttribute('aria-pressed', on); }
function setProdMin(min){ prodEl.classList.toggle('min', min); const b = $('#prod-min'); b.textContent = min ? '+' : '–'; b.setAttribute('aria-label', min ? 'Expandir produção' : 'Minimizar produção'); }
$('#prod-btn').addEventListener('click', () => { const on = prodEl.classList.contains('off'); setProd(on); if (on) setProdMin(false); });
$('#prod-close').addEventListener('click', () => setProd(false));
$('#prod-min').addEventListener('click', () => setProdMin(!prodEl.classList.contains('min')));
$('#p-mini').addEventListener('click', () => setProdMin(false));
function renderProd(){
  const picks = Math.max(0, T - prod.T0), cm = picks / prod.ppc;
  const autoCmH = prod.autoDay*100 / prod.jh;                 // cm por hora do mecanizado
  const tMan = cm / prod.man * 3600, tAuto = cm / autoCmH * 3600;   // segundos
  $('#p-len').textContent = fmtLen(cm); $('#p-mini').textContent = fmtLen(cm);
  $('#p-time').textContent = fmtClock(prod.t);
  const np = Math.floor(picks); $('#p-picks').textContent = np; $('#p-pl').textContent = np === 1 ? 'passada' : 'passadas';
  $('#p-tman').textContent = cm > 0.05 ? fmtDur(tMan) : '–';
  $('#p-tauto').textContent = cm > 0.05 ? fmtDur(tAuto) : '–';
  $('#p-bm').style.width = cm > 0.05 ? '100%' : '0';
  $('#p-ba').style.width = cm > 0.05 ? Math.max(1.5, tAuto/tMan*100) + '%' : '0';
  const dMan = prod.man*prod.jh, dAuto = prod.autoDay*100;
  $('#p-jhv').textContent = br(prod.jh, prod.jh % 1 ? 1 : 0);
  $('#p-dman').textContent = fmtLen(dMan); $('#p-dauto').textContent = fmtLen(dAuto);
  $('#p-x').textContent = `A máquina faz cerca de ${Math.round(dAuto/dMan)} vezes mais tapete no mesmo tempo.`;
  prodEl.classList.toggle('paused', !playing);
  $('#p-state').textContent = playing ? 'Tear ligado' : 'Tear pausado';
}
readProdParams();
if (window.innerWidth < 900) setProd(false);
window.addEventListener('keydown', e => {
  if (e.target.closest && e.target.closest('input, textarea, select')) return;
  if (e.key === 'p' || e.key === 'P') $('#prod-btn').click();
});

const BOUNDS = [[0,.24],[.24,.6],[.6,.86],[.86,1]];
let curStep = -1;
function updCycle(){
  const f = T - Math.floor(T);
  const st = BOUNDS.findIndex(b => f >= b[0] && f < b[1]);
  if (st !== curStep){ stepLis.forEach((li,i) => { li.classList.toggle('on', i === st); if (i !== st) li.style.setProperty('--p', 0); }); curStep = st; }
  if (st >= 0){ const b = BOUNDS[st]; stepLis[st].style.setProperty('--p', ((f-b[0])/(b[1]-b[0])).toFixed(3)); }
}

/* ---------- loop ---------- */
new ResizeObserver(() => {
  const w = view.clientWidth, h = view.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h, false); camera.aspect = w/h;
  camera.updateProjectionMatrix();
}).observe(view);

renderDims(); build();
if (IS_MOBILE_PAGE) ctl.r = 400; else if (view.clientWidth < 600) ctl.r = 520;
const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduce){ playing = false; $('#play').textContent = 'Tecer'; }
let last = performance.now();
function loop(now){
  requestAnimationFrame(loop);
  const dt = Math.min(.05, (now - last)/1000); last = now;
  const k = 1 - Math.exp(-dt*6);
  if (tween) stepTween(dt);
  if (autoRot && !reduce && !tween && !selected && now - lastInput > 7000) ctl.theta += dt*0.13;
  if (playing){ T += dt*speed/2.2; prod.t += dt; }
  if (now - prod.upd > 200){ prod.upd = now; renderProd(); }
  applyPose(pose(T)); updCycle();
  if (Math.abs(explode - explodeGoal) > .0005){ explode += (explodeGoal - explode)*k; if (Math.abs(explode - explodeGoal) < .001) explode = explodeGoal; applyExplode(); }
  if (fadeDirty || Math.abs(fadeCur - fadeGoal) > .002){ fadeCur += (fadeGoal - fadeCur)*k; if (Math.abs(fadeCur - fadeGoal) < .002) fadeCur = fadeGoal; applyFade(fadeCur); fadeDirty = false; }
  if (selected && partMats[selected]){ const pulse = .38 + .22*Math.sin(now*.004); for (const m of partMats[selected]) if (!m.isLineBasicMaterial) m.emissiveIntensity = pulse; }
  updCam(dt); renderer.render(scene, camera);
}
requestAnimationFrame(loop);
})();
