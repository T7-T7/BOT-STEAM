export default {
  name: 'شطرنج',
  aliases: ['شطرنج', 'chess', 'الشطرنج'],
  category: 'ألعاب',
  requiredRole: 'user',

  async execute(ctx) {
    const { message, sock } = ctx;
    if (!message?.chatId || !sock) return false;

    await message.react?.('♟️');

    const chessHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>CHESS ULTRA</title>
<style>
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;user-select:none;}
*:focus{outline:none!important;}
html,body{margin:0;padding:0;width:100%;min-height:100%;}
body{display:flex;align-items:flex-start;justify-content:center;
  background:transparent!important;color:#f0e6d2;
  font-family:'Courier New',monospace;
  touch-action:manipulation;overflow:hidden;}

/* ====== ثيم: Royal Walnut — خشب كلاسيكي + زمرد/ذهب ====== */
:root{
  --p1:#10B981;          /* زمرد - أنت */
  --p2:#F59E0B;          /* ذهبي - CPU */
  --g1:rgba(16,185,129,.55);
  --g2:rgba(245,158,11,.55);
  --p3:#DC2626;          /* أحمر للكش */
  --bg-deep:#1a1310;
  --bg-mid:#241a15;
  --sq-light:#d4a878;    /* خشب عسلي */
  --sq-dark:#6b4423;     /* خشب جوز */
  --text:#f0e6d2;
  --muted:#a08668;
  --border:rgba(16,185,129,.20);
}

.box{
  width:100%;max-width:none;min-height:100vh;
  padding:10px;
  background:transparent!important;
  border:none!important;border-radius:0!important;
  box-shadow:none!important;
}

.top{
  display:flex;justify-content:space-between;align-items:center;
  gap:8px;
  padding:0 4px 12px;
  border-bottom:1px solid rgba(16,185,129,.10);
}

.clock-bar{
  display:flex;align-items:center;gap:6px;
  flex:1;justify-content:center;
}
.clock{
  display:flex;flex-direction:column;align-items:center;
  gap:2px;padding:6px 12px;border-radius:14px;
  background:rgba(107,68,35,.25);
  border:1px solid rgba(212,168,120,.18);
  min-width:74px;
  transition:.25s;
}
.clock.active{
  background:rgba(16,185,129,.12);
  border-color:var(--p1);
  box-shadow:0 0 18px rgba(16,185,129,.35);
}
.clock.warn{
  border-color:#F59E0B;
  box-shadow:0 0 18px rgba(245,158,11,.40);
}
.clock.crit{
  border-color:var(--p3);
  box-shadow:0 0 22px rgba(220,38,38,.55);
  animation:crt .8s infinite;
}
@keyframes crt{
  0%,100%{box-shadow:0 0 22px rgba(220,38,38,.55);}
  50%{box-shadow:0 0 34px rgba(220,38,38,.85);}
}
.clock .lbl{
  font-size:8px;letter-spacing:2px;color:var(--muted);
  text-transform:uppercase;
}
.clock .tm{
  font-size:18px;font-weight:900;letter-spacing:1px;
  font-family:'Courier New',monospace;
  font-variant-numeric:tabular-nums;
  color:var(--text);
  transition:color .25s;
}
.clock.active .tm{color:var(--p1);text-shadow:0 0 12px var(--g1);}
.clock.warn .tm{color:#F59E0B;text-shadow:0 0 12px rgba(245,158,11,.6);}
.clock.crit .tm{color:var(--p3);text-shadow:0 0 14px rgba(220,38,38,.8);}

.clock-sep{
  color:var(--muted);font-size:14px;font-weight:700;
  opacity:.5;
}

.b{
  font-size:10px;border:1px solid rgba(212,168,120,.25);
  background:rgba(107,68,35,.30);color:var(--muted);
  padding:8px 14px;border-radius:20px;cursor:pointer;
  display:inline-flex;align-items:center;gap:6px;
  transition:.15s;
}
.b:hover{color:var(--text);background:rgba(107,68,35,.50);}
.b:active{transform:scale(.94);}

/* ====== Board: خشب كلاسيكي ====== */
.wrap{
  position:relative;
  width:min(420px,94vw);
  height:min(420px,94vw);
  margin:14px auto;
}

.board{
  position:absolute;inset:0;
  display:grid;
  grid-template-columns:repeat(8,1fr);
  grid-template-rows:repeat(8,1fr);
  border-radius:14px;
  overflow:hidden;
  border:4px solid #4a2e15;
  box-shadow:
    0 0 0 1px rgba(245,158,11,.25),
    0 10px 40px -10px rgba(0,0,0,.85),
    0 0 60px -20px rgba(16,185,129,.35),
    inset 0 2px 4px rgba(255,255,255,.10);
  background:var(--sq-dark);
  z-index:1;
}

.cell{
  position:relative;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;
  transition:background .12s;
  overflow:hidden;
}

/* خشب مع تدرج دقيق */
.cell.light{
  background:
    radial-gradient(circle at 30% 30%, rgba(255,255,255,.08), transparent 60%),
    linear-gradient(135deg, #dcb283 0%, #c99b6b 100%);
}
.cell.dark{
  background:
    radial-gradient(circle at 30% 30%, rgba(255,255,255,.05), transparent 60%),
    linear-gradient(135deg, #7a4f2a 0%, #5d3919 100%);
}

.cell.last{
  box-shadow:
    inset 0 0 0 3px rgba(245,158,11,.75),
    inset 0 0 24px rgba(245,158,11,.45)!important;
}
.cell.sel{
  box-shadow:
    inset 0 0 0 3px var(--p1),
    inset 0 0 26px rgba(16,185,129,.55)!important;
}
.cell.chk{
  background:rgba(220,38,38,.55)!important;
  box-shadow:
    inset 0 0 0 3px var(--p3),
    inset 0 0 30px rgba(220,38,38,.85)!important;
  animation:chk .9s infinite;
}
@keyframes chk{
  0%,100%{box-shadow:inset 0 0 0 3px var(--p3),inset 0 0 26px rgba(220,38,38,.7)!important;}
  50%{box-shadow:inset 0 0 0 3px var(--p3),inset 0 0 42px rgba(220,38,38,1)!important;}
}

.cell .dot{
  position:absolute;width:24%;height:24%;border-radius:50%;
  background:rgba(16,185,129,.75);
  box-shadow:0 0 14px rgba(16,185,129,.9),0 0 4px rgba(0,0,0,.5);
  pointer-events:none;
}
.cell .ring{
  position:absolute;inset:7%;border-radius:50%;
  border:3px solid rgba(245,158,11,.85);
  box-shadow:
    0 0 16px rgba(245,158,11,.75),
    inset 0 0 12px rgba(245,158,11,.45),
    0 0 4px rgba(0,0,0,.5);
  pointer-events:none;
}

/* ====== Pieces: زمرد vs ذهبي ====== */
.piece{
  position:relative;z-index:2;
  font-family:'Segoe UI Symbol','Noto Sans Symbols 2','DejaVu Sans',serif;
  font-size:clamp(24px,6.6vw,40px);
  line-height:1;font-weight:normal;
  transform:translateZ(0);
  transition:transform .15s;
  pointer-events:none;
}
.piece.w{
  color:#0d9469;
  text-shadow:
    0 0 6px rgba(16,185,129,1),
    0 0 18px rgba(16,185,129,.7),
    0 2px 0 rgba(0,0,0,.5),
    0 -1px 0 rgba(255,255,255,.35);
  filter:drop-shadow(0 1px 1px rgba(0,0,0,.6));
}
.piece.b{
  color:#c97c00;
  text-shadow:
    0 0 6px rgba(245,158,11,1),
    0 0 18px rgba(245,158,11,.7),
    0 2px 0 rgba(0,0,0,.5),
    0 -1px 0 rgba(255,255,255,.35);
  filter:drop-shadow(0 1px 1px rgba(0,0,0,.6));
}
.cell.sel .piece{transform:scale(1.12);}

/* ====== Overlays ====== */
.overlay{
  position:absolute;inset:0;
  background:rgba(26,19,16,.95);
  backdrop-filter:blur(16px);
  -webkit-backdrop-filter:blur(16px);
  border-radius:14px;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  gap:14px;z-index:10;padding:22px;text-align:center;
  border:1px solid rgba(212,168,120,.22);
}
.hide{display:none!important;}

.chip{
  padding:9px 18px;border-radius:20px;
  border:1px solid rgba(212,168,120,.28);
  background:rgba(107,68,35,.30);
  color:#c9b294;cursor:pointer;font-size:10px;
  display:inline-flex;align-items:center;gap:6px;
  transition:.15s;
}
.chip.on{
  background:var(--p1);color:#0a0f0a;
  border-color:var(--p1);
  box-shadow:0 0 20px rgba(16,185,129,.45);
  font-weight:700;
}
.chip.dngr{
  color:#ff8a8a;
  border-color:rgba(220,38,38,.4);
}
.chip:disabled{
  opacity:.30;cursor:not-allowed;
  color:#5a4a35;border-color:rgba(212,168,120,.08);
}
.chip:disabled:hover{transform:none;}

.btn{
  padding:13px 34px;
  background:linear-gradient(180deg,#10B981,#059669);
  color:#0a0f0a;border:none;border-radius:12px;
  cursor:pointer;font-weight:900;letter-spacing:2px;
  box-shadow:0 0 28px rgba(16,185,129,.50);
  transition:transform .1s;
}
.btn:active{transform:scale(.96);}

.shake{animation:shake .28s ease;}
@keyframes shake{
  0%,100%{transform:translate(0,0);}
  25%{transform:translate(-4px,2px);}
  50%{transform:translate(4px,-2px);}
}

.turn{
  font-size:9px;letter-spacing:2px;color:var(--muted);
  display:flex;align-items:center;gap:6px;justify-content:center;
}
.dotpulse{
  width:7px;height:7px;border-radius:50%;
  background:var(--p1);
  box-shadow:0 0 10px var(--p1);
  animation:pulse 1.2s infinite;
}
@keyframes pulse{
  0%,100%{opacity:1;}
  50%{opacity:.4;}
}

.p{
  position:absolute;
  width:8px;height:8px;border-radius:50%;
  pointer-events:none;z-index:3;
}

.promoPanel{
  display:flex;gap:8px;
  padding:10px;border-radius:16px;
  background:rgba(36,26,21,.95);
  border:1px solid var(--p1);
  box-shadow:0 0 40px -10px rgba(16,185,129,.6);
}
.promoOpt{
  width:56px;height:56px;
  display:flex;align-items:center;justify-content:center;
  border-radius:12px;
  background:rgba(107,68,35,.35);
  border:1px solid rgba(212,168,120,.25);
  cursor:pointer;
  font-size:34px;
  font-family:'Segoe UI Symbol','Noto Sans Symbols 2',serif;
  transition:.15s;
}
.promoOpt:hover{background:rgba(16,185,129,.20);border-color:var(--p1);}
.promoOpt.w{color:#10B981;text-shadow:0 0 10px var(--g1);}
.promoOpt.b{color:#F59E0B;text-shadow:0 0 10px var(--g2);}

.think{display:inline-flex;gap:3px;margin-inline-start:4px;}
.think i{
  width:4px;height:4px;border-radius:50%;
  background:var(--p2);
  animation:tb .9s infinite ease-in-out;
}
.think i:nth-child(2){animation-delay:.15s;}
.think i:nth-child(3){animation-delay:.3s;}
@keyframes tb{0%,80%,100%{opacity:.3;transform:translateY(0);}40%{opacity:1;transform:translateY(-3px);}}

.bottom{
  text-align:center;
  margin-top:6px;
  display:flex;
  gap:8px;
  justify-content:center;
  align-items:center;
  flex-wrap:wrap;
}

.caps{
  display:flex;
  justify-content:center;
  gap:12px;
  font-size:15px;
  font-family:'Segoe UI Symbol','Noto Sans Symbols 2',serif;
  letter-spacing:1px;
  min-height:18px;
  margin-top:6px;
  padding:0 6px;
}
.caps .cw{color:#10B981;text-shadow:0 0 8px rgba(16,185,129,.6);}
.caps .cb{color:#F59E0B;text-shadow:0 0 8px var(--g2);}
.caps .adv{
  font-family:'Courier New',monospace;
  font-size:10px;color:var(--muted);
  display:flex;align-items:center;
}

@media(max-width:520px){
  .box{padding:8px;}
  .top{padding-left:2px;padding-right:2px;}
  .wrap{width:min(430px,96vw);height:min(430px,96vw);}
  .piece{font-size:clamp(22px,7vw,34px);}
  .clock{padding:5px 9px;min-width:64px;}
  .clock .tm{font-size:15px;}
  .clock .lbl{font-size:7px;letter-spacing:1.5px;}
}
</style>
</head>

<body>
<div class="box">

  <div class="top">
    <div class="clock-bar">
      <div class="clock" id="clockB">
        <span class="lbl">CPU</span>
        <span class="tm" id="timeB">10:00</span>
      </div>
      <span class="clock-sep">:</span>
      <div class="clock active" id="clockW">
        <span class="lbl">أنت</span>
        <span class="tm" id="timeW">10:00</span>
      </div>
    </div>
    <button class="b" onclick="goMenu()" type="button">خروج</button>
  </div>

  <div class="wrap" id="wrap">
    <div class="board" id="board"></div>

    <div class="overlay" id="menu">
      <h2 style="margin:0;letter-spacing:4px">
        CHESS <span style="color:var(--p1);text-shadow:0 0 18px var(--g1)">ULTRA</span>
      </h2>

      <div class="turn">
        <span class="dotpulse"></span>
        شطرنج • أنت ضد CPU
      </div>

      <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">
        <button class="chip" onclick="setD('easy',this)" type="button">سهل</button>
        <button class="chip on" onclick="setD('normal',this)" type="button">عادي</button>
        <button class="chip" onclick="setD('hard',this)" type="button">صعب</button>
      </div>

      <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">
        <button class="chip on" onclick="setSide('w',this)" type="button">أبيض</button>
        <button class="chip" onclick="setSide('b',this)" type="button">أسود</button>
      </div>

      <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">
        <button class="chip" onclick="setTime(3,0,this)" type="button">3+0</button>
        <button class="chip on" onclick="setTime(10,0,this)" type="button">10+0</button>
        <button class="chip" onclick="setTime(5,3,this)" type="button">5+3</button>
        <button class="chip" onclick="setTime(15,10,this)" type="button">15+10</button>
      </div>

      <button class="btn" onclick="startG()" type="button">ابدأ ▶</button>

      <small style="color:#5a4a35;max-width:300px;line-height:1.6">
        كل قواعد الشطرنج<br>تبييت • en passant • ترقية • كش مات • 50 حركة • تكرار ثلاثي
        <br><br>
        <span style="color:var(--muted)">تراجع ×3 • تلميح ×2 فقط لكل مباراة</span>
      </small>
    </div>

    <div class="overlay hide" id="promo">
      <div class="turn">ترقية البيدق إلى</div>
      <div class="promoPanel" id="promoPanel"></div>
    </div>

    <div class="overlay hide" id="end">
      <div id="rText" style="letter-spacing:2px;font-size:11px">انتهت</div>
      <h1 id="rTitle" style="margin:0;letter-spacing:3px">DRAW</h1>
      <div style="display:flex;gap:10px">
        <button class="b" onclick="goMenu()" type="button">القائمة</button>
        <button class="btn" onclick="restartG()" type="button">إعادة</button>
      </div>
    </div>
  </div>

  <div class="caps" id="caps">
    <span class="cw" id="capsW"></span>
    <span class="adv" id="adv"></span>
    <span class="cb" id="capsB"></span>
  </div>

  <div class="bottom">
    <button class="chip" onclick="doHint()" type="button" id="hintBtn">
      💡 تلميح <b id="hintCount">(2)</b>
    </button>

    <button class="chip" onclick="undoMove()" type="button" id="undoBtn">
      ↶ تراجع <b id="undoCount">(3)</b>
    </button>

    <button class="chip dngr" onclick="resign()" type="button" id="resignBtn">
      ⚑ استسلام
    </button>

    <div class="turn" id="turnInfo">
      <span class="dotpulse"></span>
      اضغط ابدأ
    </div>
  </div>

</div>

<script>
var UNI = {
  'K':'\u265A','Q':'\u265B','R':'\u265C','B':'\u265D','N':'\u265E','P':'\u265F',
  'k':'\u265A','q':'\u265B','r':'\u265C','b':'\u265D','n':'\u265E','p':'\u265F'
};

var VAL = { p:100, n:320, b:330, r:500, q:900, k:20000 };

var PST = {
  p:[
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0
  ],
  n:[
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50
  ],
  b:[
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20
  ],
  r:[
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0
  ],
  q:[
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
  ],
  k:[
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20
  ]
};

var board, turn, castling, ep, halfmove, fullmove;
var moveHist, stateStack, posCounts;
var selected, legalSel, lastMove;
var running, aiBusy, pendingPromo;
var diff='normal', humanSide='w', flipped=false;
var capByW, capByB;

var undoLeft=3;
var hintLeft=2;

var baseTime=600;
var increment=0;
var timeW=600, timeB=600;
var timerId=null;

function startBoard(){
  return [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R']
  ];
}

function init(){
  board=startBoard(); turn='w';
  castling={K:true,Q:true,k:true,q:true};
  ep=null; halfmove=0; fullmove=1;
  moveHist=[]; stateStack=[]; posCounts={};
  selected=null; legalSel=[]; lastMove=null;
  running=false; aiBusy=false; pendingPromo=null;
  capByW=[]; capByB=[];
  undoLeft=3;
  hintLeft=2;
  timeW=baseTime; timeB=baseTime;
  stopTimer();
  updateClockUI();
  posCounts[keyOf(curState())]=1;
}

function refreshToolButtons(){
  var ub=document.getElementById('undoBtn');
  var hb=document.getElementById('hintBtn');
  document.getElementById('undoCount').textContent='('+undoLeft+')';
  document.getElementById('hintCount').textContent='('+hintLeft+')';
  ub.disabled = undoLeft<=0;
  hb.disabled = hintLeft<=0;
}

function cloneB(b){var n=[];for(var i=0;i<8;i++)n.push(b[i].slice());return n;}
function inB(r,c){return r>=0&&r<8&&c>=0&&c<8;}
function isW(p){return p&&p===p.toUpperCase();}
function colOf(p){return p?(isW(p)?'w':'b'):null;}
function other(c){return c==='w'?'b':'w';}
function findKing(b,col){
  var k=col==='w'?'K':'k';
  for(var r=0;r<8;r++)for(var c=0;c<8;c++)if(b[r][c]===k)return [r,c];
  return null;
}

function attacked(b,r,c,by){
  var pd=by==='w'?1:-1;
  for(var i=-1;i<=1;i+=2){
    var pr=r+pd,pc=c+i;
    if(inB(pr,pc)&&b[pr][pc]===(by==='w'?'P':'p'))return true;
  }
  var nd=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  for(var k=0;k<8;k++){
    var nr=r+nd[k][0],nc=c+nd[k][1];
    if(inB(nr,nc)&&b[nr][nc]===(by==='w'?'N':'n'))return true;
  }
  for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){
    if(!dr&&!dc)continue;
    var kr=r+dr,kc=c+dc;
    if(inB(kr,kc)&&b[kr][kc]===(by==='w'?'K':'k'))return true;
  }
  var od=[[-1,0],[1,0],[0,-1],[0,1]];
  for(var o=0;o<4;o++){
    var rr=r+od[o][0],rc=c+od[o][1];
    while(inB(rr,rc)){
      var rp=b[rr][rc];
      if(rp){
        if(colOf(rp)===by){
          var t=rp.toLowerCase();
          if(t==='r'||t==='q')return true;
        }
        break;
      }
      rr+=od[o][0];rc+=od[o][1];
    }
  }
  var dd=[[-1,-1],[-1,1],[1,-1],[1,1]];
  for(var d=0;d<4;d++){
    var br=r+dd[d][0],bc=c+dd[d][1];
    while(inB(br,bc)){
      var bp=b[br][bc];
      if(bp){
        if(colOf(bp)===by){
          var t2=bp.toLowerCase();
          if(t2==='b'||t2==='q')return true;
        }
        break;
      }
      br+=dd[d][0];bc+=dd[d][1];
    }
  }
  return false;
}

function inCheck(b,col){
  var k=findKing(b,col);
  if(!k)return false;
  return attacked(b,k[0],k[1],other(col));
}

function genPseudo(b,r,c,epSq,cast){
  var p=b[r][c];if(!p)return [];
  var col=colOf(p),t=p.toLowerCase(),moves=[],opp=other(col);

  if(t==='p'){
    var dir=col==='w'?-1:1;
    var startR=col==='w'?6:1;
    var promoR=col==='w'?0:7;
    if(inB(r+dir,c)&&!b[r+dir][c]){
      moves.push({from:[r,c],to:[r+dir,c],piece:p,promo:r+dir===promoR});
      if(r===startR&&!b[r+2*dir][c])
        moves.push({from:[r,c],to:[r+2*dir,c],piece:p,double:true});
    }
    for(var i=-1;i<=1;i+=2){
      var cr=r+dir,cc=c+i;
      if(!inB(cr,cc))continue;
      var tp=b[cr][cc];
      if(tp&&colOf(tp)===opp)
        moves.push({from:[r,c],to:[cr,cc],piece:p,captured:tp,promo:cr===promoR});
      else if(!tp&&epSq&&epSq[0]===cr&&epSq[1]===cc)
        moves.push({from:[r,c],to:[cr,cc],piece:p,ep:true,captured:col==='w'?'p':'P'});
    }
    return moves;
  }

  if(t==='n'){
    var nd=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    for(var k=0;k<8;k++){
      var nr=r+nd[k][0],nc=c+nd[k][1];
      if(!inB(nr,nc))continue;
      var tp2=b[nr][nc];
      if(tp2&&colOf(tp2)===col)continue;
      moves.push({from:[r,c],to:[nr,nc],piece:p,captured:tp2||undefined});
    }
    return moves;
  }

  if(t==='b'||t==='r'||t==='q'){
    var dirs=[];
    if(t==='b'||t==='q')dirs.push([-1,-1],[-1,1],[1,-1],[1,1]);
    if(t==='r'||t==='q')dirs.push([-1,0],[1,0],[0,-1],[0,1]);
    for(var d=0;d<dirs.length;d++){
      var rr=r+dirs[d][0],cc2=c+dirs[d][1];
      while(inB(rr,cc2)){
        var tp3=b[rr][cc2];
        if(tp3){
          if(colOf(tp3)!==col)
            moves.push({from:[r,c],to:[rr,cc2],piece:p,captured:tp3});
          break;
        }
        moves.push({from:[r,c],to:[rr,cc2],piece:p});
        rr+=dirs[d][0];cc2+=dirs[d][1];
      }
    }
    return moves;
  }

  if(t==='k'){
    for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){
      if(!dr&&!dc)continue;
      var nr2=r+dr,nc2=c+dc;
      if(!inB(nr2,nc2))continue;
      var tp4=b[nr2][nc2];
      if(tp4&&colOf(tp4)===col)continue;
      moves.push({from:[r,c],to:[nr2,nc2],piece:p,captured:tp4||undefined});
    }
    if(col==='w'&&r===7&&c===4){
      if(cast.K&&!b[7][5]&&!b[7][6]&&b[7][7]==='R'&&
         !attacked(b,7,4,'b')&&!attacked(b,7,5,'b')&&!attacked(b,7,6,'b'))
        moves.push({from:[7,4],to:[7,6],piece:p,castle:'K'});
      if(cast.Q&&!b[7][3]&&!b[7][2]&&!b[7][1]&&b[7][0]==='R'&&
         !attacked(b,7,4,'b')&&!attacked(b,7,3,'b')&&!attacked(b,7,2,'b'))
        moves.push({from:[7,4],to:[7,2],piece:p,castle:'Q'});
    }
    if(col==='b'&&r===0&&c===4){
      if(cast.k&&!b[0][5]&&!b[0][6]&&b[0][7]==='r'&&
         !attacked(b,0,4,'w')&&!attacked(b,0,5,'w')&&!attacked(b,0,6,'w'))
        moves.push({from:[0,4],to:[0,6],piece:p,castle:'k'});
      if(cast.q&&!b[0][3]&&!b[0][2]&&!b[0][1]&&b[0][0]==='r'&&
         !attacked(b,0,4,'w')&&!attacked(b,0,3,'w')&&!attacked(b,0,2,'w'))
        moves.push({from:[0,4],to:[0,2],piece:p,castle:'q'});
    }
    return moves;
  }
  return moves;
}

function applyMove(s,m){
  var b=cloneB(s.board);
  var fr=m.from[0],fc=m.from[1],tr=m.to[0],tc=m.to[1];
  var p=b[fr][fc],cap=b[tr][tc];
  b[tr][tc]=p;b[fr][fc]='';
  if(m.ep){
    var d=colOf(p)==='w'?1:-1;
    cap=b[tr+d][tc];
    b[tr+d][tc]='';
  }
  if(m.promo)b[tr][tc]=colOf(p)==='w'?'Q':'q';
  if(m.castle==='K'){b[7][5]=b[7][7];b[7][7]='';}
  if(m.castle==='Q'){b[7][3]=b[7][0];b[7][0]='';}
  if(m.castle==='k'){b[0][5]=b[0][7];b[0][7]='';}
  if(m.castle==='q'){b[0][3]=b[0][0];b[0][0]='';}
  var nc={K:s.castling.K,Q:s.castling.Q,k:s.castling.k,q:s.castling.q};
  if(p==='K'){nc.K=false;nc.Q=false;}
  if(p==='k'){nc.k=false;nc.q=false;}
  if(fr===7&&fc===0)nc.Q=false;
  if(fr===7&&fc===7)nc.K=false;
  if(fr===0&&fc===0)nc.q=false;
  if(fr===0&&fc===7)nc.k=false;
  if(tr===7&&tc===0)nc.Q=false;
  if(tr===7&&tc===7)nc.K=false;
  if(tr===0&&tc===0)nc.q=false;
  if(tr===0&&tc===7)nc.k=false;
  var nep=null;
  if(m.double){
    var dd=colOf(p)==='w'?-1:1;
    nep=[fr+dd,fc];
  }
  var isCap=cap||m.ep;
  var isPawn=p.toLowerCase()==='p';
  return {
    board:b,turn:other(s.turn),castling:nc,ep:nep,
    halfmove:(isCap||isPawn)?0:s.halfmove+1,
    fullmove:s.turn==='b'?s.fullmove+1:s.fullmove,
    captured:cap||null
  };
}

function getLegal(s,r,c){
  var p=s.board[r][c];if(!p)return [];
  var col=colOf(p);
  var pseudo=genPseudo(s.board,r,c,s.ep,s.castling);
  var out=[];
  for(var i=0;i<pseudo.length;i++){
    var ns=applyMove(s,pseudo[i]);
    if(!inCheck(ns.board,col))out.push(pseudo[i]);
  }
  return out;
}

function allLegal(s){
  var out=[];
  for(var r=0;r<8;r++)for(var c=0;c<8;c++){
    var p=s.board[r][c];
    if(p&&colOf(p)===s.turn){
      var l=getLegal(s,r,c);
      for(var k=0;k<l.length;k++)out.push(l[k]);
    }
  }
  return out;
}

function keyOf(s){
  var k='';
  for(var r=0;r<8;r++)for(var c=0;c<8;c++)k+=(s.board[r][c]||'.');
  k+=s.turn;
  k+=(s.castling.K?'K':'')+(s.castling.Q?'Q':'')+(s.castling.k?'k':'')+(s.castling.q?'q':'');
  k+=s.ep?s.ep.join(''):'-';
  return k;
}

function toSAN(s,m){
  if(m.castle){
    var isK=m.castle==='K'||m.castle==='k';
    var san=isK?'O-O':'O-O-O';
    var ns=applyMove(s,m);
    if(inCheck(ns.board,ns.turn))san+=allLegal(ns).length?'+':'#';
    return san;
  }
  var p=m.piece,t=p.toLowerCase();
  var fr=m.from[0],fc=m.from[1],tr=m.to[0],tc=m.to[1];
  var files='abcdefgh',isCap=!!m.captured,san='';
  if(t==='p'){
    if(isCap)san+=files[fc]+'x';
    san+=files[tc]+(8-tr);
    if(m.promo)san+='=Q';
  }else{
    san+=t.toUpperCase();
    var same=[];
    for(var r=0;r<8;r++)for(var c=0;c<8;c++){
      if(r===fr&&c===fc)continue;
      var op=s.board[r][c];
      if(!op||op.toLowerCase()!==t||colOf(op)!==colOf(p))continue;
      var l=getLegal(s,r,c);
      for(var k=0;k<l.length;k++){
        if(l[k].to[0]===tr&&l[k].to[1]===tc){same.push([r,c]);break;}
      }
    }
    if(same.length){
      var sf=same.some(function(x){return x[1]===fc;});
      var sr=same.some(function(x){return x[0]===fr;});
      if(!sf)san+=files[fc];
      else if(!sr)san+=(8-fr);
      else san+=files[fc]+(8-fr);
    }
    if(isCap)san+='x';
    san+=files[tc]+(8-tr);
  }
  var ns2=applyMove(s,m);
  if(inCheck(ns2.board,ns2.turn))san+=allLegal(ns2).length?'+':'#';
  return san;
}

function evaluate(s){
  var sc=0;
  for(var r=0;r<8;r++)for(var c=0;c<8;c++){
    var p=s.board[r][c];if(!p)continue;
    var t=p.toLowerCase(),isW=colOf(p)==='w';
    var idx=isW?(r*8+c):((7-r)*8+c);
    var v=VAL[t]+(PST[t]?PST[t][idx]:0);
    sc+=isW?v:-v;
  }
  sc+=s.turn==='w'?8:-8;
  return sc;
}

function orderMoves(ms){
  return ms.slice().sort(function(a,b){
    var av=a.captured?VAL[a.captured.toLowerCase()]:0;
    var bv=b.captured?VAL[b.captured.toLowerCase()]:0;
    if(av!==bv)return bv-av;
    if(a.promo&&!b.promo)return -1;
    if(b.promo&&!a.promo)return 1;
    return 0;
  });
}

function minimax(s,depth,alpha,beta,maxing){
  if(depth===0)return evaluate(s);
  var ms=allLegal(s);
  if(ms.length===0){
    if(inCheck(s.board,s.turn))
      return maxing?(-100000+(10-depth)):(100000-(10-depth));
    return 0;
  }
  if(s.halfmove>=100)return 0;
  ms=orderMoves(ms);
  if(maxing){
    var best=-Infinity;
    for(var i=0;i<ms.length;i++){
      var ns=applyMove(s,ms[i]);
      var v=minimax(ns,depth-1,alpha,beta,false);
      if(v>best)best=v;
      if(v>alpha)alpha=v;
      if(beta<=alpha)break;
    }
    return best;
  }else{
    var best2=Infinity;
    for(var j=0;j<ms.length;j++){
      var ns2=applyMove(s,ms[j]);
      var v2=minimax(ns2,depth-1,alpha,beta,true);
      if(v2<best2)best2=v2;
      if(v2<beta)beta=v2;
      if(beta<=alpha)break;
    }
    return best2;
  }
}

function bestMoveFor(s,d){
  var ms=allLegal(s);
  if(!ms.length)return null;
  if(d==='easy'&&Math.random()<0.55)
    return ms[Math.floor(Math.random()*ms.length)];
  var depth=d==='hard'?3:2;
  var maxing=s.turn==='w';
  ms=orderMoves(ms);
  var best=maxing?-Infinity:Infinity;
  var bestM=ms[0];
  for(var i=0;i<ms.length;i++){
    var ns=applyMove(s,ms[i]);
    var v=minimax(ns,depth-1,-Infinity,Infinity,!maxing);
    if(maxing){if(v>best){best=v;bestM=ms[i];}}
    else{if(v<best){best=v;bestM=ms[i];}}
  }
  return bestM;
}

var audioCtx=null,muted=false;
function ensureAudio(){
  if(!audioCtx){try{audioCtx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}
  if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume();
}
function beep(f,d,v,type){
  if(muted||!audioCtx)return;
  try{
    var o=audioCtx.createOscillator();
    var g=audioCtx.createGain();
    o.type=type||'sine';
    o.frequency.value=f;
    g.gain.value=v||0.25;
    o.connect(g);g.connect(audioCtx.destination);
    g.gain.setValueAtTime(v||0.25,audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+d);
    o.start();o.stop(audioCtx.currentTime+d);
  }catch(e){}
}
function sMove(){beep(680,.06,.2,'triangle');}
function sCap(){beep(420,.08,.26,'square');setTimeout(function(){beep(320,.1,.2,'triangle');},50);}
function sChk(){beep(880,.12,.26,'sawtooth');setTimeout(function(){beep(660,.14,.22,'sawtooth');},90);}
function sCastle(){beep(520,.06,.22,'triangle');setTimeout(function(){beep(720,.06,.22,'triangle');},70);}
function sPromo(){beep(660,.1,.26);setTimeout(function(){beep(880,.1,.26);},80);setTimeout(function(){beep(1320,.14,.26);},160);}
function sWin(){beep(880,.14,.3);setTimeout(function(){beep(1100,.14,.3);},120);setTimeout(function(){beep(1320,.22,.3);},240);}
function sLose(){beep(300,.18,.3);setTimeout(function(){beep(220,.28,.3);},160);}
function sDraw(){beep(440,.16,.24);setTimeout(function(){beep(440,.16,.24);},180);}
function sUndo(){beep(400,.08,.2);setTimeout(function(){beep(300,.1,.2);},60);}
function sBlock(){beep(180,.12,.25,'square');}
function sLowTime(){beep(1200,.06,.3,'square');}

var boardEl,wrapEl;

function curState(){
  return {board:board,turn:turn,castling:castling,ep:ep,halfmove:halfmove,fullmove:fullmove};
}
function setState(s){
  board=s.board;turn=s.turn;castling=s.castling;ep=s.ep;
  halfmove=s.halfmove;fullmove=s.fullmove;
}

function fmtTime(sec){
  if(sec<0)sec=0;
  var m=Math.floor(sec/60);
  var s=Math.floor(sec%60);
  return (m<10?'0':'')+m+':'+(s<10?'0':'')+s;
}

function updateClockUI(){
  var w=document.getElementById('timeW');
  var b=document.getElementById('timeB');
  var cw=document.getElementById('clockW');
  var cb=document.getElementById('clockB');

  w.textContent=fmtTime(timeW);
  b.textContent=fmtTime(timeB);

  cw.classList.remove('active','warn','crit');
  cb.classList.remove('active','warn','crit');

  if(running){
    if(turn==='w')cw.classList.add('active');
    else cb.classList.add('active');
  }

  if(timeW<=10&&timeW>0){cw.classList.add('crit');}
  else if(timeW<=60&&timeW>0){cw.classList.add('warn');}

  if(timeB<=10&&timeB>0){cb.classList.add('crit');}
  else if(timeB<=60&&timeB>0){cb.classList.add('warn');}
}

function tick(){
  if(!running||aiBusy||pendingPromo)return;

  if(turn==='w'){
    timeW-=0.1;
    if(timeW<=0){timeW=0;stopTimer();updateClockUI();endGame('b','timeout');return;}
  }else{
    timeB-=0.1;
    if(timeB<=0){timeB=0;stopTimer();updateClockUI();endGame('w','timeout');return;}
  }

  if(turn==='w'&&timeW<=10&&timeW>9.9)sLowTime();
  if(turn==='b'&&timeB<=10&&timeB>9.9)sLowTime();

  updateClockUI();
}

function startTimer(){
  stopTimer();
  timerId=setInterval(tick,100);
}

function stopTimer(){
  if(timerId){clearInterval(timerId);timerId=null;}
}

function render(){
  boardEl.innerHTML='';
  var chkNow=inCheck(board,turn);
  var kp=chkNow?findKing(board,turn):null;

  for(var i=0;i<8;i++){
    for(var j=0;j<8;j++){
      var r=i,c=j;
      var dR=flipped?7-r:r,dC=flipped?7-c:c;
      var cell=document.createElement('div');
      cell.className='cell '+((r+c)%2===0?'light':'dark');
      cell.style.gridRow=(dR+1);
      cell.style.gridColumn=(dC+1);

      if(lastMove){
        if((lastMove.from[0]===r&&lastMove.from[1]===c)||
           (lastMove.to[0]===r&&lastMove.to[1]===c)){
          cell.classList.add('last');
        }
      }
      if(selected&&selected[0]===r&&selected[1]===c)cell.classList.add('sel');
      if(kp&&kp[0]===r&&kp[1]===c)cell.classList.add('chk');

      var isTarget=false,isCap=false;
      for(var k=0;k<legalSel.length;k++){
        if(legalSel[k].to[0]===r&&legalSel[k].to[1]===c){
          isTarget=true;
          if(legalSel[k].captured)isCap=true;
          break;
        }
      }
      if(isTarget){
        var ind=document.createElement('span');
        ind.className=isCap?'ring':'dot';
        cell.appendChild(ind);
      }

      var p=board[r][c];
      if(p){
        var sp=document.createElement('span');
        sp.className='piece '+colOf(p);
        sp.textContent=UNI[p];
        cell.appendChild(sp);
      }

      (function(rr,cc){
        cell.onclick=function(){onClick(rr,cc);};
      })(r,c);

      boardEl.appendChild(cell);
    }
  }

  renderCaps();
  updateStatus();
  refreshToolButtons();
  updateClockUI();
}

function renderCaps(){
  var elW=document.getElementById('capsW');
  var elB=document.getElementById('capsB');
  var elA=document.getElementById('adv');
  var hw='';
  for(var i=0;i<capByW.length;i++)hw+='<span class="cb">'+UNI[capByW[i]]+'</span> ';
  var hb='';
  for(var j=0;j<capByB.length;j++)hb+='<span class="cw">'+UNI[capByB[j]]+'</span> ';
  elW.innerHTML=hw;
  elB.innerHTML=hb;
  var sw=0,sb=0;
  for(var a=0;a<capByW.length;a++)sw+=VAL[capByW[a].toLowerCase()]||0;
  for(var b=0;b<capByB.length;b++)sb+=VAL[capByB[b].toLowerCase()]||0;
  var d=(sw-sb)/100;
  if(Math.abs(d)>=0.5){
    if(d>0)elA.innerHTML='<span style="color:var(--p1)">+'+d.toFixed(1)+'</span>';
    else elA.innerHTML='<span style="color:var(--p2)">+'+(-d).toFixed(1)+'</span>';
  }else elA.textContent='';
}

function updateStatus(){
  var el=document.getElementById('turnInfo');
  if(!running){
    el.innerHTML='<span class="dotpulse"></span> اضغط ابدأ';
    return;
  }
  if(aiBusy){
    el.innerHTML='<span class="dotpulse" style="background:var(--p2)"></span> CPU<span class="think"><i></i><i></i><i></i></span>';
    return;
  }
  var col=turn==='w'?'#10B981':'#F59E0B';
  var name=turn===humanSide?'دورك':'دور CPU';
  var chk=inCheck(board,turn)?' • كش!':'';
  el.innerHTML='<span class="dotpulse" style="background:'+col+'"></span> '+name+chk;
}

function onClick(r,c){
  if(!running||aiBusy||pendingPromo)return;
  if(turn!==humanSide)return;
  ensureAudio();

  if(selected){
    for(var i=0;i<legalSel.length;i++){
      if(legalSel[i].to[0]===r&&legalSel[i].to[1]===c){
        var mv=legalSel[i];
        if(mv.promo){pendingPromo=mv;showPromo(mv.piece);return;}
        playMove(mv);return;
      }
    }
  }

  var p=board[r][c];
  if(p&&colOf(p)===humanSide){
    selected=[r,c];
    legalSel=getLegal(curState(),r,c);
    beep(720,.04,.14);
    render();return;
  }
  selected=null;legalSel=[];render();
}

function pushSnap(){
  stateStack.push({
    board:cloneB(board),
    turn:turn,
    castling:{K:castling.K,Q:castling.Q,k:castling.k,q:castling.q},
    ep:ep?ep.slice():null,
    halfmove:halfmove,fullmove:fullmove,
    moveHist:moveHist.slice(),
    capByW:capByW.slice(),capByB:capByB.slice()
  });
  if(stateStack.length>200)stateStack.shift();
}

function playMove(m){
  pushSnap();
  var s=curState();
  var san=toSAN(s,m);
  var side=turn;

  var cap=m.captured;
  if(cap){
    if(side==='w')capByW.push(cap);
    else capByB.push(cap);
  }

  var ns=applyMove(s,m);
  setState(ns);
  moveHist.push({san:san,side:side});
  lastMove={from:m.from,to:m.to};

  if(increment>0){
    if(side==='w')timeW+=increment;
    else timeB+=increment;
  }

  var key=keyOf(ns);
  posCounts[key]=(posCounts[key]||0)+1;

  selected=null;legalSel=[];

  if(m.castle)sCastle();
  else if(m.promo)sPromo();
  else if(cap)sCap();
  else sMove();

  render();

  setTimeout(function(){afterMove(key);},30);
}

function afterMove(key){
  var legal=allLegal(curState());
  if(legal.length===0){
    if(inCheck(board,turn))endGame(other(turn),'mate');
    else endGame(null,'stale');
    return;
  }
  if(halfmove>=100){endGame(null,'fifty');return;}
  if(posCounts[key]>=3){endGame(null,'rep');return;}
  if(insufficient()){endGame(null,'material');return;}

  if(inCheck(board,turn))sChk();
  updateStatus();

  if(turn!==humanSide){
    aiBusy=true;updateStatus();
    setTimeout(aiPlay,240);
  }
}

function aiPlay(){
  if(!running){aiBusy=false;return;}
  setTimeout(function(){
    var s=curState();
    var m=bestMoveFor(s,diff);
    aiBusy=false;
    if(!m){updateStatus();return;}
    playMove(m);
  },40);
}

function insufficient(){
  var pieces=[];
  for(var r=0;r<8;r++)for(var c=0;c<8;c++){
    var p=board[r][c];if(!p)continue;
    var t=p.toLowerCase();
    if(t==='k')continue;
    pieces.push({t:t,r:r,c:c,color:colOf(p)});
  }
  if(pieces.length===0)return true;
  if(pieces.length===1){
    var t=pieces[0].t;
    if(t==='n'||t==='b')return true;
  }
  if(pieces.length===2){
    if(pieces[0].t==='b'&&pieces[1].t==='b'&&pieces[0].color!==pieces[1].color){
      var s0=(pieces[0].r+pieces[0].c)%2;
      var s1=(pieces[1].r+pieces[1].c)%2;
      if(s0===s1)return true;
    }
  }
  return false;
}

function showPromo(piece){
  var panel=document.getElementById('promoPanel');
  panel.innerHTML='';
  var opts=['q','r','b','n'];
  for(var i=0;i<opts.length;i++){
    var t=opts[i];
    var ch=colOf(piece)==='w'?t.toUpperCase():t;
    var el=document.createElement('div');
    el.className='promoOpt '+colOf(piece);
    el.textContent=UNI[ch];
    (function(tt){
      el.onclick=function(){
        var mv=pendingPromo;
        pendingPromo=null;
        document.getElementById('promo').classList.add('hide');
        applyPromo(mv,tt);
      };
    })(t);
    panel.appendChild(el);
  }
  document.getElementById('promo').classList.remove('hide');
}

function applyPromo(m,to){
  pushSnap();
  var s=curState();
  var san=toSAN(s,m);
  if(san.indexOf('=')>=0)san=san.replace(/=Q/,'='+to.toUpperCase());
  else san+='='+to.toUpperCase();
  var side=turn;
  var cap=m.captured;
  if(cap){
    if(side==='w')capByW.push(cap);
    else capByB.push(cap);
  }
  var ns=applyMove(s,m);
  ns.board[m.to[0]][m.to[1]]=side==='w'?to.toUpperCase():to;
  setState(ns);
  moveHist.push({san:san,side:side});
  lastMove={from:m.from,to:m.to};

  if(increment>0){
    if(side==='w')timeW+=increment;
    else timeB+=increment;
  }

  var key=keyOf(ns);
  posCounts[key]=(posCounts[key]||0)+1;
  selected=null;legalSel=[];
  sPromo();
  render();
  setTimeout(function(){afterMove(key);},30);
}

function startG(){
  ensureAudio();
  init();
  document.getElementById('menu').classList.add('hide');
  document.getElementById('end').classList.add('hide');
  document.getElementById('promo').classList.add('hide');
  running=true;
  flipped=humanSide==='b';
  render();
  startTimer();
  if(turn!==humanSide){
    aiBusy=true;updateStatus();
    setTimeout(aiPlay,320);
  }
}

function restartG(){startG();}

function goMenu(){
  running=false;aiBusy=false;
  stopTimer();
  document.getElementById('menu').classList.remove('hide');
  document.getElementById('end').classList.add('hide');
  document.getElementById('promo').classList.add('hide');
  updateStatus();
  refreshToolButtons();
  updateClockUI();
}

function endGame(winner,reason){
  running=false;aiBusy=false;
  stopTimer();
  var rT=document.getElementById('rText');
  var rH=document.getElementById('rTitle');

  if(reason==='mate'||reason==='timeout'||reason==='resign'){
    if(winner==='w'){
      spawnParticles('#10B981');sWin();
      rT.textContent=reason==='timeout'?'انتهى وقت CPU':reason==='mate'?'كش مات':'استسلام';
      rH.textContent='WHITE WINS';
      rH.style.color='#10B981';
      rH.style.textShadow='0 0 22px rgba(16,185,129,.75)';
    }else{
      spawnParticles('#F59E0B');sLose();
      rT.textContent=reason==='timeout'?'انتهى وقتك':reason==='mate'?'كش مات':'استسلام';
      rH.textContent='BLACK WINS';
      rH.style.color='#F59E0B';
      rH.style.textShadow='0 0 22px rgba(245,158,11,.75)';
    }
  }else{
    sDraw();
    var names={
      stale:'تعادل (جمود)',
      fifty:'تعادل (50 حركة)',
      rep:'تعادل (تكرار ثلاثي)',
      material:'تعادل (مواد غير كافية)'
    };
    rT.textContent=names[reason]||'تعادل';
    rH.textContent='DRAW';
    rH.style.color='#f0e6d2';
    rH.style.textShadow='none';
  }

  updateStatus();
  refreshToolButtons();
  updateClockUI();
  setTimeout(function(){
    document.getElementById('end').classList.remove('hide');
  },520);
}

function resign(){
  if(!running)return;
  endGame(other(humanSide),'resign');
}

function undoMove(){
  if(!running||aiBusy||pendingPromo)return;
  if(undoLeft<=0){sBlock();return;}
  if(turn!==humanSide){sBlock();return;}
  if(stateStack.length<2){sBlock();return;}

  for(var i=0;i<2&&stateStack.length;i++){
    var s=stateStack.pop();
    board=s.board;turn=s.turn;castling=s.castling;ep=s.ep;
    halfmove=s.halfmove;fullmove=s.fullmove;
    moveHist=s.moveHist;capByW=s.capByW;capByB=s.capByB;
  }

  if(turn!==humanSide&&stateStack.length>=2){
    for(var j=0;j<2&&stateStack.length;j++){
      var s2=stateStack.pop();
      board=s2.board;turn=s2.turn;castling=s2.castling;ep=s2.ep;
      halfmove=s2.halfmove;fullmove=s2.fullmove;
      moveHist=s2.moveHist;capByW=s2.capByW;capByB=s2.capByB;
    }
  }

  undoLeft--;
  selected=null;legalSel=[];lastMove=null;
  render();
  sUndo();
}

function doHint(){
  if(!running||aiBusy||turn!==humanSide||pendingPromo)return;
  if(hintLeft<=0){sBlock();return;}
  var m=bestMoveFor(curState(),'normal');
  if(!m)return;
  hintLeft--;
  selected=m.from.slice();
  legalSel=getLegal(curState(),m.from[0],m.from[1]);
  render();
  beep(900,.08,.22);
}

function setD(d,el){
  diff=d;
  var sib=el.parentNode.querySelectorAll('.chip');
  for(var i=0;i<sib.length;i++)sib[i].classList.remove('on');
  el.classList.add('on');
}

function setSide(s,el){
  humanSide=s;
  var sib=el.parentNode.querySelectorAll('.chip');
  for(var i=0;i<sib.length;i++)sib[i].classList.remove('on');
  el.classList.add('on');
}

function setTime(base,inc,el){
  baseTime=base*60;
  increment=inc;
  timeW=baseTime;
  timeB=baseTime;
  updateClockUI();
  var sib=el.parentNode.querySelectorAll('.chip');
  for(var i=0;i<sib.length;i++)sib[i].classList.remove('on');
  el.classList.add('on');
}

function spawnParticles(color){
  var w=wrapEl.getBoundingClientRect();
  var cx=w.left+w.width/2,cy=w.top+w.height/2;
  for(var i=0;i<22;i++){
    var p=document.createElement('div');
    p.className='p';
    p.style.position='fixed';
    p.style.background=color;
    p.style.left=cx+'px';
    p.style.top=cy+'px';
    document.body.appendChild(p);
    (function(pt){
      var ang=Math.random()*Math.PI*2;
      var dist=60+Math.random()*140;
      var x=Math.cos(ang)*dist,y=Math.sin(ang)*dist;
      pt.animate([
        {transform:'translate(-50%,-50%)',opacity:1},
        {transform:'translate(calc(-50% + '+x+'px), calc(-50% + '+y+'px))',opacity:0}
      ],{duration:700+Math.random()*500,easing:'ease-out'})
      .onfinish=function(){pt.remove();};
    })(p);
  }
}

boardEl=document.getElementById('board');
wrapEl=document.getElementById('wrap');
init();
render();
</script>

</body>
</html>`;

    try {
      const unifiedResponse = {
        response_id: '2e139bcf-de37-4fad-a30c-01524776e17a',
        sections: [{
          __typename: 'GenAIUnifiedResponseSection',
          view_model: {
            __typename: 'GenAISingleLayoutViewModel',
            primitive: {
              __typename: 'GenAIaeacdsnwHtmlPrimitive',
              payload: chessHtml,
              trusted_sources: []
            }
          }
        }],
        embedded_screens: [{
          id: 'steam-chess-ultra',
          title: 'الشطرنج',
          content: [{
            __typename: 'FOAEmbeddedScreenContentTabbed',
            tabs: [{
              id: 'chess-game',
              tab_header: 'الشطرنج',
              sections: [{
                __typename: 'GenAIUnifiedResponseSection',
                view_model: {
                  __typename: 'GenAISingleLayoutViewModel',
                  primitive: {
                    __typename: 'GenAIaeacdsnwHtmlPrimitive',
                    payload: chessHtml,
                    trusted_sources: []
                  }
                }
              }]
            }]
          }]
        }]
      };

      await sock.relayMessage(
        message.chatId,
        {
          senderKeyDistributionMessage: {
            groupId: message.chatId,
            axolotlSenderKeyDistributionMessage: '[STRIPPED 108 bytes]'
          },
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
            botMetadata: {
              messageDisclaimerText: '',
              botResponseId: '90ab3989-9597-4bde-9593-4786925f1c97',
              verificationMetadata: {
                proofs: [{
                  version: 1,
                  useCase: 1,
                  signature: '[STRIPPED 88 bytes]',
                  certificateChain: ['[STRIPPED 912 bytes]', '[STRIPPED 1192 bytes]']
                }]
              }
            }
          },
          botForwardedMessage: {
            message: {
              richResponseMessage: {
                messageType: 1,
                submessages: [{
                  messageType: 2,
                  messageText: '♟️ CHESS ULTRA - Royal Walnut'
                }],
                unifiedResponse: {
                  data: Buffer.from(JSON.stringify(unifiedResponse)).toString('base64')
                },
                contextInfo: {
                  forwardingScore: 1,
                  isForwarded: true,
                  forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' },
                  forwardOrigin: 4
                }
              }
            }
          }
        },
        {
          additionalNodes: [{
            tag: 'biz',
            attrs: {
              actual_actors: '2',
              host_storage: '2',
              privacy_mode_ts: '1788095961'
            },
            content: [{
              tag: 'interactive',
              attrs: { type: 'native_flow', v: '1' },
              content: [{
                tag: 'native_flow',
                attrs: { v: '9', name: 'mixed' }
              }]
            }]
          }]
        }
      );

      return true;
    } catch (error) {
      console.error('[STEAM CHESS] HTML window failed:', error);
      return message.reply(
        '❌ تعذر إرسال نافذة الشطرنج.\nالسبب: ' + (error?.message || error)
      );
    }
  }
};
