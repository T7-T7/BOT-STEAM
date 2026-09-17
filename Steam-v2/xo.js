export default {
  name: 'xo',
  aliases: ['اكسو', 'إكسو'],
  category: 'ألعاب',
  requiredRole: 'user',

  async execute(ctx) {
    const { message, sock } = ctx;

    if (!message?.chatId || !sock) {
      return false;
    }

    await message.react?.('⚙️');

    const xoHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>XO ULTRA - NEW NEON</title>

<style>
*{
  box-sizing:border-box;
  -webkit-tap-highlight-color:transparent;
  -webkit-touch-callout:none;
  user-select:none;
}

*:focus{
  outline:none!important;
}

html,
body{
  margin:0;
  padding:0;
  width:100%;
  min-height:100%;
}

body{
  display:flex;
  align-items:flex-start;
  justify-content:center;

  /* إزالة الخلفية الأصلية */
  background:transparent!important;

  color:#e8ecf5;
  font-family:'Courier New',monospace;
  touch-action:manipulation;
  overflow:hidden;
}

:root{
  --p1:#A78BFA;
  --p2:#FBBF24;
  --g1:rgba(167,139,250,.6);
  --g2:rgba(251,191,36,.6);
}

/*
  الصندوق الآن مجرد حاوية شفافة
  حتى لا تظهر نافذة داخل نافذة.
*/
.box{
  width:100%;
  max-width:none;
  min-height:100vh;

  padding:10px;

  background:transparent!important;
  border:none!important;
  border-radius:0!important;
  box-shadow:none!important;
}

.top{
  display:flex;
  justify-content:space-between;
  align-items:center;
  flex-wrap:wrap;
  gap:10px;

  padding:0 6px 14px;

  border-bottom:1px solid rgba(255,255,255,.06);
}

.brand{
  font-size:11px;
  letter-spacing:3px;
  color:#8b87a8;
}

.brand b{
  color:#e8ecf5;
}

.score{
  display:flex;
  gap:18px;
  align-items:center;
}

.num{
  font-size:30px;
  font-weight:900;
  transition:transform .2s;
}

.num.bump{
  transform:scale(1.35);
}

.p1{
  color:var(--p1);
  text-shadow:0 0 16px var(--g1);
}

.p2{
  color:var(--p2);
  text-shadow:0 0 16px var(--g2);
}

.b{
  font-size:10px;
  border:1px solid #2a2550;
  background:rgba(255,255,255,.04);
  color:#8b87a8;
  padding:8px 14px;
  border-radius:20px;
  cursor:pointer;
  display:inline-flex;
  align-items:center;
  gap:6px;
}

.b.active{
  background:#e8ecf5;
  color:#0f0a1a;
  border-color:#e8ecf5;
}

.b svg{
  width:18px;
  height:18px;
  display:block;
}

.wrap{
  position:relative;

  width:min(420px,94vw);
  height:min(420px,94vw);

  margin:18px auto;
}

.board{
  position:absolute;
  inset:0;

  display:grid;
  grid-template-columns:1fr 1fr 1fr;
  grid-template-rows:1fr 1fr 1fr;

  gap:12px;
  padding:14px;

  background:rgba(10,8,24,.7);

  border-radius:20px;
  border:1px solid rgba(167,139,250,.12);

  z-index:1;
}

.cell{
  width:100%;
  height:100%;
  aspect-ratio:1;

  border-radius:16px;

  background:rgba(255,255,255,.03);
  border:1px solid #2a2550;

  font-size:42px;
  font-weight:900;

  cursor:pointer;

  display:flex;
  align-items:center;
  justify-content:center;

  color:#e8ecf5;

  transition:
    border-color .15s,
    transform .1s,
    background .15s;
}

.cell:active{
  transform:scale(.95);
}

.cell.x{
  color:var(--p1);
  text-shadow:0 0 20px var(--g1);
}

.cell.o{
  color:var(--p2);
  text-shadow:0 0 20px var(--g2);
}

.cell.win{
  background:
    linear-gradient(
      180deg,
      rgba(167,139,250,.18),
      rgba(255,255,255,.06)
    );

  border-color:#e8ecf5;

  box-shadow:
    0 0 24px rgba(167,139,250,.35);
}

.cell.hint{
  border-color:var(--p1);
  box-shadow:0 0 24px var(--g1);
}

.cell.dis{
  pointer-events:none;
  opacity:.5;
}

.winLine{
  position:absolute;

  height:8px;

  background:currentColor;

  z-index:2;

  display:none;

  top:0;
  left:0;

  transform-origin:left center;

  border-radius:4px;

  box-shadow:
    0 0 18px currentColor,
    0 0 36px currentColor;

  pointer-events:none;
}

.winLine.show{
  animation:
    growLine .5s cubic-bezier(.34,1.56,.64,1)
    forwards;
}

@keyframes growLine{
  from{
    transform:
      rotate(var(--ang))
      scaleX(0);
  }

  to{
    transform:
      rotate(var(--ang))
      scaleX(1);
  }
}

.overlay{
  position:absolute;
  inset:0;

  background:rgba(10,6,24,.92);

  backdrop-filter:blur(14px);

  border-radius:20px;

  display:flex;
  flex-direction:column;

  align-items:center;
  justify-content:center;

  gap:16px;

  z-index:10;

  padding:22px;

  text-align:center;

  border:1px solid rgba(167,139,250,.15);
}

.hide{
  display:none!important;
}

.chip{
  padding:9px 18px;

  border-radius:20px;

  border:1px solid #2a2550;

  background:rgba(255,255,255,.03);

  color:#8b87a8;

  cursor:pointer;

  font-size:10px;

  display:inline-flex;

  align-items:center;

  gap:6px;

  transition:.15s;
}

.chip.on{
  background:#e8ecf5;
  color:#0f0a1a;

  border-color:#e8ecf5;

  box-shadow:
    0 0 16px rgba(232,236,245,.25);
}

.chip svg{
  width:14px;
  height:14px;
  display:block;
}

.btn{
  padding:13px 34px;

  background:
    linear-gradient(
      180deg,
      #A78BFA,
      #7C3AED
    );

  color:#0f0a1a;

  border:none;
  border-radius:12px;

  cursor:pointer;

  font-weight:900;
  letter-spacing:2px;

  box-shadow:
    0 0 28px rgba(167,139,250,.45);

  transition:
    transform .1s;
}

.btn:active{
  transform:scale(.96);
}

.btn.ghost{
  background:transparent;
  color:#8b87a8;

  border:1px solid #2a2550;

  box-shadow:none;
}

.shake{
  animation:shake .28s ease;
}

@keyframes shake{
  0%,100%{
    transform:translate(0,0);
  }

  25%{
    transform:translate(-4px,2px);
  }

  50%{
    transform:translate(4px,-2px);
  }
}

.turn{
  font-size:9px;
  letter-spacing:2px;

  color:#8b87a8;

  display:flex;
  align-items:center;
  gap:6px;
}

.dot{
  width:7px;
  height:7px;

  border-radius:50%;

  background:var(--p1);

  box-shadow:
    0 0 10px var(--p1);

  animation:pulse 1.2s infinite;
}

@keyframes pulse{
  0%,100%{
    opacity:1;
  }

  50%{
    opacity:.4;
  }
}

.p{
  position:absolute;

  width:8px;
  height:8px;

  border-radius:50%;

  pointer-events:none;

  z-index:3;
}

/* الهاتف */
@media(max-width:520px){

  .box{
    padding:8px;
  }

  .top{
    padding-left:3px;
    padding-right:3px;
  }

  .wrap{
    width:min(430px,96vw);
    height:min(430px,96vw);
  }

  .cell{
    font-size:38px;
  }
}

</style>
</head>

<body>

<div class="box">

  <div class="top">

    <div class="brand">
      HIURA <b>XO ULTRA</b>
    </div>

    <div class="score">

      <div>
        <small style="color:#8b87a8">X</small>
        <span class="num p1" id="s1">0</span>
      </div>

      <div style="color:#3a3560">:</div>

      <div>
        <small style="color:#8b87a8">O</small>
        <span class="num p2" id="s2">0</span>
      </div>

    </div>

    <div style="display:flex;gap:6px">

      <button
        class="b"
        onclick="toggleMute()"
        type="button"
      >

        <svg
          id="on"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >

          <polygon
            points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
          ></polygon>

          <path
            d="M15.54 8.46a5 5 0 0 1 0 7.07"
          ></path>

          <path
            d="M19.07 4.93a10 10 0 0 1 0 14.14"
          ></path>

        </svg>

        <svg
          id="off"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          style="display:none"
        >

          <polygon
            points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
          ></polygon>

          <line
            x1="23"
            y1="9"
            x2="17"
            y2="15"
          ></line>

          <line
            x1="17"
            y1="9"
            x2="23"
            y2="15"
          ></line>

        </svg>

      </button>

      <button
        class="b"
        onclick="goMenu()"
        type="button"
      >
        خروج
      </button>

    </div>

  </div>


  <div
    class="wrap"
    id="wrap"
  >

    <div
      class="board"
      id="board"
    ></div>

    <div
      id="winLine"
      class="winLine"
    ></div>


    <div
      class="overlay"
      id="menu"
    >

      <h2
        style="margin:0;letter-spacing:5px"
      >
        X
        <span
          style="
            color:var(--p1);
            text-shadow:0 0 18px var(--g1)
          "
        >O</span>
        ULTRA
      </h2>

      <div class="turn">

        <span
          class="dot"
          style="background:var(--p1)"
        ></span>

        ألوان نيون جديدة • 1P vs AI

      </div>


      <div
        style="
          display:flex;
          gap:6px;
          flex-wrap:wrap;
          justify-content:center
        "
      >

        <button
          class="chip on"
          onclick="setD('normal',this)"
          type="button"
        >
          عادي
        </button>

        <button
          class="chip"
          onclick="setD('easy',this)"
          type="button"
        >
          سهل
        </button>

        <button
          class="chip"
          onclick="setD('hard',this)"
          type="button"
        >
          صعب
        </button>

        <button
          class="chip"
          onclick="setD('insane',this)"
          type="button"
        >
          جنوني
        </button>

      </div>


      <div
        style="
          display:flex;
          gap:6px
        "
      >

        <button
          class="chip on"
          onclick="setTheme('space',this)"
          type="button"
        >
          بنفسجي
        </button>

        <button
          class="chip"
          onclick="setTheme('grid',this)"
          type="button"
        >
          فضاء
        </button>

        <button
          class="chip"
          onclick="setTheme('sunset',this)"
          type="button"
        >
          عنبر
        </button>

      </div>


      <button
        class="btn"
        onclick="startG()"
        type="button"
      >
        ابدأ ▶
      </button>


      <small style="color:#6b6788">
        مربعات ثابتة • خط من 3 مربعات فائزة • بدون تفاعل أزرق
      </small>

    </div>


    <div
      class="overlay hide"
      id="end"
    >

      <div
        id="rText"
        style="letter-spacing:2px"
      >
        فوز
      </div>

      <h1
        id="rTitle"
        style="margin:0"
      >
        YOU WIN
      </h1>

      <div
        style="
          display:flex;
          gap:10px
        "
      >

        <button
          class="b"
          onclick="goMenu()"
          type="button"
        >
          القائمة
        </button>

        <button
          class="btn"
          onclick="restartG()"
          type="button"
        >
          إعادة
        </button>

      </div>

    </div>

  </div>


  <div
    style="
      text-align:center;
      margin-top:14px;
      display:flex;
      gap:10px;
      justify-content:center;
      align-items:center
    "
  >

    <button
      class="chip"
      id="hintBtn"
      onclick="doHint()"
      type="button"
    >

      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >

        <path d="M9 21h6"></path>

        <path
          d="
            M12 17a5 5 0 0 0-5-5
            5 5 0 0 1 10 0
            5 5 0 0 0-5 5z
          "
        ></path>

        <line
          x1="12"
          y1="2"
          x2="12"
          y2="3"
        ></line>

        <line
          x1="4.22"
          y1="4.22"
          x2="4.93"
          y2="4.93"
        ></line>

        <line
          x1="19.78"
          y1="4.22"
          x2="19.07"
          y2="4.93"
        ></line>

      </svg>

      <span id="hintTxt">
        تلميح (1)
      </span>

    </button>


    <div
      class="turn"
      id="turnInfo"
    >

      <span class="dot"></span>

      دورك X

    </div>

  </div>

</div>


<script>

var diff='normal';

var board=[
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  ''
];

var s1=0;
var s2=0;

var run=false;
var hintUsed=false;

var audioCtx=null;
var muted=false;


var LINES=[
  [0,1,2],
  [3,4,5],
  [6,7,8],
  [0,3,6],
  [1,4,7],
  [2,5,8],
  [0,4,8],
  [2,4,6]
];


var ORDER=[
  4,
  0,
  2,
  6,
  8,
  1,
  3,
  5,
  7
];


var THEMES={

  space:
    'radial-gradient(circle at 50% 0%,#1e1b4b 0%,#0f0a1a 70%)',

  grid:
    'radial-gradient(circle at 50% 0%,#0f1a3a 0%,#070a14 70%)',

  sunset:
    'radial-gradient(circle at 50% 0%,#3a1a0a 0%,#0f0a1a 70%)'

};


function setD(d,el){

  diff=d;

  el.parentNode
    .querySelectorAll('.chip')
    .forEach(function(c){

      c.classList.remove('on');

    });

  el.classList.add('on');

}


function setTheme(t,el){

  /*
   * مهم:
   * لا نضع الخلفية على body.
   * نضعها فقط على مساحة اللعبة نفسها.
   */

  var box=document.querySelector('.box');

  if(box){

    box.style.background=THEMES[t];

    box.style.borderRadius='24px';

    box.style.border='1px solid #2a2550';

    box.style.boxShadow=
      '0 0 50px -15px rgba(167,139,250,.25),inset 0 1px 0 rgba(255,255,255,.06)';

  }


  if(el){

    el.parentNode
      .querySelectorAll('.chip')
      .forEach(function(c){

        c.classList.remove('on');

      });

    el.classList.add('on');

  }

}


function toggleMute(){

  muted=!muted;

  document.getElementById('on').style.display=
    muted?'none':'block';

  document.getElementById('off').style.display=
    muted?'block':'none';

}


function ensureAudio(){

  if(!audioCtx){

    try{

      audioCtx=
        new(
          window.AudioContext||
          window.webkitAudioContext
        )();

    }catch(e){}

  }

  if(
    audioCtx &&
    audioCtx.state==='suspended'
  ){

    audioCtx.resume();

  }

}


function beep(f,d,v){

  if(
    muted||
    !audioCtx
  ){

    return;

  }

  try{

    var o=
      audioCtx.createOscillator();

    var g=
      audioCtx.createGain();

    o.frequency.value=f;

    g.gain.value=
      v||0.38;

    o.connect(g);

    g.connect(
      audioCtx.destination
    );

    g.gain.setValueAtTime(
      v||0.38,
      audioCtx.currentTime
    );

    g.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime+d
    );

    o.start();

    o.stop(
      audioCtx.currentTime+d
    );

  }catch(e){}

}


function build(){

  var b=
    document.getElementById('board');

  b.innerHTML='';


  for(
    var i=0;
    i<9;
    i++
  ){

    var c=
      document.createElement('button');

    c.className='cell';

    c.id='c'+i;

    c.setAttribute(
      'onclick',
      'play('+i+')'
    );

    c.setAttribute(
      'type',
      'button'
    );

    b.appendChild(c);

  }

  draw();

}


function draw(){

  for(
    var i=0;
    i<9;
    i++
  ){

    var c=
      document.getElementById(
        'c'+i
      );

    if(!c){

      continue;

    }

    c.textContent=
      board[i];

    c.className=
      'cell';


    if(
      board[i]==='X'
    ){

      c.classList.add('x');

    }


    if(
      board[i]==='O'
    ){

      c.classList.add('o');

    }


    if(!run){

      c.classList.add('dis');

    }

  }


  var count=
    board.filter(function(x){

      return x;

    }).length;


  document.getElementById(
    'turnInfo'
  ).innerHTML=

    '<span class="dot" style="background:'+

    (
      count%2===0
        ?'#A78BFA'
        :'#FBBF24'
    )+

    '"></span> '+

    (
      run
        ?
        (
          count%2===0
            ?'دورك X'
            :'دور CPU O'
        )
        :'انتهت'
    );

}


function check(b){

  for(
    var i=0;
    i<LINES.length;
    i++
  ){

    var l=
      LINES[i];

    if(
      b[l[0]] &&
      b[l[0]]===b[l[1]] &&
      b[l[0]]===b[l[2]]
    ){

      return{

        w:b[l[0]],

        line:l

      };

    }

  }


  var full=true;


  for(
    var i=0;
    i<9;
    i++
  ){

    if(!b[i]){

      full=false;

    }

  }


  if(full){

    return{

      w:'draw',

      line:[]

    };

  }


  return null;

}


function minimax(
  b,
  depth,
  isMax,
  alpha,
  beta,
  ai,
  hu
){

  var r=
    check(b);


  if(r){

    if(
      r.w===ai
    ){

      return 10-depth;

    }

    if(
      r.w===hu
    ){

      return depth-10;

    }

    return 0;

  }


  if(isMax){

    var max=-1000;


    for(
      var k=0;
      k<ORDER.length;
      k++
    ){

      var i=
        ORDER[k];


      if(!b[i]){

        b[i]=ai;


        var v=
          minimax(
            b,
            depth+1,
            false,
            alpha,
            beta,
            ai,
            hu
          );


        b[i]='';


        if(v>max){

          max=v;

        }


        if(v>alpha){

          alpha=v;

        }


        if(beta<=alpha){

          break;

        }

      }

    }


    return max;

  }


  else{

    var min=1000;


    for(
      var k=0;
      k<ORDER.length;
      k++
    ){

      var i=
        ORDER[k];


      if(!b[i]){

        b[i]=hu;


        var v=
          minimax(
            b,
            depth+1,
            true,
            alpha,
            beta,
            ai,
            hu
          );


        b[i]='';


        if(v<min){

          min=v;

        }


        if(v<beta){

          beta=v;

        }


        if(beta<=alpha){

          break;

        }

      }

    }


    return min;

  }

}


function best(
  b,
  ai,
  hu
){

  var best=-1000;

  var mv=null;


  for(
    var k=0;
    k<ORDER.length;
    k++
  ){

    var i=
      ORDER[k];


    if(!b[i]){

      b[i]=ai;


      var sc=
        minimax(
          b,
          0,
          false,
          -1000,
          1000,
          ai,
          hu
        );


      b[i]='';


      if(sc>best){

        best=sc;

        mv=i;

      }

    }

  }


  return mv;

}


function winMove(
  b,
  p
){

  for(
    var k=0;
    k<ORDER.length;
    k++
  ){

    var i=
      ORDER[k];


    if(!b[i]){

      b[i]=p;


      var r=
        check(b);


      b[i]='';


      if(
        r &&
        r.w===p
      ){

        return i;

      }

    }

  }


  return null;

}


function aiMove(){

  var moves=[];


  for(
    var k=0;
    k<ORDER.length;
    k++
  ){

    var i=
      ORDER[k];


    if(!board[i]){

      moves.push(i);

    }

  }


  if(!moves.length){

    return null;

  }


  if(
    diff==='easy'
  ){

    return moves[
      Math.floor(
        Math.random()*
        moves.length
      )
    ];

  }


  var w=
    winMove(
      board,
      'O'
    );


  if(w!==null){

    return w;

  }


  var bl=
    winMove(
      board,
      'X'
    );


  if(bl!==null){

    return bl;

  }


  if(
    diff==='normal' &&
    Math.random()<0.4
  ){

    return moves[
      Math.floor(
        Math.random()*
        moves.length
      )
    ];

  }


  if(
    diff==='hard' &&
    Math.random()<0.15
  ){

    return moves[
      Math.floor(
        Math.random()*
        moves.length
      )
    ];

  }


  return best(
    board.slice(),
    'O',
    'X'
  );

}


function showLine(
  line,
  winner
){

  if(
    !line ||
    line.length!==3
  ){

    return;

  }


  var cells=[

    document.getElementById(
      'c'+line[0]
    ),

    document.getElementById(
      'c'+line[2]
    )

  ];


  var wrap=
    document
      .getElementById('wrap')
      .getBoundingClientRect();


  var first=
    cells[0]
      .getBoundingClientRect();


  var last=
    cells[1]
      .getBoundingClientRect();


  var fx=
    first.left+
    first.width/2-
    wrap.left;


  var fy=
    first.top+
    first.height/2-
    wrap.top;


  var lx=
    last.left+
    last.width/2-
    wrap.left;


  var ly=
    last.top+
    last.height/2-
    wrap.top;


  var dx=
    lx-fx;


  var dy=
    ly-fy;


  var dist=
    Math.sqrt(
      dx*dx+
      dy*dy
    );


  var ang=
    Math.atan2(
      dy,
      dx
    )*
    180/
    Math.PI;


  var el=
    document.getElementById(
      'winLine'
    );


  el.style.left=
    fx+'px';


  el.style.top=
    fy+'px';


  el.style.width=
    dist+'px';


  el.style.setProperty(
    '--ang',
    ang+'deg'
  );


  el.style.color=
    winner==='X'
      ?'#A78BFA'
      :'#FBBF24';


  el.style.display=
    'block';


  el.classList.remove(
    'show'
  );


  void el.offsetWidth;


  el.classList.add(
    'show'
  );


  for(
    var i=0;
    i<3;
    i++
  ){

    var c=
      document.getElementById(
        'c'+line[i]
      );


    if(c){

      c.classList.add(
        'win'
      );

    }

  }

}


function hideLine(){

  var el=
    document.getElementById(
      'winLine'
    );


  el.style.display=
    'none';


  el.classList.remove(
    'show'
  );

}


function spawnParticles(
  color
){

  var wrap=
    document.getElementById(
      'wrap'
    );


  for(
    var i=0;
    i<18;
    i++
  ){

    var p=
      document.createElement(
        'div'
      );


    p.className='p';

    p.style.background=
      color;

    p.style.left='50%';

    p.style.top='50%';


    wrap.appendChild(p);


    (function(part){

      var ang=
        Math.random()*
        Math.PI*
        2;


      var dist=
        50+
        Math.random()*
        100;


      var x=
        Math.cos(ang)*
        dist;


      var y=
        Math.sin(ang)*
        dist;


      part.animate(

        [

          {
            transform:
              'translate(-50%,-50%)',

            opacity:1
          },

          {

            transform:
              'translate(calc(-50% + '+
              x+
              'px), calc(-50% + '+
              y+
              'px))',

            opacity:0

          }

        ],

        {

          duration:
            700+
            Math.random()*500,

          easing:
            'ease-out'

        }

      ).onfinish=
        function(){

          part.remove();

        };

    })(p);

  }

}


function play(i){

  if(
    !run ||
    board[i]
  ){

    return;

  }


  ensureAudio();


  board[i]='X';


  beep(
    820,
    .16,
    .36
  );


  draw();


  var r=
    check(board);


  if(r){

    if(
      r.line.length===3
    ){

      showLine(
        r.line,
        r.w
      );

    }


    endRound(r);

    return;

  }


  setTimeout(

    function(){

      var mv=
        aiMove();


      if(mv===null){

        return;

      }


      board[mv]='O';


      beep(
        420,
        .16,
        .36
      );


      draw();


      var r2=
        check(board);


      if(r2){

        if(
          r2.line.length===3
        ){

          showLine(
            r2.line,
            r2.w
          );

        }


        endRound(r2);

      }

    },

    380

  );

}


function endRound(r){

  run=false;


  var wrap=
    document.getElementById(
      'wrap'
    );


  wrap.classList.add(
    'shake'
  );


  setTimeout(

    function(){

      wrap.classList.remove(
        'shake'
      );

    },

    300

  );


  if(
    r.w==='X'
  ){

    s1++;


    document.getElementById(
      's1'
    ).textContent=s1;


    document.getElementById(
      's1'
    ).classList.add(
      'bump'
    );


    setTimeout(

      function(){

        document
          .getElementById('s1')
          .classList.remove('bump');

      },

      200

    );


    spawnParticles(
      '#A78BFA'
    );


    beep(
      960,
      .22,
      .38
    );


    setTimeout(

      function(){

        beep(
          1260,
          .28,
          .38
        );

      },

      130

    );


    document.getElementById(
      'rText'
    ).textContent=
      'فوز بنفسجي X';

  }


  else if(
    r.w==='O'
  ){

    s2++;


    document.getElementById(
      's2'
    ).textContent=s2;


    document.getElementById(
      's2'
    ).classList.add(
      'bump'
    );


    setTimeout(

      function(){

        document
          .getElementById('s2')
          .classList.remove('bump');

      },

      200

    );


    spawnParticles(
      '#FBBF24'
    );


    beep(
      200,
      .35,
      .36
    );


    document.getElementById(
      'rText'
    ).textContent=
      'خسارة عنبر O';

  }


  else{

    document.getElementById(
      'rText'
    ).textContent=
      'تعادل';


    beep(
      500,
      .22,
      .32
    );

  }


  if(

    (
      r.w==='X' &&
      s1>=5
    )

    ||

    (
      r.w==='O' &&
      s2>=5
    )

  ){

    setTimeout(

      function(){

        document
          .getElementById('end')
          .classList.remove('hide');

      },

      600

    );

  }


  else{

    setTimeout(

      function(){

        board=[
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          ''
        ];


        hintUsed=false;


        document.getElementById(
          'hintTxt'
        ).textContent=
          'تلميح (1)';


        document.getElementById(
          'hintBtn'
        ).disabled=false;


        hideLine();


        run=true;


        draw();

      },

      1100

    );

  }

}


function startG(){

  ensureAudio();


  s1=0;

  s2=0;


  document.getElementById(
    's1'
  ).textContent=0;


  document.getElementById(
    's2'
  ).textContent=0;


  board=[
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ];


  hintUsed=false;


  hideLine();


  document
    .getElementById('menu')
    .classList.add('hide');


  document
    .getElementById('end')
    .classList.add('hide');


  document.getElementById(
    'hintTxt'
  ).textContent=
    'تلميح (1)';


  document.getElementById(
    'hintBtn'
  ).disabled=false;


  run=true;


  build();

}


function restartG(){

  document
    .getElementById('end')
    .classList.add('hide');


  s1=0;

  s2=0;


  document.getElementById(
    's1'
  ).textContent=0;


  document.getElementById(
    's2'
  ).textContent=0;


  board=[
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ];


  hintUsed=false;


  hideLine();


  run=true;


  document.getElementById(
    'hintTxt'
  ).textContent=
    'تلميح (1)';


  document.getElementById(
    'hintBtn'
  ).disabled=false;


  draw();

}


function goMenu(){

  run=false;


  hideLine();


  document
    .getElementById('menu')
    .classList.remove('hide');


  document
    .getElementById('end')
    .classList.add('hide');

}


function doHint(){

  if(
    hintUsed ||
    !run
  ){

    return;

  }


  var mv=
    best(
      board.slice(),
      'X',
      'O'
    );


  if(mv!==null){

    var c=
      document.getElementById(
        'c'+mv
      );


    c.style.borderColor=
      '#A78BFA';


    c.style.boxShadow=
      '0 0 24px #A78BFA';


    hintUsed=true;


    document.getElementById(
      'hintTxt'
    ).textContent=
      'تلميح (0)';


    document.getElementById(
      'hintBtn'
    ).disabled=true;


    setTimeout(

      function(){

        c.style.borderColor='';

        c.style.boxShadow='';

      },

      900

    );

  }

}


/*
 * بدء اللعبة
 */
build();

</script>

</body>
</html>`;


    try {

      const unifiedResponse = {

        response_id:
          '2e139bcf-de37-4fad-a30c-01524776e17a',

        /*
         * العرض العادي داخل الرسالة.
         * أبقيناه حتى يكون هناك fallback.
         */
        sections: [

          {

            __typename:
              'GenAIUnifiedResponseSection',

            view_model: {

              __typename:
                'GenAISingleLayoutViewModel',

              primitive: {

                __typename:
                  'GenAIaeacdsnwHtmlPrimitive',

                payload:
                  xoHtml,

                trusted_sources: []

              }

            }

          }

        ],

        /*
         * هذا هو الجزء المهم في التجربة:
         * فتح اللعبة في Embedded Screen
         * بدل حصرها داخل Bubble صغيرة.
         */
        embedded_screens: [

          {

            id:
              'steam-xo-ultra',

            title:
              'اللعبة',

            content: [

              {

                __typename:
                  'FOAEmbeddedScreenContentTabbed',

                tabs: [

                  {

                    id:
                      'xo-game',

                    tab_header:
                      'اللعبة',

                    sections: [

                      {

                        __typename:
                          'GenAIUnifiedResponseSection',

                        view_model: {

                          __typename:
                            'GenAISingleLayoutViewModel',

                          primitive: {

                            __typename:
                              'GenAIaeacdsnwHtmlPrimitive',

                            payload:
                              xoHtml,

                            trusted_sources: []

                          }

                        }

                      }

                    ]

                  }

                ]

              }

            ]

          }

        ]

      };


      await sock.relayMessage(

        message.chatId,

        {

          senderKeyDistributionMessage: {

            groupId:
              message.chatId,

            axolotlSenderKeyDistributionMessage:
              '[STRIPPED 108 bytes]'

          },


          messageContextInfo: {

            deviceListMetadata: {},

            deviceListMetadataVersion: 2,


            botMetadata: {

              messageDisclaimerText:
                '',

              botResponseId:
                '90ab3989-9597-4bde-9593-4786925f1c97',


              verificationMetadata: {

                proofs: [

                  {

                    version:1,

                    useCase:1,

                    signature:
                      '[STRIPPED 88 bytes]',

                    certificateChain: [

                      '[STRIPPED 912 bytes]',

                      '[STRIPPED 1192 bytes]'

                    ]

                  }

                ]

              }

            }

          },


          botForwardedMessage: {

            message: {

              richResponseMessage: {

                messageType:1,


                submessages: [

                  {

                    messageType:2,

                    messageText:
                      '❌⭕ XO ULTRA - NEW NEON'

                  }

                ],


                unifiedResponse: {

                  data:

                    Buffer
                      .from(
                        JSON.stringify(
                          unifiedResponse
                        )
                      )
                      .toString('base64')

                },


                contextInfo: {

                  forwardingScore:1,

                  isForwarded:true,

                  forwardedAiBotMessageInfo: {

                    botJid:
                      '867051314767696@bot'

                  },

                  forwardOrigin:4

                }

              }

            }

          }

        },


        {

          additionalNodes: [

            {

              tag:'biz',

              attrs: {

                actual_actors:'2',

                host_storage:'2',

                privacy_mode_ts:
                  '1788095961'

              },

              content: [

                {

                  tag:'interactive',

                  attrs: {

                    type:
                      'native_flow',

                    v:'1'

                  },

                  content: [

                    {

                      tag:'native_flow',

                      attrs: {

                        v:'9',

                        name:'mixed'

                      }

                    }

                  ]

                }

              ]

            }

          ]

        }

      );


      return true;

    }


    catch(error){

      console.error(
        '[STEAM XO] HTML window failed:',
        error
      );


      return message.reply(

        '❌ تعذر إرسال نافذة XO.\n' +
        'السبب: ' +
        (
          error?.message ||
          error
        )

      );

    }

  }

};