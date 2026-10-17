/* ════════════════════════════════════════════════════════════
   Orbit · core.js — الأساسيات + Confirm Modal + Refresh
   (يتضمن refs الأزرار الجديدة: حذف + ZIP + تحديد/إلغاء)
   ════════════════════════════════════════════════════════════ */
(function(){
'use strict';
var O = window.Orbit = window.Orbit || {};

/* ─── Constants ─────────────────────────────────────────── */
O.GH_API = 'https://api.github.com';
O.API_VERSION = '2022-11-28';
O.CONCURRENCY = 4;
O.SKIP_DIRS = {'.git':1,'node_modules':1,'.vscode':1,'.idea':1,'dist':1,'build':1,'.cache':1,'__pycache__':1,'.next':1,'.nuxt':1};
O.SKIP_FILES = {'.ds_store':1,'thumbs.db':1,'desktop.ini':1};
O.STORAGE = {token:'orbit_token_v2',archive:'orbit_archive_v2',theme:'orbit_theme_v2',activeRepo:'orbit_active_repo_v2',reposKey:'orbit_repos_key_v2'};
O.TOKEN_TTL_DAYS = 30;
O.ARCHIVE_MAX = 200;
O.EXT_TO_LANG = {'html':'HTML','htm':'HTML','xhtml':'HTML','css':'CSS','scss':'CSS','sass':'CSS','less':'CSS','js':'JS','mjs':'JS','cjs':'JS','jsx':'JSX','ts':'TS','mts':'TS','cts':'TS','tsx':'TSX','json':'JSON','jsonc':'JSON','md':'MD','markdown':'MD','svg':'SVG','xml':'XML','yml':'YAML','yaml':'YAML','txt':'TXT','log':'TXT'};

/* ─── State ─────────────────────────────────────────────── */
O.state = {
  files:[],fileMap:new Map(),dirRegistry:[],
  owner:null,repoName:null,branch:'main',
  uploading:false,logs:[],repoFiles:[],repoBranches:[],
  repoNeedsRefresh:false,
  lastLoadedTreeSha:null,
  /* رفع */
  uploadFolderPath:[],
  uploadFolderCache:null,
  uploadZipMode:false,
  deleteMode:false,
  /* محرر */
  editorRepo:null,
  editorFolderCache:null,
  /* بيانات */
  archive:[],prs:[],issues:[],releases:[],
  allRepos:[],reposLogin:null,
  currentArchiveEntryId:null,currentPR:null,currentIssue:null,
  currentTab:'setup',pathSegments:[],editingPath:null,
  prState:'open',issueState:'open',
  fpMode:null,fpSourcePath:null,fpSourceType:'file',fpRepoIdx:0,fpPath:[],fpRepoFiles:[],
  pickerCallback:null,pickerItems:[],pickerSelectedValue:null,pickerTitleKey:null
};

O._refreshTimer = null;
O._retryTimer = null;

/* ─── Helpers ───────────────────────────────────────────── */
O.$ = function(s){return document.querySelector(s);};
O.$$ = function(s){return Array.prototype.slice.call(document.querySelectorAll(s));};
O.el = function(tag,cls,txt){var e=document.createElement(tag); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e;};
O.makeSvg = function(id,cls){
  var name = String(id).replace(/^i-/, '');
  var i = document.createElement('i');
  i.className = 'oi oi-' + name + (cls ? ' ' + cls : '');
  return i;
};
var $ = O.$, $$ = O.$$, el = O.el, makeSvg = O.makeSvg;

/* ─── DOM Refs ──────────────────────────────────────────── */
var r = O.refs = {};

/* Header */
r.headerBadge=$('#headerBadge'); r.headerBadgeText=$('#headerBadgeText');
r.footerStatus=$('#footerStatus');
r.rateBadge=$('#rateBadge'); r.rateRemaining=$('#rateRemaining'); r.rateLimit=$('#rateLimit');
r.uploadTabCount=$('#uploadTabCount');
r.pullsTabCount=$('#pullsTabCount'); r.issuesTabCount=$('#issuesTabCount'); r.releasesTabCount=$('#releasesTabCount');
r.remoteTabCount=$('#remoteTabCount');

/* Setup — Token */
r.savedBanner=$('#savedBanner'); r.savedBannerText=$('#savedBannerText');
r.clearSavedTokenBtn=$('#clearSavedTokenBtn');
r.rememberRow=$('#rememberRow'); r.rememberToken=$('#rememberToken'); r.rememberWarning=$('#rememberWarning');
r.tokenField=$('#tokenField'); r.tokenInput=$('#tokenInput'); r.toggleTokenBtn=$('#toggleTokenBtn');
r.checkTokenBtn=$('#checkTokenBtn'); r.tokenScopes=$('#tokenScopes');

/* Setup — Repos */
r.ownerPrefixCreate=$('#ownerPrefixCreate');
r.visPrivate=$('#visPrivate'); r.commitInput=$('#commitInput');
r.refreshReposBtn=$('#refreshReposBtn'); r.newRepoBtn=$('#newRepoBtn');
r.repoPickerBtn=$('#repoPickerBtn'); r.repoPickerText=$('#repoPickerText'); r.repoMetaHint=$('#repoMetaHint');

/* Remote — Repo tree */
r.loadRepoBtn=$('#loadRepoBtn'); r.newFileBtn=$('#newFileBtn');
r.repoToolsStatus=$('#repoToolsStatus'); r.repoTreeSection=$('#repoTreeSection');
r.repoTree=$('#repoTree'); r.repoStats=$('#repoStats');
r.loadBranchesBtn=$('#loadBranchesBtn'); r.newBranchBtn=$('#newBranchBtn');
r.branchPickerBtn=$('#branchPickerBtn'); r.branchPickerText=$('#branchPickerText');
r.activeRepoChipText=$('#activeRepoChipText');

/* Upload — Destination */
r.uploadRepoPickerBtn=$('#uploadRepoPickerBtn');
r.uploadRepoText=$('#uploadRepoText');
r.uploadRepoHint=$('#uploadRepoHint');
r.uploadFolderPickerBtn=$('#uploadFolderPickerBtn');
r.uploadFolderText=$('#uploadFolderText');
r.uploadFolderModal=$('#uploadFolderModal');
r.ufCloseBtn=$('#ufCloseBtn'); r.ufCancelBtn=$('#ufCancelBtn'); r.ufConfirmBtn=$('#ufConfirmBtn');
r.ufPath=$('#ufPath'); r.ufContents=$('#ufContents'); r.ufManualInput=$('#ufManualInput');

/* ⭐ Upload — Select All / Deselect All / Delete Mode */
r.selectAllBtn=$('#selectAllBtn');
r.deselectAllBtn=$('#deselectAllBtn');
r.deleteModeBtn=$('#deleteModeBtn');
r.confirmDeleteBtn=$('#confirmDeleteBtn');
r.deleteModeBanner=$('#deleteModeBanner');

/* ⭐ Upload — Mode (Files / ZIP) */
r.uploadModeFilesCard=$('#uploadModeFilesCard');
r.uploadModeZipCard=$('#uploadModeZipCard');
r.zipNameRow=$('#zipNameRow');
r.zipNameInput=$('#zipNameInput');

/* Upload — File pickers */
r.pickFilesBtn=$('#pickFilesBtn'); r.pickFolderBtn=$('#pickFolderBtn');
r.filesInput=$('#filesInput'); r.folderInput=$('#folderInput');
r.treeSection=$('#treeSection'); r.emptyState=$('#emptyState');
r.tree=$('#tree'); r.stats=$('#stats');
r.optKeepRoot=$('#optKeepRoot');
r.pathPreviewValue=$('#pathPreviewValue');
r.selSummary=$('#selSummary'); r.selTitle=$('#selTitle'); r.selSub=$('#selSub');

/* Upload — Final */
r.uploadBtn=$('#uploadBtn'); r.uploadSummary=$('#uploadSummary');
r.progressLabel=$('#progressLabel'); r.progressPct=$('#progressPct');
r.progressBar=$('#progressBar'); r.progressFile=$('#progressFile');
r.resultBox=$('#resultBox'); r.resultUrl=$('#resultUrl');

/* Logs */
r.log=$('#log'); r.clearLogsBtn=$('#clearLogsBtn'); r.downloadLogsBtn=$('#downloadLogsBtn');

/* Editor */
r.editorModal=$('#editorModal');
r.editorTitleBadge=$('#editorTitleBadge'); r.editorTitleName=$('#editorTitleName');
r.editorPath=$('#editorPath'); r.editorCommit=$('#editorCommit');
r.editorSaveBtn=$('#editorSaveBtn'); r.editorCancelBtn=$('#editorCancelBtn'); r.editorCloseBtn=$('#editorCloseBtn');
r.editorCommitPanel=$('#editorCommitPanel');
r.editorCommitConfirmBtn=$('#editorCommitConfirmBtn');
r.pathChips=$('#pathChips');
r.editorRepoPickerBtn=$('#editorRepoPickerBtn');
r.editorRepoText=$('#editorRepoText');
r.editorFolderPickerBtn=$('#editorFolderPickerBtn');
r.editorFolderText=$('#editorFolderText');
r.editorFolderModal=$('#editorFolderModal');
r.efCloseBtn=$('#efCloseBtn');
r.efCancelBtn=$('#efCancelBtn');
r.efConfirmBtn=$('#efConfirmBtn');
r.efPath=$('#efPath');
r.efContents=$('#efContents');
r.efManualInput=$('#efManualInput');

/* Archive Detail */
r.archiveDetailModal=$('#archiveDetailModal');
r.archiveDetailTitleText=$('#archiveDetailTitleText');
r.archiveDetailBody=$('#archiveDetailBody');
r.archiveDetailCloseBtn=$('#archiveDetailCloseBtn');
r.archiveDetailCloseBtn2=$('#archiveDetailCloseBtn2');
r.archiveDetailDeleteBtn=$('#archiveDetailDeleteBtn');

/* New Repo */
r.newRepoModal=$('#newRepoModal');
r.newRepoNameInput2=$('#newRepoNameInput2');
r.newRepoPrivateCb=$('#newRepoPrivateCb');
r.newRepoCloseBtn=$('#newRepoCloseBtn');
r.newRepoCancelBtn=$('#newRepoCancelBtn');
r.newRepoCreateBtn=$('#newRepoCreateBtn');

/* New Branch */
r.newBranchModal=$('#newBranchModal');
r.newBranchName=$('#newBranchName');
r.newBranchFromBtn=$('#newBranchFromBtn');
r.newBranchFromText=$('#newBranchFromText');
r.newBranchCloseBtn=$('#newBranchCloseBtn');
r.newBranchCancelBtn=$('#newBranchCancelBtn');
r.newBranchCreateBtn=$('#newBranchCreateBtn');

/* New PR */
r.newPRModal=$('#newPRModal'); r.prTitle=$('#prTitle'); r.prBody=$('#prBody');
r.prHeadBtn=$('#prHeadBtn'); r.prHeadText=$('#prHeadText');
r.prBaseBtn=$('#prBaseBtn'); r.prBaseText=$('#prBaseText');
r.newPRCloseBtn=$('#newPRCloseBtn'); r.newPRCancelBtn=$('#newPRCancelBtn'); r.newPRCreateBtn=$('#newPRCreateBtn');

/* PR List */
r.loadPRsBtn=$('#loadPRsBtn'); r.newPRBtn=$('#newPRBtn');
r.prList=$('#prList'); r.prStateBtn=$('#prStateBtn'); r.prStateText=$('#prStateText');

/* PR Detail */
r.prDetailModal=$('#prDetailModal'); r.prDetailTitle=$('#prDetailTitle'); r.prDetailBody=$('#prDetailBody');
r.prDetailCloseBtn=$('#prDetailCloseBtn'); r.prDetailCloseBtn2=$('#prDetailCloseBtn2');
r.prCloseBtn=$('#prCloseBtn'); r.prMergeBtn=$('#prMergeBtn');

/* New Issue */
r.newIssueModal=$('#newIssueModal'); r.issueTitle=$('#issueTitle');
r.issueBody=$('#issueBody'); r.issueLabels=$('#issueLabels');
r.newIssueCloseBtn=$('#newIssueCloseBtn'); r.newIssueCancelBtn=$('#newIssueCancelBtn'); r.newIssueCreateBtn=$('#newIssueCreateBtn');

/* Issue List */
r.loadIssuesBtn=$('#loadIssuesBtn'); r.newIssueBtn=$('#newIssueBtn');
r.issueList=$('#issueList'); r.issueStateBtn=$('#issueStateBtn'); r.issueStateText=$('#issueStateText');

/* Issue Detail */
r.issueDetailModal=$('#issueDetailModal');
r.issueDetailTitle=$('#issueDetailTitle'); r.issueDetailBody=$('#issueDetailBody');
r.issueDetailCloseBtn=$('#issueDetailCloseBtn'); r.issueDetailCloseBtn2=$('#issueDetailCloseBtn2');
r.issueCloseBtn=$('#issueCloseBtn'); r.issueReopenBtn=$('#issueReopenBtn');

/* New Release */
r.newReleaseModal=$('#newReleaseModal');
r.releaseTag=$('#releaseTag'); r.releaseName=$('#releaseName'); r.releaseBody=$('#releaseBody');
r.releasePrerelease=$('#releasePrerelease'); r.releaseDraft=$('#releaseDraft');
r.newReleaseCloseBtn=$('#newReleaseCloseBtn'); r.newReleaseCancelBtn=$('#newReleaseCancelBtn'); r.newReleaseCreateBtn=$('#newReleaseCreateBtn');

/* Release List */
r.loadReleasesBtn=$('#loadReleasesBtn'); r.newReleaseBtn=$('#newReleaseBtn'); r.releaseList=$('#releaseList');

/* Settings Drawer */
r.settingsBtn=$('#settingsBtn'); r.settingsDrawer=$('#settingsDrawer');
r.settingsCloseBtn=$('#settingsCloseBtn'); r.drawerBackdrop=$('#drawerBackdrop');
r.drawerArchiveList=$('#drawerArchiveList');
r.drawerArchiveExport=$('#drawerArchiveExport');
r.drawerArchiveClear=$('#drawerArchiveClear');

/* Offline + Toast */
r.offlineBanner=$('#offlineBanner'); r.toastEl=$('#toast');

/* Picker Modal */
r.pickerModal=$('#pickerModal'); r.pickerTitle=$('#pickerTitle');
r.pickerTitleIcon=$('#pickerTitleIcon'); r.pickerList=$('#pickerList');
r.pickerCloseBtn=$('#pickerCloseBtn'); r.pickerCancelBtn=$('#pickerCancelBtn');

/* Folder Picker (Move/Copy) */
r.folderPickerModal=$('#folderPickerModal');
r.fpModeIcon=$('#fpModeIcon'); r.fpModeTitle=$('#fpModeTitle');
r.fpCloseBtn=$('#fpCloseBtn'); r.fpCancelBtn=$('#fpCancelBtn');
r.fpConfirmBtn=$('#fpConfirmBtn'); r.fpConfirmText=$('#fpConfirmText');
r.fpRepoBtn=$('#fpRepoBtn'); r.fpRepoText=$('#fpRepoText');
r.fpPath=$('#fpPath'); r.fpContents=$('#fpContents');

/* Rename Folder Modal */
r.renameFolderModal=$('#renameFolderModal');
r.renameFolderCloseBtn=$('#renameFolderCloseBtn');
r.renameFolderCancelBtn=$('#renameFolderCancelBtn');
r.renameFolderConfirmBtn=$('#renameFolderConfirmBtn');
r.renameFolderInput=$('#renameFolderInput');
r.renameOldPath=$('#renameOldPath');
r.renameNewPath=$('#renameNewPath');

/* Confirm Modal */
r.confirmModal=$('#confirmModal');
r.confirmIcon=$('#confirmIcon');
r.confirmTitle=$('#confirmTitle');
r.confirmMessage=$('#confirmMessage');
r.confirmOkBtn=$('#confirmOkBtn');
r.confirmOkText=$('#confirmOkText');
r.confirmCancelBtn=$('#confirmCancelBtn');
r.confirmCloseBtn=$('#confirmCloseBtn');

/* ─── Toast ─────────────────────────────────────────────── */
O.toast = function(msg,type){
  var t = r.toastEl;
  t.textContent=msg; t.style.display='flex';
  t.style.borderColor=type==='error'?'var(--danger-border)':type==='success'?'var(--success-border)':'var(--border-strong)';
  t.style.color=type==='error'?'var(--danger)':type==='success'?'var(--success)':'var(--fg)';
  clearTimeout(t._t); t._t=setTimeout(function(){t.style.display='none';},3200);
};

/* ═══════════════════════════════════════════════════════════
   CONFIRM MODAL
   ═══════════════════════════════════════════════════════════ */
var _confirmResolve = null;

O.confirm = function(opts){
  if(typeof opts === 'string') opts = {message: opts};
  opts = opts || {};

  return new Promise(function(resolve){
    _confirmResolve = resolve;
    r.confirmTitle.textContent = opts.title || 'تأكيد';
    r.confirmMessage.textContent = opts.message || 'هل أنت متأكد؟';
    r.confirmOkText.textContent = opts.okText || 'حسنًا';
    r.confirmCancelBtn.textContent = opts.cancelText || 'إلغاء';
    var isDanger = opts.danger !== false;
    r.confirmOkBtn.className = 'btn ' + (isDanger ? 'btn-danger' : 'btn-primary');
    var iconName = opts.icon || (isDanger ? 'oi-alert' : 'oi-info');
    r.confirmIcon.className = 'oi ' + iconName;
    r.confirmIcon.style.color = isDanger ? 'var(--danger)' : 'var(--fg-muted)';
    r.confirmModal.classList.add('open');
    document.body.classList.add('modal-open');
    setTimeout(function(){ r.confirmOkBtn.focus(); }, 100);
  });
};

function closeConfirm(result){
  r.confirmModal.classList.remove('open');
  document.body.classList.remove('modal-open');
  var res = _confirmResolve;
  _confirmResolve = null;
  if(res) res(result);
}

r.confirmCloseBtn.addEventListener('click', function(){ closeConfirm(false); });
r.confirmCancelBtn.addEventListener('click', function(){ closeConfirm(false); });
r.confirmOkBtn.addEventListener('click', function(){ closeConfirm(true); });
r.confirmModal.addEventListener('click', function(e){
  if(e.target === r.confirmModal) closeConfirm(false);
});

/* ═══════════════════════════════════════════════════════════
   REFRESH MECHANISM
   ═══════════════════════════════════════════════════════════ */
O.refreshAfterOperation = function(operation, details){
  details = details || {};
  var messages = {
    edit:'تم التعديل', create:'تم الإنشاء', move:'تم النقل',
    copy:'تم النسخ', delete:'تم الحذف', upload:'تم الرفع'
  };
  var label = messages[operation] || 'تمت العملية';
  O.toast('✅ ' + label + (details.path ? ' · ' + details.path.split('/').pop() : ''), 'success');
  var logMsg = '✅ ' + label;
  if(details.path) logMsg += ' · ' + details.path;
  if(details.count) logMsg += ' · ' + details.count + ' ملف';
  O.addLog(logMsg, 'success');
  O.state.repoNeedsRefresh = true;
  O.updateRemoteTabCount();
  if(O.state.owner && O.state.repoName){
    O.scheduleRepoRefresh(details.commitSha || null);
  }
};

O.scheduleRepoRefresh = function(commitSha){
  if(typeof O.loadRepoContent !== 'function') return;
  clearTimeout(O._refreshTimer);
  clearTimeout(O._retryTimer);
  O._refreshTimer = setTimeout(function(){
    var oldSha = O.state.lastLoadedTreeSha;
    O.loadRepoContent(commitSha || null, function(newSha, count){
      if(oldSha && newSha && newSha === oldSha){
        O.addLog('التحديث لم يُطبَّق بعد — إعادة محاولة…', 'warn');
        O._retryTimer = setTimeout(function(){
          O.loadRepoContent(commitSha || null, function(sha2){
            if(sha2 === oldSha){
              O.addLog('فشل تحديث الشجرة — حاول يدويًا', 'warn');
            } else {
              O.addLog('تم التحديث بعد المحاولة الثانية', 'success');
            }
          });
        }, 1500);
      }
    });
  }, 900);
};

O.updateRemoteTabCount = function(){
  var elCnt = document.getElementById('remoteTabCount');
  if(!elCnt) return;
  var count = (O.state.repoFiles || []).length;
  if(count > 0){ elCnt.textContent = count; elCnt.classList.remove('hidden'); }
  else elCnt.classList.add('hidden');
};

/* ─── Format helpers ────────────────────────────────────── */
O.formatBytes = function(b){if(!b) return '0 B';var u=['B','KB','MB','GB'],i=Math.floor(Math.log(b)/Math.log(1024));var v=b/Math.pow(1024,i);return (i===0?v:v.toFixed(v>=10?1:2))+' '+u[i];};
O.bufferToBase64 = function(buf){var bytes=new Uint8Array(buf),CH=0x8000,bin='';for(var i=0;i<bytes.length;i+=CH) bin+=String.fromCharCode.apply(null,bytes.subarray(i,i+CH));return btoa(bin);};
O.base64ToText = function(b64){try{var bin=atob(b64.replace(/\n/g,''));var bytes=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);return new TextDecoder('utf-8').decode(bytes);}catch(e){return '';}};
O.textToBase64 = function(str){var bytes=new TextEncoder().encode(str),bin='';for(var i=0;i<bytes.length;i++) bin+=String.fromCharCode(bytes[i]);return btoa(bin);};
O.escapeHtml = function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};

/* ─── Storage ───────────────────────────────────────────── */
O.saveTokenToStorage = function(token){
  try{var exp=Date.now()+(O.TOKEN_TTL_DAYS*24*60*60*1000);localStorage.setItem(O.STORAGE.token,JSON.stringify({t:btoa(unescape(encodeURIComponent(token))),e:exp,v:2}));return true;}catch(e){return false;}
};
O.loadTokenFromStorage = function(){
  try{var raw=localStorage.getItem(O.STORAGE.token);if(!raw) return null;var d=JSON.parse(raw);if(!d||!d.t||!d.e){localStorage.removeItem(O.STORAGE.token);return null;}if(Date.now()>d.e){localStorage.removeItem(O.STORAGE.token);return null;}return {token:decodeURIComponent(escape(atob(d.t))),expires:d.e};}catch(e){localStorage.removeItem(O.STORAGE.token);return null;}
};
O.clearTokenFromStorage = function(){try{localStorage.removeItem(O.STORAGE.token);return true;}catch(e){return false;}};
O.formatRemaining = function(exp){var ms=exp-Date.now();if(ms<=0) return '—';var d=Math.floor(ms/86400000),h=Math.floor((ms%86400000)/3600000);return d>0?(d+'d '+(h>0?h+'h':'')):h+'h';};
O.loadReposFromStorage = function(login){try{var rr=localStorage.getItem(O.STORAGE.reposKey+'_'+login);if(!rr) return [];var a=JSON.parse(rr);return Array.isArray(a)?a:[];}catch(e){return [];}};
O.saveReposToStorage = function(login,list){try{localStorage.setItem(O.STORAGE.reposKey+'_'+login,JSON.stringify(list));}catch(e){}};
O.loadArchive = function(){try{var rr=localStorage.getItem(O.STORAGE.archive);if(!rr) return [];var a=JSON.parse(rr);return Array.isArray(a)?a:[];}catch(e){return [];}};
O.saveArchive = function(){try{if(O.state.archive.length>O.ARCHIVE_MAX) O.state.archive=O.state.archive.slice(0,O.ARCHIVE_MAX);localStorage.setItem(O.STORAGE.archive,JSON.stringify(O.state.archive));}catch(e){}};
O.saveActiveRepo = function(fn){try{localStorage.setItem(O.STORAGE.activeRepo,fn||'');}catch(e){}};
O.loadActiveRepo = function(){try{return localStorage.getItem(O.STORAGE.activeRepo)||'';}catch(e){return '';}};

/* ─── Logging ───────────────────────────────────────────── */
O.addLog = function(msg,level){
  level=level||'info';
  var icons={info:'i-info',success:'i-check-circle',warn:'i-alert',error:'i-x-circle',debug:'i-commit'};
  var d=new Date();
  var time=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+':'+String(d.getSeconds()).padStart(2,'0');
  var row=O.el('div','log-row log-'+level);
  row.appendChild(O.el('span','log-time',time));
  row.appendChild(O.makeSvg(icons[level]||'i-info','log-ic'));
  row.appendChild(O.el('span','log-msg',msg));
  r.log.appendChild(row); r.log.scrollTop=r.log.scrollHeight;
  O.state.logs.push({time:time,level:level,message:msg});
};
O.setHeaderBadge = function(text,type){
  r.headerBadgeText.textContent=text;
  r.headerBadge.classList.remove('ok','warn','err');
  if(type) r.headerBadge.classList.add(type);
};
O.updateRateBadge = function(rate){
  if(!rate||!rate.limit){r.rateBadge.classList.add('hidden');return;}
  r.rateBadge.classList.remove('hidden');
  r.rateRemaining.textContent=rate.remaining; r.rateLimit.textContent=rate.limit;
  r.rateBadge.classList.remove('ok','warn','err');
  if(rate.remaining<10) r.rateBadge.classList.add('err');
  else if(rate.remaining<rate.limit*0.2) r.rateBadge.classList.add('warn');
  else r.rateBadge.classList.add('ok');
};

/* ─── Theme ─────────────────────────────────────────────── */
O.setTheme = function(mode){
  document.documentElement.setAttribute('data-theme',mode);
  try{localStorage.setItem(O.STORAGE.theme,mode);}catch(e){}
  O.$$('[data-theme-choice]').forEach(function(b){
    b.classList.toggle('active', b.dataset.themeChoice === mode);
  });
  var meta=document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute('content',mode==='dark'?'#000000':'#f4f4f4');
};

/* ─── Drawer ────────────────────────────────────────────── */
O.openDrawer = function(){r.settingsDrawer.classList.add('open');r.drawerBackdrop.classList.add('open');r.settingsDrawer.setAttribute('aria-hidden','false');O.renderDrawerArchive();};
O.closeDrawer = function(){r.settingsDrawer.classList.remove('open');r.drawerBackdrop.classList.remove('open');r.settingsDrawer.setAttribute('aria-hidden','true');};

/* ─── Tabs ──────────────────────────────────────────────── */
O.switchTab = function(name){
  O.state.currentTab = name;
  O.$$('#tabsNav .tab').forEach(function(tab){tab.classList.toggle('active',tab.dataset.tab===name);});
  O.$$('.panel').forEach(function(p){p.classList.toggle('active',p.dataset.panel===name);});
  window.scrollTo({top:0,behavior:'smooth'});
  if(name === 'remote' && O.state.owner && O.state.repoName){
    if(O.state.repoNeedsRefresh || !O.state.repoFiles || O.state.repoFiles.length === 0){
      O.state.repoNeedsRefresh = false;
      setTimeout(function(){
        if(typeof O.loadRepoContent === 'function') O.loadRepoContent();
      }, 100);
    }
  }
};

/* ─── Archive ───────────────────────────────────────────── */
O.addToArchive = function(entry){
  var full={id:'op_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),ts:Date.now(),type:entry.type||'info',title:entry.title||'عملية',status:entry.status||'ok',repo:entry.repo||O.state.repoName,owner:entry.owner||O.state.owner,branch:entry.branch||O.state.branch,files:entry.files||[],details:entry.details||{},commitSha:entry.commitSha||null,duration:entry.duration||null};
  O.state.archive.unshift(full); O.saveArchive(); O.renderDrawerArchive();
};
O.archiveIconFor = function(type){var m={upload:'i-upload',edit:'i-edit',delete:'i-trash',create:'i-plus',validate:'i-check',error:'i-x-circle',pr:'i-pr',issue:'i-issue',release:'i-tag',branch:'i-branch'};return m[type]||'i-info';};
O.formatArchiveTime = function(ts){
  var d=new Date(ts),today=new Date();
  var p=function(n){return String(n).padStart(2,'0');};
  var timeStr=p(d.getHours())+':'+p(d.getMinutes());
  if(d.toDateString()===today.toDateString()) return timeStr;
  return p(d.getDate())+'/'+p(d.getMonth()+1)+' '+timeStr;
};
O.renderDrawerArchive = function(){
  if(!r.drawerArchiveList) return;
  r.drawerArchiveList.innerHTML='';
  if(O.state.archive.length===0){
    r.drawerArchiveList.innerHTML='<div class="drawer-empty-mini">لا توجد عمليات بعد</div>';
    return;
  }
  O.state.archive.slice(0,30).forEach(function(entry){
    var item=O.el('div','drawer-archive-item');
    item.appendChild(O.makeSvg(O.archiveIconFor(entry.type)));
    item.appendChild(O.el('div','title',entry.title));
    item.appendChild(O.el('div','time',O.formatArchiveTime(entry.ts)));
    item.addEventListener('click',function(){O.closeDrawer();setTimeout(function(){O.openArchiveDetail(entry.id);},150);});
    r.drawerArchiveList.appendChild(item);
  });
  if(O.state.archive.length>30){
    var more=O.el('div','drawer-archive-item');
    more.style.justifyContent='center'; more.style.color='var(--fg-muted)';
    more.appendChild(O.el('div','title','+'+(O.state.archive.length-30)+' عملية أخرى'));
    r.drawerArchiveList.appendChild(more);
  }
};
O.openArchiveDetail = function(id){
  var entry=O.state.archive.find(function(e){return e.id===id;}); if(!entry) return;
  O.state.currentArchiveEntryId=id;
  var d=new Date(entry.ts);
  r.archiveDetailTitleText.textContent=entry.title;
  var html='';
  function row(label,value,cls){return '<div class="detail-row"><div class="label">'+O.escapeHtml(label)+'</div><div class="value '+(cls||'')+'">'+value+'</div></div>';}
  html+=row('Date',O.escapeHtml(d.toLocaleString()),'text');
  html+=row('Type',O.escapeHtml(entry.type));
  html+=row('Status',entry.status==='ok'?'OK':entry.status==='warn'?'تحذير':'فشل');
  if(entry.owner||entry.repo) html+=row('Repo',O.escapeHtml((entry.owner||'')+'/'+(entry.repo||'')));
  if(entry.branch) html+=row('Branch',O.escapeHtml(entry.branch));
  if(entry.commitSha) html+=row('Commit','<a href="https://github.com/'+entry.owner+'/'+entry.repo+'/commit/'+entry.commitSha+'" target="_blank" rel="noopener">'+O.escapeHtml(entry.commitSha)+'</a>');
  if(entry.duration!=null) html+=row('Duration',entry.duration+'s');
  if(entry.files&&entry.files.length){
    var fh=entry.files.map(function(f){
      var cls=f.status==='ok'?'ok':f.status==='err'?'err':'';
      var icoName=f.status==='ok'?'check':f.status==='err'?'x':'info';
      var path=typeof f==='string'?f:(f.path||'');
      var size=typeof f==='object'&&f.size?' ('+O.formatBytes(f.size)+')':'';
      return '<div class="file-row '+cls+'"><i class="oi oi-'+icoName+'"></i><span>'+O.escapeHtml(path+size)+'</span></div>';
    }).join('');
    html+=row('Files','<div class="detail-files">'+fh+'</div>');
  }
  if(entry.details&&Object.keys(entry.details).length){
    Object.keys(entry.details).forEach(function(k){
      var v=entry.details[k];
      var vStr=typeof v==='object'?JSON.stringify(v,null,2):String(v);
      html+=row(k,'<pre style="margin:0;font-family:var(--mono);font-size:11px;white-space:pre-wrap;word-break:break-word;direction:ltr;text-align:left">'+O.escapeHtml(vStr)+'</pre>');
    });
  }
  r.archiveDetailBody.innerHTML=html;
  r.archiveDetailModal.classList.add('open'); document.body.classList.add('modal-open');
};
O.closeArchiveDetail = function(){r.archiveDetailModal.classList.remove('open');document.body.classList.remove('modal-open');O.state.currentArchiveEntryId=null;};
O.exportArchive = function(){
  if(!O.state.archive.length){O.toast('السجل فارغ','warn');return;}
  var data={exportedAt:new Date().toISOString(),count:O.state.archive.length,entries:O.state.archive};
  var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='orbit-archive-'+Date.now()+'.json';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(url);},1000);
  O.toast('تم التصدير','success');
};

/* ─── Offline ───────────────────────────────────────────── */
O.updateOnlineStatus = function(){if(navigator.onLine) r.offlineBanner.classList.remove('show'); else r.offlineBanner.classList.add('show');};

/* ─── Event Listeners ───────────────────────────────────── */
O.$$('[data-theme-choice]').forEach(function(b){
  b.addEventListener('click',function(){
    O.setTheme(b.dataset.themeChoice);
    O.toast('تم تغيير المظهر','success');
  });
});

/* FAQ Items — accordion */
O.$$('.faq-item').forEach(function(item){
  var q = item.querySelector('.faq-q');
  if(!q) return;
  q.addEventListener('click', function(){
    item.classList.toggle('open');
  });
});

r.settingsBtn.addEventListener('click',O.openDrawer);
r.settingsCloseBtn.addEventListener('click',O.closeDrawer);
r.drawerBackdrop.addEventListener('click',O.closeDrawer);
O.$$('.drawer-section-head').forEach(function(head){
  head.addEventListener('click',function(){
    var sec=head.parentElement;
    sec.classList.toggle('open',!sec.classList.contains('open'));
  });
});
O.$$('#tabsNav .tab').forEach(function(tab){tab.addEventListener('click',function(){O.switchTab(tab.dataset.tab);});});
r.archiveDetailCloseBtn.addEventListener('click',O.closeArchiveDetail);
r.archiveDetailCloseBtn2.addEventListener('click',O.closeArchiveDetail);
r.archiveDetailModal.addEventListener('click',function(e){if(e.target===r.archiveDetailModal) O.closeArchiveDetail();});
r.archiveDetailDeleteBtn.addEventListener('click',async function(){
  if(!O.state.currentArchiveEntryId) return;
  if(!await O.confirm({title:'حذف عملية',message:'هل تريد حذف هذه العملية من السجل؟'})) return;
  O.state.archive=O.state.archive.filter(function(e){return e.id!==O.state.currentArchiveEntryId;});
  O.saveArchive(); O.renderDrawerArchive(); O.closeArchiveDetail(); O.toast('تم الحذف','success');
});
r.drawerArchiveClear.addEventListener('click',async function(){
  if(!await O.confirm({title:'مسح كل السجل',message:'سيتم مسح كل عمليات السجل نهائيًا. لا يمكن التراجع.'})) return;
  O.state.archive=[];O.saveArchive();O.renderDrawerArchive();O.toast('تم مسح السجل','success');
});
r.drawerArchiveExport.addEventListener('click',O.exportArchive);
r.clearLogsBtn.addEventListener('click',function(){r.log.innerHTML='';O.state.logs=[];O.addLog('تم مسح السجل','info');});
r.downloadLogsBtn.addEventListener('click',function(){
  var lines=O.state.logs.map(function(l){return '['+l.time+'] ['+l.level.toUpperCase()+'] '+l.message;});
  var blob=new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'});
  var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='orbit-log-'+Date.now()+'.txt';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(url);},1000);
});

/* ─── Keyboard ──────────────────────────────────────────── */
document.addEventListener('keydown',function(e){
  var mod=e.ctrlKey||e.metaKey;
  if(e.key==='Escape'){
    if(r.confirmModal.classList.contains('open')){closeConfirm(false);return;}
    if(r.pickerModal.classList.contains('open')){O.closePicker();return;}
    if(r.folderPickerModal.classList.contains('open')){O.closeFolderPicker();return;}
    if(r.uploadFolderModal.classList.contains('open')){O.closeUploadFolderPicker();return;}
    if(r.editorFolderModal && r.editorFolderModal.classList.contains('open')){O.closeEditorFolderPicker();return;}
    if(r.renameFolderModal && r.renameFolderModal.classList.contains('open')){O.closeRenameFolder();return;}
    if(r.newRepoModal.classList.contains('open')){r.newRepoModal.classList.remove('open');document.body.classList.remove('modal-open');return;}
    if(r.newBranchModal.classList.contains('open')){r.newBranchModal.classList.remove('open');document.body.classList.remove('modal-open');return;}
    if(r.newPRModal.classList.contains('open')){r.newPRModal.classList.remove('open');document.body.classList.remove('modal-open');return;}
    if(r.newIssueModal.classList.contains('open')){r.newIssueModal.classList.remove('open');document.body.classList.remove('modal-open');return;}
    if(r.newReleaseModal.classList.contains('open')){r.newReleaseModal.classList.remove('open');document.body.classList.remove('modal-open');return;}
    if(r.prDetailModal.classList.contains('open')){O.closePRDetail();return;}
    if(r.issueDetailModal.classList.contains('open')){O.closeIssueDetail();return;}
    if(r.editorModal.classList.contains('open')){O.closeEditor();return;}
    if(r.archiveDetailModal.classList.contains('open')){O.closeArchiveDetail();return;}
    if(r.settingsDrawer.classList.contains('open')){O.closeDrawer();return;}
    return;
  }
  if(mod&&e.key.toLowerCase()==='k'){e.preventDefault(); if(r.settingsDrawer.classList.contains('open')) O.closeDrawer(); else O.openDrawer(); return;}
  if(mod&&e.key==='Enter'){e.preventDefault(); if(O.state.currentTab==='upload'&&!r.uploadBtn.disabled) r.uploadBtn.click(); return;}
  if(mod&&e.key.toLowerCase()==='s'){e.preventDefault(); if(r.editorModal.classList.contains('open')&&!r.editorSaveBtn.disabled) O.saveEditor(); return;}
  if(e.altKey&&/^[1-9]$/.test(e.key)){
    e.preventDefault();
    var tabs=O.$$('#tabsNav .tab'); var idx=parseInt(e.key,10)-1;
    if(tabs[idx]) O.switchTab(tabs[idx].dataset.tab);
  }
});

window.addEventListener('online',O.updateOnlineStatus);
window.addEventListener('offline',O.updateOnlineStatus);
O.updateOnlineStatus();

/* ─── Init ──────────────────────────────────────────────── */
O.init = function(){
  var savedTheme=localStorage.getItem(O.STORAGE.theme)||'dark';
  O.setTheme(savedTheme);

  O.addLog('مرحبًا بك في Orbit v2.2','info');
  O.state.archive=O.loadArchive(); O.renderDrawerArchive();

  var stored=O.loadTokenFromStorage();
  if(stored){
    r.tokenInput.value=stored.token; r.rememberToken.checked=true;
    r.rememberRow.classList.add('warn-active'); r.rememberWarning.classList.remove('hidden');
    O.showSavedBanner();
    setTimeout(function(){r.checkTokenBtn.click();},600);
  }
  O.updatePathPreview && O.updatePathPreview();
  O.resetProgress && O.resetProgress();
  O.refreshUI && O.refreshUI();
  O.updateRepoToolsVisibility && O.updateRepoToolsVisibility();
  O.renderPathChips && O.renderPathChips();
  O.updateRemoteTabCount();
  O.updateUploadRepoText && O.updateUploadRepoText();
  window.__orbitState=O.state;
};

/* ─── Safe stubs ────────────────────────────────────────── */
O.closeUploadFolderPicker = O.closeUploadFolderPicker || function(){
  if(r.uploadFolderModal) r.uploadFolderModal.classList.remove('open');
  document.body.classList.remove('modal-open');
};
O.closeRenameFolder = O.closeRenameFolder || function(){
  if(r.renameFolderModal) r.renameFolderModal.classList.remove('open');
  document.body.classList.remove('modal-open');
};
O.closeEditorFolderPicker = O.closeEditorFolderPicker || function(){
  if(r.editorFolderModal) r.editorFolderModal.classList.remove('open');
  document.body.classList.remove('modal-open');
};

})();