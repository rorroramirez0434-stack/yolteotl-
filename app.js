const KEY = 'yolteotl-datos';
const base = () => ({ lineas: [
  { id: 'conquista', nombre: 'Conquista', division: 'Pollux', edades: '6 a 12 años', tipos: ['Carreta', 'Flotilla'], celulas: [] },
  { id: 'juvenil', nombre: 'Juvenil', division: 'Nimtz', edades: '18 a 25 años y ex jefes', tipos: ['Célula'], celulas: [] },
  { id: 'denlai', nombre: 'Escuadrón', division: 'Denlai', edades: '12 a 18 años o más', tipos: ['Escuadra'], celulas: [] },
  { id: 'kurama', nombre: 'Escuadrón', division: 'Kurama', edades: '12 a 18 años o más', tipos: ['Escuadra'], celulas: [] },
  { id: 'braslaw', nombre: 'Cadena', division: 'Braslaw', edades: 'Chicas de 12 a 18 años', tipos: ['Eslabón'], celulas: [] }
]});

let db;
try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
db = db || base();

const save = () => localStorage.setItem(KEY, JSON.stringify(db));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const total = l => l.celulas.reduce((n, c) => n + c.integrantes.length, 0);
const $ = document.getElementById('app');
const el = id => document.getElementById(id);

function ruta() {
  const [, r, a, b] = location.hash.split('/');
  document.querySelectorAll('#tabs a').forEach(x => x.classList.toggle('on', x.dataset.t === (r || 'inicio')));
  if (r === 'lineas' && a && b) return celula(a, b);
  if (r === 'lineas' && a) return linea(a);
  if (r === 'lineas') return lineas();
  if (r === 'ajustes') return ajustes();
  inicio();
}

function inicio() {
  const p = db.lineas.reduce((n, l) => n + total(l), 0);
  const c = db.lineas.reduce((n, l) => n + l.celulas.length, 0);
  $.innerHTML = `<h1>Zona Yolteotl</h1>
  <div class="grid">
    <div class="card"><div class="big">${p}</div><div class="sub">Integrantes</div></div>
    <div class="card"><div class="big">${c}</div><div class="sub">Células</div></div>
  </div>
  <h2>Por línea</h2>
  <div class="list">${db.lineas.map(l => `<a class="row" href="#/lineas/${l.id}"><span>${esc(l.nombre)} ${esc(l.division)}</span><span class="sub">${total(l)}</span></a>`).join('')}</div>`;
}

function lineas() {
  $.innerHTML = `<h1>Líneas</h1><div class="list">${db.lineas.map(l => `<a class="row" href="#/lineas/${l.id}"><span>${esc(l.nombre)} · ${esc(l.division)}<br><span class="sub">${esc(l.edades)}</span></span><span class="sub">${total(l)}</span></a>`).join('')}</div>`;
}

function linea(id) {
  const l = db.lineas.find(x => x.id === id);
  if (!l) { location.hash = '#/lineas'; return; }
  $.innerHTML = `<a class="back" href="#/lineas">‹ Líneas</a><h1>${esc(l.division)}</h1>
  <p class="sub">${esc(l.nombre)} · ${esc(l.edades)} · ${total(l)} integrantes</p>
  <h2>Células</h2>
  <div class="list">${l.celulas.length ? l.celulas.map(c => `<a class="row" href="#/lineas/${l.id}/${c.id}"><span>${esc(c.nombre)}<br><span class="sub">${esc(c.tipo)}</span></span><span class="sub">${c.integrantes.length}</span></a>`).join('') : '<div class="row sub">Aún no hay células</div>'}</div>
  <form class="add" id="f"><input id="n" placeholder="Nombre de la nueva célula" required>${l.tipos.length > 1 ? `<select id="t">${l.tipos.map(t => `<option>${esc(t)}</option>`).join('')}</select>` : ''}<button>Añadir</button></form>`;
  el('f').onsubmit = e => {
    e.preventDefault();
    const n = el('n').value.trim();
    if (!n) return;
    const t = el('t');
    l.celulas.push({ id: uid(), nombre: n, tipo: t ? t.value : l.tipos[0], integrantes: [] });
    save(); linea(id);
  };
}

function celula(id, cid) {
  const l = db.lineas.find(x => x.id === id);
  const c = l && l.celulas.find(x => x.id === cid);
  if (!c) { location.hash = '#/lineas/' + id; return; }
  $.innerHTML = `<a class="back" href="#/lineas/${id}">‹ ${esc(l.division)}</a><h1>${esc(c.nombre)}</h1>
  <p class="sub">${esc(c.tipo)} · ${c.integrantes.length} integrantes</p>
  <h2>Integrantes</h2>
  <div class="list">${c.integrantes.length ? c.integrantes.map(p => `<div class="row"><span>${esc(p.nombre)}</span><button class="del" data-d="${p.id}">Quitar</button></div>`).join('') : '<div class="row sub">Sin integrantes</div>'}</div>
  <form class="add" id="f"><input id="n" placeholder="Nombre o apodo" required><button>Añadir</button></form>
  <h2></h2><button class="sec red" id="x">Eliminar célula</button>`;
  el('f').onsubmit = e => {
    e.preventDefault();
    const n = el('n').value.trim();
    if (!n) return;
    c.integrantes.push({ id: uid(), nombre: n });
    save(); celula(id, cid);
  };
  $.querySelectorAll('[data-d]').forEach(b => b.onclick = () => {
    c.integrantes = c.integrantes.filter(p => p.id !== b.dataset.d);
    save(); celula(id, cid);
  });
  el('x').onclick = () => {
    if (confirm('¿Eliminar esta célula y sus integrantes?')) {
      l.celulas = l.celulas.filter(x => x.id !== cid);
      save(); location.hash = '#/lineas/' + id;
    }
  };
}

let inst;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); inst = e; if (location.hash === '#/ajustes') ajustes(); });

function ajustes() {
  $.innerHTML = `<h1>Ajustes</h1>
  ${inst ? '<button class="sec" id="i">Instalar app</button>' : ''}
  <h2>Respaldo de datos</h2>
  <button class="sec" id="e">Exportar respaldo</button>
  <h2></h2>
  <button class="sec" id="im">Importar respaldo</button>
  <input type="file" id="fi" accept=".json" hidden>
  <p class="sub" style="margin:16px">Versión 1. Los datos se guardan en este dispositivo; exporta un respaldo con frecuencia.</p>`;
  if (inst) el('i').onclick = () => inst.prompt();
  el('e').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(db)], { type: 'application/json' }));
    a.download = 'yolteotl-respaldo.json';
    a.click();
  };
  el('im').onclick = () => el('fi').click();
  el('fi').onchange = () => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (!Array.isArray(d.lineas)) throw 0;
        if (confirm('Esto reemplaza los datos actuales. ¿Continuar?')) { db = d; save(); location.hash = '#/'; ruta(); }
      } catch (e) { alert('Archivo no válido'); }
    };
    r.readAsText(el('fi').files[0]);
  };
}

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
addEventListener('hashchange', ruta);
ruta();
