/* Controle por gestos – visão computacional com MediaPipe Hand Landmarker (até duas mãos).
   Uma mão: mão aberta gira, indicador mira, pinça seleciona, punho descansa.
   Duas mãos abertas: afastar/aproximar faz zoom, mover as duas juntas gira. */
import { FilesetResolver, HandLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";

const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const $ = s => document.querySelector(s);
const btn = $('#cam-btn'), st = $('#cam-status'), camBox = $('#cam');
const video = camBox.querySelector('video'), ov = camBox.querySelector('canvas'), octx = ov.getContext('2d');
const gEl = $('#gesto'), cur = $('#cursor'), curLbl = cur.querySelector('span'), view = $('#view');
const NOMES = {
  aberta:'Mão aberta: girar', aponta:'Indicador: mirar', pinca:'Pinça: selecionar', punho:'Punho: descanso',
  duas:'Duas mãos: zoom e giro', duas_pausa:'Duas mãos: descanso', nenhum:'Procurando as mãos'
};

let lm = null, running = false, stream = null, lastVT = -1;
const S = {g:'nenhum', cand:'nenhum', n:0, prev:null, prev2:null, two:0, pinch:false, lastPick:0, cx:.5, cy:.5, hoverT:0, curOn:false};
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const dist = (a,b) => Math.hypot(a.x-b.x, a.y-b.y);

async function init(){
  const fs = await FilesetResolver.forVisionTasks(WASM);
  const opts = d => ({baseOptions:{modelAssetPath:MODEL, delegate:d}, runningMode:'VIDEO', numHands:2,
    minHandDetectionConfidence:.6, minHandPresenceConfidence:.6, minTrackingConfidence:.5});
  try { lm = await HandLandmarker.createFromOptions(fs, opts('GPU')); }
  catch(e){ lm = await HandLandmarker.createFromOptions(fs, opts('CPU')); }
}
function errMsg(e){
  if (!window.isSecureContext) return 'A câmera só funciona em https ou localhost.';
  if (e && e.name === 'NotAllowedError') return 'Acesso à câmera negado. Libere a câmera nas permissões do navegador e tente de novo.';
  if (e && e.name === 'NotFoundError') return 'Nenhuma câmera encontrada neste computador.';
  if (e && e.name === 'NotReadableError') return 'A câmera está em uso por outro programa. Feche-o e tente de novo.';
  return 'Não foi possível iniciar: ' + ((e && e.message) || e);
}
async function start(){
  btn.disabled = true;
  try{
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('navegador sem acesso à câmera');
    if (!lm){ st.textContent = 'Carregando o modelo de detecção de mãos…'; await init(); }
    st.textContent = 'Pedindo acesso à câmera…';
    stream = await navigator.mediaDevices.getUserMedia({video:{width:640, height:480, facingMode:'user'}, audio:false});
    video.srcObject = stream; await video.play();
    ov.width = video.videoWidth || 640; ov.height = video.videoHeight || 480;
    camBox.hidden = false; running = true; document.body.classList.add('cam-on');
    btn.textContent = 'Desativar câmera'; st.textContent = 'Câmera ativa. Mostre uma ou duas mãos.';
    requestAnimationFrame(tick);
  } catch(e){ stop(); st.textContent = errMsg(e); }
  btn.disabled = false;
}
function stop(){
  running = false;
  if (stream) stream.getTracks().forEach(t => t.stop());
  stream = null; camBox.hidden = true; hideCursor(); document.body.classList.remove('cam-on');
  S.g = 'nenhum'; S.prev = S.prev2 = null; S.two = 0;
  btn.textContent = 'Ativar câmera';
}
btn.addEventListener('click', () => { if (running){ stop(); st.textContent = 'Câmera desligada.'; } else start(); });

function tick(){
  if (!running) return;
  if (video.readyState >= 2 && video.currentTime !== lastVT){
    lastVT = video.currentTime;
    const r = lm.detectForVideo(video, performance.now());
    handle(r.landmarks || []);
  }
  requestAnimationFrame(tick);
}

/* ---------- leitura da mão ---------- */
const fingers = h => [[8,6],[12,10],[16,14],[20,18]].map(([t,p]) => dist(h[0], h[t]) > dist(h[0], h[p]) * 1.12);
function classify(h){
  const s = dist(h[0], h[9]) || 1e-3;
  const pd = dist(h[4], h[8]) / s;
  const indexOut = dist(h[0], h[8]) > dist(h[0], h[5]) * 1.15;   // evita confundir punho com pinça
  S.pinch = indexOut && (S.pinch ? pd < .5 : pd < .3);           // histerese
  if (S.pinch) return 'pinca';
  const ext = fingers(h), n = ext.filter(Boolean).length;
  if (n >= 4) return 'aberta';
  if (ext[0] && !ext[1] && !ext[2] && !ext[3]) return 'aponta';
  if (n === 0) return 'punho';
  return 'nenhum';
}

function setGesture(g){ if (S.g !== g){ S.g = g; S.prev = null; S.prev2 = null; } gEl.textContent = NOMES[g] || NOMES.nenhum; }

function handle(hands){
  draw(hands);
  if (!hands.length){ S.two = 0; S.cand = 'nenhum'; S.n = 0; S.pinch = false; setGesture('nenhum'); hideCursor(); return; }

  // duas mãos: confirma por 2 quadros seguidos antes de trocar de modo
  if (hands.length >= 2){
    S.two++;
    if (S.two >= 2){ hideCursor(); S.cand = 'nenhum'; S.n = 0; S.pinch = false; twoHands(hands[0], hands[1]); return; }
  } else S.two = 0;

  const h = hands[0], c = classify(h);
  if (c === S.cand) S.n++; else { S.cand = c; S.n = 1; }
  const need = c === 'pinca' ? 2 : 3;              // estabilidade antes de trocar de gesto
  if (S.n >= need && S.g !== c) enter(c, h);
  act(S.g, h);
}

function twoHands(a, b){
  const A = window.loomAPI; if (!A) return;
  const fa = fingers(a).filter(Boolean).length, fb = fingers(b).filter(Boolean).length;
  if (fa === 0 || fb === 0){ setGesture('duas_pausa'); return; }        // um punho = descanso
  setGesture('duas');
  const pa = {x:1 - a[9].x, y:a[9].y}, pb = {x:1 - b[9].x, y:b[9].y};
  const m = {x:(pa.x + pb.x)/2, y:(pa.y + pb.y)/2, d:Math.hypot(pa.x - pb.x, pa.y - pb.y)};
  if (!S.prev2){ S.prev2 = m; return; }
  const p = S.prev2, k = .45;
  const sm = {x:p.x + (m.x - p.x)*k, y:p.y + (m.y - p.y)*k, d:p.d + (m.d - p.d)*k};
  const dx = sm.x - p.x, dy = sm.y - p.y;
  if (Math.abs(dx) + Math.abs(dy) > .0015) A.orbit(dx*5, dy*3.5);
  if (sm.d > .03 && p.d > .03){ const ratio = p.d / sm.d; if (Math.abs(1 - ratio) > .003) A.zoom(Math.pow(ratio, 1.8)); }
  S.prev2 = sm;
}

function enter(g, h){
  const A = window.loomAPI;
  setGesture(g);
  cur.classList.toggle('pinch', g === 'pinca');
  if (g === 'pinca' && A){
    const now = performance.now();
    if (now - S.lastPick > 500){
      S.lastPick = now;
      if (!S.curOn) moveCursor(mid(h));
      const k = A.partAt(S.cx, S.cy);
      A.select(k);
      curLbl.textContent = k ? A.name(k) : 'Nenhuma peça';
    }
  }
}
const mid = h => ({x:(h[4].x + h[8].x)/2, y:(h[4].y + h[8].y)/2});

function act(g, h){
  const A = window.loomAPI; if (!A) return;
  if (g === 'aberta'){
    hideCursor();
    const p = {x:1 - h[9].x, y:h[9].y};
    if (S.prev){
      const sm = {x:S.prev.x + (p.x - S.prev.x)*.5, y:S.prev.y + (p.y - S.prev.y)*.5};
      const dx = sm.x - S.prev.x, dy = sm.y - S.prev.y;
      if (Math.abs(dx) + Math.abs(dy) > .0015) A.orbit(dx*6, dy*4);
      S.prev = sm;
    } else S.prev = p;
  } else if (g === 'aponta'){
    moveCursor(h[8]);
    const now = performance.now();
    if (now - S.hoverT > 90){ S.hoverT = now; const k = A.partAt(S.cx, S.cy); curLbl.textContent = k ? A.name(k) : ''; }
  } else if (g === 'pinca'){
    moveCursor(mid(h));
  } else hideCursor();
}

function moveCursor(src){
  const nx = clamp((1 - src.x - .15)/.7, 0, 1), ny = clamp((src.y - .1)/.7, 0, 1);
  if (!S.curOn){ S.cx = nx; S.cy = ny; } else { S.cx += (nx - S.cx)*.45; S.cy += (ny - S.cy)*.45; }
  S.curOn = true; cur.hidden = false;
  cur.style.left = (S.cx * view.clientWidth) + 'px';
  cur.style.top = (S.cy * view.clientHeight) + 'px';
}
function hideCursor(){ S.curOn = false; cur.hidden = true; cur.classList.remove('pinch'); }

function draw(hands){
  octx.clearRect(0, 0, ov.width, ov.height);
  const W = ov.width, H = ov.height;
  hands.forEach((h, i) => {
    octx.lineWidth = 3; octx.strokeStyle = 'rgba(255,255,255,.85)';
    for (const c of HandLandmarker.HAND_CONNECTIONS){
      const a = h[c.start], b = h[c.end];
      octx.beginPath(); octx.moveTo(a.x*W, a.y*H); octx.lineTo(b.x*W, b.y*H); octx.stroke();
    }
    octx.fillStyle = i ? '#6fb3e8' : '#e37c93';
    for (const p of h){ octx.beginPath(); octx.arc(p.x*W, p.y*H, 4, 0, Math.PI*2); octx.fill(); }
  });
}
