export default {
  name: 'بنج',
  aliases: ['pong'],
  category: 'ألعاب',
  requiredRole: 'user',

  async execute(ctx) {
    const { message, sock } = ctx;

    if (!message?.chatId || !sock) {
      return false;
    }

    await message.react?.('⚙️');

    const pongHtml = `<style>
  :root{
    --bg-0:#05060a;
    --bg-1:#0b0e17;
    --line:#1c2333;
    --p1:#5ee3ff;
    --p2:#ff5e9e;
    --glow-p1:rgba(94,227,255,.65);
    --glow-p2:rgba(255,94,158,.65);
    --ink:#e8ecf5;
    --ink-dim:#7d879e;
  }
  *{box-sizing:border-box; -webkit-tap-highlight-color:transparent; user-select:none;}
  html{margin:0;padding:0;}
  body{
    margin:0;
    padding:0;
    font-family:'Courier New', ui-monospace, monospace;
    color:var(--ink);
    background:transparent;
    touch-action:manipulation;
    display:block;
    width:100%;
    min-height:0;
  }
  .wrap{
    width:100%;
    max-width:740px;
    margin:0 auto;
    padding:8px;
    display:flex;
    flex-direction:column;
    align-items:stretch;
  }
  .cab{position:relative; width:100%; padding:14px; background:linear-gradient(180deg, #10131f, #090b12); border-radius:22px; border:1px solid #232a3d; box-shadow:0 0 0 1px rgba(255,255,255,.02) inset, 0 20px 40px -20px rgba(0,0,0,.8);}
  .top{display:flex; align-items:center; justify-content:space-between; padding:2px 4px 12px; flex-wrap:wrap; gap:8px;}
  .brand{font-size:11px; letter-spacing:3px; color:var(--ink-dim);}
  .brand b{color:var(--ink); letter-spacing:1px;}
  .score-row{display:flex; align-items:center; gap:20px;}
  .score{text-align:center; min-width:48px;}
  .score .tag{font-size:9px; letter-spacing:2px; color:var(--ink-dim); margin-bottom:2px;}
  .score .num{font-size:28px; font-weight:bold; line-height:1; font-variant-numeric:tabular-nums; transition:transform .15s ease;}
  .score.p1 .num{color:var(--p1); text-shadow:0 0 18px var(--glow-p1);}
  .score.p2 .num{color:var(--p2); text-shadow:0 0 18px var(--glow-p2);}
  .score.bump .num{transform:scale(1.3);}
  .divider{color:var(--ink-dim); font-size:18px;}
  .mode-badge{font-size:9px; letter-spacing:2px; color:var(--ink-dim); border:1px solid var(--line); padding:5px 10px; border-radius:20px;}
  .exit-btn{
    font-family:inherit; font-size:9px; letter-spacing:2px;
    background:transparent; color:var(--ink-dim); border:1px solid var(--line);
    padding:6px 12px; border-radius:20px; cursor:pointer; transition:.15s ease;
    display:inline-flex; align-items:center; gap:6px;
  }
  .exit-btn .icon{display:inline-flex; align-items:center; justify-content:center; width:13px; height:13px;}
  .exit-btn .icon svg{display:block;}
  .exit-btn:hover{color:#ff8080; border-color:#ff8080;}

  /* stage-wrap ياخد الارتفاع الطبيعي من المحتوى اللي جواه فقط */
  .stage-wrap{position:relative; width:100%;}
  canvas{display:block; width:100%; height:auto; border-radius:12px; border:1px solid var(--line);}
  canvas.hide{display:none!important;}

  /* القوائم بقت في التدفق الطبيعي - مفيش position:absolute */
  .overlay{
    position:relative;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:flex-start;
    gap:10px;
    background:rgba(5,6,10,.9);
    backdrop-filter:blur(6px);
    -webkit-backdrop-filter:blur(6px);
    border-radius:12px;
    border:1px solid var(--line);
    padding:22px 16px;
    text-align:center;
    width:100%;
    box-sizing:border-box;
    animation:fadeIn .25s ease;
  }
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  .overlay.hide{display:none!important;}
  .overlay h1{margin:0; font-size:clamp(22px,6vw,34px); letter-spacing:5px; color:var(--ink); text-shadow:0 0 24px rgba(255,255,255,.15);}
  .overlay h1 span{color:var(--p1); text-shadow:0 0 20px var(--glow-p1);}
  .overlay h2{margin:0; font-size:13px; letter-spacing:3px; color:var(--ink-dim);}
  .result{font-size:13px; letter-spacing:2px; margin-bottom:-4px;}
  .result.win{color:var(--p1); text-shadow:0 0 16px var(--glow-p1);}
  .result.lose{color:var(--p2); text-shadow:0 0 16px var(--glow-p2);}

  /* شاشة الإيقاف بس تفضل فوق الكانفاس عشان تبان محاطة باللعبة */
  #pauseScreen{
    position:absolute;
    inset:0;
    background:rgba(5,6,10,.85);
    border:none;
  }

  .row{display:flex; gap:8px; flex-wrap:wrap; justify-content:center;}
  .row .lbl{width:100%; font-size:9px; letter-spacing:2px; color:var(--ink-dim); margin-top:4px;}
  .chip{font-family:inherit; font-size:10px; letter-spacing:2px; padding:7px 13px; border-radius:20px; background:transparent; color:var(--ink-dim); border:1px solid var(--line); cursor:pointer; transition:.15s ease;}
  .chip.active{color:var(--bg-0); background:var(--ink); border-color:var(--ink);}

  .theme-grid{display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-top:2px;}
  .theme-card{
    width:110px; padding:8px; border-radius:12px; cursor:pointer;
    border:1px solid var(--line); background:rgba(255,255,255,.02);
    transition:.15s ease; display:flex; flex-direction:column; align-items:center; gap:6px;
  }
  .theme-card.active{border-color:var(--p1); box-shadow:0 0 18px var(--glow-p1);}
  .theme-card canvas{width:100%; height:54px; border-radius:8px; display:block; border:none;}
  .theme-card .name{font-size:9px; letter-spacing:1.5px; color:var(--ink-dim);}
  .theme-card.active .name{color:var(--ink);}

  .btn{margin-top:6px; padding:11px 26px; font-family:inherit; font-size:12px; letter-spacing:3px; color:var(--bg-0); background:var(--p1); border:none; border-radius:8px; cursor:pointer; box-shadow:0 0 22px var(--glow-p1); transition:transform .12s ease;}
  .btn:active{transform:scale(.95);}
  .btn.ghost{background:transparent; color:var(--ink-dim); border:1px solid var(--line); box-shadow:none;}
  .btn-row{display:flex; gap:10px; flex-wrap:wrap; justify-content:center;}

  .bottom{display:flex; align-items:center; justify-content:space-between; padding:10px 4px 2px; font-size:9px; letter-spacing:1.2px; color:var(--ink-dim); flex-wrap:wrap; gap:6px;}
  .hint{display:flex; align-items:center; gap:6px;}
  .dot{width:6px; height:6px; border-radius:50%; background:var(--p1); box-shadow:0 0 8px var(--glow-p1);}
  .dot.pink{background:var(--p2); box-shadow:0 0 8px var(--glow-p2);}

  .control-buttons-wrap{
    margin-top:10px;
    display:none;
    gap:12px;
    justify-content:center;
    width:100%;
  }
  .control-buttons-wrap.visible{display:flex;}
  .ctrl-btn{
    flex:1;
    padding:14px 0;
    font-family:inherit;
    font-size:15px;
    font-weight:bold;
    letter-spacing:2px;
    color:var(--ink);
    background:linear-gradient(180deg, #101625, #090b12);
    border:1px solid var(--line);
    border-radius:12px;
    cursor:pointer;
    user-select:none;
    touch-action:none;
    box-shadow:0 4px 12px rgba(0,0,0,.4);
    transition:background .1s, transform .1s, border-color .1s, box-shadow .1s;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:8px;
  }
  .ctrl-btn:active, .ctrl-btn.active{
    background:linear-gradient(180deg, var(--p1), #3aa8c9);
    color:var(--bg-0);
    border-color:var(--p1);
    box-shadow:0 0 20px var(--glow-p1);
    transform:scale(0.97);
  }

  @media (prefers-reduced-motion: reduce){ *{transition:none !important;} }

  @media (max-width: 480px){
    .cab{padding:12px;}
    .overlay{gap:9px; padding:18px 12px;}
    .overlay h1{font-size:24px; letter-spacing:3px;}
    .overlay h2{font-size:12px;}
    .row{gap:6px;}
    .row .lbl{font-size:8px; margin-top:2px;}
    .chip{padding:7px 11px; font-size:9px;}
    .theme-grid{gap:8px;}
    .theme-card{width:86px; padding:6px; gap:5px;}
    .theme-card canvas{height:42px;}
    .btn{padding:11px 22px; margin-top:4px; font-size:11px; letter-spacing:2px;}
    .ctrl-btn{padding:16px 0; font-size:16px;}
    .bottom{font-size:8px; padding:8px 2px 2px;}
  }
</style>
<body>
<div class="wrap">

<div class="cab">
  <div class="top">
    <div class="brand">HIURA <b>ARCADE PRO</b></div>
    <div class="score-row">
      <div class="score p1"><div class="tag" id="tagP1">أنت</div><div class="num" id="s1">0</div></div>
      <div class="divider">:</div>
      <div class="score p2"><div class="tag" id="tagP2">CPU</div><div class="num" id="s2">0</div></div>
    </div>
    <div style="display:flex; align-items:center; gap:8px;">
      <div class="mode-badge" id="modeBadge">1P · عادي</div>
      <button class="exit-btn" id="muteBtn" aria-label="كتم الصوت">
        <span class="icon" id="muteIcon"></span>
      </button>
      <button class="exit-btn" id="exitBtn" aria-label="خروج">
        <span class="icon">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 5 L19 19 M19 5 L5 19"/></svg>
        </span>
        <span>خروج</span>
      </button>
    </div>
  </div>

  <div class="stage-wrap" id="stageWrap">
    <canvas id="game" width="700" height="420"></canvas>

    <div class="overlay" id="menuScreen">
      <h1>P<span>O</span>NG <span style="font-size:.5em; color:var(--ink-dim); letter-spacing:2px;">PRO</span></h1>

      <div class="row" id="diffRow">
        <div class="lbl">الصعوبة</div>
        <button class="chip diff-btn" data-d="easy">سهل</button>
        <button class="chip diff-btn active" data-d="normal">عادي</button>
        <button class="chip diff-btn" data-d="hard">صعب</button>
        <button class="chip diff-btn" data-d="insane">جنوني</button>
      </div>
      <div class="row">
        <div class="lbl">باور-أبس</div>
        <button class="chip pw-btn active" data-p="on">مفعّلة</button>
        <button class="chip pw-btn" data-p="off">متوقفة</button>
      </div>

      <button class="btn" id="toThemeBtn">التالي: اختر الخلفية</button>
    </div>

    <div class="overlay hide" id="themeScreen">
      <h2>اختر خلفية الملعب</h2>
      <div class="theme-grid" id="themeGrid"></div>
      <div class="btn-row">
        <button class="btn ghost" id="backToMenuBtn">رجوع</button>
        <button class="btn" id="startBtn">ابدأ اللعب</button>
      </div>
    </div>

    <div class="overlay hide" id="endScreen">
      <div class="result" id="resultText">فزت!</div>
      <h1 id="endTitle">GAME OVER</h1>
      <div class="btn-row">
        <button class="btn ghost" id="exitToMenuBtn">القائمة الرئيسية</button>
        <button class="btn" id="restartBtn">إعادة</button>
      </div>
    </div>

    <div class="overlay hide" id="pauseScreen">
      <h1>PAUSE</h1>
      <div class="btn-row">
        <button class="btn ghost" id="pauseExitBtn">القائمة الرئيسية</button>
        <button class="btn" id="resumeBtn">استكمال</button>
      </div>
    </div>
  </div>

  <div class="control-buttons-wrap" id="controlBarWrap">
    <button class="ctrl-btn" id="btnUp">▲ أعلى</button>
    <button class="ctrl-btn" id="btnDown">▼ أسفل</button>
  </div>

  <div class="bottom">
    <div class="hint"><span class="dot"></span> <span id="p1Hint">استخدم الأزرار بالأسفل</span></div>
    <div>أول وصول لـ 7 نقاط يفوز · Space = إيقاف مؤقت</div>
    <div class="hint" id="p2HintWrap"><span id="p2Hint">CPU</span> <span class="dot pink"></span></div>
  </div>
</div>

<script>
(function(){
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const s1El = document.getElementById('s1');
  const s2El = document.getElementById('s2');
  const tagP2 = document.getElementById('tagP2');
  const p2Hint = document.getElementById('p2Hint');
  const modeBadge = document.getElementById('modeBadge');

  const menuScreen = document.getElementById('menuScreen');
  const themeScreen = document.getElementById('themeScreen');
  const endScreen = document.getElementById('endScreen');
  const pauseScreen = document.getElementById('pauseScreen');

  const toThemeBtn = document.getElementById('toThemeBtn');
  const backToMenuBtn = document.getElementById('backToMenuBtn');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const exitBtn = document.getElementById('exitBtn');
  const muteBtn = document.getElementById('muteBtn');
  const muteIcon = document.getElementById('muteIcon');
  const ICON_SOUND_ON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4h4l5 4V6l-5 4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
  const ICON_SOUND_OFF = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4h4l5 4V6l-5 4H4z"/><path d="M16 9l5 6M21 9l-5 6"/></svg>';
  muteIcon.innerHTML = ICON_SOUND_ON;
  const exitToMenuBtn = document.getElementById('exitToMenuBtn');
  const pauseExitBtn = document.getElementById('pauseExitBtn');
  const resultText = document.getElementById('resultText');
  const endTitle = document.getElementById('endTitle');
  const themeGrid = document.getElementById('themeGrid');

  const diffBtns = document.querySelectorAll('.diff-btn');
  const pwBtns = document.querySelectorAll('.pw-btn');

  const controlBarWrap = document.getElementById('controlBarWrap');
  const btnUp = document.getElementById('btnUp');
  const btnDown = document.getElementById('btnDown');

  const WIN_SCORE = 7;
  const PADDLE_W = 12, PADDLE_H = 82;
  const BASE_BALL_R = 7;
  const FRICTION_WALL = 0.985;
  const MAX_SPEED = 13;

  let difficulty = 'normal';
  let powerupsOn = true;
  let theme = 'space';

  const diffSettings = {
    easy:   { cpuSpeed: 3.4, cpuReact: 0.09, ballSpeed: 4.2, errorMargin: 26 },
    normal: { cpuSpeed: 4.6, cpuReact: 0.15, ballSpeed: 5.0, errorMargin: 16 },
    hard:   { cpuSpeed: 6.2, cpuReact: 0.24, ballSpeed: 5.8, errorMargin: 8  },
    insane: { cpuSpeed: 8.2, cpuReact: 0.38, ballSpeed: 6.6, errorMargin: 2  }
  };

  const themes = {
    space: {
      name: 'الفضاء العميق',
      stars: Array.from({length:70}, ()=>({x:Math.random(), y:Math.random(), r:Math.random()*1.6+0.3, tw:Math.random()*Math.PI*2})),
      draw(c, w, h, t){
        const g = c.createLinearGradient(0,0,0,h);
        g.addColorStop(0,'#0b0e1c'); g.addColorStop(1,'#05060a');
        ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
        this.stars.forEach(s=>{
          const alpha = 0.4 + 0.6*Math.sin(t*0.002 + s.tw);
          ctx.save(); ctx.globalAlpha = Math.max(alpha,0.1);
          ctx.fillStyle = '#cfe6ff';
          ctx.beginPath(); ctx.arc(s.x*w, s.y*h, s.r, 0, 7); ctx.fill();
          ctx.restore();
        });
      }
    },
    grid: {
      name: 'شبكة نيون',
      draw(c, w, h, t){
        ctx.fillStyle = '#0a0714'; ctx.fillRect(0,0,w,h);
        const spacing = 34;
        const offset = (t*0.02) % spacing;
        ctx.save();
        ctx.strokeStyle = 'rgba(94,227,255,0.10)';
        ctx.lineWidth = 1;
        for(let x=-spacing; x<w+spacing; x+=spacing){
          ctx.beginPath(); ctx.moveTo(x+offset, 0); ctx.lineTo(x+offset, h); ctx.stroke();
        }
        for(let y=-spacing; y<h+spacing; y+=spacing){
          ctx.beginPath(); ctx.moveTo(0, y+offset*0.4); ctx.lineTo(w, y+offset*0.4); ctx.stroke();
        }
        ctx.restore();
      }
    },
    sunset: {
      name: 'غروب',
      draw(c, w, h, t){
        const g = c.createLinearGradient(0,0,0,h);
        g.addColorStop(0,'#1a0e2e'); g.addColorStop(0.55,'#3a1b3f'); g.addColorStop(1,'#0c0812');
        ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#ff9e5e';
        ctx.beginPath(); ctx.arc(w/2, h*0.85, 60, 0, Math.PI*2); ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = 'rgba(255,158,94,0.15)'; ctx.lineWidth = 1.5;
        for(let y = h*0.4; y < h; y += 14){
          ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
        }
        ctx.restore();
      }
    },
    matrix: {
      name: 'ماتريكس',
      cols: null,
      draw(c, w, h, t){
        ctx.fillStyle = '#050a06'; ctx.fillRect(0,0,w,h);
        if(!this.cols){
          this.cols = Array.from({length: Math.floor(w/16)}, ()=>({y: Math.random()*h, speed: 1+Math.random()*2}));
        }
        ctx.save();
        ctx.fillStyle = 'rgba(94,255,150,0.5)';
        ctx.font = '12px monospace';
        this.cols.forEach((col, i)=>{
          col.y += col.speed;
          if(col.y > h) col.y = -20;
          const ch = String.fromCharCode(0x30A0 + Math.random()*96);
          ctx.fillText(ch, i*16, col.y);
        });
        ctx.restore();
      }
    }
  };

  Object.keys(themes).forEach(key=>{
    const card = document.createElement('div');
    card.className = 'theme-card' + (key===theme ? ' active' : '');
    card.dataset.theme = key;
    const mini = document.createElement('canvas');
    mini.width = 200; mini.height = 100;
    const label = document.createElement('div');
    label.className = 'name';
    label.textContent = themes[key].name;
    card.appendChild(mini);
    card.appendChild(label);
    themeGrid.appendChild(card);
    themes[key]._preview = mini;
    const mctx = mini.getContext('2d');
    themes[key].draw(mctx, mini.width, mini.height, 0);

    card.addEventListener('click', ()=>{
      document.querySelectorAll('.theme-card').forEach(c=>c.classList.remove('active'));
      card.classList.add('active');
      theme = key;
    });
  });

  diffBtns.forEach(b=>b.addEventListener('click', ()=>{
    diffBtns.forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    difficulty = b.dataset.d;
  }));
  pwBtns.forEach(b=>b.addEventListener('click', ()=>{
    pwBtns.forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    powerupsOn = b.dataset.p === 'on';
  }));

  toThemeBtn.addEventListener('click', ()=>{
    menuScreen.classList.add('hide');
    themeScreen.classList.remove('hide');
  });
  backToMenuBtn.addEventListener('click', ()=>{
    themeScreen.classList.add('hide');
    menuScreen.classList.remove('hide');
  });

  let p1 = { x: 20, y: H/2 - PADDLE_H/2, vy: 0, h: PADDLE_H, boostUntil:0 };
  let p2 = { x: W - 20 - PADDLE_W, y: H/2 - PADDLE_H/2, vy: 0, h: PADDLE_H, boostUntil:0 };
  let ball = { x: W/2, y: H/2, vx: 0, vy: 0, speed: 5, r: BASE_BALL_R, spin: 0 };
  let score1 = 0, score2 = 0;
  let running = false, paused = false;
  let particles = [];
  let trail = [];
  let shake = 0;

  let powerup = null;
  let powerupTimer = 0;
  const POWERUP_TYPES = ['grow', 'shrink_enemy', 'slow', 'multiball'];
  let extraBalls = [];

  let audioCtx = null;
  let muted = false;
  muteBtn.addEventListener('click', ()=>{
    muted = !muted;
    muteIcon.innerHTML = muted ? ICON_SOUND_OFF : ICON_SOUND_ON;
  });
  function ensureAudio(){
    if(!audioCtx){
      try{ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){}
    } else if(audioCtx.state === 'suspended'){
      audioCtx.resume();
    }
  }
  function tone(freq, dur, type, gain, glideTo){
    if(!audioCtx || muted) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type || 'square';
    o.frequency.value = freq;
    if(glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, audioCtx.currentTime + dur);
    g.gain.value = gain || 0.05;
    o.connect(g); g.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    g.gain.setValueAtTime(g.gain.value, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    o.start(now); o.stop(now + dur);
  }
  function noiseBurst(dur, gain){
    if(!audioCtx || muted) return;
    const bufferSize = audioCtx.sampleRate * dur;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<bufferSize;i++){ data[i] = (Math.random()*2-1) * (1 - i/bufferSize); }
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    const g = audioCtx.createGain();
    g.gain.value = gain || 0.05;
    src.connect(g); g.connect(audioCtx.destination);
    src.start();
  }
  const sfx = {
    hit: (speedFactor)=>tone(260 + speedFactor*40, 0.09, 'square', 0.06),
    wall: ()=>tone(200, 0.06, 'triangle', 0.045),
    score: ()=>tone(180,0.22,'sawtooth',0.06,90),
    win: ()=>{ tone(440,0.12,'square',0.06); setTimeout(()=>tone(660,0.18,'square',0.06),120); setTimeout(()=>tone(880,0.22,'square',0.06),260); },
    lose: ()=>{ tone(300,0.15,'sawtooth',0.05,120); setTimeout(()=>tone(180,0.3,'sawtooth',0.05,80),150); },
    powerup: ()=>tone(500,0.08,'sine',0.05,900),
    powerdown: ()=>tone(400,0.1,'sine',0.04,150),
    tick: ()=>tone(700,0.05,'sine',0.04),
    click: ()=>noiseBurst(0.02, 0.01)
  };

  let serveTimer = 0, pendingVX = 0, pendingVY = 0;
  const SERVE_FRAMES = 150;

  function resetBall(dir){
    ball.x = W/2; ball.y = H/2;
    ball.r = BASE_BALL_R;
    const angle = (Math.random() * 0.6 - 0.3);
    const s = diffSettings[difficulty].ballSpeed;
    ball.speed = s;
    pendingVX = Math.cos(angle) * s * (dir || (Math.random()>0.5?1:-1));
    pendingVY = Math.sin(angle) * s;
    ball.vx = 0; ball.vy = 0;
    ball.spin = 0;
    trail = [];
    extraBalls = [];
    serveTimer = SERVE_FRAMES;
  }

  function resetGame(){
    score1 = 0; score2 = 0;
    s1El.textContent = 0; s2El.textContent = 0;
    p1.y = H/2 - PADDLE_H/2; p1.h = PADDLE_H; p1.vy = 0;
    p2.y = H/2 - PADDLE_H/2; p2.h = PADDLE_H; p2.vy = 0;
    particles = [];
    powerup = null; powerupTimer = 180 + Math.random()*180;
    tagP2.textContent = 'CPU';
    p2Hint.textContent = 'CPU';
    modeBadge.textContent = '1P · ' + ({easy:'سهل',normal:'عادي',hard:'صعب',insane:'جنوني'}[difficulty]);
    moveUp = false; moveDown = false;
    resetBall();
  }

  function spawnParticles(x, y, color, n, spread){
    for(let i=0;i<n;i++){
      const a = Math.random()*Math.PI*2;
      const sp = (1 + Math.random()*3) * (spread||1);
      particles.push({ x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, life: 1, color, size: 1.5+Math.random()*2 });
    }
  }
  function bumpScore(el){
    el.parentElement.classList.remove('bump');
    void el.parentElement.offsetWidth;
    el.parentElement.classList.add('bump');
  }

  // إظهار/إخفاء الكانفاس حسب القوائم المفتوحة
  // لو أي قائمة من (menu/theme/end) مفتوحة → نخفي الكانفاس
  // شاشة الإيقاف (pause) تفضل فوق الكانفاس (absolute)
  function syncCanvasVisibility(){
    const blockCanvas =
      !menuScreen.classList.contains('hide') ||
      !themeScreen.classList.contains('hide') ||
      !endScreen.classList.contains('hide');
    canvas.classList.toggle('hide', blockCanvas);
  }

  let moveUp = false;
  let moveDown = false;
  const PADDLE_SPEED = 7.5;

  function bindBtn(btn, setMove) {
    btn.addEventListener('touchstart', e => {
      e.preventDefault();
      ensureAudio();
      setMove(true);
      btn.classList.add('active');
    }, { passive: false });

    btn.addEventListener('touchend', e => {
      e.preventDefault();
      setMove(false);
      btn.classList.remove('active');
    }, { passive: false });

    btn.addEventListener('touchcancel', e => {
      e.preventDefault();
      setMove(false);
      btn.classList.remove('active');
    }, { passive: false });

    btn.addEventListener('mousedown', e => {
      ensureAudio();
      setMove(true);
      btn.classList.add('active');
    });

    btn.addEventListener('mouseup', e => {
      setMove(false);
      btn.classList.remove('active');
    });

    btn.addEventListener('mouseleave', e => {
      setMove(false);
      btn.classList.remove('active');
    });
  }

  bindBtn(btnUp, val => moveUp = val);
  bindBtn(btnDown, val => moveDown = val);

  window.addEventListener('keydown', e => {
    if(e.code === 'ArrowUp' || e.code === 'KeyW'){ moveUp = true; btnUp.classList.add('active'); }
    if(e.code === 'ArrowDown' || e.code === 'KeyS'){ moveDown = true; btnDown.classList.add('active'); }
    if(e.code === 'Space'){ e.preventDefault(); if(running) togglePause(); }
    if(e.code === 'Escape'){ if(running) goToMenu(); }
  });

  window.addEventListener('keyup', e => {
    if(e.code === 'ArrowUp' || e.code === 'KeyW'){ moveUp = false; btnUp.classList.remove('active'); }
    if(e.code === 'ArrowDown' || e.code === 'KeyS'){ moveDown = false; btnDown.classList.remove('active'); }
  });

  function applyButtonControls(){
    p1.vy = 0;
    if(moveUp){
      p1.y -= PADDLE_SPEED;
      p1.vy = -PADDLE_SPEED;
    }
    if(moveDown){
      p1.y += PADDLE_SPEED;
      p1.vy = PADDLE_SPEED;
    }
    p1.y = Math.max(6, Math.min(H - p1.h - 6, p1.y));
  }

  function roundRect(x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }
  function drawNet(){
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.setLineDash([6, 10]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H); ctx.stroke();
    ctx.restore();
  }
  function drawPaddle(p, color){
    ctx.save();
    ctx.shadowColor = color; ctx.shadowBlur = 18;
    ctx.fillStyle = color;
    roundRect(p.x, p.y, PADDLE_W, p.h, 5);
    ctx.fill();
    ctx.restore();
  }
  function drawBallObj(b){
    trail.push({x:b.x, y:b.y, r:b.r});
    if(trail.length > 9) trail.shift();
    trail.forEach((t, i)=>{
      const a = (i+1)/trail.length;
      ctx.save(); ctx.globalAlpha = a * 0.3; ctx.fillStyle = '#ffe45e';
      ctx.beginPath(); ctx.arc(t.x, t.y, t.r * a, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    });
    ctx.save();
    ctx.shadowColor = 'rgba(255,228,94,0.85)'; ctx.shadowBlur = 22;
    ctx.fillStyle = '#ffe45e';
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
  function drawParticles(){
    particles.forEach(p=>{
      ctx.save(); ctx.globalAlpha = Math.max(p.life, 0); ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    });
  }
  function drawPowerup(){
    if(!powerup) return;
    const colors = { grow:'#7bffb0', shrink_enemy:'#ff9e5e', slow:'#c39bff', multiball:'#ffe45e' };
    const c = colors[powerup.type];
    ctx.save();
    ctx.translate(powerup.x, powerup.y);
    ctx.rotate(Date.now()/400);
    ctx.shadowColor = c; ctx.shadowBlur = 16;
    ctx.strokeStyle = c; ctx.lineWidth = 2.5;
    ctx.beginPath();
    for(let i=0;i<6;i++){
      const a = i/6*Math.PI*2;
      const px = Math.cos(a)*11, py = Math.sin(a)*11;
      i===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py);
    }
    ctx.closePath(); ctx.stroke();
    ctx.restore();
  }

  function updateParticles(){
    particles.forEach(p=>{
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.94; p.vy *= 0.94;
      p.life -= 0.035;
    });
    particles = particles.filter(p=>p.life>0);
  }
  function aiMove(){
    const cfg = diffSettings[difficulty];
    const targetCenter = p2.y + p2.h/2;
    const ballAhead = ball.vx > 0;
    let target;
    if(ballAhead){
      target = ball.y + (Math.random()*2-1) * cfg.errorMargin;
    } else {
      target = H/2 + (ball.y - H/2) * 0.2;
    }
    const diff = target - targetCenter;
    const move = diff * cfg.cpuReact;
    const clamped = Math.max(-cfg.cpuSpeed, Math.min(cfg.cpuSpeed, move));
    p2.y += clamped;
    p2.y = Math.max(6, Math.min(H - p2.h - 6, p2.y));
    p2.vy = clamped;
  }
  function checkPaddleCollision(p, b, isLeft){
    const withinY = b.y + b.r > p.y && b.y - b.r < p.y + p.h;
    const withinX = isLeft
      ? (b.x - b.r < p.x + PADDLE_W && b.x - b.r > p.x - 4)
      : (b.x + b.r > p.x && b.x + b.r < p.x + PADDLE_W + 4);
    return withinY && withinX;
  }
  function reflectOffPaddle(p, b, isLeft){
    const rel = (b.y - (p.y + p.h/2)) / (p.h/2);
    const maxAngle = Math.PI/3.4;
    const angle = isLeft ? rel*maxAngle : Math.PI - rel*maxAngle;
    b.speed = Math.min(b.speed + 0.3, MAX_SPEED);
    const spinTransfer = (isLeft ? p1.vy : p2.vy) * 0.06;
    b.vx = Math.cos(angle) * b.speed;
    b.vy = Math.sin(angle) * b.speed + spinTransfer;
    b.spin = spinTransfer;
  }
  function moveBall(b, isMainBall){
    b.vy += b.spin * 0.02;
    b.spin *= 0.98;
    b.x += b.vx; b.y += b.vy;

    if(b.y - b.r < 0){
      b.y = b.r; b.vy = -b.vy * FRICTION_WALL;
      spawnParticles(b.x, 0, '#5ee3ff', 6); sfx.wall();
    } else if(b.y + b.r > H){
      b.y = H - b.r; b.vy = -b.vy * FRICTION_WALL;
      spawnParticles(b.x, H, '#5ee3ff', 6); sfx.wall();
    }
    if(b.vx < 0 && checkPaddleCollision(p1, b, true)){
      b.x = p1.x + PADDLE_W + b.r;
      reflectOffPaddle(p1, b, true);
      spawnParticles(b.x, b.y, '#5ee3ff', 10); sfx.hit(b.speed); shake = 4;
    }
    if(b.vx > 0 && checkPaddleCollision(p2, b, false)){
      b.x = p2.x - b.r;
      reflectOffPaddle(p2, b, false);
      spawnParticles(b.x, b.y, '#ff5e9e', 10); sfx.hit(b.speed); shake = 4;
    }
    if(powerupsOn && powerup){
      const dx = b.x - powerup.x, dy = b.y - powerup.y;
      if(Math.sqrt(dx*dx+dy*dy) < b.r + 12){
        applyPowerup(powerup.type, b.vx < 0 ? 'p1' : 'p2');
        powerup = null;
        powerupTimer = 260 + Math.random()*220;
      }
    }
    if(b.x < -30){
      if(isMainBall){ score2++; onScore('p2'); }
      return 'out-left';
    } else if(b.x > W + 30){
      if(isMainBall){ score1++; onScore('p1'); }
      return 'out-right';
    }
    return null;
  }
  function applyPowerup(type, forWho){
    sfx.powerup();
    if(type === 'grow'){
      const target = forWho === 'p1' ? p1 : p2;
      target.h = PADDLE_H * 1.5; target.boostUntil = Date.now() + 6000;
    } else if(type === 'shrink_enemy'){
      const target = forWho === 'p1' ? p2 : p1;
      target.h = PADDLE_H * 0.6; target.boostUntil = Date.now() + 6000;
    } else if(type === 'slow'){
      ball.speed = Math.max(3, ball.speed * 0.6);
      const s = Math.hypot(ball.vx, ball.vy) || 1;
      ball.vx = ball.vx/s*ball.speed; ball.vy = ball.vy/s*ball.speed;
    } else if(type === 'multiball'){
      extraBalls.push({
        x: ball.x, y: ball.y,
        vx: -ball.vx*0.9 + (Math.random()*2-1),
        vy: ball.vy*0.9 + (Math.random()*2-1),
        speed: ball.speed, r: BASE_BALL_R*0.85, spin:0
      });
    }
  }
  function checkPaddleTimers(){
    const now = Date.now();
    if(p1.boostUntil && now > p1.boostUntil){ p1.h = PADDLE_H; p1.boostUntil = 0; sfx.powerdown(); }
    if(p2.boostUntil && now > p2.boostUntil){ p2.h = PADDLE_H; p2.boostUntil = 0; sfx.powerdown(); }
  }
  function onScore(who){
    const el = who === 'p1' ? s1El : s2El;
    el.textContent = who === 'p1' ? score1 : score2;
    bumpScore(el);
    spawnParticles(who==='p1' ? W-20 : 20, ball.y, who==='p1' ? '#5ee3ff' : '#ff5e9e', 22, 1.4);
    sfx.score();
    if(score1 >= WIN_SCORE){ endGame(true); return; }
    if(score2 >= WIN_SCORE){ endGame(false); return; }
    resetBall(who === 'p1' ? -1 : 1);
  }
  function updatePowerupSpawn(){
    if(!powerupsOn || powerup) return;
    powerupTimer--;
    if(powerupTimer <= 0){
      powerup = {
        x: W*0.3 + Math.random()*W*0.4,
        y: 40 + Math.random()*(H-80),
        type: POWERUP_TYPES[Math.floor(Math.random()*POWERUP_TYPES.length)]
      };
    }
  }

  function update(){
    if(shake > 0) shake *= 0.85;
    updateParticles();

    if(!running || paused) return;

    applyButtonControls();
    aiMove();
    checkPaddleTimers();
    updatePowerupSpawn();
    if(serveTimer > 0){
      serveTimer--;
      if(serveTimer % 50 === 0) sfx.tick();
      if(serveTimer <= 0){ ball.vx = pendingVX; ball.vy = pendingVY; }
    } else {
      moveBall(ball, true);
      extraBalls.forEach(b=> moveBall(b, false));
      extraBalls = extraBalls.filter(b => b.x > -40 && b.x < W+40);
    }
  }

  function drawServeCountdown(){
    if(serveTimer <= 0) return;
    const n = Math.max(1, Math.ceil(serveTimer / 50));
    const progress = (serveTimer % 50) / 50;
    ctx.save();
    ctx.globalAlpha = 0.85 * (1 - progress * 0.3);
    ctx.font = 'bold 46px Courier New, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(255,255,255,.55)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#e8ecf5';
    ctx.fillText(String(n), W/2, H/2 - 34);
    ctx.restore();
  }

  function render(t){
    ctx.save();
    if(shake > 0.2){ ctx.translate((Math.random()-0.5)*shake, (Math.random()-0.5)*shake); }
    themes[theme].draw(ctx, W, H, t);
    drawNet();
    drawPowerup();
    drawPaddle(p1, '#5ee3ff');
    drawPaddle(p2, '#ff5e9e');
    drawParticles();
    drawBallObj(ball);
    extraBalls.forEach(drawBallObj);
    drawServeCountdown();
    ctx.restore();
  }

  function loop(t){
    syncCanvasVisibility();
    update();
    render(t || 0);
    requestAnimationFrame(loop);
  }

  function endGame(p1Won){
    running = false;
    resultText.textContent = p1Won ? 'انتصار' : 'خسارة';
    resultText.className = 'result ' + (p1Won ? 'win' : 'lose');
    endTitle.textContent = p1Won ? 'YOU WIN' : 'GAME OVER';
    endScreen.classList.remove('hide');
    controlBarWrap.classList.remove('visible');
    p1Won ? sfx.win() : sfx.lose();
    if(p1Won){
      const confettiColors = ['#5ee3ff','#ffe45e','#7bffb0','#ff5e9e','#c39bff'];
      for(let i=0;i<5;i++){
        spawnParticles(W*0.15 + Math.random()*W*0.7, H*0.2 + Math.random()*H*0.4,
          confettiColors[i % confettiColors.length], 14, 2.2);
      }
    }
  }

  function togglePause(){
    paused = !paused;
    pauseScreen.classList.toggle('hide', !paused);
  }

  function goToMenu(){
    sfx.click();
    running = false; paused = false;
    endScreen.classList.add('hide');
    pauseScreen.classList.add('hide');
    themeScreen.classList.add('hide');
    menuScreen.classList.remove('hide');
    controlBarWrap.classList.remove('visible');
  }

  startBtn.addEventListener('click', ()=>{
    ensureAudio();
    resetGame();
    themeScreen.classList.add('hide');
    running = true; paused = false;
    controlBarWrap.classList.add('visible');
  });
  restartBtn.addEventListener('click', ()=>{
    ensureAudio();
    resetGame();
    endScreen.classList.add('hide');
    running = true; paused = false;
    controlBarWrap.classList.add('visible');
  });
  resumeBtn.addEventListener('click', togglePause);
  exitBtn.addEventListener('click', goToMenu);
  exitToMenuBtn.addEventListener('click', goToMenu);
  pauseExitBtn.addEventListener('click', goToMenu);

  resetBall();
  render(0);
  loop();
})();
</script>
</div>
</body>`;

    const unifiedResponse = {
      response_id: '2e139bcf-de37-4fad-a30c-01524776e17a',
      sections: [
        {
          __typename: 'GenAIUnifiedResponseSection',
          view_model: {
            __typename: 'GenAISingleLayoutViewModel',
            primitive: {
              __typename: 'GenAIaeacdsnwHtmlPrimitive',
              payload: pongHtml,
              trusted_sources: ['nixel.dev', 'kangwifi.eu.org']
            }
          }
        }
      ],
      embedded_screens: [
        {
          id: 'steam-pong-ultra',
          title: 'اللعبة',
          content: [
            {
              __typename: 'FOAEmbeddedScreenContentTabbed',
              tabs: [
                {
                  id: 'pong-game',
                  tab_header: 'اللعبة',
                  sections: [
                    {
                      __typename: 'GenAIUnifiedResponseSection',
                      view_model: {
                        __typename: 'GenAISingleLayoutViewModel',
                        primitive: {
                          __typename: 'GenAIaeacdsnwHtmlPrimitive',
                          payload: pongHtml,
                          trusted_sources: ['nixel.dev', 'kangwifi.eu.org']
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

    try {
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
                proofs: [
                  {
                    version: 1,
                    useCase: 1,
                    signature: '[STRIPPED 88 bytes]',
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
                messageType: 1,
                submessages: [
                  {
                    messageType: 2,
                    messageText: '🏓 PONG PRO — أزرار التحكم'
                  }
                ],
                unifiedResponse: {
                  data: Buffer.from(JSON.stringify(unifiedResponse)).toString('base64')
                },
                contextInfo: {
                  forwardingScore: 1,
                  isForwarded: true,
                  forwardedAiBotMessageInfo: {
                    botJid: '867051314767696@bot'
                  },
                  forwardOrigin: 4
                }
              }
            }
          }
        },
        {
          additionalNodes: [
            {
              tag: 'biz',
              attrs: {
                actual_actors: '2',
                host_storage: '2',
                privacy_mode_ts: '1788095961'
              },
              content: [
                {
                  tag: 'interactive',
                  attrs: {
                    type: 'native_flow',
                    v: '1'
                  },
                  content: [
                    {
                      tag: 'native_flow',
                      attrs: {
                        v: '9',
                        name: 'mixed'
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
    } catch (error) {
      console.error('[STEAM PONG] HTML window failed:', error);
      try {
        return await message.reply(
          '❌ تعذر إرسال نافذة البنج.\n' +
          'السبب: ' + (error?.message || error)
        );
      } catch {
        return false;
      }
    }
  }
};
