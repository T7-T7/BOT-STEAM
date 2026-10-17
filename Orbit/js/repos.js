/* ════════════════════════════════════════════════════════════
   Orbit · repos.js — المستودعات + التوكن + مستودع جديد
   ════════════════════════════════════════════════════════════ */
(function(){
'use strict';
var O = window.Orbit;
var el = O.el, makeSvg = O.makeSvg;
var r = O.refs, state = O.state;

/* ─── Fetch repos ───────────────────────────────────────── */
function fetchAndStoreUserRepos(token,login){
  O.addLog('جاري تحميل المستودعات…','info');
  return O.api('/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member',{token:token})
    .then(function(list){
      if(!Array.isArray(list)) list=[];
      var simplified=list.map(function(rp){
        return {full_name:rp.full_name,name:rp.name,owner:(rp.owner&&rp.owner.login)||'',private:!!rp.private,default_branch:rp.default_branch||'main',description:rp.description||'',updated_at:rp.updated_at||null};
      });
      state.allRepos=simplified;
      state.reposLogin=login;
      O.saveReposToStorage(login,simplified);
      O.addLog('تم تحميل '+simplified.length+' مستودع','success');
      renderRepoSelect();
      /* ⭐ حدّث عرض المستودع في قسم الرفع */
      if(typeof O.updateUploadRepoText === 'function') O.updateUploadRepoText();
      return simplified;
    });
}

function renderRepoSelect(){
  if(state.allRepos.length===0){
    r.repoPickerText.textContent='— لا توجد مستودعات —';
    r.repoMetaHint.textContent='لا يوجد أي مستودع بعد — أنشئ واحدًا.';
    return;
  }
  var active=O.loadActiveRepo();
  var idx=state.allRepos.findIndex(function(rp){return rp.full_name===active;});
  if(idx===-1) idx=0;
  applySelectedRepo(idx,true);
}

function applySelectedRepo(idx,silent){
  var rp=state.allRepos[idx]; if(!rp) return;
  state.owner=rp.owner;
  state.repoName=rp.name;
  state.branch=rp.default_branch||'main';
  if(r.ownerPrefixCreate) r.ownerPrefixCreate.textContent=rp.owner+' /';
  O.saveActiveRepo(rp.full_name);
  updateActiveRepoChip();
  r.repoPickerText.textContent=rp.full_name+(rp.private?' (خاص)':'');
  r.branchPickerText.textContent=state.branch;
  r.repoMetaHint.textContent=(rp.private?'خاص':'عام')+' · فرع: '+state.branch+(rp.description?' · '+rp.description:'');
  if(!silent) O.addLog('المستودع النشط: '+rp.full_name,'info');
  updateRepoToolsVisibility();
  /* ⭐ حدّث عرض المستودع في قسم الرفع */
  if(typeof O.updateUploadRepoText === 'function') O.updateUploadRepoText();
}

function updateActiveRepoChip(){
  r.activeRepoChipText.textContent=state.repoName?(state.owner?state.owner+'/':'')+state.repoName+' · '+state.branch:'—';
}

function updateRepoToolsVisibility(){
  var hasToken=!!r.tokenInput.value.trim()&&r.tokenField.classList.contains('valid');
  var hasRepo=!!state.repoName;
  r.loadRepoBtn.disabled=!(hasToken&&hasRepo);
  r.newFileBtn.disabled=!(hasToken&&hasRepo);
}

function showSavedBanner(){
  var s=O.loadTokenFromStorage(); if(!s){r.savedBanner.classList.remove('show');return;}
  r.savedBanner.classList.add('show'); r.savedBannerText.textContent='ينتهي بعد '+O.formatRemaining(s.expires);
}

/* ─── Repo Picker (Setup) ──────────────────────────────── */
r.repoPickerBtn.addEventListener('click',function(){
  if(state.allRepos.length===0){O.toast('لا توجد مستودعات','warn'); return;}
  var activeFullName=state.allRepos.find(function(rp){return rp.name===state.repoName&&rp.owner===state.owner;});
  var selFull=activeFullName?activeFullName.full_name:O.loadActiveRepo();
  O.openPicker({
    title:'اختر مستودعًا',
    icon:'i-branch',
    selected:selFull,
    items:state.allRepos.map(function(rp){
      return {value:rp.full_name,label:rp.full_name,icon:'i-folder',sub:rp.description||'',lock:rp.private};
    }),
    onSelect:function(fullName){
      var idx=state.allRepos.findIndex(function(x){return x.full_name===fullName;});
      if(idx!==-1) applySelectedRepo(idx,false);
    }
  });
});

r.refreshReposBtn.addEventListener('click',function(){
  var token=r.tokenInput.value.trim();
  if(!token||!r.tokenField.classList.contains('valid')){O.toast('تحقق من التوكن أولًا','warn');return;}
  fetchAndStoreUserRepos(token,state.owner||state.reposLogin).catch(function(e){O.addLog(e.message,'error');O.toast(e.message,'error');});
});

/* ─── New Repo ──────────────────────────────────────────── */
r.newRepoBtn.addEventListener('click',function(){
  if(!state.owner||!r.tokenInput.value.trim()){O.toast('تحقق من التوكن أولًا','warn');return;}
  r.newRepoNameInput2.value=''; r.newRepoPrivateCb.checked=true;
  r.newRepoModal.classList.add('open'); document.body.classList.add('modal-open');
  setTimeout(function(){r.newRepoNameInput2.focus();},150);
});
r.newRepoCloseBtn.addEventListener('click',function(){r.newRepoModal.classList.remove('open');document.body.classList.remove('modal-open');});
r.newRepoCancelBtn.addEventListener('click',function(){r.newRepoModal.classList.remove('open');document.body.classList.remove('modal-open');});
r.newRepoCreateBtn.addEventListener('click',function(){
  var name=r.newRepoNameInput2.value.trim();
  if(!name){O.toast('اكتب اسم المستودع','error'); return;}
  if(!/^[A-Za-z0-9._-]{1,100}$/.test(name)){O.toast('اسم غير صالح','error'); return;}
  var token=r.tokenInput.value.trim();
  r.newRepoCreateBtn.disabled=true;
  O.api('/user/repos',{method:'POST',token:token,body:{name:name,private:r.newRepoPrivateCb.checked,auto_init:true,description:'Created via Orbit'}})
    .then(function(repo){
      O.addLog('تم إنشاء المستودع: '+repo.full_name,'success');
      O.addToArchive({type:'create',title:'مستودع جديد',status:'ok',owner:repo.owner.login,repo:repo.name,details:{full_name:repo.full_name}});
      O.toast('تم الإنشاء','success');
      r.newRepoModal.classList.remove('open'); document.body.classList.remove('modal-open');
      return fetchAndStoreUserRepos(token,repo.owner.login).then(function(){
        var idx=state.allRepos.findIndex(function(rp){return rp.full_name===repo.full_name;});
        if(idx!==-1) applySelectedRepo(idx,true);
      });
    })
    .catch(function(e){O.addLog(e.message,'error');O.toast(e.message,'error');})
    .then(function(){r.newRepoCreateBtn.disabled=false;});
});

/* ─── Token Check ───────────────────────────────────────── */
r.checkTokenBtn.addEventListener('click',function(){
  var token=r.tokenInput.value.trim();
  if(!token){O.toast('أدخل التوكن أولًا','warn'); r.tokenInput.focus(); return;}
  r.checkTokenBtn.disabled=true; O.setHeaderBadge('جاري التحقق…','warn');
  r.tokenField.classList.remove('valid','invalid');
  var t0=performance.now();
  O.validateToken(token).then(function(res){
    state.owner=res.user.login;
    if(r.ownerPrefixCreate) r.ownerPrefixCreate.textContent=res.user.login+' /';
    r.tokenField.classList.add('valid'); O.renderScopes(res.scopes);
    O.addLog('التوكن صالح — '+res.user.login,'success');
    O.setHeaderBadge('صالح · '+res.user.login,'ok');
    O.addToArchive({type:'validate',title:'التحقق من التوكن',status:'ok',owner:res.user.login,details:{user:res.user.login,scopes:res.scopes||'(fine-grained)'},duration:((performance.now()-t0)/1000).toFixed(2)});
    if(r.rememberToken.checked){if(O.saveTokenToStorage(token)){O.addLog('تم حفظ التوكن','success'); showSavedBanner();}}
    return O.fetchRateLimit(token).then(function(){return res.user.login;});
  }).then(function(login){
    return fetchAndStoreUserRepos(token,login);
  }).then(function(){
    updateRepoToolsVisibility();
    O.toast('تم تحميل مستودعاتك','success');
  }).catch(function(e){
    r.tokenField.classList.add('invalid'); r.tokenScopes.innerHTML='';
    O.addLog(e.message,'error'); O.setHeaderBadge(e.message,'err');
  }).then(function(){r.checkTokenBtn.disabled=false;});
});

/* ─── Toggle Token ──────────────────────────────────────── */
r.toggleTokenBtn.addEventListener('click',function(){
  var isPass=r.tokenInput.type==='password';
  r.tokenInput.type=isPass?'text':'password';
  var i=r.toggleTokenBtn.querySelector('i.oi');
  if(i){ i.className = 'oi ' + (isPass ? 'oi-eye-off' : 'oi-eye'); }
});

/* ─── Remember Token ────────────────────────────────────── */
r.rememberToken.addEventListener('change',function(){
  if(r.rememberToken.checked){r.rememberRow.classList.add('warn-active');r.rememberWarning.classList.remove('hidden');}
  else{r.rememberRow.classList.remove('warn-active');r.rememberWarning.classList.add('hidden');}
});

/* ⭐ مسح التوكن المحفوظ — يستخدم Confirm Modal المخصص */
r.clearSavedTokenBtn.addEventListener('click',async function(){
  if(!await O.confirm({
    title:'مسح التوكن',
    message:'هل أنت متأكد من مسح التوكن المحفوظ؟\nستحتاج إلى إعادة إدخاله في المرة القادمة.',
    okText:'مسح'
  })) return;
  O.clearTokenFromStorage();
  r.savedBanner.classList.remove('show');
  O.toast('تم المسح','success');
});

r.tokenInput.addEventListener('input',function(){
  r.tokenField.classList.remove('valid','invalid'); r.tokenScopes.innerHTML='';
  if(state.owner){state.owner=null; if(r.ownerPrefixCreate) r.ownerPrefixCreate.textContent='owner /';}
  r.rateBadge.classList.add('hidden'); updateRepoToolsVisibility();
});

/* ─── Expose ────────────────────────────────────────────── */
O.fetchAndStoreUserRepos = fetchAndStoreUserRepos;
O.renderRepoSelect = renderRepoSelect;
O.applySelectedRepo = applySelectedRepo;
O.updateActiveRepoChip = updateActiveRepoChip;
O.updateRepoToolsVisibility = updateRepoToolsVisibility;
O.showSavedBanner = showSavedBanner;

})();