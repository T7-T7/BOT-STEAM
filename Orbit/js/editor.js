/* ════════════════════════════════════════════════════════════
   Orbit · editor.js — محرر مع اختيار المستودع والمجلد
   ════════════════════════════════════════════════════════════ */
(function(){
'use strict';
var O = window.Orbit;
var el = O.el, makeSvg = O.makeSvg;
var r = O.refs, state = O.state;

/* ─── Path Chips ────────────────────────────────────────── */
function renderPathChips(){
  r.pathChips.innerHTML='';
  state.pathSegments.forEach(function(seg,i){
    var chip=el('span','path-chip');
    chip.appendChild(el('span',null,seg));
    var x=el('button','chip-x'); x.type='button'; x.textContent='×';
    x.title='إزالة المجلد';
    x.addEventListener('click',function(e){
      e.stopPropagation();
      state.pathSegments = state.pathSegments.slice(0,i);
      renderPathChips();
      updateFileInfo();
      updateEditorTargetDisplay();
      r.editorPath.focus();
    });
    chip.appendChild(x);
    r.pathChips.appendChild(chip);
    r.pathChips.appendChild(el('span','path-sep','/'));
  });
  updateEditorTargetDisplay();
}

function getFullPath(){
  var s = state.pathSegments.slice();
  var n = r.editorPath.value.trim();
  if(n) s.push(n);
  return s.join('/');
}

function setFullPath(path){
  state.pathSegments = [];
  r.editorPath.value = '';
  if(path){
    var parts = path.split('/').filter(Boolean);
    if(parts.length){
      r.editorPath.value = parts[parts.length-1];
      state.pathSegments = parts.slice(0, -1);
    }
  }
  renderPathChips();
  updateFileInfo();
}

r.editorPath.addEventListener('input',function(){
  var v = r.editorPath.value;
  if(v.indexOf('/') !== -1){
    var parts = v.split('/');
    var rest = parts.slice(0,-1).filter(Boolean);
    state.pathSegments = state.pathSegments.concat(rest);
    r.editorPath.value = parts[parts.length-1];
    renderPathChips();
  }
  updateFileInfo();
});

r.editorPath.addEventListener('keydown',function(e){
  if(e.key === 'Backspace' && r.editorPath.value === '' && state.pathSegments.length){
    e.preventDefault();
    var last = state.pathSegments.pop();
    r.editorPath.value = last;
    renderPathChips();
    updateFileInfo();
    var len = last.length;
    setTimeout(function(){ r.editorPath.setSelectionRange(len, len); }, 0);
  }
});

function getLangFromFilename(fn){
  var n = String(fn || '').toLowerCase();
  if(!n) return null;
  var i = n.lastIndexOf('.');
  if(i === -1 || i === n.length - 1) return null;
  return O.EXT_TO_LANG[n.slice(i+1)] || null;
}

function updateFileInfo(){
  var fn = r.editorPath.value.trim();
  var lang = getLangFromFilename(fn) || 'TXT';
  r.editorTitleBadge.textContent = lang;
  r.editorTitleBadge.setAttribute('data-lang', lang.toLowerCase());
  if(fn) r.editorTitleName.textContent = fn;
  else if(state.pathSegments.length) r.editorTitleName.textContent = state.pathSegments[state.pathSegments.length-1] + '/…';
  else r.editorTitleName.textContent = 'ملف جديد';
  if(window.__orbitCM) window.__orbitCM.setLang(lang);
}

/* ─── عرض اسم المستودع والمجلد ───────────────────────────── */
function updateEditorTargetDisplay(){
  /* المستودع */
  if(state.editorRepo){
    var rp = state.allRepos.find(function(x){
      return x.owner === state.editorRepo.owner && x.name === state.editorRepo.name;
    });
    var prefix = state.editorRepo.owner + '/' + state.editorRepo.name;
    r.editorRepoText.textContent = prefix + (rp && rp.private ? ' (خاص)' : '');
  } else if(state.repoName){
    r.editorRepoText.textContent = (state.owner ? state.owner + '/' : '') + state.repoName;
  } else {
    r.editorRepoText.textContent = '—';
  }
  /* المجلد */
  if(state.pathSegments.length){
    r.editorFolderText.textContent = '/' + state.pathSegments.join('/');
  } else {
    r.editorFolderText.textContent = 'الجذر (/)';
  }
}

/* ─── CodeMirror lazy loader ────────────────────────────── */
var _cmResolved = null;
function getCM(){
  if(window.__orbitCM) return Promise.resolve(window.__orbitCM);
  if(_cmResolved) return _cmResolved;
  _cmResolved = new Promise(function(resolve, reject){
    window.addEventListener('orbit-cm-ready', function(){ resolve(window.__orbitCM); }, {once:true});
    window.addEventListener('orbit-cm-failed', function(){ reject(new Error('CodeMirror failed')); }, {once:true});
    setTimeout(function(){ if(!window.__orbitCM) reject(new Error('CodeMirror timeout')); }, 12000);
  });
  return _cmResolved;
}

/* ─── Commit Panel ──────────────────────────────────────── */
function showCommitPanel(){
  var fullPath = getFullPath().replace(/^\/+|\/+$/g,'');
  if(!fullPath){
    O.toast('أدخل اسم الملف أولًا','error');
    r.editorPath.focus();
    return;
  }
  var isNew = !state.editingPath;
  var fileName = fullPath.split('/').pop();
  var defaultMsg = isNew ? ('Create ' + fileName) : ('Update ' + fileName);
  if(!r.editorCommit.value.trim()){
    r.editorCommit.value = defaultMsg;
  }
  r.editorCommitPanel.classList.remove('hidden');
  setTimeout(function(){
    r.editorCommit.focus();
    r.editorCommit.select();
  }, 100);
}
function hideCommitPanel(){
  r.editorCommitPanel.classList.add('hidden');
}

/* ─── Open Editor ───────────────────────────────────────── */
async function openEditor(path, mode){
  var token = r.tokenInput.value.trim(), owner = state.owner, repo = state.repoName;
  if(!token || !owner || !repo){ O.toast('اختر مستودعًا','warn'); return; }

  /* ⭐ تهيئة الوجهة الافتراضية */
  state.editorRepo = {
    owner: state.owner,
    name: state.repoName,
    branch: state.branch
  };
  state.editorFolderCache = null;

  state.editingPath = path || null;
  r.editorCommit.value = '';
  hideCommitPanel();
  setFullPath(path || '');
  updateEditorTargetDisplay();

  r.editorModal.classList.add('open');
  document.body.classList.add('modal-open');
  r.editorSaveBtn.disabled = true;

  var cm;
  try{ cm = await getCM(); }
  catch(e){ O.toast('فشل المحرر','error'); return; }
  cm.setValue('');
  cm.setDisabled(true);

  if(mode === 'edit' && path){
    O.api('/repos/'+owner+'/'+repo+'/contents/'+encodeURI(path), {token:token})
      .then(function(data){
        if(data.content && data.encoding === 'base64'){
          cm.setValue(O.base64ToText(data.content));
          cm.setDisabled(false);
          setTimeout(function(){ cm.focus(); }, 250);
          r.editorSaveBtn.disabled = false;
        } else throw new Error('لا يوجد محتوى');
      }).catch(function(e){
        O.addLog('فشل التحميل: ' + e.message, 'error');
        cm.setDisabled(false);
        r.editorSaveBtn.disabled = false;
      });
  } else {
    cm.setValue('');
    cm.setDisabled(false);
    setTimeout(function(){ r.editorPath.focus(); }, 200);
    r.editorSaveBtn.disabled = false;
  }
}

/* ─── Actual Save ───────────────────────────────────────── */
function doActualSave(){
  var fullPath = getFullPath().replace(/^\/+|\/+$/g,'');
  if(!fullPath){
    O.toast('أدخل المسار','error');
    r.editorPath.focus();
    return;
  }
  var content = window.__orbitCM ? window.__orbitCM.getValue() : '';
  var msg = r.editorCommit.value.trim() || (state.editingPath ? 'تعديل ملف' : 'إنشاء ملف');
  var token = r.tokenInput.value.trim();

  /* ⭐ استخدام المستودع المختار في المحرر */
  var targetOwner = state.editorRepo ? state.editorRepo.owner : state.owner;
  var targetRepo = state.editorRepo ? state.editorRepo.name : state.repoName;
  var targetBranch = state.editorRepo ? state.editorRepo.branch : state.branch;

  if(!token || !targetOwner || !targetRepo){ O.toast('بيانات ناقصة','error'); return; }

  r.editorCommitConfirmBtn.disabled = true;
  r.editorSaveBtn.disabled = true;

  var t0 = performance.now();
  var isNew = !state.editingPath;

  O.api('/repos/'+targetOwner+'/'+targetRepo+'/contents/'+encodeURI(fullPath), {token:token, allow404:true})
    .then(function(ex){
      var body = {
        message: msg,
        content: O.textToBase64(content),
        branch: targetBranch
      };
      if(ex && ex.sha) body.sha = ex.sha;
      return O.api('/repos/'+targetOwner+'/'+targetRepo+'/contents/'+encodeURI(fullPath), {
        method:'PUT', token:token, body:body
      });
    })
    .then(function(res){
      var sha = res && res.commit ? res.commit.sha : null;
      O.addLog('تم الحفظ: ' + fullPath + ' في ' + targetOwner + '/' + targetRepo, 'success');
      O.addToArchive({
        type: isNew ? 'create' : 'edit',
        title: isNew ? 'إنشاء ملف' : 'تعديل ملف',
        status:'ok',
        repo: targetRepo, owner: targetOwner, branch: targetBranch,
        files:[{path:fullPath, status:'ok'}],
        commitSha: sha,
        duration: ((performance.now()-t0)/1000).toFixed(2),
        details:{file: fullPath, message: msg, target_repo: targetOwner + '/' + targetRepo}
      });
      closeEditor();
      O.refreshAfterOperation(isNew ? 'create' : 'edit', {path: fullPath, commitSha: sha});
    })
    .catch(function(e){
      O.addLog('فشل الحفظ: ' + e.message, 'error');
      r.editorCommitConfirmBtn.disabled = false;
      r.editorSaveBtn.disabled = false;
    });
}

/* ─── Close Editor ──────────────────────────────────────── */
function closeEditor(){
  r.editorModal.classList.remove('open');
  document.body.classList.remove('modal-open');
  if(window.__orbitCM) window.__orbitCM.setValue('');
  state.pathSegments = [];
  state.editorRepo = null;
  state.editorFolderCache = null;
  r.editorPath.value = '';
  r.editorCommit.value = '';
  state.editingPath = null;
  hideCommitPanel();
  renderPathChips();
}

/* ═══════════════════════════════════════════════════════════
   ⭐ المستودع الهدف — Picker
   ═══════════════════════════════════════════════════════════ */
r.editorRepoPickerBtn.addEventListener('click', function(){
  if(state.allRepos.length === 0){
    O.toast('لا توجد مستودعات','warn');
    return;
  }
  var currentFullName = state.editorRepo
    ? state.editorRepo.owner + '/' + state.editorRepo.name
    : '';
  O.openPicker({
    title:'اختر المستودع الهدف',
    icon:'i-branch',
    selected: currentFullName,
    items: state.allRepos.map(function(rp){
      return {
        value: rp.full_name,
        label: rp.full_name,
        icon:'i-folder',
        sub: rp.description || '',
        lock: rp.private
      };
    }),
    onSelect: function(fullName){
      var found = state.allRepos.find(function(x){ return x.full_name === fullName; });
      if(!found) return;
      state.editorRepo = {
        owner: found.owner,
        name: found.name,
        branch: found.default_branch || 'main'
      };
      state.editorFolderCache = null;
      updateEditorTargetDisplay();
      O.toast('سيتم الحفظ في: ' + found.full_name, 'success');
    }
  });
});

/* ═══════════════════════════════════════════════════════════
   ⭐ المجلد الهدف — Folder Picker
   ═══════════════════════════════════════════════════════════ */
function buildEditorFolderIndex(files){
  var root = {dirs: new Map(), files: []};
  files.forEach(function(f){
    var parts = f.path.split('/');
    var node = root;
    for(var i = 0; i < parts.length - 1; i++){
      var seg = parts[i];
      if(!node.dirs.has(seg)){
        node.dirs.set(seg, {name: seg, dirs: new Map(), files: []});
      }
      node = node.dirs.get(seg);
    }
    node.files.push({name: parts[parts.length - 1]});
  });
  return root;
}
function getEditorFolderNode(root, pathArr){
  var node = root;
  for(var i = 0; i < pathArr.length; i++){
    if(!node.dirs.has(pathArr[i])) return null;
    node = node.dirs.get(pathArr[i]);
  }
  return node;
}
function renderEditorFolderPath(){
  r.efPath.innerHTML = '';
  var crumb = el('span','fp-crumb');
  crumb.appendChild(makeSvg('i-folder'));
  crumb.appendChild(el('span',null,'الجذر'));
  crumb.addEventListener('click', function(){
    state._efTempPath = [];
    renderEditorFolderContents();
  });
  r.efPath.appendChild(crumb);
  (state._efTempPath || []).forEach(function(seg, i){
    r.efPath.appendChild(el('span','fp-crumb-sep','/'));
    var c = el('span','fp-crumb');
    c.appendChild(makeSvg('i-folder'));
    c.appendChild(el('span',null,seg));
    c.addEventListener('click', function(){
      state._efTempPath = state._efTempPath.slice(0, i + 1);
      renderEditorFolderContents();
    });
    r.efPath.appendChild(c);
  });
}
function renderEditorFolderContents(){
  renderEditorFolderPath();
  r.efContents.innerHTML = '';
  var node = getEditorFolderNode(state.editorFolderCache, state._efTempPath || []);
  if(!node){
    r.efContents.innerHTML = '<div class="fp-empty">لا يوجد محتوى</div>';
    return;
  }
  var dirs = Array.from(node.dirs.values()).sort(function(a,b){
    return a.name.localeCompare(b.name,'en');
  });
  if(dirs.length === 0){
    r.efContents.innerHTML = '<div class="fp-empty">لا توجد مجلدات فرعية — يمكنك الحفظ هنا</div>';
    return;
  }
  dirs.forEach(function(d){
    var item = el('div','fp-item folder');
    var ic = makeSvg('i-folder'); ic.classList.add('folder');
    item.appendChild(ic);
    item.appendChild(el('div','name', d.name));
    var count = d.files.length + d.dirs.size;
    item.appendChild(el('div','size', String(count)));
    var enter = makeSvg('i-chevron-left'); enter.classList.add('enter-ic');
    item.appendChild(enter);
    item.addEventListener('click', function(){
      state._efTempPath.push(d.name);
      renderEditorFolderContents();
    });
    r.efContents.appendChild(item);
  });
}

function openEditorFolderPicker(){
  if(!state.editorRepo){
    O.toast('اختر مستودعًا أولًا','warn');
    return;
  }
  state._efTempPath = (state.pathSegments || []).slice();
  state.editorFolderCache = state.editorFolderCache || {dirs: new Map(), files: []};
  r.editorFolderModal.classList.add('open');
  document.body.classList.add('modal-open');
  r.efManualInput.value = '';

  if(state.editorFolderCache.dirs.size > 0){
    renderEditorFolderContents();
    return;
  }

  r.efContents.innerHTML = '<div class="busy"><div class="spinner"></div><span>جاري التحميل…</span></div>';
  r.efPath.innerHTML = '';

  var token = r.tokenInput.value.trim();
  var owner = state.editorRepo.owner;
  var repo = state.editorRepo.name;
  var branch = state.editorRepo.branch;
  var url = '/repos/' + owner + '/' + repo + '/git/trees/' +
            encodeURIComponent(branch) + '?recursive=1';

  O.api(url, {token: token}).then(function(data){
    var files = (data.tree || []).filter(function(t){ return t.type === 'blob'; });
    state.editorFolderCache = buildEditorFolderIndex(files);
    renderEditorFolderContents();
  }).catch(function(err){
    r.efContents.innerHTML = '<div class="fp-empty">تعذّر التحميل: ' + O.escapeHtml(err.message) + '</div>';
  });
}
O.openEditorFolderPicker = openEditorFolderPicker;

function closeEditorFolderPicker(){
  r.editorFolderModal.classList.remove('open');
  document.body.classList.remove('modal-open');
}
O.closeEditorFolderPicker = closeEditorFolderPicker;

r.editorFolderPickerBtn.addEventListener('click', openEditorFolderPicker);
r.efCloseBtn.addEventListener('click', closeEditorFolderPicker);
r.efCancelBtn.addEventListener('click', closeEditorFolderPicker);
r.editorFolderModal.addEventListener('click', function(e){
  if(e.target === r.editorFolderModal) closeEditorFolderPicker();
});

r.efConfirmBtn.addEventListener('click', function(){
  var manual = r.efManualInput.value.trim().replace(/^[\/\\]+|[\/\\]+$/g, '');
  if(manual){
    state.pathSegments = manual.split(/[\/\\]+/).filter(Boolean);
  } else {
    state.pathSegments = (state._efTempPath || []).slice();
  }
  renderPathChips();
  updateFileInfo();
  updateEditorTargetDisplay();
  closeEditorFolderPicker();
  var label = state.pathSegments.length
    ? '/' + state.pathSegments.join('/')
    : 'الجذر (/)';
  O.toast('سيُحفظ في: ' + label, 'success');
});

/* ─── Event Listeners ───────────────────────────────────── */
r.editorSaveBtn.addEventListener('click', function(){
  showCommitPanel();
});

r.editorCommitConfirmBtn.addEventListener('click', function(){
  doActualSave();
});

r.editorCommit.addEventListener('keydown', function(e){
  if(e.key === 'Enter'){
    e.preventDefault();
    doActualSave();
  }
});

r.editorCancelBtn.addEventListener('click', function(){
  if(!r.editorCommitPanel.classList.contains('hidden')){
    hideCommitPanel();
    return;
  }
  closeEditor();
});

r.editorCloseBtn.addEventListener('click', closeEditor);

r.editorModal.addEventListener('click', function(e){
  if(e.target === r.editorModal) closeEditor();
});

/* ─── Expose ────────────────────────────────────────────── */
O.renderPathChips = renderPathChips;
O.getFullPath = getFullPath;
O.setFullPath = setFullPath;
O.getLangFromFilename = getLangFromFilename;
O.updateFileInfo = updateFileInfo;
O.updateEditorTargetDisplay = updateEditorTargetDisplay;
O.openEditor = openEditor;
O.saveEditor = doActualSave;
O.closeEditor = closeEditor;

})();