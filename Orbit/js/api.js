/* ════════════════════════════════════════════════════════════
   Orbit · api.js — GitHub API + Picker Modal
   ════════════════════════════════════════════════════════════ */
(function(){
'use strict';
var O = window.Orbit;
var el = O.el, makeSvg = O.makeSvg;
var r = O.refs, state = O.state;

/* ─── Error → Arabic ────────────────────────────────────── */
function describeError(res,data){
  var msg=(data&&data.message)||res.statusText||'Error';
  switch(res.status){
    case 401:return 'التوكن غير صالح (401).';
    case 403:return 'صلاحية مرفوضة (403).';
    case 404:return 'غير موجود (404).';
    case 409:return 'تعارض (409).';
    case 422:return 'بيانات غير صحيحة (422): '+msg;
    default:return 'خطأ ('+res.status+'): '+msg;
  }
}

/* ─── API Fetch ─────────────────────────────────────────── */
function api(path,opts){
  opts=opts||{};
  var headers={
    'Accept':'application/vnd.github+json',
    'X-GitHub-Api-Version':O.API_VERSION
  };
  if(opts.token) headers['Authorization']='Bearer '+opts.token;
  if(opts.body!==undefined) headers['Content-Type']='application/json';

  /* ✅ cache buster في الرابط — آمن مع CORS ولا يسبب preflight */
  var isGet = !opts.method || opts.method === 'GET';
  var finalPath = path;
  if(isGet){
    var sep = path.indexOf('?') === -1 ? '?' : '&';
    finalPath = path + sep + '_t=' + Date.now();
  }

  return fetch(O.GH_API+finalPath,{
    method:opts.method||'GET',
    headers:headers,
    body:opts.body!==undefined?JSON.stringify(opts.body):undefined,
    cache:'no-store',
    mode:'cors',
    credentials:'omit'
  })
    .catch(function(err){
      /* ✅ اطبع الخطأ الحقيقي للمساعدة في التشخيص */
      console.error('[Orbit API] fetch failed:', err, 'URL:', O.GH_API+finalPath);
      throw new Error('تعذّر الاتصال بـ GitHub. ('+(err && err.message ? err.message : 'network')+')');
    })
    .then(function(res){
      var rl={
        remaining:parseInt(res.headers.get('x-ratelimit-remaining')||'0',10),
        limit:parseInt(res.headers.get('x-ratelimit-limit')||'0',10)
      };
      if(!isNaN(rl.remaining)&&rl.limit) O.updateRateBadge(rl);
      if(opts.allow404&&res.status===404) return null;
      return res.text().then(function(text){
        var data=null;
        if(text){try{data=JSON.parse(text);}catch(e){}}
        if(!res.ok){var err=new Error(describeError(res,data));err.status=res.status;throw err;}
        return data;
      });
    });
}

function fetchRateLimit(token){
  return api('/rate_limit',{token:token})
    .then(function(d){if(d&&d.rate) O.updateRateBadge(d.rate);return d;})
    .catch(function(){});
}

function validateToken(token){
  /* ✅ نستخدم fetch مباشرة لكن بنفس الطريقة */
  return fetch(O.GH_API+'/user?_t='+Date.now(),{
    headers:{
      'Authorization':'Bearer '+token,
      'Accept':'application/vnd.github+json',
      'X-GitHub-Api-Version':O.API_VERSION
    },
    cache:'no-store',
    mode:'cors',
    credentials:'omit'
  })
    .catch(function(err){
      console.error('[Orbit API] validateToken failed:', err);
      throw new Error('تعذّر الاتصال بـ GitHub. ('+(err && err.message ? err.message : 'network')+')');
    })
    .then(function(res){
      if(res.status===401) throw new Error('التوكن غير صالح.');
      if(!res.ok){
        return res.json().catch(function(){return null;}).then(function(d){
          throw new Error(describeError(res,d));
        });
      }
      var scopes=null;
      try{scopes=res.headers.get('x-oauth-scopes');}catch(e){}
      return res.json().then(function(u){return {user:u,scopes:scopes};});
    })
    .catch(function(err){
      if(err.message&&/^(التوكن|صلاحية|غير موجود|تعارض|بيانات|خطأ|تعذّر)/.test(err.message)) throw err;
      throw new Error('تعذّر الاتصال بـ GitHub.');
    });
}

function renderScopes(scopes){
  r.tokenScopes.innerHTML='';
  if(scopes===null){var p=el('span','scope-pill','fine-grained');r.tokenScopes.appendChild(p);return;}
  if(!scopes) return;
  scopes.split(',').map(function(s){return s.trim();}).filter(Boolean).forEach(function(s){
    var p=el('span','scope-pill');
    if(s==='repo'||s==='public_repo') p.classList.add('ok');
    p.textContent=s; r.tokenScopes.appendChild(p);
  });
}

/* ─── Generic Picker Modal ──────────────────────────────── */
function openPicker(opts){
  state.pickerCallback=opts.onSelect;
  state.pickerSelectedValue=opts.selected;
  r.pickerTitle.textContent=opts.title||'اختر';
  var iconName = String(opts.icon||'i-list').replace(/^i-/, '');
  r.pickerTitleIcon.className = 'oi oi-' + iconName;
  r.pickerList.innerHTML='';
  opts.items.forEach(function(item){
    var btn=el('button','picker-item'+(item.value===opts.selected?' selected':''));
    btn.type='button';
    var icWrap=el('div','picker-item-ic');
    icWrap.appendChild(makeSvg(item.icon||'i-folder'));
    btn.appendChild(icWrap);
    var body=el('div','picker-item-body');
    var titleEl=el('div','picker-item-title');
    titleEl.textContent=item.label;
    titleEl.style.direction=item.dir||'ltr';
    titleEl.style.textAlign='start';
    body.appendChild(titleEl);
    if(item.sub){var sub=el('div','picker-item-sub');sub.textContent=item.sub;body.appendChild(sub);}
    btn.appendChild(body);
    if(item.lock){
      var lock=makeSvg('i-lock');
      lock.style.color='var(--warn)';
      lock.style.width='13px';
      lock.style.height='13px';
      btn.appendChild(lock);
    }
    btn.addEventListener('click',function(){
      var cb=state.pickerCallback;
      closePicker();
      if(cb) cb(item.value,item);
    });
    r.pickerList.appendChild(btn);
  });
  r.pickerModal.classList.add('open');
  document.body.classList.add('modal-open');
}
function closePicker(){
  r.pickerModal.classList.remove('open');
  document.body.classList.remove('modal-open');
  state.pickerCallback=null;
}
r.pickerCloseBtn.addEventListener('click',closePicker);
r.pickerCancelBtn.addEventListener('click',closePicker);
r.pickerModal.addEventListener('click',function(e){if(e.target===r.pickerModal) closePicker();});

/* ─── Expose ────────────────────────────────────────────── */
O.api = api;
O.describeError = describeError;
O.fetchRateLimit = fetchRateLimit;
O.validateToken = validateToken;
O.renderScopes = renderScopes;
O.openPicker = openPicker;
O.closePicker = closePicker;

})();