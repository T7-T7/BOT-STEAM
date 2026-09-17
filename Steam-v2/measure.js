const strip=s=>String(s??'').replace(/\x1B\[[0-?]*[ -/]*[@-~]/g,'');
export function width(s){return [...strip(s)].length;}
export function measure(title,lines=[]){const ls=lines.flatMap(x=>String(x??'').split(/\r?\n/)); const w=Math.max(width(title),...ls.map(width),20)+4; return {title,lines:ls,width:Math.min(w,process.stdout.columns||120)};}
