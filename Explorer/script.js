const NAMED_COLORS={aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgreen:"#006400",darkgrey:"#a9a9a9",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dimgrey:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",gray:"#808080",green:"#008000",greenyellow:"#adff2f",grey:"#808080",honeydew:"#f0fff0",hotpink:"#ff69b4",indianred:"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgray:"#d3d3d3",lightgreen:"#90ee90",lightgrey:"#d3d3d3",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",lightslategrey:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370db",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#db7093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",rebeccapurple:"#663399",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",slategrey:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32"};
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));const round=(v,d=2)=>Math.round(v*10**d)/10**d;const fmt=(v,d=2)=>String(round(v,d));
function hslToRgb(h,s,l){h=((h%360)+360)%360;s=clamp(s,0,100)/100;l=clamp(l,0,100)/100;const c=(1-Math.abs(2*l-1))*s;const x=c*(1-Math.abs(((h/60)%2)-1));const m=l-c/2;let r=0,g=0,b=0;if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}return{r:Math.round((r+m)*255),g:Math.round((g+m)*255),b:Math.round((b+m)*255)};}
function hsvToRgb(h,s,v){h=((h%360)+360)%360;s=clamp(s,0,100)/100;v=clamp(v,0,100)/100;const c=v*s;const x=c*(1-Math.abs(((h/60)%2)-1));const m=v-c;let r=0,g=0,b=0;if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}return{r:Math.round((r+m)*255),g:Math.round((g+m)*255),b:Math.round((b+m)*255)};}
function hwbToRgb(h,w,bl){w=clamp(w,0,100)/100;bl=clamp(bl,0,100)/100;if(w+bl>=1){const gray=Math.round((w/(w+bl))*255);return{r:gray,g:gray,b:gray};}const{hslToRgb:toRgb}= {hslToRgb};const{r,g,b}=toRgb(h,100,50);const f=(ch)=>Math.round((ch/255*(1-w-bl)+w)*255);return{r:f(r),g:f(g),b:f(b)};}
function cmykToRgb(c,m,y,k){c=clamp(c,0,100)/100;m=clamp(m,0,100)/100;y=clamp(y,0,100)/100;k=clamp(k,0,100)/100;return{r:Math.round(255*(1-c)*(1-k)),g:Math.round(255*(1-m)*(1-k)),b:Math.round(255*(1-y)*(1-k))};}
function rgbToHex(r,g,b){const h=(n)=>clamp(Math.round(n),0,255).toString(16).padStart(2,'0');return'#'+h(r)+h(g)+h(b);}function alphaToHex(a){return clamp(Math.round(a*255),0,255).toString(16).padStart(2,'0');}
function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b);const l=(max+min)/2;let h=0,s=0;if(max!==min){const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);if(max===r)h=((g-b)/d+(g<b?6:0));else if(max===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;}return{h,s:s*100,l:l*100};}
function rgbToHsv(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b);const d=max-min;let h=0;if(d!==0){if(max===r)h=((g-b)/d)%6;else if(max===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360;}return{h,s:(max===0?0:d/max)*100,v:max*100};}
function rgbToHwb(r,g,b){const hsl=rgbToHsl(r,g,b);return{h:hsl.h,w:(Math.min(r,g,b)/255)*100,b:(1-Math.max(r,g,b)/255)*100};}
function rgbToCmyk(r,g,b){r/=255;g/=255;b/=255;const k=1-Math.max(r,g,b);if(k===1)return{c:0,m:0,y:0,k:100};return{c:((1-r-k)/(1-k))*100,m:((1-g-k)/(1-k))*100,y:((1-b-k)/(1-k))*100,k:k*100};}
const srgbToLinear=(c)=>{c/=255;return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4);};
function rgbToXyz(r,g,b){const lr=srgbToLinear(r),lg=srgbToLinear(g),lb=srgbToLinear(b);return{x:(lr*0.4124564+lg*0.3575761+lb*0.1804375)*100,y:(lr*0.2126729+lg*0.7151522+lb*0.0721750)*100,z:(lr*0.0193339+lg*0.1191920+lb*0.9503041)*100};}
const PIVOT=(t)=>(t>216/24389?Math.cbrt(t):(841/108)*t+16/116);
function xyzToLab({x,y,z}){const Xn=95.047,Yn=100.0,Zn=108.883;const fx=PIVOT(x/Xn),fy=PIVOT(y/Yn),fz=PIVOT(z/Zn);return{L:116*fy-16,a:500*(fx-fy),b:200*(fy-fz)};}
function labToLch({L,a,b}){const C=Math.sqrt(a*a+b*b);let H=Math.atan2(b,a)*180/Math.PI;if(H<0)H+=360;return{L,C,H};}
function rgbToOklab(r,g,b){const lr=srgbToLinear(r),lg=srgbToLinear(g),lb=srgbToLinear(b);const l=0.4122214708*lr+0.5363325363*lg+0.0514459929*lb;const m=0.2119034982*lr+0.6806995451*lg+0.1073969566*lb;const s=0.0883024619*lr+0.2817188376*lg+0.6299787005*lb;const l_=Math.cbrt(l),m_=Math.cbrt(m),s_=Math.cbrt(s);return{L:0.2104542553*l_+0.7936177850*m_-0.0040720468*s_,a:1.9779984951*l_-2.4285922050*m_+0.4505937099*s_,b:0.0259040371*l_+0.7827717662*m_-0.8086757660*s_};}
const oklabToOklch=({L,a,b})=>labToLch({L,a,b});
const relativeLuminance=(r,g,b)=>rgbToXyz(r,g,b).y/100;
function contrastRatio(rgb1,rgb2){const l1=relativeLuminance(rgb1.r,rgb1.g,rgb1.b);const l2=relativeLuminance(rgb2.r,rgb2.g,rgb2.b);const[hi,lo]=l1>l2?[l1,l2]:[l2,l1];return(hi+0.05)/(lo+0.05);}
function findNamed(r,g,b){const hex=rgbToHex(r,g,b);for(const[name,value]of Object.entries(NAMED_COLORS)){if(value===hex)return name;}return null;}
function parseColor(raw){if(raw==null)return null;let s=String(raw).trim().toLowerCase();if(!s)return null;if(s==='transparent')return{r:0,g:0,b:0,a:0};if(NAMED_COLORS[s])s=NAMED_COLORS[s];const hexMatch=s.match(/^#([0-9a-f]{3,8})$/)||s.match(/^([0-9a-f]{6}|[0-9a-f]{8})$/);if(hexMatch&&!s.includes('(')){const h=hexMatch[1];if(h.length===3||h.length===4){const[r,g,b,a]=h.split('').map((c)=>parseInt(c+c,16)/255);return h.length===3?{r:r*255,g:g*255,b:b*255,a:1}:{r:r*255,g:g*255,b:b*255,a};}if(h.length===6||h.length===8){const r=parseInt(h.slice(0,2),16);const g=parseInt(h.slice(2,4),16);const b=parseInt(h.slice(4,6),16);const a=h.length===8?parseInt(h.slice(6,8),16)/255:1;return{r,g,b,a};}return null;}const fnMatch=s.match(/^([a-z]+)\s*\(([^)]*)\)$/);if(!fnMatch)return null;const fn=fnMatch[1];const parts=fnMatch[2].replace(/\//g,' ').split(/[\s,]+/).filter(Boolean);if(!parts.length)return null;const num=(v,max)=>{if(v==null)return NaN;if(typeof v==='string'&&v.endsWith('%'))return parseFloat(v)*max/100;return parseFloat(v);};const alpha=(v)=>{if(v==null)return 1;if(typeof v==='string'&&v.endsWith('%'))return parseFloat(v)/100;const n=parseFloat(v);return isNaN(n)?1:clamp(n,0,1);};switch(fn){case'rgb':case'rgba':{const r=num(parts[0],255),g=num(parts[1],255),b=num(parts[2],255);if([r,g,b].some(isNaN))return null;return{r:clamp(r,0,255),g:clamp(g,0,255),b:clamp(b,0,255),a:alpha(parts[3])};}case'hsl':case'hsla':{const h=parseFloat(parts[0]),s=num(parts[1],100),l=num(parts[2],100);if([h,s,l].some(isNaN))return null;return{...hslToRgb(h,s,l),a:alpha(parts[3])};}case'hsv':case'hsva':{const h=parseFloat(parts[0]),s=num(parts[1],100),v=num(parts[2],100);if([h,s,v].some(isNaN))return null;return{...hsvToRgb(h,s,v),a:alpha(parts[3])};}case'hwb':{const h=parseFloat(parts[0]),w=num(parts[1],100),bl=num(parts[2],100);if([h,w,bl].some(isNaN))return null;return{...hwbToRgb(h,w,bl),a:alpha(parts[3])};}case'cmyk':{const c=num(parts[0],100),m=num(parts[1],100),y=num(parts[2],100),k=num(parts[3],100);if([c,m,y,k].some(isNaN))return null;return{...cmykToRgb(c,m,y,k),a:alpha(parts[4])};}default:return null;}}
function buildFormats(c){const r=clamp(Math.round(c.r),0,255),g=clamp(Math.round(c.g),0,255),b=clamp(Math.round(c.b),0,255),a=clamp(c.a,0,1),aStr=fmt(a,3),hex=rgbToHex(r,g,b),hex8=hex+alphaToHex(a),hsl=rgbToHsl(r,g,b),hsv=rgbToHsv(r,g,b),hwb=rgbToHwb(r,g,b),cmyk=rgbToCmyk(r,g,b),xyz=rgbToXyz(r,g,b),lab=xyzToLab(xyz),lch=labToLch(lab),oklab=rgbToOklab(r,g,b),oklch=oklabToOklch(oklab),named=findNamed(r,g,b);const css=[{label:'HEX',value:hex},{label:'HEX 8',value:hex8},{label:'RGB',value:`rgb(${r}, ${g}, ${b})`},{label:'RGBA',value:`rgba(${r}, ${g}, ${b}, ${aStr})`},{label:'HSL',value:`hsl(${fmt(hsl.h,1)}, ${fmt(hsl.s,1)}%, ${fmt(hsl.l,1)}%)`},{label:'HSLA',value:`hsla(${fmt(hsl.h,1)}, ${fmt(hsl.s,1)}%, ${fmt(hsl.l,1)}%, ${aStr})`},{label:'HWB',value:`hwb(${fmt(hwb.h,1)} ${fmt(hwb.w,1)}% ${fmt(hwb.b,1)}% / ${aStr})`}];if(named)css.push({label:'اسم اللون',value:named});const sci=[{label:'HSV',value:`hsv(${fmt(hsv.h,1)}, ${fmt(hsv.s,1)}%, ${fmt(hsv.v,1)}%)`},{label:'HSVA',value:`hsva(${fmt(hsv.h,1)}, ${fmt(hsv.s,1)}%, ${fmt(hsv.v,1)}%, ${aStr})`},{label:'CMYK',value:`cmyk(${fmt(cmyk.c,1)}%, ${fmt(cmyk.m,1)}%, ${fmt(cmyk.y,1)}%, ${fmt(cmyk.k,1)}%)`},{label:'CIELAB',value:`lab(${fmt(lab.L,2)}% ${fmt(lab.a,2)} ${fmt(lab.b,2)})`},{label:'CIELCH',value:`lch(${fmt(lch.L,2)}% ${fmt(lch.C,2)} ${fmt(lch.H,2)})`},{label:'OKLAB',value:`oklab(${fmt(oklab.L,3)} ${fmt(oklab.a,3)} ${fmt(oklab.b,3)})`},{label:'OKLCH',value:`oklch(${fmt(oklch.L,3)} ${fmt(oklch.C,3)} ${fmt(oklch.H,2)})`},{label:'XYZ (D65)',value:`xyz(${fmt(xyz.x,2)}, ${fmt(xyz.y,2)}, ${fmt(xyz.z,2)})`}];const extra=[{label:'RGB (0-1)',value:`${fmt(r/255,3)}, ${fmt(g/255,3)}, ${fmt(b/255,3)}`},{label:'Alpha',value:aStr},{label:'HEX بدون #',value:hex.slice(1)},{label:'CSS color()',value:`color(srgb ${fmt(r/255,3)} ${fmt(g/255,3)} ${fmt(b/255,3)} / ${aStr})`},{label:'RGB 24-bit',value:String((r<<16)|(g<<8)|b)},{label:'الإضاءة النسبية',value:fmt(relativeLuminance(r,g,b),4)}];return{css,sci,extra};}

const state={r:41,g:41,b:41,a:0.5};
const $=(id)=>document.getElementById(id);
const els={
  input:$('colorInput'),picker:$('nativePicker'),alpha:$('alphaSlider'),alphaVal:$('alphaVal'),
  previewFill:$('previewFill'),preview:$('preview'),previewLabel:$('previewLabel'),error:$('error'),
  gridCss:$('gridCss'),gridSci:$('gridSci'),gridExtra:$('gridExtra'),alphaVariants:$('alphaVariants'),
  contrastRow:$('contrastRow'),harmonies:$('harmonies'),
  countCss:$('countCss'),countSci:$('countSci'),countExtra:$('countExtra')
};
const escapeHtml=(s)=>String(s).replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function copyText(text){
  try { await navigator.clipboard.writeText(text); }
  catch {
    const ta=document.createElement('textarea');
    ta.value=text; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
}

function updateDynamicColors(){
  const r=Math.round(state.r),g=Math.round(state.g),b=Math.round(state.b);
  const root=document.documentElement;
  root.style.setProperty('--picked', `rgb(${r}, ${g}, ${b})`);
  root.style.setProperty('--picked-soft', `rgba(${r}, ${g}, ${b}, 0.15)`);
  root.style.setProperty('--picked-glow', `rgba(${r}, ${g}, ${b}, 0.35)`);
}

function setState(c,syncInput=true,syncAlpha=true){
  state.r=clamp(c.r,0,255);state.g=clamp(c.g,0,255);state.b=clamp(c.b,0,255);state.a=clamp(c.a,0,1);
  if(syncInput){els.input.value=`rgba(${Math.round(state.r)}, ${Math.round(state.g)}, ${Math.round(state.b)}, ${fmt(state.a,3)})`;}
  if(syncAlpha){els.alpha.value=Math.round(state.a*100);els.alphaVal.textContent=Math.round(state.a*100)+'%';}
  els.picker.value=rgbToHex(Math.round(state.r),Math.round(state.g),Math.round(state.b));
  render();
}

const copyIconSVG = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>';
const checkIconSVG = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>';

function renderGrid(container,items){
  container.innerHTML=items.map((item)=>`<div class="card"><div class="card-head"><span class="card-label">${escapeHtml(item.label)}</span><button type="button" class="copy-btn" data-copy="${escapeHtml(item.value)}" title="نسخ">${copyIconSVG}</button></div><div class="card-value">${escapeHtml(item.value)}</div></div>`).join('');
}

const ALPHA_LEVELS=[{a:0.05,label:'شبح خافت'},{a:0.10,label:'شفافية شبه معدومة'},{a:0.15,label:'ضباب خفيف جداً'},{a:0.20,label:'ضباب خفيف'},{a:0.30,label:'ضباب متوسط'},{a:0.40,label:'ضباب كثيف'},{a:0.50,label:'نصف شفافية'},{a:0.60,label:'شفافية متوسطة'},{a:0.70,label:'شفافية خفيفة جداً'},{a:0.80,label:'شفافية خفيفة'},{a:0.90,label:'شبه معتم'},{a:1.00,label:'معتم تماماً'}];
function renderAlphaVariants(){const r=Math.round(state.r),g=Math.round(state.g),b=Math.round(state.b);els.alphaVariants.innerHTML=ALPHA_LEVELS.map(({a,label})=>{const rgba=`rgba(${r}, ${g}, ${b}, ${fmt(a,2)})`;const pct=Math.round(a*100);return`<div class="alpha-card"><div class="alpha-swatch" style="--c: rgba(${r}, ${g}, ${b}, ${a})"><span class="alpha-pct">${pct}%</span></div><div class="alpha-body"><div class="alpha-desc">${label}</div><div class="alpha-code">${rgba}</div></div><button type="button" class="copy-btn" data-copy="${rgba}" title="نسخ">${copyIconSVG}</button></div>`;}).join('');}

function renderContrast(){const fg={r:state.r,g:state.g,b:state.b};const cards=[{title:'مع الأبيض',bg:'#ffffff',color:'#111111',ratio:contrastRatio(fg,{r:255,g:255,b:255})},{title:'مع الأسود',bg:'#000000',color:'#ffffff',ratio:contrastRatio(fg,{r:0,g:0,b:0})}];els.contrastRow.innerHTML=cards.map((c)=>{const pass=c.ratio>=4.5,aaa=c.ratio>=7;const level=aaa?'AAA ✓':pass?'AA ✓':c.ratio>=3?'AA كبير ✓':'غير مطابق ✗';const cls=pass||aaa?'badge-pass':'badge-fail';return`<div class="contrast-card"><div class="contrast-sample" style="background:${c.bg};color:${c.color}">Aa</div><div class="contrast-info"><span class="contrast-ratio">${c.ratio.toFixed(2)}:1</span><span class="contrast-level">${c.title} · <span class="${cls}">${level}</span></span></div></div>`;}).join('');}

function renderHarmonies(){const hsl=rgbToHsl(state.r,state.g,state.b);const h=hsl.h;const s=Math.max(hsl.s,28);const l=clamp(hsl.l,30,65);const sets=[{name:'متكاملة',hues:[h,h+180]},{name:'متشابهة',hues:[h-30,h,h+30]},{name:'ثلاثية',hues:[h,h+120,h+240]},{name:'رباعية',hues:[h,h+90,h+180,h+270]},{name:'منقسمة متكاملة',hues:[h,h+150,h+210]}];const shades=[12,28,44,58,72,88].map((lv)=>hslToRgb(h,s,lv));const swatchHtml=(hex)=>`<button type="button" class="swatch" data-copy="${hex}" title="${hex}" style="background:${hex}"></button>`;els.harmonies.innerHTML=sets.map((set)=>`<div class="harmony"><span class="harmony-name">${set.name}</span><div class="harmony-swatches">${set.hues.map((hu)=>{const rgb=hslToRgb(hu,s,l);return swatchHtml(rgbToHex(rgb.r,rgb.g,rgb.b));}).join('')}</div></div>`).join('')+`<div class="harmony"><span class="harmony-name">تدرجات</span><div class="harmony-swatches">${shades.map((rgb)=>swatchHtml(rgbToHex(rgb.r,rgb.g,rgb.b))).join('')}</div></div>`;}

function updateAlphaSliderColor(){
  const{r,g,b}=state;
  els.alpha.style.background=`linear-gradient(to right, rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},0), rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},1))`;
}

function render(){
  updateDynamicColors();
  const rgba=`rgba(${Math.round(state.r)}, ${Math.round(state.g)}, ${Math.round(state.b)}, ${round(state.a,3)})`;
  els.previewFill.style.background=rgba;
  els.previewLabel.textContent=rgba;
  const f=buildFormats(state);
  renderGrid(els.gridCss,f.css);
  renderGrid(els.gridSci,f.sci);
  renderGrid(els.gridExtra,f.extra);
  renderAlphaVariants();
  renderContrast();
  renderHarmonies();
  updateAlphaSliderColor();
  if(els.countCss)els.countCss.textContent=f.css.length;
  if(els.countSci)els.countSci.textContent=f.sci.length;
  if(els.countExtra)els.countExtra.textContent=f.extra.length;
}

const tabs=document.querySelectorAll('.tab');
const panels=document.querySelectorAll('.tab-panel');
function activateTab(name){
  tabs.forEach((t)=>{const isActive=t.dataset.tab===name;t.classList.toggle('active',isActive);t.setAttribute('aria-selected',isActive?'true':'false');});
  panels.forEach((p)=>{p.classList.toggle('active',p.id==='panel-'+name);});
}
tabs.forEach((tab)=>{tab.addEventListener('click',()=>activateTab(tab.dataset.tab));});

els.input.addEventListener('input',()=>{
  if(!els.input.value.trim()){els.error.classList.remove('show');return;}
  const parsed=parseColor(els.input.value);
  if(!parsed){els.error.textContent='صيغة غير معروفة. جرّب: #454545 أو rgba(41,41,41,0.5)';els.error.classList.add('show');return;}
  els.error.classList.remove('show');
  setState(parsed,false,true);
});
els.alpha.addEventListener('input',()=>{
  const v=parseInt(els.alpha.value,10)/100;
  state.a=v;
  els.alphaVal.textContent=Math.round(v*100)+'%';
  els.input.value=`rgba(${Math.round(state.r)}, ${Math.round(state.g)}, ${Math.round(state.b)}, ${fmt(v,3)})`;
  render();
});
els.picker.addEventListener('input',()=>{
  const parsed=parseColor(els.picker.value);
  if(parsed)setState({...parsed,a:state.a},true,true);
});
document.querySelectorAll('.chip').forEach((chip)=>{
  chip.addEventListener('click',()=>{els.input.value=chip.dataset.c;els.input.dispatchEvent(new Event('input'));});
});
document.addEventListener('click',(e)=>{
  const sw=e.target.closest('.swatch');
  if(sw){copyText(sw.dataset.copy);return;}
  const btn=e.target.closest('.copy-btn');
  if(!btn)return;
  copyText(btn.dataset.copy).then(()=>{
    btn.innerHTML = checkIconSVG;
    btn.classList.add('done');
    setTimeout(()=>{
      btn.innerHTML = copyIconSVG;
      btn.classList.remove('done');
    },1400);
  });
});

(function init(){
  els.input.value='rgba(41, 41, 41, 0.5)';
  const parsed=parseColor(els.input.value);
  setState(parsed,false,true);
})();

(function(){
  var loc=location.href.replace(/#.*$/,"");
  var ATTR_NAMES=["data-product-id","data-productid","data-product_id","product-id","productid","product_id","data-source-entity-id","source-entity-id","source_entity_id","data-product","data-metadata","data-meta"];
  var DATASET_KEYS=["productId","productid","product_id","sourceEntityId","sourceentityid","source_entity_id","product","metadata","meta"];
  function readProductId(value){if(typeof value!=="string"||value.length===0)return null;if(/^[0-9]{6,}$/.test(value))return value;var match=value.match(/(?:product(?:_|-)?id|source(?:_|-)?entity(?:_|-)?id)["'=:\s]+([0-9]{6,})/i);return match?match[1]:null}
  function extractProductId(start){for(var node=start;node&&node!==document.body;node=node.parentElement){for(var i=0;i<ATTR_NAMES.length;i++){var attrValue=node.getAttribute&&node.getAttribute(ATTR_NAMES[i]);var attrProductId=readProductId(attrValue);if(attrProductId)return attrProductId}var dataset=node.dataset||null;if(dataset){for(var j=0;j<DATASET_KEYS.length;j++){var dataValue=dataset[DATASET_KEYS[j]];var dataProductId=readProductId(dataValue);if(dataProductId)return dataProductId}}}return null}
  function isInlineMediaSlotElement(node){return !!(node&&node.getAttribute&&node.getAttribute("data-clippy-inline-media-slot")!==null)}
  function findInlineMediaSlot(start){for(var node=start;node&&node!==document.body;node=node.parentElement){if(isInlineMediaSlotElement(node))return node}return null}
  function readInlineMediaUrl(node){if(!node)return null;return node.getAttribute&&((node.getAttribute("data-clippy-inline-media-url")||node.getAttribute("data-url")||node.getAttribute("data_url")))||node.href||null}
  function stripHash(url){return String(url).replace(/#.*$/,"")}
  function urlsMatch(a,b){if(!a||!b)return false;try{return stripHash(new URL(a,loc).href)===stripHash(new URL(b,loc).href)}catch(_){return stripHash(a)===stripHash(b)}}
  function isFirstPartyReelUrl(value){try{var url=new URL(value,loc);if(url.protocol!=="https:")return false;var host=url.hostname.toLowerCase();var supported=host==="instagram.com"||host.endsWith(".instagram.com")||host==="facebook.com"||host.endsWith(".facebook.com");return supported&&/\/reels?\//i.test(url.pathname)}catch(_){return false}}
  function isInlineMediaUrlClick(node,href){var slot=findInlineMediaSlot(node);if(!slot)return false;var slotUrl=readInlineMediaUrl(slot);if(slotUrl)return urlsMatch(href,slotUrl);return isFirstPartyReelUrl(href)}
  function findDataHref(start){for(var node=start;node&&node!==document.body;node=node.parentElement){if(node.getAttribute){var href=node.getAttribute("data-href")||node.getAttribute("data-url");if(href)return{href:href,node:node}}}return null}
  var nativeOpen=window.open;
  window.open=function(url){if(parent!==window&&typeof url==="string"&&/^https?:\/\//.test(url)){parent.postMessage({type:"ecto:usercontent-link-click",href:url},"*");return null}return nativeOpen?nativeOpen.apply(window,arguments):null};
  document.addEventListener("click",function(e){
    var target=e.target instanceof Element?e.target:null;if(!target)return;if(parent===window)return;
    var a=target.closest?target.closest("a[href]"):null;
    if(a&&a.href&&/^https?:\/\//.test(a.href)&&a.href.replace(/#.*$/,"")!==loc){
      if(isInlineMediaUrlClick(a,a.href))return;
      var productId=extractProductId(target)||extractProductId(a);
      if(productId){e.preventDefault();parent.postMessage({type:"ecto-artifact-link-click",productId:productId},"*");return}
      e.preventDefault();parent.postMessage({type:"ecto:usercontent-link-click",href:a.href},"*");return
    }
    var dataHref=findDataHref(target);
    if(dataHref&&/^https?:\/\//.test(dataHref.href)&&dataHref.href.replace(/#.*$/,"")!==loc){
      if(isInlineMediaUrlClick(dataHref.node,dataHref.href))return;
      e.preventDefault();parent.postMessage({type:"ecto:usercontent-link-click",href:dataHref.href},"*")
    }
  },true);
})();

(function(){
  var FOCUS_TYPE="ecto:artifact-focus-request";
  var CLOSE_TYPE="ecto:artifact-close-request";
  function focusArtifactDocument(){var body=document.body;if(!body)return;try{window.focus();}catch(e){}if(!body.hasAttribute("tabindex"))body.setAttribute("tabindex","-1");try{body.focus({preventScroll:true});}catch(e){try{body.focus();}catch(e2){}}}
  window.addEventListener("message",function(event){
    if(event.source!==window.parent)return;
    var data=event.data;if(!data||typeof data!=="object"||data.type!==FOCUS_TYPE)return;
    if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",focusArtifactDocument,{once:true});return;}
    focusArtifactDocument();
  });
  window.addEventListener("keydown",function(event){
    if(event.key!=="Escape")return;
    window.setTimeout(function(){if(event.defaultPrevented)return;window.parent.postMessage({type:CLOSE_TYPE},"*");},0);
  });
})();