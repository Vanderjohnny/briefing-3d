/* Briefing de imagens 3D · UNK Group
   Código compartilhado por todos os empreendimentos. Cada página define window.BRIEFING
   (plantas, ambientes, zonas, pacote, endereço de envio) e carrega este arquivo. */
"use strict";
const CFG = window.BRIEFING;
const PLANTAS = CFG.plantas;
const REF = "../assets/refs/";
const LOGO = "../assets/logo.png";

const HORAS = [["dia","Dia"],["tarde","Entardecer"],["noite","Noite"]];
const FORMATOS = [["16:9","16:9 · horizontal"],["3:2","3:2 · horizontal"],["4:3","4:3 · horizontal"],["1:1","1:1 · quadrado"],["4:5","4:5 · vertical (feed)"],["2:3","2:3 · vertical"],["9:16","9:16 · vertical (stories)"]];
const PADROES = [["1","Básico"],["2","Intermediário"],["3","Alto padrão"]];
const DECOR = {
  living:["Apartamento · living","Sala, cozinha e dormitórios"],
  hall:["Hall de entrada","Recepção e acesso das torres"],
  salao:["Salão de festas","Mobiliário, iluminação e bancadas"],
  academia:["Academia","Equipamentos e acabamentos"],
  piscina:["Área da piscina","Paisagismo, deck e mobiliário externo"],
  brinquedoteca:["Brinquedoteca","Espaço infantil"],
  fachada:["Fachada","Linguagem das torres e do embasamento"]
};
const MATERIAIS = [
  ["porc_branco","Porcelanato branco","Pulpis Bianco Lux · Biancogres"],
  ["porc_bege","Porcelanato bege","Chicago Avorio Satin · Biancogres"],
  ["porc_cinza-claro","Porcelanato cinza claro","Bloomy Off White · Portobello"],
  ["vin_cedro","Vinílico Cedro","Tarkett"],
  ["vin_faia","Vinílico Faia","Tarkett"],
  ["vin_gergelim","Vinílico Gergelim","Tarkett"]
];
const PISOS = [["living","Living"],["dormitorios","Dormitórios"],["salao","Salão de festas"],["academia","Academia"],["piscina","Área da piscina"]];
const MDF = [["mdf_louro-freijo","Louro Freijó","Berneck"],["mdf_nogal-artezzano","Nogal Artezzano","Berneck"],["mdf_peroba-tatto","Peroba Tatto","Berneck"]];
const PASSOS = [["dados","Dados"],["cameras","Câmeras"],["direcao","Direção criativa"],["revisao","Revisão e envio"]];
const KEY = "briefing3d-" + CFG.slug;

let S = novoEstado();
function novoEstado(){ return {
  passo:0, planta:PLANTAS[0].id, filtro:"planta", sel:null, seq:0,
  dados:{responsavel:"",cargo:"",empresa:CFG.construtora,email:"",whats:"",endereco:CFG.endereco,contrato:"",pacote:CFG.pacote,prazo:"",padrao:"",valor:"",publico:"",concorrentes:"",conceito:"",uso:[]},
  cenas:[],
  dir:{decor:{},estilo:"",estiloOutro:"",atmosfera:[],pisos:{},pisosOutro:{},mdf:"",mdfOutro:"",bancadas:"",
       fachadaRev:"",fachadaRevOutro:"",friso:"",guardaCorpo:"",forroSacada:"",esqCor:"",esqMat:"",
       pessoas:"",veiculos:"",vegetacao:"",ceu:"",humanizada:"",objecoes:"",decoracao:"",refs:"",refImgs:[]},
  obs:"", aceite:false, enviado:null
};}
try{ const r = localStorage.getItem(KEY); if(r){ const o = JSON.parse(r), n = novoEstado();
  S = Object.assign(n, o, {dados:Object.assign(n.dados,o.dados), dir:Object.assign(n.dir,o.dir)});
  if(!PLANTAS.some(p=>p.id===S.planta)) S.planta = PLANTAS[0].id; } }catch(e){}
S.cenas.forEach(c=>{ if(!c.formato) c.formato = CFG.formatoPadrao || "16:9"; });
let saveT=null;
function salvar(){ clearTimeout(saveT); saveT=setTimeout(()=>{ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){ try{ localStorage.setItem(KEY, JSON.stringify(Object.assign({},S,{dir:Object.assign({},S.dir,{refImgs:[]})}))); }catch(_){} } },300); }

const $ = (s,el=document)=>el.querySelector(s);
const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const planta = id => PLANTAS.find(p=>p.id===id);
const numero = c => S.cenas.indexOf(c)+1;
const imgsDe = c => HORAS.filter(([k])=>c.horas[k]).length;
const totalImgs = () => S.cenas.reduce((a,c)=>a+imgsDe(c),0);
const horasTxt = c => HORAS.filter(([k])=>c.horas[k]).map(([,t])=>t).join(", ");
const padraoTxt = v => v==="unk" ? "UNK decide" : (PADROES.find(([k])=>k===v)||[,""])[1];

/* ---------- Estrutura da página ---------- */
document.body.insertAdjacentHTML("afterbegin", `
<header class="hdr">
  <div class="brand"><img src="${LOGO}" alt="UNK Group"><div><b>Briefing de imagens 3D</b><span>${esc(CFG.empreendimento)} · ${esc(CFG.construtora)}</span></div></div>
  <nav aria-label="Etapas"><ol class="steps" id="steps"></ol></nav>
</header>
<main id="main"></main>
<footer class="ftr">
  <div class="meter"><div><b id="mCount" class="mono">0</b><small id="mLabel"></small></div><div class="bar" id="mBar" aria-hidden="true"></div><span class="addnote" id="mAdd" hidden></span></div>
  <div class="nav"><button class="btn ghost" id="prevBtn">Voltar</button><button class="btn pri" id="nextBtn">Continuar</button></div>
</footer>
<div class="modal" id="modal" hidden><div id="modalBody"></div></div>
<div class="lightbox" id="lightbox" hidden><figure style="margin:0"><img id="lbImg" alt=""><p id="lbCap"></p></figure></div>
<input type="file" id="refFile" accept="image/*" multiple hidden>`);
$("#lightbox").onclick=()=>{ $("#lightbox").hidden=true; };
document.addEventListener("keydown",e=>{ if(e.key==="Escape"){ $("#lightbox").hidden=true; $("#modal").hidden=true; } });
function ampliar(src,cap){ $("#lbImg").src=src; $("#lbCap").textContent=cap||""; $("#lightbox").hidden=false; }

const IMG = {};
PLANTAS.forEach(p=>{ const im=new Image(); im.onload=()=>{ if(S.planta===p.id){ if(view.fitPending||!view.user) fit(); desenhar(); } }; im.src=p.img; IMG[p.id]=im; });

function pintarEtapas(){
  $("#steps").innerHTML = PASSOS.map(([k,t],i)=>`<li><button data-i="${i}" ${i===S.passo?'aria-current="step"':''} class="${i<S.passo?'done':''}"><span class="n">${i+1}</span><span class="t">${t}</span></button></li>`).join("");
}
$("#steps").addEventListener("click",e=>{ const b=e.target.closest("button"); if(b) irPara(+b.dataset.i); });
$("#prevBtn").onclick=()=>irPara(S.passo-1);
$("#nextBtn").onclick=()=>irPara(S.passo+1);
function irPara(i){ if(i<0||i>=PASSOS.length) return; S.passo=i; salvar(); render(); $("#main").scrollTop=0; window.scrollTo(0,0); }
function pintarMedidor(){
  const n=totalImgs(), p=+S.dados.pacote||CFG.pacote;
  $("#mCount").textContent=n;
  $("#mLabel").textContent=`${n===1?"imagem":"imagens"} · pacote de ${p}`;
  let h=""; for(let i=0;i<Math.max(p,n);i++) h+=`<i class="${i<n?(i<p?'on':'over'):''}"></i>`;
  $("#mBar").innerHTML=h;
  const a=$("#mAdd"); if(n>p){ a.hidden=false; a.textContent=`+${n-p} além do pacote (aditivo)`; } else a.hidden=true;
  $("#prevBtn").disabled = S.passo===0;
  $("#nextBtn").hidden = S.passo===PASSOS.length-1;
  if(S.passo<PASSOS.length-1) $("#nextBtn").textContent = "Continuar para " + PASSOS[S.passo+1][1].toLowerCase();
}
function render(){
  pintarEtapas();
  const k=PASSOS[S.passo][0]; document.body.dataset.passo=k;
  ({dados:renderDados,cameras:renderCameras,direcao:renderDirecao,revisao:renderRevisao})[k]();
  pintarMedidor();
}

/* ---------- Campos genéricos ---------- */
function getP(path){ return path.split(".").reduce((o,k)=>o?.[k],S); }
function setP(path,v){ const ks=path.split("."); const last=ks.pop(); const o=ks.reduce((o,k)=>(o[k]??={}),S); o[last]=v; }
function campo(path,label,opt={}){
  const v=getP(path)??""; const id="f_"+path.replace(/\./g,"_");
  const req=opt.req?' <span class="req">*</span>':'';
  let input;
  if(opt.area) input=`<textarea id="${id}" data-p="${path}" placeholder="${esc(opt.ph||"")}">${esc(v)}</textarea>`;
  else if(opt.sel) input=`<select id="${id}" data-p="${path}"><option value="">Selecione</option>${opt.sel.map(o=>`<option ${o===v?"selected":""}>${esc(o)}</option>`).join("")}</select>`;
  else input=`<input id="${id}" data-p="${path}" type="${opt.type||"text"}" value="${esc(v)}" placeholder="${esc(opt.ph||"")}" ${opt.type==="number"?'min="1"':''}>`;
  return `<div class="f ${opt.full?"full":""}"><label for="${id}">${label}${req}</label>${input}${opt.help?`<small>${opt.help}</small>`:""}</div>`;
}
function chips(path,opts,multi=false){
  const v=getP(path); const nm=path.replace(/\./g,"_");
  return `<div class="chips" role="group">${opts.map((o,i)=>{ const on=multi?(v||[]).includes(o):v===o; const id=`c_${nm}_${i}`;
    return `<label class="chip" for="${id}"><input id="${id}" type="${multi?"checkbox":"radio"}" name="${nm}" data-c="${path}" data-m="${multi?1:0}" value="${esc(o)}" ${on?"checked":""}><span>${esc(o)}</span></label>`; }).join("")}</div>`;
}
function ligarCampos(root){
  root.querySelectorAll("[data-p]").forEach(el=>el.addEventListener("input",()=>{ setP(el.dataset.p, el.value); salvar(); if(el.dataset.p==="dados.pacote") pintarMedidor(); }));
  root.querySelectorAll("[data-c]").forEach(el=>el.addEventListener("change",()=>{ const p=el.dataset.c;
    if(el.dataset.m==="1"){ const a=new Set(getP(p)||[]); el.checked?a.add(el.value):a.delete(el.value); setP(p,[...a]); } else setP(p,el.value); salvar();
    root.querySelectorAll(`[data-show="${p}"]`).forEach(x=>x.hidden = getP(p)!==x.dataset.when); }));
}

/* ---------- Etapa 1: dados ---------- */
function renderDados(){
  $("#main").innerHTML = `<div class="page">
    <div class="page-head"><span class="eyebrow">Etapa 1 de 4</span><h1>${esc(CFG.empreendimento)}</h1>
    <p>Neste briefing você marca cada câmera direto nas plantas, escolhe os horários e o formato de cada imagem e passa a direção criativa. Ao final, o briefing é enviado automaticamente para a equipe UNK. O rascunho fica salvo neste navegador.</p></div>
    <section class="sheet"><h2>Quem responde pelo briefing</h2><p class="sub">Uma única pessoa aprova as imagens, para que o projeto flua sem retrabalho.</p>
      <div class="grid">
        ${campo("dados.responsavel","Nome completo",{req:1,ph:"Nome de quem aprova as imagens"})}
        ${campo("dados.cargo","Cargo",{ph:"Ex.: Diretor de marketing"})}
        ${campo("dados.empresa","Construtora / incorporadora",{req:1})}
        ${campo("dados.email","E-mail",{req:1,type:"email",ph:"nome@empresa.com.br"})}
        ${campo("dados.whats","WhatsApp",{req:1,type:"tel",ph:"(47) 99999-9999"})}
        ${campo("dados.contrato","Contrato ou referência",{ph:"Ex.: Contrato LMR/2026"})}
        ${campo("dados.endereco","Endereço do empreendimento",{full:1})}
      </div></section>
    <section class="sheet"><h2>Pacote e prazo</h2>
      <div class="grid g3">
        ${campo("dados.pacote","Imagens contratadas",{type:"number",req:1,help:"Imagens acima do pacote viram aditivo contratual."})}
        ${campo("dados.prazo","Data de lançamento ou evento",{type:"date",help:"Ajuda a priorizar a ordem de entrega."})}
        ${campo("dados.valor","Valor médio do apartamento",{ph:"R$"})}
      </div></section>
    <section class="sheet"><h2>Posicionamento de venda</h2><p class="sub">Ajuda a acertar o público das cenas, a decoração e o clima das imagens.</p>
      <div class="grid">
        <div class="f full"><span class="lbl">Padrão do empreendimento <span class="req">*</span></span>${chips("dados.padrao",["Popular","Intermediário","Alto padrão","Luxo"])}</div>
        ${campo("dados.publico","Público-alvo",{ph:"Ex.: casais jovens, investidores, veraneio"})}
        ${campo("dados.concorrentes","3 principais concorrentes",{ph:"Empreendimento · construtora"})}
        ${campo("dados.conceito","Conceito e diferenciais que as imagens precisam mostrar",{area:1,full:1,ph:"Ex.: a 300 m da praia, lazer completo no térreo, vista para o rio Piçarras"})}
        <div class="f full"><span class="lbl">Onde as imagens serão usadas</span>${chips("dados.uso",["Site","Redes sociais","Anúncios digitais","Stand de vendas","Book / folder impresso","Outdoor","Placa de obra","Apresentação a investidores"],true)}</div>
      </div></section>
  </div>`;
  ligarCampos($("#main"));
}

/* ---------- Etapa 2: câmeras ---------- */
const view={s:1,tx:0,ty:0,fitPending:true,user:false,mode:"draw"};
let cv, ctx, stageEl, temp=null, ro=null;
const TOPO=56;
function renderCameras(){
  const grupos=[...new Set(PLANTAS.map(p=>p.grupo))];
  $("#main").innerHTML = `<div class="work">
    <div class="tabs" role="tablist">${grupos.map(g=>`<div class="tabgroup"><span>${esc(g)}</span><div>${PLANTAS.filter(p=>p.grupo===g).map(p=>`<button class="tab" role="tab" data-p="${p.id}" aria-selected="${p.id===S.planta}">${esc(p.nome)}<span class="cnt" data-cnt="${p.id}" hidden></span></button>`).join("")}</div></div>`).join("")}</div>
    <div class="stage" id="stage">
      <canvas id="cv" aria-label="Planta para marcar câmeras"></canvas>
      <div class="tools">
        <div class="grp"><button id="mDraw" title="Arraste para criar uma câmera">Câmera</button><button id="mPan" title="Arraste para mover a planta">Mover</button></div>
        <div class="grp"><button id="zOut" aria-label="Reduzir">−</button><span class="zoomv mono" id="zv">100%</span><button id="zIn" aria-label="Ampliar">+</button><button id="zFit">Ajustar</button></div>
        <div class="grp"><button id="undo">Desfazer</button><button id="clearP">Limpar planta</button></div>
      </div>
      <span class="sheetref" id="sheetref"></span>
      <div class="hint" id="hint"></div>
    </div>
    <section class="scenes" aria-label="Câmeras">
      <div class="scenes-hd"><h2 id="scTitle"></h2><span class="where" id="scInfo"></span>
        <div class="seg"><button data-f="planta">Esta planta</button><button data-f="todas">Lista geral</button></div></div>
      <div class="scenes-body" id="scBody"></div>
    </section></div>`;
  stageEl=$("#stage"); cv=$("#cv"); ctx=cv.getContext("2d");
  $(".tabs").addEventListener("click",e=>{ const b=e.target.closest(".tab"); if(!b) return; S.planta=b.dataset.p; S.sel=null; view.fitPending=true; salvar(); renderCameras(); pintarMedidor(); });
  $("#mDraw").onclick=()=>modo("draw"); $("#mPan").onclick=()=>modo("pan");
  $("#zIn").onclick=()=>zoomEm(1.25); $("#zOut").onclick=()=>zoomEm(1/1.25); $("#zFit").onclick=()=>{fit();desenhar();};
  $("#undo").onclick=()=>{ const ult=[...S.cenas].reverse().find(c=>c.planta===S.planta); if(ult) apagar(ult.id); };
  $("#clearP").onclick=()=>confirmar(`Apagar todas as câmeras de “${planta(S.planta).nome}”?`,()=>{ S.cenas=S.cenas.filter(c=>c.planta!==S.planta); S.sel=null; mudou(); });
  document.querySelectorAll(".seg button").forEach(b=>{ b.setAttribute("aria-pressed", b.dataset.f===S.filtro); b.onclick=()=>{ S.filtro=b.dataset.f; salvar(); pintarLista(); document.querySelectorAll(".seg button").forEach(x=>x.setAttribute("aria-pressed",x.dataset.f===S.filtro)); }; });
  ligarCanvas(); modo(view.mode);
  if(ro) ro.disconnect(); ro=new ResizeObserver(()=>dimensionar()); ro.observe(stageEl);
  dimensionar(); pintarLista(); contarAbas();
  $("#sheetref").textContent = planta(S.planta).prancha;
}
function modo(m){ view.mode=m; $("#mDraw").setAttribute("aria-pressed",m==="draw"); $("#mPan").setAttribute("aria-pressed",m==="pan"); stageEl.classList.toggle("pan",m==="pan"); dica(); }
function dica(){ const h=$("#hint"); if(!h) return; const n=S.cenas.filter(c=>c.planta===S.planta).length;
  h.textContent = view.mode==="pan" ? "Arraste para mover · role ou use a pinça para ampliar" : (n? "Arraste para outra câmera · toque numa seta para ajustar as pontas" : "Arraste do ponto da câmera até o que ela deve enquadrar"); }
function dimensionar(){ if(!cv) return; const r=stageEl.getBoundingClientRect(); const d=window.devicePixelRatio||1; cv.width=Math.max(1,r.width*d); cv.height=Math.max(1,r.height*d); if(view.fitPending||!view.user) fit(); desenhar(); }
function baseEscala(){ const im=IMG[S.planta]; if(!im||!im.naturalWidth) return 0; const r=stageEl.getBoundingClientRect(); return Math.min((r.width-24)/im.naturalWidth,(r.height-TOPO-12)/im.naturalHeight); }
function fit(){ const im=IMG[S.planta]; if(!im||!im.naturalWidth||!cv) return; const r=stageEl.getBoundingClientRect(); if(!r.width) return;
  const s=baseEscala(); view.s=s; view.tx=(r.width-im.naturalWidth*s)/2; view.ty=TOPO+(r.height-TOPO-12-im.naturalHeight*s)/2; view.fitPending=false; view.user=false; }
function zoomEm(f,cx,cy){ const r=stageEl.getBoundingClientRect(); if(cx==null){cx=r.width/2;cy=r.height/2;}
  view.user=true; const ns=Math.min(Math.max(view.s*f,.05),8); const k=ns/view.s; view.tx=cx-(cx-view.tx)*k; view.ty=cy-(cy-view.ty)*k; view.s=ns; desenhar(); }
const toImg=(x,y)=>{ const im=IMG[S.planta]; return {x:(x-view.tx)/(im.naturalWidth*view.s), y:(y-view.ty)/(im.naturalHeight*view.s)}; };
const toScr=(x,y)=>{ const im=IMG[S.planta]; return {x:view.tx+x*im.naturalWidth*view.s, y:view.ty+y*im.naturalHeight*view.s}; };
const cssVar=(n,f)=>getComputedStyle(document.documentElement).getPropertyValue(n).trim()||f;

/* uma câmera: cone de visão, haste, ponta e número no ponto da câmera */
function setaNo(g,a,b,n,o){
  const {cor,raio,lw,sel,handles}=o;
  const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1, ang=Math.atan2(dy,dx);
  g.save(); g.globalAlpha=sel?.18:.12; g.fillStyle=cor; g.beginPath(); g.moveTo(a.x,a.y); g.arc(a.x,a.y,L,ang-Math.PI/6,ang+Math.PI/6); g.closePath(); g.fill(); g.restore();
  const head=Math.max(raio*1.05,10);
  g.strokeStyle=cor; g.lineWidth=lw; g.lineCap="round";
  g.beginPath(); g.moveTo(a.x+Math.cos(ang)*raio,a.y+Math.sin(ang)*raio); g.lineTo(b.x-Math.cos(ang)*head*.7,b.y-Math.sin(ang)*head*.7); g.stroke();
  g.fillStyle=cor; g.beginPath(); g.moveTo(b.x,b.y); g.lineTo(b.x-Math.cos(ang-.42)*head,b.y-Math.sin(ang-.42)*head); g.lineTo(b.x-Math.cos(ang+.42)*head,b.y-Math.sin(ang+.42)*head); g.closePath(); g.fill();
  g.beginPath(); g.arc(a.x,a.y,raio,0,Math.PI*2); g.fillStyle=cor; g.fill(); g.lineWidth=Math.max(2,lw*.7); g.strokeStyle="#fff"; g.stroke();
  g.fillStyle="#fff"; g.font=`600 ${Math.round(raio*1.05)}px "IBM Plex Mono",Consolas,monospace`; g.textAlign="center"; g.textBaseline="middle"; g.fillText(String(n),a.x,a.y+raio*.05);
  if(handles){ g.lineWidth=2; g.strokeStyle=cor; g.fillStyle="#fff"; g.beginPath(); g.arc(b.x,b.y,7,0,Math.PI*2); g.fill(); g.stroke(); g.beginPath(); g.arc(a.x,a.y,raio+5,0,Math.PI*2); g.setLineDash([4,3]); g.stroke(); g.setLineDash([]); }
}
function desenhar(){
  if(!cv||!ctx||!document.body.contains(cv)) return; const d=window.devicePixelRatio||1; ctx.setTransform(d,0,0,d,0,0);
  const r=stageEl.getBoundingClientRect(); ctx.clearRect(0,0,r.width,r.height);
  const im=IMG[S.planta]; if(!im||!im.naturalWidth) return;
  ctx.save(); ctx.shadowColor="rgba(0,0,0,.18)"; ctx.shadowBlur=18; ctx.fillStyle="#fff"; ctx.fillRect(view.tx,view.ty,im.naturalWidth*view.s,im.naturalHeight*view.s); ctx.restore();
  ctx.imageSmoothingQuality="high"; ctx.drawImage(im,view.tx,view.ty,im.naturalWidth*view.s,im.naturalHeight*view.s);
  const cc=cssVar("--cam","#e0482c"), ca=cssVar("--accent","#0e6e73");
  S.cenas.forEach(c=>{ if(c.planta!==S.planta) return; const sel=c.id===S.sel; setaNo(ctx,toScr(c.x1,c.y1),toScr(c.x2,c.y2),numero(c),{cor:sel?ca:cc,raio:13,lw:3,sel,handles:sel}); });
  if(temp) setaNo(ctx,toScr(temp.x1,temp.y1),toScr(temp.x2,temp.y2),S.cenas.length+1,{cor:cc,raio:13,lw:3});
  const zv=$("#zv"); if(zv) zv.textContent=Math.round(view.s/(baseEscala()||view.s)*100)+"%";
}
function distSeg(p,a,b){ const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy; let t=l?((p.x-a.x)*dx+(p.y-a.y)*dy)/l:0; t=Math.max(0,Math.min(1,t)); return Math.hypot(p.x-(a.x+t*dx),p.y-(a.y+t*dy)); }
function ligarCanvas(){
  const pts=new Map(); let act=null;
  const P=e=>{ const r=cv.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; };
  const cl=v=>Math.max(0,Math.min(1,v));
  cv.addEventListener("wheel",e=>{ e.preventDefault(); const p=P(e); zoomEm(Math.exp(-e.deltaY*.0015),p.x,p.y); },{passive:false});
  cv.addEventListener("pointerdown",e=>{
    e.preventDefault(); try{cv.setPointerCapture(e.pointerId);}catch(_){}
    const p=P(e); pts.set(e.pointerId,p);
    if(pts.size===2){ temp=null; const [a,b]=[...pts.values()]; act={t:"pinch",d0:Math.hypot(a.x-b.x,a.y-b.y),m:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},s0:view.s,tx0:view.tx,ty0:view.ty}; desenhar(); return; }
    if(pts.size>2) return;
    if(view.mode==="pan"||e.button===1||e.button===2){ act={t:"pan",p0:p,tx0:view.tx,ty0:view.ty}; stageEl.classList.add("panning"); return; }
    const sel=S.cenas.find(c=>c.id===S.sel&&c.planta===S.planta);
    if(sel){ const a=toScr(sel.x1,sel.y1), b=toScr(sel.x2,sel.y2);
      if(Math.hypot(p.x-b.x,p.y-b.y)<16){ act={t:"end",c:sel,k:2}; return; }
      if(Math.hypot(p.x-a.x,p.y-a.y)<18){ act={t:"end",c:sel,k:1}; return; } }
    const hit=[...S.cenas].reverse().find(c=>c.planta===S.planta && (Math.hypot(p.x-toScr(c.x1,c.y1).x,p.y-toScr(c.x1,c.y1).y)<16 || distSeg(p,toScr(c.x1,c.y1),toScr(c.x2,c.y2))<9));
    if(hit){ S.sel=hit.id; act={t:"move",c:hit,p0:toImg(p.x,p.y),o:{x1:hit.x1,y1:hit.y1,x2:hit.x2,y2:hit.y2},moved:false}; desenhar(); pintarLista(true); return; }
    const ip=toImg(p.x,p.y); if(ip.x<0||ip.y<0||ip.x>1||ip.y>1){ act={t:"pan",p0:p,tx0:view.tx,ty0:view.ty}; return; }
    act={t:"draw"}; temp={x1:ip.x,y1:ip.y,x2:ip.x,y2:ip.y};
  });
  cv.addEventListener("pointermove",e=>{
    if(!pts.has(e.pointerId)) return; const p=P(e); pts.set(e.pointerId,p); if(!act) return;
    if(act.t==="pinch"&&pts.size===2){ const [a,b]=[...pts.values()]; const d=Math.hypot(a.x-b.x,a.y-b.y), m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
      view.user=true; const ns=Math.min(Math.max(act.s0*d/act.d0,.05),8), k=ns/act.s0; view.s=ns; view.tx=m.x-(act.m.x-act.tx0)*k; view.ty=m.y-(act.m.y-act.ty0)*k; desenhar(); }
    else if(act.t==="pan"){ view.user=true; view.tx=act.tx0+p.x-act.p0.x; view.ty=act.ty0+p.y-act.p0.y; desenhar(); }
    else if(act.t==="draw"){ const ip=toImg(p.x,p.y); temp.x2=cl(ip.x); temp.y2=cl(ip.y); desenhar(); }
    else if(act.t==="end"){ const ip=toImg(p.x,p.y); act.c["x"+act.k]=cl(ip.x); act.c["y"+act.k]=cl(ip.y); desenhar(); }
    else if(act.t==="move"){ const ip=toImg(p.x,p.y); const dx=ip.x-act.p0.x, dy=ip.y-act.p0.y; if(Math.abs(dx)+Math.abs(dy)>.002) act.moved=true;
      Object.assign(act.c,{x1:cl(act.o.x1+dx),y1:cl(act.o.y1+dy),x2:cl(act.o.x2+dx),y2:cl(act.o.y2+dy)}); desenhar(); }
  });
  const fim=e=>{
    pts.delete(e.pointerId); stageEl.classList.remove("panning"); if(!act) return;
    if(act.t==="pinch"){ if(pts.size===0) act=null; return; }
    if(act.t==="draw"&&temp){ const a=toScr(temp.x1,temp.y1), b=toScr(temp.x2,temp.y2);
      if(Math.hypot(a.x-b.x,a.y-b.y)<14){ temp=null; S.sel=null; desenhar(); pintarLista(); act=null; return; }
      criar(temp); temp=null; }
    else if(act.t==="end"){ sugerir(act.c); mudou(); }
    else if(act.t==="move"){ if(act.moved){ sugerir(act.c); mudou(); } }
    act=null;
  };
  cv.addEventListener("pointerup",fim); cv.addEventListener("pointercancel",fim);
  cv.addEventListener("contextmenu",e=>e.preventDefault());
}
/* reconhece ambiente e unidade pelas zonas da planta */
function zonaEm(pid,x,y){ return (CFG.zonas[pid]||[]).find(([n,u,x0,y0,x1,y1])=>x>=x0&&x<=x1&&y>=y0&&y<=y1); }
function sugerir(c){
  const p=planta(c.planta); const zo=zonaEm(c.planta,c.x1,c.y1), zt=zonaEm(c.planta,c.x2,c.y2);
  let amb="", un="";
  if(p.tipo==="apto"){
    const z=zo||zt; if(z){ amb=z[0]; un=z[1]; }
    if(zo&&zt&&zo[1]===zt[1]&&((zo[0]==="Estar e jantar"&&zt[0]==="Sacada")||(zo[0]==="Sacada"&&zt[0]==="Estar e jantar"))) amb="Estar integrado à sacada";
    if(!un && zt) un=zt[1];
  } else { const z=zt||zo; if(z){ amb=z[0]; } }
  if(amb && !c.ambienteManual) c.ambiente=amb;
  if(un && !c.unidadeManual) c.unidade=un;
}
function novoId(){ return "c"+(++S.seq)+"_"+Date.now().toString(36); }
function criar(t){
  const c={id:novoId(),planta:S.planta,x1:t.x1,y1:t.y1,x2:t.x2,y2:t.y2,ambiente:"",unidade:"",horas:{dia:true,tarde:false,noite:false},formato:CFG.formatoPadrao||"16:9",obs:""};
  sugerir(c); S.cenas.push(c); S.sel=c.id; mudou();
  requestAnimationFrame(()=>{ const row=document.querySelector(`tr[data-id="${c.id}"]`); if(row){ row.scrollIntoView({block:"nearest"}); if(!c.ambiente) row.querySelector("select")?.focus({preventScroll:true}); } });
}
function duplicar(id){ const o=S.cenas.find(c=>c.id===id); if(!o) return;
  const off=.025, c=JSON.parse(JSON.stringify(o)); c.id=novoId();
  c.x1=Math.min(1,o.x1+off); c.y1=Math.min(1,o.y1+off); c.x2=Math.min(1,o.x2+off); c.y2=Math.min(1,o.y2+off);
  S.cenas.splice(S.cenas.indexOf(o)+1,0,c); S.sel=c.id; mudou(); }
function apagar(id){ S.cenas=S.cenas.filter(c=>c.id!==id); if(S.sel===id) S.sel=null; mudou(); }
function mudou(){ salvar(); desenhar(); pintarLista(); pintarMedidor(); contarAbas(); dica(); }
function contarAbas(){ document.querySelectorAll("[data-cnt]").forEach(el=>{ const n=S.cenas.filter(c=>c.planta===el.dataset.cnt).length; el.hidden=!n; el.textContent=n; }); }
function selFormato(c){ return `<select data-k="formato" aria-label="Formato da imagem ${numero(c)}">${FORMATOS.map(([v,t])=>`<option value="${v}" ${v===c.formato?"selected":""}>${t}</option>`).join("")}</select>`; }
function pintarLista(soSel){
  const body=$("#scBody"); if(!body) return;
  if(soSel){ body.querySelectorAll("tr[data-id]").forEach(tr=>tr.classList.toggle("sel",tr.dataset.id===S.sel)); const tr=body.querySelector(`tr[data-id="${S.sel}"]`); tr&&tr.scrollIntoView({block:"nearest"}); return; }
  const geral=S.filtro==="todas"; const lista = geral ? S.cenas : S.cenas.filter(c=>c.planta===S.planta);
  $("#scTitle").textContent = geral ? `Lista geral das imagens (${lista.length} câmeras)` : `Câmeras nesta planta (${lista.length})`;
  $("#scInfo").textContent = `${totalImgs()} imagens no total · cada horário marcado conta como uma imagem`;
  if(!lista.length){ body.innerHTML=`<div class="empty"><svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true"><circle cx="11" cy="31" r="7" fill="var(--cam)"/><path d="M16 26 L33 12" stroke="var(--cam)" stroke-width="3" stroke-linecap="round"/><path d="M36 9 l-3 10 -7 -7z" fill="var(--cam)"/></svg><div><b>Nenhuma câmera ${geral?"marcada":"nesta planta"} ainda.</b><br>Arraste sobre a planta, do ponto onde a câmera fica até o que ela deve enquadrar. Cada câmera vira uma linha aqui.</div></div>`; return; }
  body.innerHTML = `<table class="cams"><thead><tr><th>#</th><th>Ambiente</th><th>Unidade</th><th>Horário da cena</th><th>Formato</th><th>Observação</th><th></th></tr></thead><tbody>${lista.map(c=>{
    const pl=planta(c.planta); const amb=CFG.ambientes[pl.tipo]||[]; const outro=c.ambiente && !amb.includes(c.ambiente);
    return `<tr data-id="${c.id}" class="${c.id===S.sel?"sel":""}">
      <td><span class="num">${numero(c)}</span></td>
      <td><select data-k="ambiente" aria-label="Ambiente da câmera ${numero(c)}"><option value="">Escolha o ambiente</option>${amb.map(a=>`<option ${a===c.ambiente?"selected":""}>${esc(a)}</option>`).join("")}${outro?`<option selected>${esc(c.ambiente)}</option>`:""}</select>
        ${c.ambiente==="Outro"||outro?`<input type="text" data-k="ambienteTxt" placeholder="Qual ambiente?" value="${esc(outro?c.ambiente:"")}" style="margin-top:6px">`:""}
        ${geral?`<div class="where">${esc(pl.nome)}</div>`:""}</td>
      <td>${pl.tipo==="apto"?`<select data-k="unidade" aria-label="Unidade"><option value="">—</option>${CFG.unidades.map(([u,a])=>`<option value="${u}" ${u===c.unidade?"selected":""}>${u} · ${a}</option>`).join("")}</select>`:`<span class="where">${pl.tipo==="lazer"?"Área comum":"Externa"}</span>`}</td>
      <td><div class="hrs">${HORAS.map(([k,t])=>`<label class="hr"><input type="checkbox" data-h="${k}" ${c.horas[k]?"checked":""}><span>${t}</span></label>`).join("")}</div></td>
      <td class="fmt">${selFormato(c)}</td>
      <td><input type="text" data-k="obs" value="${esc(c.obs)}" placeholder="Ex.: destacar a vista da sacada"></td>
      <td><div class="acts"><button class="btn-s" data-a="dup" title="Cria uma cópia desta cena para outro ângulo ou formato">Duplicar cena</button><button class="btn-s danger" data-a="del">Apagar</button></div></td></tr>`; }).join("")}</tbody></table>`;
}
function linhaCena(e){ const tr=e.target.closest("tr[data-id]"); if(!tr||!tr.closest("#scBody,#revBody")) return null; return S.cenas.find(x=>x.id===tr.dataset.id)||null; }
document.addEventListener("click",e=>{
  const c=linhaCena(e); if(!c) return; const noRev=!!e.target.closest("#revBody");
  const a=e.target.closest("[data-a]"); if(a){ a.dataset.a==="dup"?duplicar(c.id):apagar(c.id); if(noRev) renderRevisao(); return; }
  if(noRev) return;
  if(S.sel!==c.id){ S.sel=c.id; if(c.planta!==S.planta){ S.planta=c.planta; view.fitPending=true; renderCameras(); } else { desenhar(); pintarLista(true); } }
});
document.addEventListener("change",e=>{
  const c=linhaCena(e); if(!c) return; const noRev=!!e.target.closest("#revBody");
  if(e.target.dataset.h){ c.horas[e.target.dataset.h]=e.target.checked;
    if(!HORAS.some(([k])=>c.horas[k])){ c.horas[e.target.dataset.h]=true; e.target.checked=true; aviso("Cada cena precisa de pelo menos um horário. Para tirar a cena, use Apagar."); }
    salvar(); pintarMedidor(); noRev?renderRevisao():pintarLista(); return; }
  const k=e.target.dataset.k;
  if(k==="ambiente"){ c.ambiente=e.target.value; c.ambienteManual=true; salvar(); noRev?renderRevisao():pintarLista(); }
  else if(k==="unidade"){ c.unidade=e.target.value; c.unidadeManual=true; salvar(); }
  else if(k==="formato"){ c.formato=e.target.value; salvar(); if(noRev) renderRevisao(); }
});
document.addEventListener("input",e=>{
  const c=linhaCena(e); if(!c) return; const k=e.target.dataset.k;
  if(k==="obs"){ c.obs=e.target.value; salvar(); } else if(k==="ambienteTxt"){ c.ambiente=e.target.value||"Outro"; c.ambienteManual=true; salvar(); }
});
document.addEventListener("keydown",e=>{
  if(document.body.dataset.passo!=="cameras"||e.target.closest("input,select,textarea")) return;
  if((e.key==="Delete"||e.key==="Backspace")&&S.sel){ e.preventDefault(); apagar(S.sel); }
  if(e.key.toLowerCase()==="d"&&S.sel&&(e.ctrlKey||e.metaKey)){ e.preventDefault(); duplicar(S.sel); }
});

/* ---------- Etapa 3: direção criativa ---------- */
function decorRow(k){
  const [tit,sub]=DECOR[k]; const v=S.dir.decor[k]||"";
  return `<div class="decor-row"><div class="hd"><b>${tit}</b><small>${sub}</small></div><div class="dcards" role="radiogroup" aria-label="${esc(tit)}">
    ${PADROES.map(([n,t])=>`<label class="dcard"><input type="radio" name="dec_${k}" value="${n}" data-dec="${k}" ${v===n?"checked":""}><div class="ph"><img src="${REF}${k}_${n}.jpg" alt="${esc(tit)} · ${t}" loading="lazy"></div><span class="cap">${t}</span><button type="button" class="zoom" data-zoom="${REF}${k}_${n}.jpg" data-cap="${esc(tit)} · ${t}">Ampliar</button></label>`).join("")}
    <label class="dcard unk"><input type="radio" name="dec_${k}" value="unk" data-dec="${k}" ${v==="unk"?"checked":""}><div class="ph"><div><b>UNK decide</b>A equipe propõe com base no padrão do empreendimento</div></div><span class="cap">UNK decide</span></label>
  </div></div>`;
}
function swRow(chave,rotulo,opts,valor,outroPath,path){
  const nm="sw_"+path.replace(/\./g,"_");
  return `<div class="swrow"><span>${rotulo}</span><div><div class="sws">${opts.map(([id,t,m])=>`<label class="sw" title="${esc(m||"")}"><input type="radio" name="${nm}" data-sw="${path}" value="${id}" ${valor===id?"checked":""}><span>${id.startsWith("_")?"":`<i style="background-image:url('${REF}${id}.jpg')"></i>`}${esc(t)}</span></label>`).join("")}</div>
    <input class="outro" type="text" data-p="${outroPath}" value="${esc(getP(outroPath)||"")}" placeholder="Outro ou referência exata (fabricante, linha, tamanho)" ${valor==="_outro"?"":"hidden"}></div></div>`;
}
function renderDirecao(){
  const d=S.dir;
  const pisosOpts=[...MATERIAIS,["_unk","UNK decide"],["_outro","Outro"]];
  $("#main").innerHTML=`<div class="page">
    <div class="page-head"><span class="eyebrow">Etapa 3 de 4</span><h1>Direção criativa</h1><p>Vale para todas as imagens. Os exemplos abaixo são imagens produzidas pela UNK em cada padrão de decoração. Toque em “Ampliar” para ver em tamanho grande.</p></div>
    <section class="sheet"><h2>Padrão de decoração</h2><p class="sub">Escolha um padrão para cada ambiente. Ele define mobiliário, iluminação, marcenaria e acabamentos da cena.</p>
      <div class="decor">${(CFG.decor||Object.keys(DECOR)).map(decorRow).join("")}</div></section>
    <section class="sheet"><h2>Estilo e atmosfera</h2>
      <div class="f"><span class="lbl">Estilo que melhor representa o empreendimento</span>${chips("dir.estilo",["Contemporâneo","Contemporâneo litorâneo","Minimalista","Eclético","Clássico","Industrial","UNK decide","Outro"])}</div>
      <div class="f" data-show="dir.estilo" data-when="Outro" ${d.estilo==="Outro"?"":"hidden"}><label for="f_dir_estiloOutro">Descreva o estilo</label><input id="f_dir_estiloOutro" data-p="dir.estiloOutro" value="${esc(d.estiloOutro)}"></div>
      <div class="f"><span class="lbl">Atmosfera desejada</span>${chips("dir.atmosfera",["Aconchegante","Sofisticada","Solar e leve","Vibrante","Familiar","Tranquila","Jovem e urbana"],true)}</div>
    </section>
    <section class="sheet"><h2>Pisos e marcenaria</h2><p class="sub">Materiais de referência da UNK. Se o memorial já define outro, escolha “Outro” e informe fabricante, linha e tamanho.</p>
      <div>${PISOS.map(([k,t])=>swRow(k,"Piso · "+t,pisosOpts,d.pisos[k]||"",`dir.pisosOutro.${k}`,`dir.pisos.${k}`)).join("")}
      ${swRow("mdf","Marcenaria (MDF)",[...MDF,["_unk","UNK decide"],["_outro","Outro"]],d.mdf,"dir.mdfOutro","dir.mdf")}</div>
      ${campo("dir.bancadas","Bancadas e metais",{ph:"Ex.: quartzo branco, metais pretos"})}
    </section>
    <section class="sheet"><h2>Fachada e esquadrias</h2>
      <div class="grid">
        <div class="f full"><span class="lbl">Revestimento da fachada <span class="req">*</span></span>${chips("dir.fachadaRev",["Pintura","Textura","Porcelanato","Fachada ventilada","Outro"])}</div>
        <div class="f full" data-show="dir.fachadaRev" data-when="Outro" ${d.fachadaRev==="Outro"?"":"hidden"}><label for="f_dir_fachadaRevOutro">Qual revestimento?</label><input id="f_dir_fachadaRevOutro" data-p="dir.fachadaRevOutro" value="${esc(d.fachadaRevOutro)}"></div>
        <div class="f"><span class="lbl">Junta de dilatação ou friso em cada pavimento?</span>${chips("dir.friso",["Sim","Não","Seguir projeto"])}</div>
        <div class="f"><span class="lbl">Forro da sacada</span>${chips("dir.forroSacada",["Gesso","Amadeirado","Outro"])}</div>
        <div class="f full"><span class="lbl">Guarda-corpo das sacadas <span class="req">*</span></span>${chips("dir.guardaCorpo",["Alumínio + vidro, montantes por trás","Alumínio + vidro + fechamento Reiki","Somente vidro, sem perfil aparente","Somente alumínio","Seguir projeto"])}</div>
        <div class="f"><span class="lbl">Cor das esquadrias <span class="req">*</span></span>${chips("dir.esqCor",["Branco","Preto","Bronze","Outro"])}</div>
        <div class="f"><span class="lbl">Material das esquadrias</span>${chips("dir.esqMat",["Alumínio","PVC","Outro"])}</div>
      </div></section>
    <section class="sheet"><h2>Cena e composição</h2>
      <div class="grid">
        <div class="f"><span class="lbl">Pessoas nas imagens</span>${chips("dir.pessoas",["Sem pessoas","Poucas, discretas","Cenas de uso com pessoas"])}</div>
        <div class="f"><span class="lbl">Veículos</span>${chips("dir.veiculos",["Sem veículos","Poucos, estacionados","Rua movimentada"])}</div>
        <div class="f"><span class="lbl">Vegetação</span>${chips("dir.vegetacao",["Tropical litorânea","Nativa da Mata Atlântica","Seguir projeto paisagístico","UNK decide"])}</div>
        <div class="f"><span class="lbl">Céu e clima</span>${chips("dir.ceu",["Céu limpo","Poucas nuvens","Dramático","UNK decide"])}</div>
      </div></section>
    <section class="sheet"><h2>Plantas humanizadas</h2><p class="sub">Modelo das plantas humanizadas, quando fizerem parte do contrato.</p>
      <div class="hum">
        ${[["Humanizada com blocos 3D","humanizada_blocos3d"],["Minimalista","humanizada_minimalista"]].map(([t,f])=>`<label class="dcard"><input type="radio" name="hum" data-c="dir.humanizada" data-m="0" value="${t}" ${d.humanizada===t?"checked":""}><div class="ph"><img src="${REF}${f}.jpg" alt="${t}" loading="lazy"></div><span class="cap">${t}</span><button type="button" class="zoom" data-zoom="${REF}${f}.jpg" data-cap="${t}">Ampliar</button></label>`).join("")}
        <label class="dcard unk"><input type="radio" name="hum" data-c="dir.humanizada" data-m="0" value="Não fazem parte do contrato" ${d.humanizada==="Não fazem parte do contrato"?"checked":""}><div class="ph"><div><b>Não se aplica</b>As plantas humanizadas não fazem parte do contrato</div></div><span class="cap">Não se aplica</span></label>
      </div></section>
    <section class="sheet"><h2>Restrições e decoração</h2>
      <div class="grid">
        ${campo("dir.objecoes","Alguma objeção ao projeto de interiores?",{area:1,ph:"Ex.: não usar a cor X, evitar o estilo Y, sem tapetes"})}
        ${campo("dir.decoracao","Decoração e mobiliário desejados",{area:1,ph:"Peças, marcas, cores de destaque"})}
      </div></section>
    <section class="sheet"><h2>Referências</h2>
      ${campo("dir.refs","Links de referência",{area:1,ph:"Pinterest, Instagram, Drive, sites de outros empreendimentos"})}
      <div class="f"><span class="lbl">Imagens de referência, fotos das esquadrias ou do memorial</span>
        <div class="drop" id="drop" tabindex="0" role="button">Arraste imagens aqui ou clique para escolher. Elas entram no documento enviado.</div>
        <div class="refs" id="refs"></div></div></section>
    <section class="sheet"><h2>Informações gerais</h2>
      <div class="f"><label for="obsG">Particularidades do projeto, diferenciais a valorizar, necessidades específicas</label><textarea id="obsG" placeholder="Restrições da incorporadora, itens do memorial, datas, contatos">${esc(S.obs)}</textarea></div></section>
  </div>`;
  const m=$("#main");
  ligarCampos(m);
  m.querySelectorAll("[data-dec]").forEach(r=>r.onchange=()=>{ S.dir.decor[r.dataset.dec]=r.value; salvar(); });
  m.querySelectorAll("[data-sw]").forEach(r=>r.onchange=()=>{ setP(r.dataset.sw,r.value); salvar(); const o=r.closest(".swrow").querySelector("input.outro"); o.hidden=r.value!=="_outro"; if(!o.hidden) o.focus(); });
  m.querySelectorAll("[data-zoom]").forEach(b=>b.onclick=e=>{ e.preventDefault(); e.stopPropagation(); ampliar(b.dataset.zoom,b.dataset.cap); });
  $("#obsG").oninput=e=>{ S.obs=e.target.value; salvar(); };
  const drop=$("#drop"), fi=$("#refFile");
  drop.onclick=()=>fi.click(); drop.onkeydown=e=>{ if(e.key==="Enter"||e.key===" "){e.preventDefault();fi.click();} };
  drop.ondragover=e=>e.preventDefault(); drop.ondrop=e=>{ e.preventDefault(); addRefs(e.dataTransfer.files); };
  fi.onchange=()=>{ addRefs(fi.files); fi.value=""; };
  pintarRefs();
}
function addRefs(files){ [...files].filter(f=>f.type.startsWith("image/")).slice(0,12).forEach(f=>{ const r=new FileReader(); r.onload=()=>{ const im=new Image(); im.onload=()=>{ const k=Math.min(1,1400/Math.max(im.width,im.height)); const c=document.createElement("canvas"); c.width=im.width*k; c.height=im.height*k; c.getContext("2d").drawImage(im,0,0,c.width,c.height); S.dir.refImgs.push({n:f.name,d:c.toDataURL("image/jpeg",.82)}); salvar(); pintarRefs(); }; im.src=r.result; }; r.readAsDataURL(f); }); }
function pintarRefs(){ const el=$("#refs"); if(!el) return; el.innerHTML=S.dir.refImgs.map((r,i)=>`<figure><img src="${r.d}" alt="${esc(r.n)}"><button data-rm="${i}" aria-label="Remover referência">×</button></figure>`).join(""); el.querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{ S.dir.refImgs.splice(+b.dataset.rm,1); salvar(); pintarRefs(); }); }

/* ---------- Etapa 4: revisão e envio ---------- */
function pendencias(){
  const d=S.dados, r=S.dir, out=[];
  if(!d.responsavel.trim()) out.push(["Nome do responsável",0]);
  if(!d.empresa.trim()) out.push(["Construtora",0]);
  if(!/^\S+@\S+\.\S+$/.test(d.email)) out.push(["E-mail válido",0]);
  if(d.whats.replace(/\D/g,"").length<10) out.push(["WhatsApp com DDD",0]);
  if(!d.padrao) out.push(["Padrão do empreendimento",0]);
  if(!S.cenas.length) out.push(["Pelo menos uma câmera marcada",1]);
  const sem=S.cenas.filter(c=>!c.ambiente||c.ambiente==="Outro"); if(sem.length) out.push([`Ambiente das câmeras ${sem.map(numero).join(", ")}`,1]);
  const semU=S.cenas.filter(c=>planta(c.planta).tipo==="apto"&&!c.unidade); if(semU.length) out.push([`Unidade das câmeras ${semU.map(numero).join(", ")}`,1]);
  if(!r.fachadaRev) out.push(["Revestimento da fachada",2]);
  if(!r.guardaCorpo) out.push(["Guarda-corpo das sacadas",2]);
  if(!r.esqCor) out.push(["Cor das esquadrias",2]);
  return out;
}
function renderRevisao(){
  const n=totalImgs(), p=+S.dados.pacote||CFG.pacote, pend=pendencias();
  const porHora=HORAS.map(([k,t])=>[t,S.cenas.filter(c=>c.horas[k]).length]);
  const porFmt=FORMATOS.map(([v])=>[v,S.cenas.filter(c=>c.formato===v).reduce((a,c)=>a+imgsDe(c),0)]).filter(([,q])=>q);
  $("#main").innerHTML=`<div class="page">
    <div class="page-head"><span class="eyebrow">Etapa 4 de 4</span><h1>Revisão e envio</h1><p>Confira as imagens antes de enviar. Horário e formato ainda podem ser ajustados aqui. Depois do envio, mudanças de câmera entram como revisão do briefing.</p></div>
    <div class="sum">
      <div class="kpi"><small>Câmeras marcadas</small><b>${S.cenas.length}</b></div>
      <div class="kpi"><small>Imagens (câmeras × horários)</small><b>${n}</b></div>
      <div class="kpi"><small>Pacote contratado</small><b>${p}</b></div>
      <div class="kpi ${n>p?"warn":""}"><small>${n>p?"Aditivo necessário":"Saldo do pacote"}</small><b>${n>p?"+"+(n-p):p-n}</b></div>
    </div>
    ${n>p?`<div class="alert" style="margin-top:16px"><div><b>${n-p} ${n-p===1?"imagem excede":"imagens excedem"} o pacote de ${p}.</b> As excedentes serão orçadas pela UNK como aditivo contratual antes da produção. Você também pode desmarcar horários ou apagar câmeras.</div></div>`:""}
    <section class="sheet" style="margin-top:16px"><h2>O que falta preencher</h2>
      ${pend.length?`<ul class="checks">${pend.map(([t,st])=>`<li><span class="dot no">!</span><span>${esc(t)} · <a href="#" data-go="${st}">corrigir</a></span></li>`).join("")}</ul>`:`<ul class="checks"><li><span class="dot ok">✓</span>Tudo preenchido. O briefing está pronto para envio.</li></ul>`}
    </section>
    <section class="sheet"><h2>Lista geral das imagens</h2><p class="sub">${porHora.map(([t,q])=>`${q} ${t.toLowerCase()}`).join(" · ")}${porFmt.length?" · formatos: "+porFmt.map(([v,q])=>`${q}× ${v}`).join(", "):""}</p>
      <div class="tbl-wrap" id="revBody"><table class="rev"><thead><tr><th>#</th><th>Planta</th><th>Ambiente</th><th>Unidade</th><th>Horários</th><th>Formato</th><th>Imagens</th><th>Observação</th><th></th></tr></thead><tbody>
      ${S.cenas.map(c=>`<tr data-id="${c.id}"><td class="mono">${numero(c)}</td><td>${esc(planta(c.planta).nome)}</td><td class="${c.ambiente&&c.ambiente!=="Outro"?"":"missing"}">${esc(c.ambiente||"Definir")}</td><td>${esc(c.unidade||"—")}</td>
        <td><div class="hrs">${HORAS.map(([k,t])=>`<label class="hr"><input type="checkbox" data-h="${k}" ${c.horas[k]?"checked":""}><span>${t}</span></label>`).join("")}</div></td>
        <td class="fmt">${selFormato(c)}</td><td class="mono">${imgsDe(c)}</td><td>${esc(c.obs||"")}</td><td><button class="btn-s" data-a="dup">Duplicar</button></td></tr>`).join("")||`<tr><td colspan="9">Nenhuma câmera marcada.</td></tr>`}
      </tbody></table></div></section>
    <section class="sheet"><h2>Envio</h2>
      ${S.enviado?`<div class="sent"><b>Briefing enviado em ${esc(new Date(S.enviado).toLocaleString("pt-BR"))}.</b><span>A equipe UNK recebeu o PDF com as câmeras marcadas. Se mudar algo, envie de novo: a versão mais recente é a que vale.</span></div>`:""}
      <label class="consent" for="aceite"><input type="checkbox" id="aceite" ${S.aceite?"checked":""}><span>Declaro que revisei as câmeras, horários, formatos e a direção criativa deste briefing, e que imagens acima do pacote contratado dependem de aditivo com custo adicional.</span></label>
      <div class="send">
        <button class="btn pri big" id="sendBtn">${S.enviado?"Enviar versão revisada":"Enviar briefing para a UNK"}</button>
        <button class="btn out" id="pdfBtn">Baixar cópia em PDF</button>
        <a class="btn out" id="waBtn" target="_blank" rel="noopener">Avisar pelo WhatsApp</a>
      </div>
      <p class="status" id="st"></p>
    </section></div>`;
  $("#aceite").onchange=e=>{ S.aceite=e.target.checked; salvar(); atualizarEnvio(); };
  document.querySelectorAll("[data-go]").forEach(a=>a.onclick=e=>{ e.preventDefault(); irPara(+a.dataset.go); });
  $("#pdfBtn").onclick=baixarPdf;
  $("#sendBtn").onclick=enviar;
  atualizarEnvio();
}
function atualizarEnvio(){ const ok=S.aceite && !pendencias().length;
  ["sendBtn","pdfBtn"].forEach(i=>{ const b=$("#"+i); if(b) b.disabled=!ok; });
  const wa=$("#waBtn"); if(wa){ wa.href= ok? "https://wa.me/?text="+encodeURIComponent(resumoTxt()) : "#"; wa.style.pointerEvents=ok?"":"none"; wa.style.opacity=ok?"":".45"; wa.setAttribute("aria-disabled",!ok); }
  if(!ok) status(!S.aceite&&!pendencias().length?"Marque a declaração para liberar o envio.":"Complete os itens pendentes para liberar o envio.");
  else status(`O briefing vai direto para ${CFG.destino}, com o PDF das câmeras marcadas nas plantas.`);
}
function status(t,cls){ const s=$("#st"); if(s){ s.innerHTML=t; s.className="status "+(cls||""); } }
function aviso(t){ const h=$("#hint"); if(h){ h.textContent=t; setTimeout(dica,3500);} }
function resumoTxt(){
  const d=S.dados, n=totalImgs(), p=+d.pacote||CFG.pacote;
  let t=`*Briefing de imagens 3D · ${CFG.empreendimento}*\n${d.empresa}\nResponsável: ${d.responsavel}${d.cargo?" ("+d.cargo+")":""}\n${d.email} · ${d.whats}\n\n*${n} imagens* (pacote de ${p}${n>p?`, ${n-p} em aditivo`:""})\n`;
  S.cenas.forEach(c=>{ t+=`${numero(c)}. ${c.ambiente||"?"}${c.unidade?" · "+c.unidade:""} · ${planta(c.planta).nome} · ${horasTxt(c)} · ${c.formato}${c.obs?" · "+c.obs:""}\n`; });
  t+=`\nBriefing enviado pelo site para a UNK${S.enviado?" em "+new Date(S.enviado).toLocaleString("pt-BR"):""}.`;
  return t;
}
function dadosJson(){ return { empreendimento:CFG.empreendimento, slug:CFG.slug, enviadoEm:new Date().toISOString(), dados:S.dados, direcao:Object.assign({},S.dir,{refImgs:S.dir.refImgs.map(r=>r.n)}), observacoes:S.obs,
  imagens:S.cenas.map(c=>({n:numero(c),planta:planta(c.planta).nome,prancha:planta(c.planta).prancha,ambiente:c.ambiente,unidade:c.unidade,horarios:horasTxt(c),formato:c.formato,imagens:imgsDe(c),obs:c.obs,seta:[c.x1,c.y1,c.x2,c.y2].map(v=>+v.toFixed(4))})) }; }

/* ---------- PDF ---------- */
function plantaComSetas(p){
  const im=IMG[p.id]; const W=im.naturalWidth, H=im.naturalHeight; const c=document.createElement("canvas"); c.width=W; c.height=H; const g=c.getContext("2d");
  g.fillStyle="#fff"; g.fillRect(0,0,W,H); g.drawImage(im,0,0);
  const raio=Math.max(16,W/95), lw=Math.max(4,W/420);
  S.cenas.filter(x=>x.planta===p.id).forEach(x=>setaNo(g,{x:x.x1*W,y:x.y1*H},{x:x.x2*W,y:x.y2*H},numero(x),{cor:"#e0482c",raio,lw}));
  return c.toDataURL("image/jpeg",.84);
}
function carregar(src,max=700){ return new Promise(res=>{ const i=new Image(); i.onload=()=>{ const k=Math.min(1,max/Math.max(i.width,i.height)); const c=document.createElement("canvas"); c.width=Math.round(i.width*k); c.height=Math.round(i.height*k); c.getContext("2d").drawImage(i,0,0,c.width,c.height); res({d:c.toDataURL("image/jpeg",.84),w:c.width,h:c.height}); }; i.onerror=()=>res(null); i.src=src; }); }
async function logoBranco(){ const l=await carregar(LOGO,200); if(!l) return null; return new Promise(res=>{ const i=new Image(); i.onload=()=>{ const c=document.createElement("canvas"); c.width=i.width; c.height=i.height; const g=c.getContext("2d"); g.drawImage(i,0,0); g.globalCompositeOperation="source-in"; g.fillStyle="#fff"; g.fillRect(0,0,c.width,c.height); res(c.toDataURL("image/png")); }; i.src=LOGO; }); }
function nomeArquivo(){ return `briefing-3d-${CFG.slug}-${(S.dados.empresa||"cliente").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^\w]+/g,"-").replace(/^-|-$/g,"").slice(0,40)}.pdf`; }
async function montarPdf(){
  if(!window.jspdf) throw new Error("O gerador de PDF não carregou. Verifique a internet e recarregue a página.");
  const {jsPDF}=window.jspdf; const doc=new jsPDF({orientation:"landscape",unit:"mm",format:"a4",compress:true});
  const W=297,H=210,M=14; const d=S.dados, r=S.dir, n=totalImgs(), p=+d.pacote||CFG.pacote;
  const ink=[20,33,43], mut=[110,124,134], acc=[14,110,115], cam=[224,72,44];
  let pg=1;
  const rodape=()=>{ doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...mut); doc.text(`${CFG.empreendimento} · Briefing de imagens 3D · ${new Date().toLocaleDateString("pt-BR")}`,M,H-7); doc.text(String(pg),W-M,H-7,{align:"right"}); };
  const novaPag=tit=>{ doc.addPage(); pg++; doc.setTextColor(...ink); doc.setFont("helvetica","bold"); doc.setFontSize(16); doc.text(tit,M,M+6); rodape(); return M+16; };
  // capa
  doc.setFillColor(...ink); doc.rect(0,0,W,H,"F");
  const lg=await logoBranco(); if(lg) doc.addImage(lg,"PNG",M,M,14,14);
  doc.setTextColor(255,255,255); doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.text("BRIEFING DE IMAGENS 3D",M,44);
  doc.setFontSize(34); doc.text(CFG.empreendimento,M,60);
  doc.setFont("helvetica","normal"); doc.setFontSize(12); doc.setTextColor(190,205,212); doc.text(d.endereco||CFG.endereco||"",M,70);
  const linhas=[["Construtora",d.empresa],["Responsável",d.responsavel+(d.cargo?" · "+d.cargo:"")],["Contato",d.email+" · "+d.whats],["Contrato",d.contrato||"—"],["Lançamento",d.prazo?new Date(d.prazo+"T12:00").toLocaleDateString("pt-BR"):"—"],["Padrão · valor médio",[d.padrao,d.valor].filter(Boolean).join(" · ")||"—"],["Público",d.publico||"—"],["Concorrentes",d.concorrentes||"—"],["Uso das imagens",d.uso.join(", ")||"—"]];
  let y=88; linhas.forEach(([k,v])=>{ doc.setFontSize(9); doc.setTextColor(140,160,170); doc.text(k.toUpperCase(),M,y); doc.setFontSize(11); doc.setTextColor(255,255,255); doc.text(doc.splitTextToSize(String(v),150)[0],M+48,y); y+=9.5; });
  doc.setFillColor(...acc); doc.roundedRect(W-M-80,88,80,48,3,3,"F"); doc.setTextColor(255,255,255); doc.setFontSize(10); doc.text("IMAGENS SOLICITADAS",W-M-74,98); doc.setFont("helvetica","bold"); doc.setFontSize(36); doc.text(String(n),W-M-74,118); doc.setFont("helvetica","normal"); doc.setFontSize(10); doc.text(`pacote de ${p}${n>p?` · ${n-p} em aditivo`:""}`,W-M-74,129);
  doc.setFontSize(8); doc.setTextColor(150,165,175); doc.text(`${S.cenas.length} câmeras · ${HORAS.map(([k,t])=>S.cenas.filter(c=>c.horas[k]).length+" "+t.toLowerCase()).join(" · ")}`,W-M-80,142);
  // lista de imagens
  y=novaPag("Lista geral das imagens");
  const cols=[[M,"#"],[M+9,"Planta"],[M+62,"Ambiente"],[M+118,"Unidade"],[M+144,"Horários"],[M+190,"Formato"],[M+212,"Img."],[M+224,"Observação"]];
  const cab=()=>{ doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...mut); cols.forEach(([x,t])=>doc.text(t.toUpperCase(),x,y)); y+=3; doc.setDrawColor(210,216,220); doc.line(M,y,W-M,y); y+=5; };
  cab();
  S.cenas.forEach(c=>{ const obs=doc.splitTextToSize(c.obs||"",45); const hh=Math.max(7,obs.length*4+3);
    if(y+hh>H-14){ y=novaPag("Lista geral das imagens (continuação)"); cab(); }
    doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(...cam); doc.text(String(numero(c)),M,y);
    doc.setFont("helvetica","normal"); doc.setTextColor(...ink);
    doc.text(doc.splitTextToSize(planta(c.planta).nome,51)[0],M+9,y); doc.text(doc.splitTextToSize(c.ambiente||"—",54)[0],M+62,y); doc.text(c.unidade||"—",M+118,y); doc.text(horasTxt(c),M+144,y); doc.text(c.formato,M+190,y); doc.text(String(imgsDe(c)),M+212,y); doc.text(obs,M+224,y);
    y+=hh; doc.setDrawColor(232,236,238); doc.line(M,y-4,W-M,y-4); });
  // plantas
  for(const pl of PLANTAS){ const cs=S.cenas.filter(c=>c.planta===pl.id); if(!cs.length) continue;
    y=novaPag(`${pl.grupo} · ${pl.nome}`); doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...mut); doc.text(pl.prancha,W-M,M+6,{align:"right"});
    const im=IMG[pl.id]; const legW=72; const maxW=W-M*2-legW-6, maxH=H-y-14; const k=Math.min(maxW/im.naturalWidth,maxH/im.naturalHeight);
    doc.addImage(plantaComSetas(pl),"JPEG",M,y,im.naturalWidth*k,im.naturalHeight*k);
    let ly=y+2; const lx=W-M-legW;
    cs.forEach(c=>{ if(ly>H-18) return; doc.setFillColor(...cam); doc.circle(lx+3,ly-1.2,3,"F"); doc.setTextColor(255,255,255); doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.text(String(numero(c)),lx+3,ly-.2,{align:"center"});
      doc.setTextColor(...ink); doc.setFontSize(9); const t=doc.splitTextToSize((c.ambiente||"—")+(c.unidade?" · "+c.unidade:""),legW-9); doc.text(t,lx+9,ly);
      doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...mut); doc.text(`${horasTxt(c)} · ${c.formato}`,lx+9,ly+t.length*4); ly+=t.length*4+8; }); }
  // padrão de decoração com as referências escolhidas
  const escolhidos=(CFG.decor||Object.keys(DECOR)).filter(k=>r.decor[k]);
  if(escolhidos.length){ y=novaPag("Padrão de decoração"); let x=M; const bw=84, bh=56;
    for(const k of escolhidos){ const v=r.decor[k];
      if(x+bw>W-M){ x=M; y+=bh+16; } if(y+bh+10>H-12){ y=novaPag("Padrão de decoração (continuação)"); x=M; }
      doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(...ink); doc.text(`${DECOR[k][0]} · ${padraoTxt(v)}`,x,y);
      if(v!=="unk"){ const im=await carregar(`${REF}${k}_${v}.jpg`,700); if(im){ const s=Math.min(bw/im.w,bh/im.h); doc.addImage(im.d,"JPEG",x,y+2,im.w*s,im.h*s); } }
      else { doc.setDrawColor(210,216,220); doc.rect(x,y+2,bw,bh); doc.setFont("helvetica","normal"); doc.setTextColor(...mut); doc.text("A equipe UNK propõe o padrão",x+6,y+30); }
      x+=bw+8; } }
  // direção criativa
  y=novaPag("Direção criativa");
  const mat=(v,o)=>v==="_outro"?(o||"Outro"):v==="_unk"?"UNK decide":([...MATERIAIS,...MDF].find(([i])=>i===v)||[,""])[1]+( ([...MATERIAIS,...MDF].find(([i])=>i===v)||[,,""])[2]?` (${([...MATERIAIS,...MDF].find(([i])=>i===v))[2]})`:"");
  const itens=[["Estilo",r.estilo==="Outro"?r.estiloOutro:r.estilo],["Atmosfera",r.atmosfera.join(", ")],
    ...PISOS.map(([k,t])=>["Piso · "+t, r.pisos[k]?mat(r.pisos[k],r.pisosOutro[k]):""]),["Marcenaria (MDF)",r.mdf?mat(r.mdf,r.mdfOutro):""],["Bancadas e metais",r.bancadas],
    ["Fachada",r.fachadaRev==="Outro"?r.fachadaRevOutro:r.fachadaRev],["Friso por pavimento",r.friso],["Forro da sacada",r.forroSacada],["Guarda-corpo",r.guardaCorpo],["Esquadrias",[r.esqCor,r.esqMat].filter(Boolean).join(" · ")],
    ["Pessoas",r.pessoas],["Veículos",r.veiculos],["Vegetação",r.vegetacao],["Céu",r.ceu],["Plantas humanizadas",r.humanizada],
    ["Objeções de interiores",r.objecoes],["Decoração",r.decoracao],["Conceito e diferenciais",d.conceito],["Links de referência",r.refs],["Informações gerais",S.obs]];
  itens.forEach(([k,v])=>{ const t=doc.splitTextToSize(String(v||"Não informado · UNK decide"),200); if(y+t.length*4.6>H-12) y=novaPag("Direção criativa (continuação)");
    doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(...mut); doc.text(k.toUpperCase(),M,y); doc.setFont("helvetica","normal"); doc.setFontSize(10); doc.setTextColor(...ink); doc.text(t,M+60,y); y+=Math.max(6.2,t.length*4.6+1.6); });
  if(r.refImgs.length){ y=novaPag("Imagens de referência do cliente"); let x=M; const bw=85, bh=56;
    for(const ri of r.refImgs){ if(x+bw>W-M){ x=M; y+=bh+6; } if(y+bh>H-14){ y=novaPag("Imagens de referência (continuação)"); x=M; }
      const im=await carregar(ri.d,900); if(im){ const s=Math.min(bw/im.w,bh/im.h); doc.addImage(im.d,"JPEG",x,y,im.w*s,im.h*s); } x+=bw+6; } }
  // termo
  y=novaPag("Termo de aprovação do briefing");
  doc.setFont("helvetica","normal"); doc.setFontSize(11); doc.setTextColor(...ink);
  doc.text(doc.splitTextToSize(`${d.responsavel}, representando ${d.empresa}, declara que revisou as ${S.cenas.length} câmeras, os horários, os formatos e a direção criativa deste briefing para o empreendimento ${CFG.empreendimento}, totalizando ${n} imagens. O pacote contratado é de ${p} imagens${n>p?`; as ${n-p} imagens excedentes dependem de aditivo contratual com custo adicional, a ser aprovado antes da produção`:""}. Alterações de câmera após o início da produção serão tratadas como revisão.`,W-M*2),M,y);
  doc.setFontSize(9); doc.setTextColor(...mut); doc.text(`Aceite eletrônico: ${d.responsavel} · ${d.email} · ${new Date().toLocaleString("pt-BR")}`,M,y+40);
  return doc;
}
function baixar(blob,nome){ const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=nome; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },4000); }
async function baixarPdf(){ const b=$("#pdfBtn"); b.disabled=true; status('<span class="spin"></span>Montando o PDF…');
  try{ const doc=await montarPdf(); baixar(doc.output("blob"),nomeArquivo()); status("PDF baixado.","ok"); }
  catch(e){ status(esc(e.message||"Não foi possível gerar o PDF."),"err"); } b.disabled=false; }
function paraBase64(blob){ return new Promise(res=>{ const r=new FileReader(); r.onload=()=>res(String(r.result).split(",")[1]); r.readAsDataURL(blob); }); }
async function enviar(){
  const b=$("#sendBtn"); b.disabled=true; $("#pdfBtn").disabled=true;
  let doc; try{ status('<span class="spin"></span>Montando o PDF com as câmeras…'); doc=await montarPdf(); }
  catch(e){ status(esc(e.message||"Não foi possível gerar o PDF."),"err"); atualizarEnvio(); return; }
  const blob=doc.output("blob"), nome=nomeArquivo();
  if(!CFG.endpoint){ baixar(blob,nome); status(`O envio automático ainda não está ativo. O PDF foi baixado: envie para <b>${esc(CFG.destino)}</b>.`,"err"); atualizarEnvio(); return; }
  status('<span class="spin"></span>Enviando para a UNK…');
  const d=S.dados;
  const payload={token:CFG.token,empreendimento:CFG.empreendimento,slug:CFG.slug,empresa:d.empresa,responsavel:d.responsavel,email:d.email,whats:d.whats,imagens:totalImgs(),pacote:+d.pacote||CFG.pacote,fileName:nome,pdfBase64:await paraBase64(blob),resumo:resumoTxt(),briefing:dadosJson()};
  try{
    const r=await fetch(CFG.endpoint,{method:"POST",body:JSON.stringify(payload)});
    const j=await r.json();
    if(!j.ok) throw new Error(j.error||"O servidor recusou o envio.");
    S.enviado=new Date().toISOString(); salvar(); renderRevisao();
    status(`Briefing enviado para ${esc(CFG.destino)}. Você pode baixar uma cópia do PDF ou avisar pelo WhatsApp.`,"ok");
  }catch(e){
    baixar(blob,nome);
    status(`Não foi possível enviar automaticamente (${esc(e.message||"sem conexão")}). O PDF foi baixado: envie para <b>${esc(CFG.destino)}</b> ou tente de novo.`,"err");
    atualizarEnvio();
  }
}

function confirmar(msg,ok){ const m=$("#modal"), b=$("#modalBody"); m.hidden=false; b.innerHTML=`<p style="margin:0;font-size:16px">${esc(msg)}</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn out" id="cNo">Cancelar</button><button class="btn pri" id="cYes" style="background:var(--cam);color:#fff">Apagar</button></div>`; $("#cNo").onclick=()=>m.hidden=true; $("#cYes").onclick=()=>{ m.hidden=true; ok(); }; }
$("#modal").addEventListener("click",e=>{ if(e.target.id==="modal") e.target.hidden=true; });

render();
