export default {
  name: 'اركيد',
  aliases: ['arcade', 'drive', 'سيبر'],
  category: 'ألعاب',
  requiredRole: 'user',

  async execute(ctx) {
    const { message, sock } = ctx;

    if (!message?.chatId || !sock) {
      return false;
    }

    await message.react?.('🏎️');

    const arcadeHtml = `<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;-webkit-tap-highlight-color:transparent;user-select:none}
html,body{width:100%;background:transparent;color:#e0e7ff;padding:8px;overflow-y:auto}
#app{max-width:420px;margin:0 auto}
.hdr{display:flex;flex-direction:column;align-items:center;gap:8px;padding:2px 2px 10px;width:100%}
.tt{font:900 18px 'Arial Black';color:#5eead4;text-shadow:0 0 10px #5eead488,0 0 18px #a78bfa55,0 2px #000;letter-spacing:1.5px;text-align:center;line-height:1.1}
.tt small{display:block;font:700 6.5px Arial;letter-spacing:2px;color:#a78bfa;text-shadow:none;margin-top:3px}
.hrs{display:flex;gap:6px;align-items:center;justify-content:center;width:100%}
.hr{background:rgba(3,1,10,.7);border:1px solid rgba(94,234,212,.35);border-radius:9px;padding:3px 7px;text-align:center;min-width:52px;display:flex;flex-direction:column;align-items:center;gap:1px}
.hr i{display:inline-flex;align-items:center;justify-content:center;height:10px;color:#6b7280}
.hr b{font:900 12px 'Arial Black';color:#eef2ff;font-variant-numeric:tabular-nums;line-height:1}
.hr.cn{border-color:rgba(251,191,36,.5)}
.hr.cn i{color:#fbbf24}
.hr.cn b{color:#fbbf24}
.mbtn{width:34px;height:34px;border:2px solid rgba(94,234,212,.35);border-radius:9px;background:rgba(3,1,10,.7);color:#eef2ff;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}
.mbtn:active{filter:brightness(1.6)}
#exitB{border-color:rgba(244,114,182,.5);color:#f472b6}
.gw{position:relative;border:2px solid rgba(94,234,212,.4);border-radius:14px;overflow:hidden;background:#03010a;box-shadow:0 0 20px rgba(94,234,212,.2),0 0 40px rgba(167,139,250,.15)}
canvas{width:100%;display:block;touch-action:none}
.pads{display:grid;grid-template-columns:1fr 1.6fr 1fr;gap:8px;margin-top:8px}
.pd{height:52px;border:2px solid rgba(255,255,255,.16);border-radius:14px;font:900 13px 'Arial Black';color:#fff;cursor:pointer;touch-action:none;box-shadow:0 4px 0 rgba(0,0,0,.6);background:linear-gradient(#1a1d2e,#0d0f1e 60%,#06040e);display:flex;align-items:center;justify-content:center;gap:6px}
.pd:active{transform:translateY(3px);box-shadow:none;filter:brightness(1.5)}
#atkB{background:linear-gradient(#14b8a6,#0d5a52 60%,#062826);color:#e6fffa;text-shadow:0 1px #000;border-color:rgba(94,234,212,.6)}
.ub{margin-top:8px;width:100%;height:40px;border:2px solid rgba(167,139,250,.5);border-radius:12px;font:900 13px 'Arial Black';color:#3a1e6a;background:#0a0420;cursor:pointer;touch-action:none;letter-spacing:2px;display:flex;align-items:center;justify-content:center;gap:7px}
.ub.rdy{color:#fff;background:linear-gradient(90deg,#a78bfa,#c4b5fd);box-shadow:0 0 16px #a78bfaaa;animation:up 1s infinite}
.ub:active{transform:translateY(2px)}
@keyframes up{50%{filter:brightness(1.4)}}
.hint{text-align:center;font:600 9px Arial;color:#6b7280;margin-top:6px;display:flex;align-items:center;justify-content:center;gap:5px;flex-wrap:wrap}
.hint svg{color:#5eead4;vertical-align:middle}
</style>
<body>
<div id="app">
<div class="hdr">
<div class="tt">CYBER DRIVE<small>AURORA PROTOCOL · VOID EDITION</small></div>
<div class="hrs">
<div class="hr"><i id="hSc"></i><b id="sc">0</b></div>
<div class="hr"><i id="hBs"></i><b id="bs">0</b></div>
<div class="hr cn"><i id="hCn"></i><b id="cn">0</b></div>
<button class="mbtn" id="muteB" title="صوت"></button>
<button class="mbtn" id="exitB" title="خروج"></button>
</div>
</div>
<div class="gw"><canvas id="cv" width="404" height="380"></canvas></div>
<div class="pads">
<button class="pd" id="leftB"></button>
<button class="pd" id="atkB"></button>
<button class="pd" id="rightB"></button>
</div>
<button class="ub" id="ultB"></button>
<div class="hint" id="hintEl"></div>
</div>
<script>
(function(){
var cv=document.getElementById('cv'),x=cv.getContext('2d'),W=404,H=380,DPR=2;
cv.width=W*DPR;cv.height=H*DPR;
var scEl=document.getElementById('sc'),bsEl=document.getElementById('bs'),ub=document.getElementById('ultB');
var BEST=0;
try{BEST=parseInt(localStorage.getItem('cdrive_best')||'0',10)||0;}catch(e){}
bsEl.textContent=BEST;

var SVG={
soundOn:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>',
soundOff:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>',
exit:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
coin:'<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4.5"/></svg>',
arrowL:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>',
arrowR:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>',
blaster:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
bolt:'<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>',
shield:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 2 4 5v7c0 5 3.5 9 8 10 4.5-1 8-5 8-10V5z"/></svg>',
trophy:'<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>',
crosshair:'<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>'
};

document.getElementById('hSc').innerHTML=SVG.crosshair;
document.getElementById('hBs').innerHTML=SVG.trophy;
document.getElementById('hCn').innerHTML=SVG.coin;
document.getElementById('leftB').innerHTML=SVG.arrowL;
document.getElementById('rightB').innerHTML=SVG.arrowR;
document.getElementById('atkB').innerHTML=SVG.blaster+'<span>BLASTER</span>';
document.getElementById('exitB').innerHTML=SVG.exit;
document.getElementById('hintEl').innerHTML=SVG.blaster+' إطلاق الليزر · ضرب بلازما العدو = PARRY · دمر الدرونات لشحن النيترو';

function icShield(cx,cy,s,col){
x.save();x.translate(cx,cy);x.scale(s/24,s/24);
x.strokeStyle=col;x.lineWidth=2.4;x.lineJoin='round';x.lineCap='round';
x.beginPath();x.moveTo(0,-10);x.lineTo(9,-6);x.lineTo(9,3);x.quadraticCurveTo(9,10,0,13);x.quadraticCurveTo(-9,10,-9,3);x.lineTo(-9,-6);x.closePath();x.stroke();
x.restore();}
function icSparkle(cx,cy,s,col){
x.save();x.translate(cx,cy);x.scale(s/24,s/24);
x.fillStyle=col;
x.beginPath();x.moveTo(0,-11);x.lineTo(2.5,-3);x.lineTo(10,0);x.lineTo(2.5,3);x.lineTo(0,11);x.lineTo(-2.5,3);x.lineTo(-10,0);x.lineTo(-2.5,-3);x.closePath();x.fill();
x.restore();}
function icBurst(cx,cy,s,col){
x.save();x.translate(cx,cy);x.scale(s/24,s/24);
x.strokeStyle=col;x.fillStyle=col;x.lineWidth=2.4;x.lineCap='round';
for(var i=0;i<8;i++){var a=i*Math.PI/4;x.beginPath();x.moveTo(Math.cos(a)*4,Math.sin(a)*4);x.lineTo(Math.cos(a)*11,Math.sin(a)*11);x.stroke();}
x.beginPath();x.arc(0,0,3,0,7);x.fill();
x.restore();}
function icMagnet(cx,cy,s,col){
x.save();x.translate(cx,cy);x.scale(s/24,s/24);
x.strokeStyle=col;x.lineWidth=3;x.lineCap='round';
x.beginPath();x.arc(0,-1,7,Math.PI,0,false);x.stroke();
x.beginPath();x.moveTo(-7,-1);x.lineTo(-7,8);x.stroke();
x.beginPath();x.moveTo(7,-1);x.lineTo(7,8);x.stroke();
x.strokeStyle='#f472b6';x.lineWidth=3.2;
x.beginPath();x.moveTo(-10,8);x.lineTo(-4,8);x.stroke();
x.beginPath();x.moveTo(4,8);x.lineTo(10,8);x.stroke();
x.restore();}
function icCoinMap(cx,cy,r,col){
x.save();x.translate(cx,cy);
x.strokeStyle=col;x.lineWidth=2;
x.beginPath();x.ellipse(0,0,r*0.55,r,0,0,7);x.stroke();
x.fillStyle=col;x.font='900 '+(r*1.1)+'px Arial';x.textAlign='center';x.textBaseline='middle';
x.fillText('$',0,0);
x.restore();}
function drawIconByKind(kind,cx,cy,s,col){
if(kind==='shield')icShield(cx,cy,s,col);
else if(kind==='double')icSparkle(cx,cy,s,col);
else if(kind==='triple')icBurst(cx,cy,s,col);
else if(kind==='magnet')icMagnet(cx,cy,s,col);
}

var horizonY=80,playerY=330,MAXZ=750,laneW=66,EDGE=1.65;
var stars=[];for(var _si=0;_si<70;_si++)stars.push({x:Math.random(),y:Math.random(),r:Math.random()*1.6+0.3,tw:Math.random()*Math.PI*2});

function psc(z){return 1-(z/MAXZ)*.65}
function py(z){return playerY-(z/MAXZ)*(playerY-horizonY)}
function pX(l,z){return W/2+l*laneW*psc(z)}

var AC=null,MUTED=false;
try{MUTED=localStorage.getItem('cdrive_mute')==='1'}catch(e){}
function ac(){
  if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}
  if(AC&&AC.state==='suspended'){try{AC.resume()}catch(e){}}
  return AC;
}
document.getElementById('muteB').innerHTML=MUTED?SVG.soundOff:SVG.soundOn;

function tone(f,d,t,v,at,sl){var a=AC;if(!a||MUTED)return;try{var n=a.currentTime+(at||0),o=a.createOscillator(),g=a.createGain();o.type=t||'square';o.frequency.setValueAtTime(f,n);if(sl)o.frequency.exponentialRampToValueAtTime(sl,n+d);g.gain.setValueAtTime(v||.1,n);g.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(g);g.connect(a.destination);o.start(n);o.stop(n+d+.03);}catch(e){}}
function noiz(d,v,at,fc){var a=AC;if(!a||MUTED)return;try{var n=a.currentTime+(at||0),len=Math.floor(a.sampleRate*d),b=a.createBuffer(1,len,a.sampleRate),c=b.getChannelData(0);for(var i=0;i<len;i++)c[i]=Math.random()*2-1;var s=a.createBufferSource(),g=a.createGain(),f=a.createBiquadFilter();s.buffer=b;f.type='lowpass';f.frequency.value=fc||1200;g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.0001,n+d);s.connect(f);f.connect(g);g.connect(a.destination);s.start(n);s.stop(n+d+.03);}catch(e){}}
function sLaser(){tone(900,.08,'sawtooth',.12,0,180);noiz(.05,.08,0,3000);}
function sHit(){noiz(.1,.22,0,1000);tone(120,.08,'sine',.25,0,40);}
function sParry(){tone(1800,.08,'square',.15,0,1200);tone(900,.15,'sine',.12);noiz(.06,.1,0,4000);}
function sNitro(){tone(200,.6,'sawtooth',.15,0,1800);noiz(.6,.2,0,2500);}
function sExplode(){noiz(.25,.3,0,800);tone(80,.2,'sine',.3,0,30);}
function sHurt(){tone(220,.25,'sawtooth',.18,0,60);noiz(.2,.15,.02,600);}
function sHeal(){tone(523,.08,'sine',.08);tone(659,.1,'sine',.08,.06);}
function sCoin(){tone(1100,.06,'sine',.1);tone(1600,.08,'sine',.08,.04);}
function sPow(){tone(523,.1,'sine',.12);tone(784,.12,'sine',.12,.07);tone(1046,.16,'sine',.1,.14);}
function sBossSpawn(){tone(70,.8,'sawtooth',.28,0,30);noiz(.5,.2,0,400);}
function sBossHit(){tone(200,.06,'square',.15);noiz(.05,.1,0,2000);}
function sLevelUp(){tone(523,.12,'sine',.15);tone(659,.12,'sine',.15,.1);tone(784,.12,'sine',.15,.2);tone(1046,.25,'sine',.15,.3);}
function sCombo(n){var base=800+n*80;tone(base,.08,'square',.14);tone(base*1.5,.1,'sine',.1,.05);}
function sBossAttack(t){
if(t==='skull'){tone(600,.15,'square',.15,0,300);tone(450,.12,'square',.12,.06);}
else if(t==='crystal'){tone(1400,.25,'sine',.1,0,600);}
else if(t==='dragon'){tone(120,.4,'sawtooth',.18,0,50);noiz(.3,.15,0,400);}
else{tone(400,.15,'sawtooth',.12,0,100);}
}

var mStep=0,mNext=0,PL=[130,146,164,174,196,220];
function mTick(){var a=AC;if(!a)return;var inten=(nitroT>0||hp<=30||(boss&&!boss.dead));var SPB=60/(inten?145:120)/2;while(mNext<a.currentTime+.15){var s=mStep%16,at=Math.max(0,mNext-a.currentTime);if(s===0||s===8||(inten&&s===10)){tone(60,.12,'sine',.35,at,30);}if(s===4||s===12){noiz(.05,.08,at,2500);tone(180,.03,'triangle',.08,at);}if(s%2===0){noiz(.015,.02,at,7000);}if(s%4===0||s===14){var f=PL[(s+Math.floor(mStep/16))%6];tone(f,.18,'sawtooth',.07,at,f*.9);}mStep++;mNext+=SPB;}}
setInterval(function(){if(AC&&state==='play')mTick();},40);
setInterval(function(){if(AC&&AC.state==='suspended'&&!MUTED){try{AC.resume()}catch(e){}}},2000);

var coins=0;try{coins=parseInt(localStorage.getItem('cdrive_coins')||'0',10)||0;}catch(e){}
var lastDaily=0;try{lastDaily=parseInt(localStorage.getItem('cdrive_daily')||'0',10)||0;}catch(e){}
var maxHp=100;
function saveCoins(){try{localStorage.setItem('cdrive_coins',String(coins));}catch(e){}}
function refreshCoins(){var a=document.getElementById('cn');if(a)a.textContent=coins;}
function addCoins(n){coins+=n;saveCoins();refreshCoins();}
refreshCoins();

var today=Math.floor(Date.now()/86400000);
if(today!==lastDaily){try{localStorage.setItem('cdrive_daily',String(today));}catch(e){}addCoins(150);}

function getRank(sc){if(sc<5000)return{n:'ROOKIE',c:'#6b7280'};if(sc<15000)return{n:'PRO',c:'#5eead4'};if(sc<30000)return{n:'ELITE',c:'#a78bfa'};if(sc<60000)return{n:'MASTER',c:'#fbbf24'};return{n:'LEGEND',c:'#f472b6'};}

var state='ready',frame=0,score=0,best=BEST,hp=100,iframe=0,camZ=0,scroll=5.5,shake=0,flashR=0,wflash=0,hitstop=0;
var lane=0,px=0,pv=0,playerX=W/2,shots=[],ents=[],props=[],parts=[],pops=[],projs=[],ghosts=[];
var nitro=0,nitroT=0,nitroPing=false,combo=0,comboT=0,overT=0,bestNew=false;
var obsAt=300,droneAt=450,tankAt=1800,propAt=100;
var shield=0,doubleT=0,tripleT=0,magnetT=0;
var boss=null,coinAt=200,powAt=600;
var level=1,levelStartScore=0,levelTarget=3000,levelState='run',levelUpT=0,levelFlash=0;
var comboCount=0,comboTimer=0,comboMult=1,comboFlash=0;

function reset(){
score=0;iframe=0;camZ=0;scroll=5.5;shake=0;flashR=0;wflash=0;hitstop=0;lane=0;px=0;pv=0;playerX=W/2;
nitro=0;nitroT=0;nitroPing=false;combo=0;comboT=0;
shots=[];ents=[];props=[];parts=[];pops=[];projs=[];ghosts=[];bestNew=false;
obsAt=camZ+300;droneAt=camZ+450;tankAt=camZ+1800;propAt=camZ+100;
shield=0;doubleT=0;tripleT=0;magnetT=0;boss=null;coinAt=camZ+200;powAt=camZ+600;
level=1;levelStartScore=0;levelTarget=3000;levelState='run';levelUpT=0;levelFlash=0;
comboCount=0;comboTimer=0;comboMult=1;comboFlash=0;
maxHp=100;hp=maxHp;
scEl.textContent='0';ub.classList.remove('rdy');ub.innerHTML=SVG.bolt+'<span>HYPER NITRO — 0%</span>';
}

function mv(d){ac();if(state!=='play')return;var nl=Math.max(-1,Math.min(1,lane+d));if(nl!==lane){lane=nl;tone(350,.04,'square',.05);ghosts.push({x:playerX,y:playerY,t:1});}}
function shoot(){ac();if(state!=='play')return;
var lanes=[lane];
if(tripleT>0)lanes=[lane-0.6,lane,lane+0.6];
var dmg=1;
if(doubleT>0)dmg*=2;
for(var L=0;L<lanes.length;L++){shots.push({lane:lanes[L],z:20,vz:scroll+18,dmg:dmg});}
sLaser();for(var i=0;i<3;i++){parts.push({x:playerX+(i===0?-12:12),y:playerY-10,vx:(Math.random()-.5)*2,vy:-3,life:.2,c:'#5eead4',s:2.5});}}
function tryNitro(){ac();if(state!=='play')return;if(nitro>=100&&nitroT===0){nitroT=300;nitro=0;ub.classList.remove('rdy');ub.innerHTML=SVG.bolt+'<span>HYPER NITRO — 0%</span>';sNitro();shake=12;}}

function exitGame(){
ac();
try{ window.close(); }catch(e){}
reset();
state='ready';
}

document.getElementById('leftB').addEventListener('pointerdown',function(e){e.preventDefault();mv(-1);});
document.getElementById('rightB').addEventListener('pointerdown',function(e){e.preventDefault();mv(1);});
document.getElementById('atkB').addEventListener('pointerdown',function(e){e.preventDefault();shoot();});
ub.addEventListener('pointerdown',function(e){e.preventDefault();tryNitro();});
document.addEventListener('keydown',function(e){if((e.code==='ArrowLeft'||e.code==='KeyA')&&!e.repeat)mv(-1);if((e.code==='ArrowRight'||e.code==='KeyD')&&!e.repeat)mv(1);if((e.code==='Space'||e.code==='KeyJ')&&!e.repeat){e.preventDefault();shoot();}if((e.code==='KeyU'||e.code==='KeyK')&&!e.repeat)tryNitro();});
var mb=document.getElementById('muteB');mb.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();ac();MUTED=!MUTED;mb.innerHTML=MUTED?SVG.soundOff:SVG.soundOn;try{localStorage.setItem('cdrive_mute',MUTED?'1':'0');}catch(e2){}});
var eb=document.getElementById('exitB');eb.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();exitGame();});

function burst(wx,wy,n,cols){for(var i=0;i<n;i++){parts.push({x:wx,y:wy,vx:(Math.random()-.5)*7,vy:(Math.random()-.5)*7,life:.8,c:cols[i%cols.length],s:2+Math.random()*3});}}
function popup(sx,y,txt,c){pops.push({sx:sx,y:y,t:1,txt:txt,c:c});if(pops.length>6)pops.shift();}
function dmg(n){if(iframe>0||nitroT>0||state!=='play'||levelState==='complete')return;
if(shield>0){shield--;iframe=60;shake=8;flashR=.2;sParry();popup(playerX,playerY-50,'SHIELD!','#34d399');return;}
hp=Math.max(0,hp-n);iframe=70;shake=10;flashR=.6;
combo=0;comboCount=0;comboTimer=0;comboMult=1;
sHurt();popup(playerX,playerY-50,'-'+n,'#f472b6');burst(playerX,playerY-10,12,['#f472b6','#a78bfa']);
if(hp<=0){state='dead';overT=performance.now();sExplode();if(score>best){best=score;bsEl.textContent=best;try{localStorage.setItem('cdrive_best',best);}catch(e){}bestNew=true;}}}
function addNitro(v){nitro=Math.min(100,nitro+v);if(nitro>=100&&!nitroPing){nitroPing=true;tone(1200,.15,'sine',.15);ub.classList.add('rdy');}ub.innerHTML=SVG.bolt+'<span>HYPER NITRO — '+Math.floor(nitro)+'%</span>';}

function bumpCombo(){
comboCount++;comboTimer=180;
var newMult=1+Math.min(4,Math.floor(comboCount/3))*0.25;
if(newMult>comboMult){comboMult=newMult;comboFlash=1;sCombo(comboCount);}
if(comboCount%3===0){popup(W/2,70,'COMBO x'+comboMult.toFixed(2),'#fbbf24');}
}

function applyPow(kind){
if(kind==='shield'){shield=Math.min(2,shield+1);sPow();}
else if(kind==='double'){doubleT=480;tripleT=0;sPow();}
else if(kind==='triple'){tripleT=480;doubleT=0;sPow();}
else if(kind==='magnet'){magnetT=360;sPow();}
}
function spawnInterval(base,min){return Math.max(min,base-(level-1)*12);}
function spawn(){if(camZ>obsAt){var r=Math.random(),l=Math.floor(Math.random()*3)-1;if(r<.4){ents.push({t:'barrier',z:MAXZ,lane:l,hp:1});}else if(r<.7){ents.push({t:'spike',z:MAXZ,lane:l,hp:1});}else{ents.push({t:'mine',z:MAXZ,lane:l,hp:1});}obsAt=camZ+spawnInterval(260,180)+Math.random()*240;}if(camZ>droneAt){ents.push({t:'drone',z:MAXZ,lane:Math.floor(Math.random()*3)-1,hp:1,shootT:0});droneAt=camZ+spawnInterval(320,220)+Math.random()*300;}if(camZ>tankAt){ents.push({t:'tank',z:MAXZ,lane:Math.floor(Math.random()*3)-1,hp:3});tankAt=camZ+spawnInterval(1600,1100)+Math.random()*800;}if(camZ>propAt){props.push({z:MAXZ,side:Math.random()<.5?-1:1,kind:Math.random()<.5?'tower':'light'});propAt=camZ+140+Math.random()*120;}
if(camZ>coinAt){var cn=1+Math.floor(Math.random()*3),cl=Math.floor(Math.random()*3)-1;for(var ci=0;ci<cn;ci++)ents.push({t:'coin',z:MAXZ+ci*40,lane:cl,hp:1,spin:Math.random()*6});coinAt=camZ+240+Math.random()*200;}
if(camZ>powAt){var kinds=['shield','double','triple','magnet'];var kind=kinds[Math.floor(Math.random()*4)];ents.push({t:'pow',kind:kind,z:MAXZ,lane:Math.floor(Math.random()*3)-1,hp:1});powAt=camZ+900+Math.random()*500;}
}
var BOSS_TYPES=['saucer','skull','crystal','dragon'];
function spawnBoss(){var tier=level;var bt=BOSS_TYPES[(level-1)%4];boss={z:MAXZ,tz:320,lane:0,hp:40+tier*10,maxHp:40+tier*10,enterT:60,shootT:0,dead:false,dieT:0,type:bt};sBossSpawn();shake=15;flashR=.5;wflash=.4;levelState='boss';}

function bossFire(){
var pl=Math.round(px/laneW);
if(boss.type==='saucer'){
projs.push({lane:pl-0.5,z:boss.z-30});
projs.push({lane:pl,z:boss.z-30});
projs.push({lane:pl+0.5,z:boss.z-30});
sBossAttack('saucer');
}
else if(boss.type==='skull'){
projs.push({lane:pl-0.22,z:boss.z-30});
projs.push({lane:pl+0.22,z:boss.z-30});
sBossAttack('skull');
}
else if(boss.type==='crystal'){
for(var s=-2;s<=2;s++)projs.push({lane:boss.lane+s*0.5,z:boss.z-30});
sBossAttack('crystal');
}
else if(boss.type==='dragon'){
projs.push({lane:boss.lane,z:boss.z-30,homing:true,big:true});
sBossAttack('dragon');
}
}

function update(){
frame++;
if(hitstop>0){hitstop--;return;}
shake=Math.max(0,shake-.5);flashR=Math.max(0,flashR-.03);wflash=Math.max(0,wflash-.04);
if(levelFlash>0)levelFlash=Math.max(0,levelFlash-.03);
if(comboFlash>0)comboFlash=Math.max(0,comboFlash-.04);
if(iframe>0)iframe--;
if(nitroT>0){nitroT--;if(frame%2===0&&state==='play'){parts.push({x:playerX+(Math.random()-.5)*20,y:playerY+10,vx:(Math.random()-.5)*3,vy:3+Math.random()*4,life:.4,c:Math.random()<.5?'#a78bfa':'#5eead4',s:3});}}
if(doubleT>0)doubleT--;
if(tripleT>0)tripleT--;
if(magnetT>0)magnetT--;
if(comboTimer>0){comboTimer--;if(comboTimer===0){comboCount=0;comboMult=1;}}
for(var i=ghosts.length-1;i>=0;i--){if((ghosts[i].t-=.1)<=0)ghosts.splice(i,1);}
for(i=parts.length-1;i>=0;i--){var q=parts[i];q.x+=q.vx;q.y+=q.vy;if((q.life-=.04)<=0)parts.splice(i,1);}
for(i=pops.length-1;i>=0;i--){if((pops[i].t-=.04)<=0)pops.splice(i,1);}
if(levelState==='complete'){levelUpT--;if(levelUpT<=0){level++;levelStartScore=score;levelTarget=3000+(level-1)*1500;levelState='run';levelFlash=1;sLevelUp();}}
if(state!=='play')return;
if(levelState==='run'&&!boss&&(score-levelStartScore>=levelTarget)){spawnBoss();}
var curScroll=scroll+(nitroT>0?4.5:0);
if(levelState==='complete')curScroll*=0.4;
camZ+=curScroll;score+=Math.round(curScroll*.12);if(frame%6===0)scEl.textContent=score;
var tgt=lane*laneW;pv+=(tgt-px)*.55;pv*=.42;px+=pv;playerX=W/2+px;
if(levelState==='run')spawn();
if(boss){
if(boss.dead){boss.dieT--;if(boss.dieT<=0)boss=null;}
else{
if(boss.enterT>0){boss.enterT--;boss.z+=(boss.tz-boss.z)*0.08;}
else{
boss.lane=Math.sin(frame*.02)*1.1;
boss.shootT++;
var shootRate=Math.max(75,130-level*5);
if(boss.shootT>=shootRate){boss.shootT=0;bossFire();}
}
}}
for(i=shots.length-1;i>=0;i--){var s=shots[i];s.z+=s.vz;var hit=false;
for(var j=ents.length-1;j>=0;j--){var e=ents[j];
if(e.t==='coin'||e.t==='pow')continue;
if(Math.abs(e.lane-s.lane)<0.5&&Math.abs(e.z-s.z)<35){
e.hp-=s.dmg;hit=true;
if(e.hp<=0){
e.rm=true;sExplode();
bumpCombo();
var gain=Math.round((e.t==='tank'?200:100)*comboMult);score+=gain;
var ec=(e.t==='tank'?5:(e.t==='drone'?3:2));
addCoins(ec);
popup(pX(e.lane,e.z),py(e.z)-20,'+'+gain+' · '+ec,'#5eead4');
burst(pX(e.lane,e.z),py(e.z),14,['#5eead4','#a78bfa','#fff']);
addNitro(e.t==='tank'?4:2);
if(hp<maxHp){hp=Math.min(maxHp,hp+4);sHeal();}
if(Math.random()<0.15){var kinds=['shield','double','triple','magnet'];ents.push({t:'pow',kind:kinds[Math.floor(Math.random()*4)],z:e.z,lane:e.lane,hp:1});}
}else{sHit();burst(pX(e.lane,e.z),py(e.z),6,['#fff','#5eead4']);}
break;
}}
if(!hit&&boss&&!boss.dead&&Math.abs(boss.lane-s.lane)<0.7&&Math.abs(boss.z-s.z)<60){
boss.hp-=s.dmg;hit=true;sBossHit();burst(pX(boss.lane,boss.z),py(boss.z),8,['#a78bfa','#fff']);
if(boss.hp<=0){
boss.dead=true;boss.dieT=40;
projs=[];shots=[];ents=[];
var bg=500+level*200;score+=bg;
addCoins(100);
popup(W/2,py(boss.z)-30,'BOSS DOWN +'+bg+' · 100','#fbbf24');
burst(W/2,py(boss.z),50,['#a78bfa','#fbbf24','#fff','#5eead4']);
sExplode();sNitro();
addNitro(12);
hp=Math.min(maxHp,hp+30);shake=25;wflash=.8;
levelState='complete';levelUpT=150;
}
}
if(!hit){
for(var k=projs.length-1;k>=0;k--){var pr=projs[k];if(Math.abs(pr.lane-s.lane)<0.5&&Math.abs(pr.z-s.z)<40){pr.rm=true;hit=true;sParry();wflash=.4;popup(pX(pr.lane,pr.z),py(pr.z)-20,'PARRY!','#fbbf24');burst(pX(pr.lane,pr.z),py(pr.z),10,['#fbbf24','#fff']);
addNitro(2);break;}}
}
if(hit||s.z>MAXZ)shots.splice(i,1);
}
for(i=projs.length-1;i>=0;i--){var pr2=projs[i];
if(pr2.homing){var tgtLane=px/laneW;pr2.lane+=Math.max(-0.025,Math.min(0.025,(tgtLane-pr2.lane)*0.02));}
pr2.z-=curScroll+4;
if(pr2.z<15){if(Math.abs(pr2.lane*laneW-px)<laneW*(pr2.big?0.8:0.55)&&nitroT===0)dmg(pr2.big?10:6);projs.splice(i,1);}
}
for(i=ents.length-1;i>=0;i--){var e2=ents[i];
if(magnetT>0&&e2.t==='coin'&&e2.z>40&&e2.z<500){var d=px-e2.lane*laneW*psc(e2.z);e2.lane+=(d/(laneW*psc(e2.z)))*0.08;}
e2.z-=curScroll;
if(e2.t==='coin'){e2.spin=(e2.spin||0)+0.18;if(e2.z<40&&e2.z>-40&&Math.abs(e2.lane*laneW-px)<35){
score+=30;sCoin();
var cv2=1;
addCoins(cv2);
popup(pX(e2.lane,e2.z),py(e2.z)-20,'+30 · '+cv2,'#fbbf24');
burst(pX(e2.lane,e2.z),py(e2.z),8,['#fbbf24','#fff','#fb923c']);
ents.splice(i,1);continue;}if(e2.z<-40)ents.splice(i,1);continue;}
if(e2.t==='pow'){if(e2.z<40&&e2.z>-40&&Math.abs(e2.lane*laneW-px)<35){applyPow(e2.kind);var lbl=e2.kind==='shield'?'SHIELD!':(e2.kind==='double'?'DOUBLE!':(e2.kind==='triple'?'TRIPLE!':'MAGNET!'));popup(pX(e2.lane,e2.z),py(e2.z)-20,lbl,'#34d399');burst(pX(e2.lane,e2.z),py(e2.z),16,['#34d399','#fff','#5eead4']);ents.splice(i,1);continue;}if(e2.z<-40)ents.splice(i,1);continue;}
if(e2.t==='drone'&&e2.z>200&&e2.z<600){e2.shootT++;if(e2.shootT===40){projs.push({lane:e2.lane,z:e2.z-20});sLaser();}}
if(e2.z<15&&e2.z>-20){if(e2.lane===Math.round(px/laneW)){if(nitroT>0){e2.rm=true;score+=80;sExplode();burst(pX(e2.lane,0),py(0),12,['#a78bfa','#5eead4']);}else if(!e2.hit){e2.hit=true;dmg(e2.t==='tank'?18:10);}}}
if(e2.z<-50||e2.rm)ents.splice(i,1);
}
props.forEach(function(p){p.z-=curScroll});
props=props.filter(function(p){return p.z>-50});
}

function drawSpaceBg(){
var _bg=x.createLinearGradient(0,0,0,H);
_bg.addColorStop(0,'#0a0528');
_bg.addColorStop(1,'#03010a');
x.fillStyle=_bg;x.fillRect(0,0,W,H);
var r1=x.createRadialGradient(W*0.25,horizonY+20,0,W*0.25,horizonY+20,150);
r1.addColorStop(0,'rgba(94,234,212,0.10)');r1.addColorStop(1,'rgba(0,0,0,0)');
x.fillStyle=r1;x.fillRect(0,0,W,H);
var r2=x.createRadialGradient(W*0.75,horizonY+40,0,W*0.75,horizonY+40,160);
r2.addColorStop(0,'rgba(167,139,250,0.09)');r2.addColorStop(1,'rgba(0,0,0,0)');
x.fillStyle=r2;x.fillRect(0,0,W,H);
for(var _i=0;_i<stars.length;_i++){
var _s=stars[_i];
var _al=0.4+0.6*Math.sin(frame*0.04+_s.tw);
x.globalAlpha=Math.max(_al,0.1);
x.fillStyle='#e0e7ff';
x.beginPath();x.arc(_s.x*W,_s.y*H,_s.r,0,7);x.fill();
}
x.globalAlpha=1;
}

function drawGrid(){var sc0=psc(-100),sc1=psc(MAXZ),y0=py(-100),y1=py(MAXZ);
x.fillStyle='rgba(10,5,40,0.85)';x.beginPath();x.moveTo(W/2-EDGE*laneW*sc0,y0);x.lineTo(W/2+EDGE*laneW*sc0,y0);x.lineTo(W/2+EDGE*laneW*sc1,y1);x.lineTo(W/2-EDGE*laneW*sc1,y1);x.fill();
[-EDGE,EDGE].forEach(function(o){x.strokeStyle='#a78bfa';x.lineWidth=3;x.beginPath();x.moveTo(W/2+o*laneW*sc0,y0);x.lineTo(W/2+o*laneW*sc1,y1);x.stroke();});
x.strokeStyle='rgba(94,234,212,0.4)';x.lineWidth=1.5;for(var k=0;k<12;k++){var z=k*65-(camZ%65);if(z<0||z>MAXZ)continue;var sy=py(z),w=EDGE*laneW*psc(z);x.beginPath();x.moveTo(W/2-w,sy);x.lineTo(W/2+w,sy);x.stroke();}
[-.5,.5].forEach(function(o){x.strokeStyle='rgba(94,234,212,0.2)';x.beginPath();x.moveTo(W/2+o*laneW*sc0,y0);x.lineTo(W/2+o*laneW*sc1,y1);x.stroke();});}

function drawPlayer(){if(state==='dead')return;if(iframe>0&&Math.floor(frame/3)%2===0)return;
ghosts.forEach(function(g){x.globalAlpha=g.t*.3;x.fillStyle='#5eead4';x.fillRect(g.x-14,g.y-8,28,14);x.globalAlpha=1;});
var pyy=playerY+Math.sin(frame*.15)*2.5;
x.fillStyle='rgba(0,0,0,0.5)';x.beginPath();x.ellipse(playerX,playerY+12,16,5,0,0,7);x.fill();
if(shield>0){x.strokeStyle='rgba(52,211,153,'+(0.55+0.35*Math.sin(frame*0.18))+')';x.lineWidth=2.5;x.beginPath();x.arc(playerX,pyy,26,0,7);x.stroke();x.strokeStyle='rgba(52,211,153,0.25)';x.lineWidth=1;x.beginPath();x.arc(playerX,pyy,32,0,7);x.stroke();}
if(comboMult>1){x.strokeStyle='rgba(251,191,36,'+(0.35+0.35*Math.sin(frame*0.2))+')';x.lineWidth=2;x.beginPath();x.arc(playerX,pyy,20,0,7);x.stroke();}
x.save();x.translate(playerX,pyy);var lean=pv*.012;x.rotate(lean);
var fg=x.createLinearGradient(0,10,0,25);fg.addColorStop(0,nitroT>0?'#a78bfa':'#5eead4');fg.addColorStop(1,'transparent');x.fillStyle=fg;x.fillRect(-6,10,12,12+Math.random()*8);
x.fillStyle='#111033';x.strokeStyle=nitroT>0?'#a78bfa':'#5eead4';x.lineWidth=2;x.beginPath();x.moveTo(0,-18);x.lineTo(-14,6);x.lineTo(-8,12);x.lineTo(8,12);x.lineTo(14,6);x.closePath();x.fill();x.stroke();
x.fillStyle='#fff';x.beginPath();x.ellipse(0,-4,4,7,0,0,7);x.fill();
x.fillStyle='#5eead4';x.fillRect(-15,-8,3,10);x.fillRect(12,-8,3,10);
x.restore();}

function drawEnt(e){var z=e.z,sc=psc(z),sy=py(z),sx=pX(e.lane,z);
if(e.t==='coin'){if(sy<horizonY-10||sy>H+30)return;x.save();x.translate(sx,sy);x.scale(sc,sc);var r=8+Math.sin(e.spin||0)*2;icCoinMap(0,-14,r,'#fbbf24');x.restore();return;}
if(e.t==='pow'){if(sy<horizonY-10||sy>H+30)return;var pc=e.kind==='shield'?'#34d399':(e.kind==='double'?'#fbbf24':(e.kind==='triple'?'#a78bfa':'#fb923c'));var pulse=0.5+0.5*Math.sin(frame*0.18);x.save();x.translate(sx,sy);x.scale(sc,sc);x.strokeStyle=pc;x.lineWidth=2.5;x.shadowColor=pc;x.shadowBlur=15+pulse*10;x.beginPath();x.moveTo(0,-24);x.lineTo(15,-11);x.lineTo(0,4);x.lineTo(-15,-11);x.closePath();x.stroke();x.shadowBlur=0;drawIconByKind(e.kind,0,-10,16,pc);x.restore();return;}
if(sy<horizonY-10||sy>H+30)return;x.save();x.translate(sx,sy);x.scale(sc,sc);
if(e.t==='barrier'){x.fillStyle='rgba(167,139,250,0.2)';x.strokeStyle='#a78bfa';x.lineWidth=2;x.fillRect(-22,-24,44,24);x.strokeRect(-22,-24,44,24);}
else if(e.t==='spike'){x.fillStyle='#fbbf24';x.beginPath();x.moveTo(-18,0);x.lineTo(0,-22);x.lineTo(18,0);x.closePath();x.fill();}
else if(e.t==='mine'){x.fillStyle='#f472b6';x.beginPath();x.arc(0,-10,12,0,7);x.fill();}
else if(e.t==='drone'){x.fillStyle='#111033';x.strokeStyle='#5eead4';x.lineWidth=2;x.beginPath();x.moveTo(-20,-10);x.lineTo(0,-22);x.lineTo(20,-10);x.lineTo(0,0);x.closePath();x.fill();x.stroke();x.fillStyle='#f472b6';x.beginPath();x.arc(0,-11,4,0,7);x.fill();}
else if(e.t==='tank'){x.fillStyle='#1a0a2a';x.strokeStyle='#a78bfa';x.lineWidth=2.5;x.fillRect(-26,-28,52,28);x.strokeRect(-26,-28,52,28);x.fillStyle='#a78bfa';x.fillRect(-10,-34,20,8);}
x.restore();}

function drawBoss(){if(!boss)return;var sc=psc(boss.z),sy=py(boss.z),sx=pX(boss.lane,boss.z);if(sy<horizonY-20)return;x.save();x.translate(sx,sy);x.scale(sc,sc);
if(boss.dead){x.globalAlpha=Math.max(0,boss.dieT/40);}
var pulse=0.5+0.5*Math.sin(frame*0.2);
if(boss.type==='saucer'){
x.fillStyle='rgba(167,139,250,'+(0.18+pulse*0.15)+')';x.beginPath();x.arc(0,-30,80,0,7);x.fill();
x.fillStyle='#1a0a30';x.strokeStyle='#a78bfa';x.lineWidth=3;x.shadowColor='#a78bfa';x.shadowBlur=20;
x.beginPath();x.ellipse(0,-30,60,22,0,0,7);x.fill();x.stroke();
x.fillStyle='#2a1040';x.beginPath();x.moveTo(-32,-50);x.lineTo(32,-50);x.lineTo(16,-15);x.lineTo(-16,-15);x.closePath();x.fill();x.stroke();
x.shadowBlur=0;
for(var i=0;i<4;i++){var ang=frame*.05+i*Math.PI/2;x.fillStyle='rgba(94,234,212,'+(0.5+0.5*Math.sin(frame*.2+i))+')';x.beginPath();x.arc(Math.cos(ang)*45,-30,4.5,0,7);x.fill();}
x.fillStyle='#a78bfa';x.beginPath();x.arc(0,-52,8,0,7);x.fill();
x.fillStyle='#fff';x.beginPath();x.arc(0,-52,3,0,7);x.fill();
}
else if(boss.type==='skull'){
x.fillStyle='rgba(244,114,182,'+(0.18+pulse*0.15)+')';x.beginPath();x.arc(0,-30,85,0,7);x.fill();
x.fillStyle='#1a0818';x.strokeStyle='#f472b6';x.lineWidth=3;x.shadowColor='#f472b6';x.shadowBlur=22;
x.beginPath();x.arc(0,-40,32,Math.PI*0.15,Math.PI*0.85,true);x.closePath();x.fill();x.stroke();
x.fillRect(-30,-40,60,20);
x.beginPath();x.moveTo(-22,-20);x.lineTo(-22,4);x.lineTo(22,4);x.lineTo(22,-20);x.closePath();x.fill();x.stroke();
x.shadowBlur=0;
x.fillStyle='#000';x.beginPath();x.arc(-11,-38,7,0,7);x.fill();x.beginPath();x.arc(11,-38,7,0,7);x.fill();
x.fillStyle='rgba(244,114,182,'+(0.6+0.4*Math.sin(frame*.15))+')';
x.beginPath();x.arc(-11,-38,3.5,0,7);x.fill();x.beginPath();x.arc(11,-38,3.5,0,7);x.fill();
x.fillStyle='#1a0818';x.fillRect(-2,-30,4,8);
for(var t=0;t<5;t++){x.fillStyle='#1a0818';x.strokeStyle='#f472b6';x.lineWidth=1.5;x.fillRect(-18+t*8,-2,5,6);x.strokeRect(-18+t*8,-2,5,6);}
}
else if(boss.type==='crystal'){
x.fillStyle='rgba(94,234,212,'+(0.15+pulse*0.15)+')';x.beginPath();x.arc(0,-30,90,0,7);x.fill();
var rot=frame*.02;
x.save();x.translate(0,-30);x.rotate(rot);
for(var s2=0;s2<6;s2++){
var a=s2*Math.PI/3;
x.fillStyle='#0a1a30';x.strokeStyle='#5eead4';x.lineWidth=2;x.shadowColor='#5eead4';x.shadowBlur=15;
x.beginPath();x.moveTo(Math.cos(a)*18,Math.sin(a)*18);x.lineTo(Math.cos(a+0.4)*55,Math.sin(a+0.4)*55);x.lineTo(Math.cos(a+0.8)*55,Math.sin(a+0.8)*55);x.closePath();x.fill();x.stroke();
x.shadowBlur=0;
}
x.restore();
x.fillStyle='#5eead4';x.shadowColor='#5eead4';x.shadowBlur=25+pulse*15;
x.beginPath();x.moveTo(0,-50);x.lineTo(15,-30);x.lineTo(0,-10);x.lineTo(-15,-30);x.closePath();x.fill();
x.shadowBlur=0;
x.fillStyle='#fff';x.beginPath();x.arc(0,-30,5+pulse*2,0,7);x.fill();
x.fillStyle='rgba(94,234,212,0.4)';
for(var i=0;i<4;i++){var da=frame*.03+i*Math.PI/2;x.beginPath();x.arc(Math.cos(da)*65,Math.sin(da)*65-30,4,0,7);x.fill();}
}
else if(boss.type==='dragon'){
x.fillStyle='rgba(251,191,36,'+(0.18+pulse*0.15)+')';x.beginPath();x.arc(0,-30,85,0,7);x.fill();
x.strokeStyle='#fbbf24';x.lineWidth=3;x.shadowColor='#fbbf24';x.shadowBlur=20;
x.fillStyle='#2a1805';
x.beginPath();x.ellipse(0,-30,50,26,0,0,7);x.fill();x.stroke();
x.beginPath();x.moveTo(-40,-42);x.lineTo(-52,-58);x.lineTo(-32,-52);x.closePath();x.fill();x.stroke();
x.beginPath();x.moveTo(40,-42);x.lineTo(52,-58);x.lineTo(32,-52);x.closePath();x.fill();x.stroke();
x.shadowBlur=0;
var jaw=Math.sin(frame*.08)*4;
x.fillStyle='#1a0e05';x.strokeStyle='#fbbf24';x.lineWidth=2.5;
x.beginPath();x.moveTo(-28,-18);x.lineTo(28,-18);x.lineTo(22,-4+jaw);x.lineTo(-22,-4+jaw);x.closePath();x.fill();x.stroke();
x.fillStyle='#fff';for(var f=0;f<5;f++){x.beginPath();x.moveTo(-20+f*10,-17);x.lineTo(-17+f*10,-11);x.lineTo(-14+f*10,-17);x.closePath();x.fill();}
x.fillStyle='#5eead4';x.shadowColor='#5eead4';x.shadowBlur=15;
x.beginPath();x.ellipse(-14,-34,6,4,0,0,7);x.fill();
x.beginPath();x.ellipse(14,-34,6,4,0,0,7);x.fill();
x.shadowBlur=0;
x.fillStyle='#000';x.beginPath();x.arc(-14,-34,1.8,0,7);x.fill();x.beginPath();x.arc(14,-34,1.8,0,7);x.fill();
x.fillStyle='rgba(251,191,36,0.5)';
for(var s3=0;s3<3;s3++){x.beginPath();x.arc(-20+s3*20,-3+jaw,3,0,7);x.fill();}
}
x.restore();}

function drawProp(p){var sc=psc(p.z),sy=py(p.z),bx=W/2+p.side*(EDGE+.3)*laneW*sc;if(sy<horizonY)return;
x.fillStyle='#0a0520';x.strokeStyle='rgba(94,234,212,0.3)';x.lineWidth=1;
if(p.kind==='tower'){x.fillRect(bx-8*sc,sy-60*sc,16*sc,60*sc);x.strokeRect(bx-8*sc,sy-60*sc,16*sc,60*sc);}
else{x.fillRect(bx-3*sc,sy-40*sc,6*sc,40*sc);x.fillStyle='#a78bfa';x.beginPath();x.arc(bx,sy-40*sc,4*sc,0,7);x.fill();}}

function draw(){x.setTransform(DPR,0,0,DPR,0,0);drawSpaceBg();
var sg=x.createLinearGradient(0,20,0,90);sg.addColorStop(0,'#a78bfa');sg.addColorStop(0.5,'#f472b6');sg.addColorStop(1,'#fbbf24');x.fillStyle=sg;x.beginPath();x.arc(W/2,75,35,0,7);x.fill();
x.fillStyle='#0a0528';for(var i=0;i<5;i++){x.fillRect(W/2-40,62+i*5,80,1.8+i*.4);}
x.fillStyle='rgba(94,234,212,0.15)';x.fillRect(0,horizonY-2,W,4);
x.save();if(shake>0){x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);}
drawGrid();props.forEach(drawProp);
shots.forEach(function(s){var sc=psc(s.z),sy=py(s.z),sx=pX(s.lane,s.z);x.fillStyle='#5eead4';x.fillRect(sx-2*sc,sy-10*sc,4*sc,10*sc);});
projs.forEach(function(pr){var sc=psc(pr.z),sy=py(pr.z),sx=pX(pr.lane,pr.z);
var r=pr.big?10:5;var col=pr.big?'#fbbf24':'#f472b6';
x.shadowColor=col;x.shadowBlur=pr.big?14:8;x.fillStyle=col;
x.beginPath();x.arc(sx,sy,r*sc,0,7);x.fill();
if(pr.big){x.fillStyle='#fff';x.beginPath();x.arc(sx,sy,r*0.4*sc,0,7);x.fill();}
x.shadowBlur=0;});
ents.slice().sort(function(a,b){return b.z-a.z}).forEach(drawEnt);
if(boss)drawBoss();
drawPlayer();
parts.forEach(function(p){x.fillStyle=p.c;x.fillRect(p.x,p.y,p.s,p.s);});
pops.forEach(function(p){x.font='900 12px Arial';x.fillStyle=p.c;x.textAlign='center';x.fillText(p.txt,p.sx,p.y-(1-p.t)*15);});
x.restore();
if(nitroT>0){x.strokeStyle='rgba(167,139,250,0.3)';x.lineWidth=2;for(i=0;i<8;i++){var rx=Math.random()*W;x.beginPath();x.moveTo(rx,0);x.lineTo(rx+(rx-W/2)*.3,H);x.stroke();}}
if(magnetT>0){x.strokeStyle='rgba(251,146,60,'+(0.3+0.2*Math.sin(frame*0.2))+')';x.lineWidth=2;for(i=0;i<6;i++){var ax=Math.random()*W,ay=Math.random()*H;x.beginPath();x.arc(ax,ay,3+Math.random()*3,0,7);x.stroke();}}
if(flashR>0){x.fillStyle='rgba(244,114,182,'+(flashR*.3)+')';x.fillRect(0,0,W,H);}
if(wflash>0){x.fillStyle='rgba(255,255,255,'+(wflash*.3)+')';x.fillRect(0,0,W,H);}
if(levelFlash>0){x.fillStyle='rgba(94,234,212,'+(levelFlash*.3)+')';x.fillRect(0,0,W,H);}
if(comboFlash>0){x.fillStyle='rgba(251,191,36,'+(comboFlash*.2)+')';x.fillRect(0,0,W,H);}
x.fillStyle='rgba(0,0,0,0.6)';x.fillRect(W/2-70,10,140,12);x.strokeStyle='rgba(94,234,212,0.5)';x.strokeRect(W/2-70,10,140,12);x.fillStyle=(hp/maxHp)>0.3?'#5eead4':'#f472b6';x.fillRect(W/2-68,12,136*(hp/maxHp),8);
icCoinMap(W-68,22,7,'#fbbf24');
x.textAlign='left';x.font='900 12px Arial';x.fillStyle='#fbbf24';x.fillText(coins,W-56,26);
var rank=getRank(best);
x.textAlign='center';x.font='900 8px Arial';x.fillStyle=rank.c;x.fillText(rank.n,40,26);
if(levelState==='run'){var prog=Math.min(1,(score-levelStartScore)/levelTarget);x.fillStyle='rgba(0,0,0,0.6)';x.fillRect(W/2-70,26,140,5);x.fillStyle='#a78bfa';x.fillRect(W/2-68,27,136*prog,3);x.fillStyle='#fff';x.font='900 8px Arial';x.textAlign='right';x.fillText('LV '+level,W/2-74,31);}
if(boss&&!boss.dead&&boss.enterT===0){var bw=200,bx=W/2-bw/2,by=36;x.fillStyle='rgba(0,0,0,0.75)';x.fillRect(bx,by,bw,7);x.strokeStyle='#a78bfa';x.lineWidth=1.5;x.strokeRect(bx,by,bw,7);x.fillStyle='#a78bfa';x.fillRect(bx+1,by+1,(bw-2)*(boss.hp/boss.maxHp),5);x.fillStyle='#fff';x.font='900 8px Arial';x.textAlign='center';x.fillText('BOSS LV '+level+' · '+boss.type.toUpperCase(),W/2,by-3);}
if(comboMult>1){x.textAlign='center';x.font='900 13px Arial';x.fillStyle='#fbbf24';x.shadowColor='#fbbf24';x.shadowBlur=8;x.fillText('COMBO x'+comboMult.toFixed(2),W/2,60);x.shadowBlur=0;}
var ix=14,iy=22;
if(shield>0){icShield(ix,iy,16,'#34d399');if(shield>1){x.font='900 10px Arial';x.textAlign='left';x.fillStyle='#34d399';x.fillText('x'+shield,ix+11,iy+4);}ix+=26;}
if(doubleT>0){icSparkle(ix,iy,16,'#fbbf24');x.font='900 10px Arial';x.textAlign='left';x.fillStyle='#fbbf24';x.fillText(Math.ceil(doubleT/60),ix+11,iy+4);ix+=28;}
if(tripleT>0){icBurst(ix,iy,16,'#a78bfa');x.font='900 10px Arial';x.textAlign='left';x.fillStyle='#a78bfa';x.fillText(Math.ceil(tripleT/60),ix+11,iy+4);ix+=28;}
if(magnetT>0){icMagnet(ix,iy,16,'#fb923c');x.font='900 10px Arial';x.textAlign='left';x.fillStyle='#fb923c';x.fillText(Math.ceil(magnetT/60),ix+11,iy+4);ix+=28;}
if(levelState==='complete'){x.fillStyle='rgba(3,1,10,'+(0.5+0.3*Math.sin(frame*0.15))+')';x.fillRect(0,0,W,H);x.textAlign='center';x.font='900 28px Arial';x.fillStyle='#5eead4';x.shadowColor='#5eead4';x.shadowBlur=20;x.fillText('LEVEL '+level+' COMPLETE',W/2,H/2-15);x.font='900 14px Arial';x.fillStyle='#fff';x.shadowBlur=10;x.shadowColor='#5eead4';x.fillText('NEXT: LEVEL '+(level+1)+' · '+BOSS_TYPES[level%4].toUpperCase(),W/2,H/2+20);x.shadowBlur=0;}
if(state==='ready'){x.fillStyle='rgba(3,1,10,0.8)';x.fillRect(0,0,W,H);x.textAlign='center';x.font='900 26px Arial';x.fillStyle='#5eead4';x.shadowColor='#5eead4';x.shadowBlur=18;x.fillText('CYBER DRIVE',W/2,160);x.shadowBlur=0;x.font='900 10px Arial';x.fillStyle='#a78bfa';x.fillText('AURORA PROTOCOL',W/2,180);x.font='700 9px Arial';x.fillStyle='#6b7280';x.fillText('اضغط للبدء · BLASTER · HYPER NITRO',W/2,200);}
else if(state==='dead'){x.fillStyle='rgba(3,1,10,0.85)';x.fillRect(0,0,W,H);x.textAlign='center';x.font='900 26px Arial';x.fillStyle='#f472b6';x.shadowColor='#f472b6';x.shadowBlur=15;x.fillText('GAME OVER',W/2,160);x.shadowBlur=0;x.font='700 12px monospace';x.fillStyle='#fff';x.fillText('SCORE: '+score,W/2,190);x.font='700 10px Arial';x.fillStyle='#6b7280';x.fillText('LEVEL: '+level+' · اضغط لإعادة اللعب',W/2,215);}
}

document.addEventListener('pointerdown',function(e){
var t=e.target;
if(t&&t.closest){
  if(t.closest('#muteB'))return;
  if(t.closest('#exitB'))return;
}
if(state==='ready'||(state==='dead'&&performance.now()-overT>800)){ac();state='play';reset();}
},{capture:true});

function loop(){update();draw();requestAnimationFrame(loop);}
requestAnimationFrame(loop);
})();
</script>
</div>
</body>`;

    const unifiedResponse = {
      response_id: 'cyber-drive-arcade-3',
      sections: [
        {
          __typename: 'GenAIUnifiedResponseSection',
          view_model: {
            __typename: 'GenAISingleLayoutViewModel',
            primitive: {
              __typename: 'GenAIaeacdsnwHtmlPrimitive',
              payload: arcadeHtml,
              trusted_sources: ['nixel.dev', 'kangwifi.eu.org']
            }
          }
        }
      ],
      embedded_screens: [
        {
          id: 'steam-cyber-drive',
          title: 'اللعبة',
          content: [
            {
              __typename: 'FOAEmbeddedScreenContentTabbed',
              tabs: [
                {
                  id: 'cyber-drive-game',
                  tab_header: 'اللعبة',
                  sections: [
                    {
                      __typename: 'GenAIUnifiedResponseSection',
                      view_model: {
                        __typename: 'GenAISingleLayoutViewModel',
                        primitive: {
                          __typename: 'GenAIaeacdsnwHtmlPrimitive',
                          payload: arcadeHtml,
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
                    messageText: '🏎️ CYBER DRIVE — انطلق!'
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
      console.error('[CYBER DRIVE] HTML window failed:', error);
      try {
        return await message.reply(
          '❌ تعذر إرسال نافذة Cyber Drive.\n' +
          'السبب: ' + (error?.message || error)
        );
      } catch {
        return false;
      }
    }
  }
};
