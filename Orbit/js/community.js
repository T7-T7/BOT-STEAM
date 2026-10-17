/* ════════════════════════════════════════════════════════════
   Orbit · community.js — Pull Requests + Issues + Releases
   ════════════════════════════════════════════════════════════ */
(function(){
'use strict';
var O = window.Orbit;
var el = O.el, makeSvg = O.makeSvg;
var r = O.refs, state = O.state;

/* ═══════════════════════════════════════════════════════════
   PULL REQUESTS
   ═══════════════════════════════════════════════════════════ */
function renderPRs(){
  if(!state.prs.length){
    r.prList.innerHTML='<div class="empty"><i class="oi oi-pr"></i><div class="empty-title">لم يتم تحميل الطلبات</div><div class="empty-desc">اضغط «تحميل».</div></div>';
    return;
  }
  r.prList.innerHTML='';
  state.prs.forEach(function(pr){
    var item=el('div','list-item');
    var iconBox=el('div','list-icon pr'+(pr.state==='closed'?' closed':'')+(pr.merged_at?' merged':''));
    iconBox.appendChild(makeSvg('i-pr')); item.appendChild(iconBox);
    var body=el('div','list-body');
    var title=el('div','list-title');
    title.appendChild(el('span','num','#'+pr.number));
    title.appendChild(el('span',null,pr.title));
    var st=el('span','badge-mini '+pr.state+(pr.merged_at?' merged':'')); st.textContent=pr.merged_at?'مدمج':pr.state==='open'?'مفتوح':'مغلق'; title.appendChild(st);
    body.appendChild(title);
    var sub=el('div','list-sub');
    sub.appendChild(el('span','meta',pr.user?pr.user.login:''));
    sub.appendChild(el('span','meta',(pr.head&&pr.head.ref||'')+' → '+(pr.base&&pr.base.ref||'')));
    body.appendChild(sub);
    item.appendChild(body);
    item.appendChild(el('div','list-time',O.formatArchiveTime(new Date(pr.created_at).getTime())));
    item.addEventListener('click',function(){openPRDetail(pr);});
    r.prList.appendChild(item);
  });
}
function loadPRsList(){
  var token=r.tokenInput.value.trim(),owner=state.owner,repo=state.repoName;
  if(!token||!owner||!repo){O.toast('اختر مستودعًا','warn'); return;}
  O.api('/repos/'+owner+'/'+repo+'/pulls?state='+state.prState+'&per_page=50',{token:token}).then(function(list){
    state.prs=Array.isArray(list)?list:[];
    var openCount=state.prs.filter(function(p){return p.state==='open';}).length;
    if(openCount>0){r.pullsTabCount.textContent=openCount;r.pullsTabCount.classList.remove('hidden');} else r.pullsTabCount.classList.add('hidden');
    renderPRs(); O.addLog('تم تحميل '+state.prs.length+' طلب','success');
  }).catch(function(e){O.addLog(e.message,'error');O.toast(e.message,'error');});
}
r.loadPRsBtn.addEventListener('click',loadPRsList);
r.prStateBtn.addEventListener('click',function(){
  var opts=[{value:'open',label:'مفتوحة'},{value:'closed',label:'مغلقة'},{value:'all',label:'الكل'}];
  O.openPicker({
    title:'حالة الطلبات', icon:'i-info', selected:state.prState,
    items:opts.map(function(o){return {value:o.value,label:o.label,icon:'i-pr'};}),
    onSelect:function(v){
      state.prState=v;
      var o=opts.find(function(x){return x.value===v;});
      r.prStateText.textContent=o?o.label:v;
      loadPRsList();
    }
  });
});
r.newPRBtn.addEventListener('click',function(){
  if(!state.owner||!r.tokenInput.value.trim()){O.toast('اختر مستودعًا','warn'); return;}
  r.prTitle.value=''; r.prBody.value='';
  var names=state.repoBranches.map(function(b){return b.name;});
  if(names.length===0){names=[state.branch||'main'];}
  state._prHead=names[0];
  state._prBase=state.branch||names[0];
  r.prHeadText.textContent=state._prHead;
  r.prBaseText.textContent=state._prBase;
  if(!state.repoBranches.length) O.loadBranches();
  r.newPRModal.classList.add('open'); document.body.classList.add('modal-open');
});
r.prHeadBtn.addEventListener('click',function(){
  var names=state.repoBranches.map(function(b){return b.name;});
  if(names.length===0) names=[state.branch||'main'];
  O.openPicker({title:'من فرع',icon:'i-branch',selected:state._prHead,items:names.map(function(n){return {value:n,label:n,icon:'i-branch'};}),onSelect:function(v){state._prHead=v;r.prHeadText.textContent=v;}});
});
r.prBaseBtn.addEventListener('click',function(){
  var names=state.repoBranches.map(function(b){return b.name;});
  if(names.length===0) names=[state.branch||'main'];
  O.openPicker({title:'إلى فرع',icon:'i-branch',selected:state._prBase,items:names.map(function(n){return {value:n,label:n,icon:'i-branch'};}),onSelect:function(v){state._prBase=v;r.prBaseText.textContent=v;}});
});
r.newPRCloseBtn.addEventListener('click',function(){r.newPRModal.classList.remove('open');document.body.classList.remove('modal-open');});
r.newPRCancelBtn.addEventListener('click',function(){r.newPRModal.classList.remove('open');document.body.classList.remove('modal-open');});
r.newPRCreateBtn.addEventListener('click',function(){
  var title=r.prTitle.value.trim();
  if(!title){O.toast('اكتب العنوان','error'); return;}
  if(state._prHead===state._prBase){O.toast('يجب أن يختلف الفرعان','error'); return;}
  var token=r.tokenInput.value.trim(),owner=state.owner,repo=state.repoName;
  r.newPRCreateBtn.disabled=true;
  O.api('/repos/'+owner+'/'+repo+'/pulls',{method:'POST',token:token,body:{title:title,body:r.prBody.value,head:state._prHead,base:state._prBase}})
    .then(function(pr){
      O.addLog('تم إنشاء PR #'+pr.number,'success');
      O.addToArchive({type:'pr',title:'إنشاء PR',status:'ok',repo:repo,owner:owner,details:{number:pr.number,title:title}});
      O.toast('تم الإنشاء','success');
      r.newPRModal.classList.remove('open'); document.body.classList.remove('modal-open');
      loadPRsList();
    })
    .catch(function(e){O.addLog(e.message,'error');O.toast(e.message,'error');})
    .then(function(){r.newPRCreateBtn.disabled=false;});
});
function openPRDetail(pr){
  state.currentPR=pr;
  r.prDetailTitle.textContent='#'+pr.number+' · '+pr.title;
  var html='';
  function row(l,v,cls){return '<div class="detail-row"><div class="label">'+O.escapeHtml(l)+'</div><div class="value '+(cls||'')+'">'+v+'</div></div>';}
  html+=row('الكاتب',O.escapeHtml(pr.user?pr.user.login:''),'text');
  html+=row('الحالة',O.escapeHtml(pr.merged_at?'مدمج':pr.state==='open'?'مفتوح':'مغلق'));
  html+=row('من',O.escapeHtml(pr.head&&pr.head.ref||''));
  html+=row('إلى',O.escapeHtml(pr.base&&pr.base.ref||''));
  html+=row('تاريخ الإنشاء',O.escapeHtml(new Date(pr.created_at).toLocaleString()),'text');
  if(pr.body) html+=row('الوصف','<pre style="margin:0;font-family:inherit;white-space:pre-wrap;word-break:break-word;direction:ltr;text-align:left">'+O.escapeHtml(pr.body)+'</pre>');
  html+=row('الرابط','<a href="'+O.escapeHtml(pr.html_url)+'" target="_blank" rel="noopener">'+O.escapeHtml(pr.html_url)+'</a>');
  r.prDetailBody.innerHTML=html;
  r.prMergeBtn.classList.toggle('hidden',pr.state!=='open'||!!pr.merged_at);
  r.prCloseBtn.classList.toggle('hidden',pr.state!=='open'||!!pr.merged_at);
  r.prDetailModal.classList.add('open'); document.body.classList.add('modal-open');
}
function closePRDetail(){r.prDetailModal.classList.remove('open');document.body.classList.remove('modal-open');state.currentPR=null;}
r.prDetailCloseBtn.addEventListener('click',closePRDetail);
r.prDetailCloseBtn2.addEventListener('click',closePRDetail);
r.prDetailModal.addEventListener('click',function(e){if(e.target===r.prDetailModal) closePRDetail();});

/* ⭐ دمج PR — يستخدم Confirm Modal المخصص */
r.prMergeBtn.addEventListener('click',async function(){
  var pr=state.currentPR; if(!pr) return;
  var token=r.tokenInput.value.trim(),owner=state.owner,repo=state.repoName;
  if(!await O.confirm({
    title:'دمج الطلب',
    message:'هل تريد دمج PR #' + pr.number + '؟\n' + pr.title,
    okText:'دمج',
    danger:false,
    icon:'oi-merge'
  })) return;
  r.prMergeBtn.disabled=true;
  O.api('/repos/'+owner+'/'+repo+'/pulls/'+pr.number+'/merge',{method:'PUT',token:token,body:{merge_method:'merge'}})
    .then(function(){O.toast('تم الدمج','success');closePRDetail();loadPRsList();})
    .catch(function(e){O.toast(e.message,'error');})
    .then(function(){r.prMergeBtn.disabled=false;});
});

/* ⭐ إغلاق PR — يستخدم Confirm Modal المخصص */
r.prCloseBtn.addEventListener('click',async function(){
  var pr=state.currentPR; if(!pr) return;
  var token=r.tokenInput.value.trim(),owner=state.owner,repo=state.repoName;
  if(!await O.confirm({
    title:'إغلاق الطلب',
    message:'هل تريد إغلاق PR #' + pr.number + '؟\nلن يتم دمجه.',
    okText:'إغلاق'
  })) return;
  O.api('/repos/'+owner+'/'+repo+'/pulls/'+pr.number,{method:'PATCH',token:token,body:{state:'closed'}})
    .then(function(){O.toast('تم الإغلاق','success');closePRDetail();loadPRsList();})
    .catch(function(e){O.toast(e.message,'error');});
});

/* ═══════════════════════════════════════════════════════════
   ISSUES
   ═══════════════════════════════════════════════════════════ */
function renderIssues(){
  var realIssues=state.issues.filter(function(i){return !i.pull_request;});
  if(!realIssues.length){
    r.issueList.innerHTML='<div class="empty"><i class="oi oi-issue"></i><div class="empty-title">لم يتم تحميل البلاغات</div><div class="empty-desc">اضغط «تحميل».</div></div>';
    return;
  }
  r.issueList.innerHTML='';
  realIssues.forEach(function(iss){
    var item=el('div','list-item');
    var iconBox=el('div','list-icon issue'+(iss.state==='closed'?' closed':''));
    iconBox.appendChild(makeSvg('i-issue')); item.appendChild(iconBox);
    var body=el('div','list-body');
    var title=el('div','list-title');
    title.appendChild(el('span','num','#'+iss.number));
    title.appendChild(el('span',null,iss.title));
    var st=el('span','badge-mini '+iss.state); st.textContent=iss.state==='open'?'مفتوح':'مغلق'; title.appendChild(st);
    body.appendChild(title);
    var sub=el('div','list-sub');
    sub.appendChild(el('span','meta',iss.user?iss.user.login:''));
    if(iss.labels&&iss.labels.length) sub.appendChild(el('span','meta',iss.labels.map(function(l){return l.name;}).join(',')));
    body.appendChild(sub);
    item.appendChild(body);
    item.appendChild(el('div','list-time',O.formatArchiveTime(new Date(iss.created_at).getTime())));
    item.addEventListener('click',function(){openIssueDetail(iss);});
    r.issueList.appendChild(item);
  });
}
function loadIssuesList(){
  var token=r.tokenInput.value.trim(),owner=state.owner,repo=state.repoName;
  if(!token||!owner||!repo){O.toast('اختر مستودعًا','warn'); return;}
  O.api('/repos/'+owner+'/'+repo+'/issues?state='+state.issueState+'&per_page=50',{token:token}).then(function(list){
    state.issues=Array.isArray(list)?list:[];
    var openCount=state.issues.filter(function(i){return i.state==='open'&&!i.pull_request;}).length;
    if(openCount>0){r.issuesTabCount.textContent=openCount;r.issuesTabCount.classList.remove('hidden');} else r.issuesTabCount.classList.add('hidden');
    renderIssues(); O.addLog('تم تحميل '+state.issues.length+' بلاغ','success');
  }).catch(function(e){O.addLog(e.message,'error');O.toast(e.message,'error');});
}
r.loadIssuesBtn.addEventListener('click',loadIssuesList);
r.issueStateBtn.addEventListener('click',function(){
  var opts=[{value:'open',label:'مفتوحة'},{value:'closed',label:'مغلقة'},{value:'all',label:'الكل'}];
  O.openPicker({
    title:'حالة البلاغات', icon:'i-info', selected:state.issueState,
    items:opts.map(function(o){return {value:o.value,label:o.label,icon:'i-issue'};}),
    onSelect:function(v){
      state.issueState=v;
      var o=opts.find(function(x){return x.value===v;});
      r.issueStateText.textContent=o?o.label:v;
      loadIssuesList();
    }
  });
});
r.newIssueBtn.addEventListener('click',function(){
  r.issueTitle.value=''; r.issueBody.value=''; r.issueLabels.value='';
  r.newIssueModal.classList.add('open'); document.body.classList.add('modal-open');
});
r.newIssueCloseBtn.addEventListener('click',function(){r.newIssueModal.classList.remove('open');document.body.classList.remove('modal-open');});
r.newIssueCancelBtn.addEventListener('click',function(){r.newIssueModal.classList.remove('open');document.body.classList.remove('modal-open');});
r.newIssueCreateBtn.addEventListener('click',function(){
  var title=r.issueTitle.value.trim();
  if(!title){O.toast('اكتب العنوان','error'); return;}
  var labels=r.issueLabels.value.split(',').map(function(s){return s.trim();}).filter(Boolean);
  var token=r.tokenInput.value.trim(),owner=state.owner,repo=state.repoName;
  r.newIssueCreateBtn.disabled=true;
  O.api('/repos/'+owner+'/'+repo+'/issues',{method:'POST',token:token,body:{title:title,body:r.issueBody.value,labels:labels}})
    .then(function(iss){
      O.addLog('تم إنشاء بلاغ #'+iss.number,'success');
      O.addToArchive({type:'issue',title:'إنشاء بلاغ',status:'ok',repo:repo,owner:owner,details:{number:iss.number,title:title}});
      O.toast('تم الإنشاء','success');
      r.newIssueModal.classList.remove('open'); document.body.classList.remove('modal-open');
      loadIssuesList();
    })
    .catch(function(e){O.addLog(e.message,'error');O.toast(e.message,'error');})
    .then(function(){r.newIssueCreateBtn.disabled=false;});
});
function openIssueDetail(iss){
  state.currentIssue=iss;
  r.issueDetailTitle.textContent='#'+iss.number+' · '+iss.title;
  var html='';
  function row(l,v,cls){return '<div class="detail-row"><div class="label">'+O.escapeHtml(l)+'</div><div class="value '+(cls||'')+'">'+v+'</div></div>';}
  html+=row('الكاتب',O.escapeHtml(iss.user?iss.user.login:''),'text');
  html+=row('الحالة',O.escapeHtml(iss.state==='open'?'مفتوح':'مغلق'));
  html+=row('تاريخ الإنشاء',O.escapeHtml(new Date(iss.created_at).toLocaleString()),'text');
  if(iss.labels&&iss.labels.length) html+=row('التصنيفات',O.escapeHtml(iss.labels.map(function(l){return l.name;}).join(', ')));
  if(iss.body) html+=row('الوصف','<pre style="margin:0;font-family:inherit;white-space:pre-wrap;word-break:break-word;direction:ltr;text-align:left">'+O.escapeHtml(iss.body)+'</pre>');
  html+=row('الرابط','<a href="'+O.escapeHtml(iss.html_url)+'" target="_blank" rel="noopener">'+O.escapeHtml(iss.html_url)+'</a>');
  r.issueDetailBody.innerHTML=html;
  r.issueCloseBtn.classList.toggle('hidden',iss.state!=='open');
  r.issueReopenBtn.classList.toggle('hidden',iss.state!=='closed');
  r.issueDetailModal.classList.add('open'); document.body.classList.add('modal-open');
}
function closeIssueDetail(){r.issueDetailModal.classList.remove('open');document.body.classList.remove('modal-open');state.currentIssue=null;}
r.issueDetailCloseBtn.addEventListener('click',closeIssueDetail);
r.issueDetailCloseBtn2.addEventListener('click',closeIssueDetail);
r.issueDetailModal.addEventListener('click',function(e){if(e.target===r.issueDetailModal) closeIssueDetail();});
r.issueCloseBtn.addEventListener('click',function(){
  var iss=state.currentIssue; if(!iss) return;
  var token=r.tokenInput.value.trim(),owner=state.owner,repo=state.repoName;
  O.api('/repos/'+owner+'/'+repo+'/issues/'+iss.number,{method:'PATCH',token:token,body:{state:'closed'}})
    .then(function(){O.toast('تم الإغلاق','success');closeIssueDetail();loadIssuesList();})
    .catch(function(e){O.toast(e.message,'error');});
});
r.issueReopenBtn.addEventListener('click',function(){
  var iss=state.currentIssue; if(!iss) return;
  var token=r.tokenInput.value.trim(),owner=state.owner,repo=state.repoName;
  O.api('/repos/'+owner+'/'+repo+'/issues/'+iss.number,{method:'PATCH',token:token,body:{state:'open'}})
    .then(function(){O.toast('تم إعادة الفتح','success');closeIssueDetail();loadIssuesList();})
    .catch(function(e){O.toast(e.message,'error');});
});

/* ═══════════════════════════════════════════════════════════
   RELEASES
   ═══════════════════════════════════════════════════════════ */
function renderReleases(){
  if(!state.releases.length){
    r.releaseList.innerHTML='<div class="empty"><i class="oi oi-tag"></i><div class="empty-title">لم يتم تحميل الإصدارات</div><div class="empty-desc">اضغط «تحميل».</div></div>';
    return;
  }
  r.releaseList.innerHTML='';
  state.releases.forEach(function(rel){
    var item=el('div','list-item');
    var iconBox=el('div','list-icon release'); iconBox.appendChild(makeSvg('i-tag')); item.appendChild(iconBox);
    var body=el('div','list-body');
    var title=el('div','list-title');
    title.appendChild(el('span',null,rel.name||rel.tag_name));
    title.appendChild(el('span','badge-mini',rel.tag_name));
    if(rel.prerelease){var p=el('span','badge-mini');p.textContent='تجريبي';title.appendChild(p);}
    if(rel.draft){var d=el('span','badge-mini closed');d.textContent='مسودة';title.appendChild(d);}
    body.appendChild(title);
    var sub=el('div','list-sub');
    sub.appendChild(el('span','meta',rel.author?rel.author.login:''));
    sub.appendChild(el('span','meta',new Date(rel.published_at||rel.created_at).toLocaleDateString()));
    body.appendChild(sub);
    item.appendChild(body);
    item.appendChild(el('div','list-time',O.formatArchiveTime(new Date(rel.created_at).getTime())));
    item.addEventListener('click',function(){window.open(rel.html_url,'_blank');});
    r.releaseList.appendChild(item);
  });
}
r.loadReleasesBtn.addEventListener('click',function(){
  var token=r.tokenInput.value.trim(),owner=state.owner,repo=state.repoName;
  if(!token||!owner||!repo){O.toast('اختر مستودعًا','warn'); return;}
  O.api('/repos/'+owner+'/'+repo+'/releases?per_page=50',{token:token}).then(function(list){
    state.releases=Array.isArray(list)?list:[];
    r.releasesTabCount.textContent=state.releases.length;
    if(state.releases.length) r.releasesTabCount.classList.remove('hidden'); else r.releasesTabCount.classList.add('hidden');
    renderReleases(); O.addLog('تم تحميل '+state.releases.length+' إصدار','success');
  }).catch(function(e){O.addLog(e.message,'error');O.toast(e.message,'error');});
});
r.newReleaseBtn.addEventListener('click',function(){
  r.releaseTag.value=''; r.releaseName.value=''; r.releaseBody.value='';
  r.releasePrerelease.checked=false; r.releaseDraft.checked=false;
  r.newReleaseModal.classList.add('open'); document.body.classList.add('modal-open');
});
r.newReleaseCloseBtn.addEventListener('click',function(){r.newReleaseModal.classList.remove('open');document.body.classList.remove('modal-open');});
r.newReleaseCancelBtn.addEventListener('click',function(){r.newReleaseModal.classList.remove('open');document.body.classList.remove('modal-open');});
r.newReleaseCreateBtn.addEventListener('click',function(){
  var tag=r.releaseTag.value.trim();
  if(!tag){O.toast('اكتب tag','error'); return;}
  var token=r.tokenInput.value.trim(),owner=state.owner,repo=state.repoName;
  r.newReleaseCreateBtn.disabled=true;
  var body={tag_name:tag,name:r.releaseName.value.trim()||tag,body:r.releaseBody.value,draft:r.releaseDraft.checked,prerelease:r.releasePrerelease.checked,target_commitish:state.branch};
  O.api('/repos/'+owner+'/'+repo+'/releases',{method:'POST',token:token,body:body})
    .then(function(rel){
      O.addLog('تم إنشاء إصدار '+rel.tag_name,'success');
      O.addToArchive({type:'release',title:'إنشاء إصدار',status:'ok',repo:repo,owner:owner,details:{tag:rel.tag_name}});
      O.toast('تم الإنشاء','success');
      r.newReleaseModal.classList.remove('open'); document.body.classList.remove('modal-open');
      r.loadReleasesBtn.click();
    })
    .catch(function(e){O.addLog(e.message,'error');O.toast(e.message,'error');})
    .then(function(){r.newReleaseCreateBtn.disabled=false;});
});

/* ─── Expose ────────────────────────────────────────────── */
O.renderPRs = renderPRs;
O.loadPRsList = loadPRsList;
O.openPRDetail = openPRDetail;
O.closePRDetail = closePRDetail;
O.renderIssues = renderIssues;
O.loadIssuesList = loadIssuesList;
O.openIssueDetail = openIssueDetail;
O.closeIssueDetail = closeIssueDetail;
O.renderReleases = renderReleases;

})();