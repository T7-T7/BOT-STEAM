/* ════════════════════════════════════════════════════════════
   Orbit · upload.js — رفع الملفات + اختيار المستودع والمجلد
   + وضع الحذف + الرفع كـ ZIP
   ════════════════════════════════════════════════════════════ */
(function(){
'use strict';
var O = window.Orbit;
var el = O.el, makeSvg = O.makeSvg;
var r = O.refs, state = O.state;
var CONCURRENCY = O.CONCURRENCY;

/* ─── File filters ──────────────────────────────────────── */
function isExcludedDir(n){return !!O.SKIP_DIRS[n];}
function isExcludedFile(n){return !!O.SKIP_FILES[String(n).toLowerCase()];}
function fileExtIcon(name){
  var n=String(name).toLowerCase();
  if(/\.html?$/.test(n)) return {icon:'i-file',cls:'html'};
  if(/\.css$/.test(n)) return {icon:'i-file',cls:'css'};
  if(/\.(js|mjs|cjs|jsx|ts|tsx)$/.test(n)) return {icon:'i-file',cls:'js'};
  return {icon:'i-file',cls:''};
}

/* ─── Target prefix ─────────────────────────────────────── */
function getTargetPrefix(){
  return (state.uploadFolderPath && state.uploadFolderPath.length)
    ? state.uploadFolderPath.join('/') + '/'
    : '';
}
function updatePathPreview(){
  var pre = getTargetPrefix();
  if(state.uploadZipMode){
    var name = (r.zipNameInput && r.zipNameInput.value.trim()) || 'files';
    if(!/\.zip$/i.test(name)) name += '.zip';
    r.pathPreviewValue.textContent = pre + name;
    return;
  }
  if(state.files.length > 0){
    r.pathPreviewValue.textContent = pre + state.files[0].path;
    return;
  }
  r.pathPreviewValue.textContent = (pre ? pre : '') + 'index.html';
}

/* ═══════════════════════════════════════════════════════════
   Upload Repo Picker
   ═══════════════════════════════════════════════════════════ */
function updateUploadRepoText(){
  if(!state.repoName){
    r.uploadRepoText.textContent = 'لم يتم اختيار مستودع';
    r.uploadRepoHint.textContent = 'اختر المستودع الذي تريد الرفع فيه.';
    return;
  }
  var rp = state.allRepos.find(function(x){
    return x.owner === state.owner && x.name === state.repoName;
  });
  if(rp){
    r.uploadRepoText.textContent = rp.full_name + (rp.private ? ' (خاص)' : '') + ' · ' + state.branch;
  } else {
    r.uploadRepoText.textContent = (state.owner ? state.owner + '/' : '') + state.repoName + ' · ' + state.branch;
  }
  r.uploadRepoHint.textContent = 'الفرع: ' + state.branch + ' — يمكنك تغييره من قسم التحكم.';
}

function applyUploadRepo(idx){
  var rp = state.allRepos[idx]; if(!rp) return;
  state.owner = rp.owner;
  state.repoName = rp.name;
  state.branch = rp.default_branch || 'main';
  state.uploadFolderPath = [];
  state.uploadFolderCache = null;
  if(r.uploadFolderText) r.uploadFolderText.textContent = 'الجذر (/)';
  O.saveActiveRepo(rp.full_name);
  if(typeof O.updateActiveRepoChip === 'function') O.updateActiveRepoChip();
  updateUploadRepoText();
  updatePathPreview();
  O.addLog('المستودع النشط (رفع): ' + rp.full_name, 'info');
}

r.uploadRepoPickerBtn.addEventListener('click', function(){
  if(state.allRepos.length === 0){
    O.toast('لا توجد مستودعات — تحقق من التوكن أولًا', 'warn');
    return;
  }
  var selFull = state.repoName ? (state.owner + '/' + state.repoName) : '';
  O.openPicker({
    title: 'اختر المستودع للرفع',
    icon: 'i-branch',
    selected: selFull,
    items: state.allRepos.map(function(rp){
      return {value: rp.full_name, label: rp.full_name, icon:'i-folder', sub: rp.description || '', lock: rp.private};
    }),
    onSelect: function(fullName){
      var idx = state.allRepos.findIndex(function(x){ return x.full_name === fullName; });
      if(idx !== -1) applyUploadRepo(idx);
    }
  });
});

/* ═══════════════════════════════════════════════════════════
   Upload Folder Picker
   ═══════════════════════════════════════════════════════════ */
function buildFolderIndexForUpload(files){
  var root = {dirs: new Map(), files: []};
  files.forEach(function(f){
    var parts = f.path.split('/');
    var node = root;
    for(var i = 0; i < parts.length - 1; i++){
      var seg = parts[i];
      if(!node.dirs.has(seg)) node.dirs.set(seg, {name: seg, dirs: new Map(), files: []});
      node = node.dirs.get(seg);
    }
    node.files.push({name: parts[parts.length - 1]});
  });
  return root;
}
function getFolderNodeByPath(root, pathArr){
  var node = root;
  for(var i = 0; i < pathArr.length; i++){
    if(!node.dirs.has(pathArr[i])) return null;
    node = node.dirs.get(pathArr[i]);
  }
  return node;
}
function renderUploadFolderPath(){
  r.ufPath.innerHTML = '';
  var crumb = el('span', 'fp-crumb');
  crumb.appendChild(makeSvg('i-folder'));
  crumb.appendChild(el('span', null, 'الجذر'));
  crumb.addEventListener('click', function(){
    state._ufTempPath = [];
    renderUploadFolderContents();
  });
  r.ufPath.appendChild(crumb);
  (state._ufTempPath || []).forEach(function(seg, i){
    r.ufPath.appendChild(el('span', 'fp-crumb-sep', '/'));
    var c = el('span', 'fp-crumb');
    c.appendChild(makeSvg('i-folder'));
    c.appendChild(el('span', null, seg));
    c.addEventListener('click', function(){
      state._ufTempPath = state._ufTempPath.slice(0, i + 1);
      renderUploadFolderContents();
    });
    r.ufPath.appendChild(c);
  });
}
function renderUploadFolderContents(){
  renderUploadFolderPath();
  r.ufContents.innerHTML = '';
  var node = getFolderNodeByPath(state.uploadFolderCache, state._ufTempPath || []);
  if(!node){
    r.ufContents.innerHTML = '<div class="fp-empty">لا يوجد محتوى</div>';
    return;
  }
  var dirs = Array.from(node.dirs.values()).sort(function(a,b){ return a.name.localeCompare(b.name, 'en'); });
  if(dirs.length === 0){
    r.ufContents.innerHTML = '<div class="fp-empty">لا توجد مجلدات فرعية — يمكنك الرفع هنا</div>';
    return;
  }
  dirs.forEach(function(d){
    var item = el('div', 'fp-item folder');
    var ic = makeSvg('i-folder'); ic.classList.add('folder');
    item.appendChild(ic);
    item.appendChild(el('div', 'name', d.name));
    var count = d.files.length + d.dirs.size;
    item.appendChild(el('div', 'size', String(count)));
    var enter = makeSvg('i-chevron-left'); enter.classList.add('enter-ic');
    item.appendChild(enter);
    item.addEventListener('click', function(){
      state._ufTempPath.push(d.name);
      renderUploadFolderContents();
    });
    r.ufContents.appendChild(item);
  });
}

function openUploadFolderPicker(){
  if(!state.owner || !state.repoName){
    O.toast('اختر مستودعًا أولًا', 'warn'); return;
  }
  state._ufTempPath = (state.uploadFolderPath || []).slice();
  state.uploadFolderCache = state.uploadFolderCache || {dirs: new Map(), files: []};
  r.uploadFolderModal.classList.add('open');
  document.body.classList.add('modal-open');
  r.ufManualInput.value = '';
  r.ufContents.innerHTML = '<div class="busy"><div class="spinner"></div><span>جاري التحميل…</span></div>';
  r.ufPath.innerHTML = '';

  var token = r.tokenInput.value.trim();
  var url = '/repos/' + state.owner + '/' + state.repoName + '/git/trees/' +
            encodeURIComponent(state.branch) + '?recursive=1';

  O.api(url, {token: token}).then(function(data){
    var files = (data.tree || []).filter(function(t){ return t.type === 'blob'; });
    state.uploadFolderCache = buildFolderIndexForUpload(files);
    renderUploadFolderContents();
  }).catch(function(err){
    r.ufContents.innerHTML = '<div class="fp-empty">تعذّر تحميل المستودع: ' + O.escapeHtml(err.message) + '</div>';
  });
}
O.openUploadFolderPicker = openUploadFolderPicker;

function closeUploadFolderPicker(){
  r.uploadFolderModal.classList.remove('open');
  document.body.classList.remove('modal-open');
}
O.closeUploadFolderPicker = closeUploadFolderPicker;

r.uploadFolderPickerBtn.addEventListener('click', openUploadFolderPicker);
r.ufCloseBtn.addEventListener('click', closeUploadFolderPicker);
r.ufCancelBtn.addEventListener('click', closeUploadFolderPicker);
r.uploadFolderModal.addEventListener('click', function(e){
  if(e.target === r.uploadFolderModal) closeUploadFolderPicker();
});

r.ufConfirmBtn.addEventListener('click', function(){
  var manual = r.ufManualInput.value.trim().replace(/^[\/\\]+|[\/\\]+$/g, '');
  if(manual){
    state.uploadFolderPath = manual.split(/[\/\\]+/).filter(Boolean);
  } else {
    state.uploadFolderPath = (state._ufTempPath || []).slice();
  }
  var label = state.uploadFolderPath.length ? '/' + state.uploadFolderPath.join('/') : 'الجذر (/)';
  r.uploadFolderText.textContent = label;
  closeUploadFolderPicker();
  updatePathPreview();
  O.toast('سيتم الرفع في: ' + label, 'success');
});

/* ═══════════════════════════════════════════════════════════
   File scanning
   ═══════════════════════════════════════════════════════════ */
async function scanDirectoryHandle(handle, path, out){
  for await (var entry of handle.values()){
    if(entry.kind === 'directory'){
      if(isExcludedDir(entry.name)) continue;
      await scanDirectoryHandle(entry, path + entry.name + '/', out);
    } else {
      if(isExcludedFile(entry.name)) continue;
      try{
        var file = await entry.getFile();
        out.push({path: path + entry.name, file: file, size: file.size});
      }catch(e){}
    }
  }
}
async function tryFSAFolderPick(){
  if(!window.showDirectoryPicker) return false;
  try{
    var dirHandle = await window.showDirectoryPicker({mode: 'read'});
    var items = [];
    var keepRoot = r.optKeepRoot.checked;
    var rootName = dirHandle.name;
    await scanDirectoryHandle(dirHandle, '', items);
    var finalItems = items.map(function(it){
      var rel = it.path;
      if(!keepRoot && rootName && rel.indexOf(rootName + '/') === 0){
        rel = rel.substring(rootName.length + 1);
      }
      return {path: rel, file: it.file, size: it.size, selected: true};
    });
    var added = 0, dupes = 0;
    finalItems.forEach(function(it){
      if(state.fileMap.has(it.path)){ dupes++; return; }
      state.fileMap.set(it.path, it);
      state.files.push(it);
      added++;
    });
    state.files.sort(function(a,b){ return a.path.localeCompare(b.path, 'en'); });
    O.addLog('أضيف ' + added + ' ملف' + (dupes ? ' (' + dupes + ' مكرر)' : ''), added > 0 ? 'success' : 'warn');
    refreshUI();
    return true;
  }catch(e){
    if(e.name === 'AbortError') return true;
    O.addLog('فشل FSA، سيتم استخدام الطريقة البديلة', 'warn');
    return false;
  }
}

function addFiles(list, mode){
  var keepRoot = r.optKeepRoot.checked;
  var added = 0, skipped = 0, dupes = 0;
  var arr = Array.prototype.slice.call(list || []);
  arr.forEach(function(f){
    var raw = f.webkitRelativePath || '';
    var rel = raw || f.name;
    if(mode === 'folder' && raw && !keepRoot){
      var i = rel.indexOf('/');
      if(i !== -1) rel = rel.substring(i + 1);
    }
    if(!rel) return;
    var parts = rel.split('/');
    for(var j = 0; j < parts.length; j++){
      if(isExcludedDir(parts[j])){ skipped++; return; }
    }
    if(isExcludedFile(parts[parts.length - 1])){ skipped++; return; }
    if(state.fileMap.has(rel)){ dupes++; return; }
    var item = {path: rel, file: f, size: f.size, selected: true};
    state.fileMap.set(rel, item);
    state.files.push(item);
    added++;
  });
  state.files.sort(function(a,b){ return a.path.localeCompare(b.path, 'en'); });
  O.addLog('أضيف ' + added + ' ملف' +
           (dupes ? ' (' + dupes + ' مكرر)' : '') +
           (skipped ? ' (' + skipped + ' مستثنى)' : ''),
           added > 0 ? 'success' : 'warn');
  refreshUI();
}

function refreshUI(){
  var total = state.files.length;
  if(total > 0){ r.uploadTabCount.textContent = total; r.uploadTabCount.classList.remove('hidden'); }
  else r.uploadTabCount.classList.add('hidden');

  if(total === 0){
    r.treeSection.classList.add('hidden');
    r.selSummary.classList.add('hidden');
    r.emptyState.classList.remove('hidden');
    r.selectAllBtn.disabled = r.deselectAllBtn.disabled = r.deleteModeBtn.disabled = true;
    if(state.deleteMode) toggleDeleteMode();
    r.uploadBtn.disabled = true;
    r.uploadSummary.textContent = '—';
    updatePathPreview();
    return;
  }
  r.emptyState.classList.add('hidden');
  r.treeSection.classList.remove('hidden');
  r.selSummary.classList.remove('hidden');
  r.selectAllBtn.disabled = r.deselectAllBtn.disabled = r.deleteModeBtn.disabled = false;
  renderTree();
  updateStats();
  updateSelSummary();
  updatePathPreview();
}

function updateSelSummary(){
  var sel = state.files.filter(function(f){ return f.selected; });
  var size = sel.reduce(function(s, f){ return s + (f.size || 0); }, 0);
  r.selTitle.textContent = state.files.length + ' ملف';
  var dirs = new Set();
  state.files.forEach(function(f){
    var p = f.path.split('/');
    for(var i = 0; i < p.length - 1; i++) dirs.add(p.slice(0, i+1).join('/'));
  });
  r.selSub.textContent = sel.length + '/' + state.files.length +
    ' · ' + dirs.size + ' مجلد · ' + O.formatBytes(size);
}

/* ═══════════════════════════════════════════════════════════
   Tree rendering
   ═══════════════════════════════════════════════════════════ */
function buildTree(files){
  var root = {name:'', path:'', dirs:new Map(), files:[]};
  files.forEach(function(f){
    var parts = f.path.split('/'), node = root;
    for(var i = 0; i < parts.length - 1; i++){
      var seg = parts[i], p = parts.slice(0, i+1).join('/');
      if(!node.dirs.has(seg)){
        node.dirs.set(seg, {name: seg, path: p, dirs: new Map(), files: []});
      }
      node = node.dirs.get(seg);
    }
    node.files.push(f);
  });
  return root;
}
function renderNode(node, depth){
  var frag = document.createDocumentFragment(), paths = [];
  var dirs = Array.from(node.dirs.values()).sort(function(a,b){ return a.name.localeCompare(b.name, 'en'); });
  var files = node.files.slice().sort(function(a,b){ return a.path.localeCompare(b.path, 'en'); });
  dirs.forEach(function(d){
    var sub = renderNode(d, depth + 1);
    var nodeEl = el('div', 'tree-node');
    var row = el('div', 'tree-row dir');
    row.style.paddingInlineStart = (14 + depth * 18) + 'px';
    var chev = el('button', 'tree-chev'); chev.type = 'button'; chev.appendChild(makeSvg('i-chevron-down'));
    chev.addEventListener('click', function(e){ e.stopPropagation(); nodeEl.classList.toggle('collapsed'); });
    var cb = document.createElement('input'); cb.type = 'checkbox'; cb.className = 'tree-cb';
    if(state.deleteMode) cb.classList.add('delete-mode');
    var ico = makeSvg('i-folder', 'folder');
    var name = el('span', 'tree-name', d.name);
    var cnt = el('span', 'tree-count', String(sub.paths.length));
    row.appendChild(chev); row.appendChild(cb); row.appendChild(ico);
    row.appendChild(name); row.appendChild(cnt);
    var children = el('div', 'tree-children'); children.appendChild(sub.frag);
    var dirPaths = sub.paths.slice();
    state.dirRegistry.push({cb: cb, paths: dirPaths});
    cb.addEventListener('change', function(){
      var v = cb.checked;
      dirPaths.forEach(function(p){ var f = state.fileMap.get(p); if(f) f.selected = v; });
      var inner = children.querySelectorAll('input[data-file]');
      for(var i = 0; i < inner.length; i++) inner[i].checked = v;
      syncDirs(); updateStats(); updateSelSummary();
    });
    nodeEl.appendChild(row); nodeEl.appendChild(children); frag.appendChild(nodeEl);
    sub.paths.forEach(function(p){ paths.push(p); });
  });
  files.forEach(function(f){
    var nodeEl = el('div', 'tree-node');
    var row = el('div', 'tree-row file');
    row.style.paddingInlineStart = (14 + depth * 18 + 34) + 'px';
    var ph = el('span', 'tree-chev placeholder');
    var cb = document.createElement('input'); cb.type = 'checkbox'; cb.className = 'tree-cb';
    if(state.deleteMode) cb.classList.add('delete-mode');
    cb.checked = f.selected; cb.setAttribute('data-file', '1');
    cb.addEventListener('change', function(){
      f.selected = cb.checked; syncDirs(); updateStats(); updateSelSummary();
    });
    var info = fileExtIcon(f.path.split('/').pop());
    var ico = makeSvg(info.icon, info.cls);
    var name = el('span', 'tree-name', f.path.split('/').pop());
    var meta = el('span', 'tree-meta', f.size ? O.formatBytes(f.size) : '');
    row.appendChild(ph); row.appendChild(cb); row.appendChild(ico);
    row.appendChild(name); row.appendChild(meta);
    nodeEl.appendChild(row); frag.appendChild(nodeEl);
    paths.push(f.path);
  });
  return {frag: frag, paths: paths};
}
function renderTree(){
  state.dirRegistry = [];
  r.tree.innerHTML = '';
  var root = buildTree(state.files);
  var res = renderNode(root, 0);
  r.tree.appendChild(res.frag);
  syncDirs();
}
function syncDirs(){
  state.dirRegistry.forEach(function(d){
    var sel = 0;
    d.paths.forEach(function(p){ var f = state.fileMap.get(p); if(f && f.selected) sel++; });
    d.cb.checked = d.paths.length > 0 && sel === d.paths.length;
    d.cb.indeterminate = sel > 0 && sel < d.paths.length;
  });
}
function updateStats(){
  var total = state.files.length;
  if(!total){ r.stats.innerHTML = ''; return; }
  var sel = state.files.filter(function(f){ return f.selected; });
  var size = sel.reduce(function(s, f){ return s + (f.size || 0); }, 0);
  var dirs = new Set();
  state.files.forEach(function(f){
    var p = f.path.split('/');
    for(var i = 0; i < p.length - 1; i++) dirs.add(p.slice(0, i+1).join('/'));
  });
  r.stats.innerHTML = '';
  function addStat(id, label, value){
    var s = el('span', 'stat');
    s.appendChild(makeSvg(id));
    s.appendChild(el('span', null, label));
    s.appendChild(el('b', null, value));
    r.stats.appendChild(s);
  }
  addStat('i-file', 'ملفات:', String(total));
  addStat('i-folder', 'مجلدات:', String(dirs.size));
  addStat('i-check', 'مختار:', String(sel.length));
  addStat('i-upload', 'الحجم:', O.formatBytes(size));
  r.uploadBtn.disabled = sel.length === 0 || state.uploading;
  r.uploadSummary.textContent = sel.length === 0
    ? '—'
    : sel.length + ' ملف · ' + O.formatBytes(size);
}

/* ═══════════════════════════════════════════════════════════
   Select All / Deselect All
   ═══════════════════════════════════════════════════════════ */
r.selectAllBtn.addEventListener('click', function(){
  state.files.forEach(function(f){ f.selected = true; });
  var all = r.tree.querySelectorAll('input[data-file]');
  for(var i = 0; i < all.length; i++) all[i].checked = true;
  syncDirs(); updateStats(); updateSelSummary();
  O.toast('تم تحديد كل الملفات (' + state.files.length + ')', 'success');
});

r.deselectAllBtn.addEventListener('click', function(){
  state.files.forEach(function(f){ f.selected = false; });
  var all = r.tree.querySelectorAll('input[data-file]');
  for(var i = 0; i < all.length; i++) all[i].checked = false;
  syncDirs(); updateStats(); updateSelSummary();
  O.toast('تم إلغاء تحديد الكل', 'success');
});

/* ═══════════════════════════════════════════════════════════
   ⭐ وضع الحذف
   ═══════════════════════════════════════════════════════════ */
function toggleDeleteMode(){
  state.deleteMode = !state.deleteMode;

  if(state.deleteMode){
    /* تفعيل */
    r.deleteModeBtn.innerHTML = '<i class="oi oi-x"></i><span>إلغاء</span>';
    r.deleteModeBtn.classList.add('active');
    r.confirmDeleteBtn.classList.remove('hidden');
    r.deleteModeBanner.classList.remove('hidden');

    /* إلغاء التحديد الحالي */
    state.files.forEach(function(f){ f.selected = false; });
    var all = r.tree.querySelectorAll('input[data-file]');
    for(var i = 0; i < all.length; i++) all[i].checked = false;

    /* تحويل كل الـ checkboxes للأحمر */
    var cbs = r.tree.querySelectorAll('.tree-cb');
    for(var j = 0; j < cbs.length; j++) cbs[j].classList.add('delete-mode');

    syncDirs(); updateStats(); updateSelSummary();
    O.toast('وضع الحذف — حدد الملفات التي تريد حذفها', 'warn');
  } else {
    /* تعطيل */
    r.deleteModeBtn.innerHTML = '<i class="oi oi-trash"></i>';
    r.deleteModeBtn.classList.remove('active');
    r.confirmDeleteBtn.classList.add('hidden');
    r.deleteModeBanner.classList.add('hidden');

    var cbs2 = r.tree.querySelectorAll('.tree-cb');
    for(var k = 0; k < cbs2.length; k++) cbs2[k].classList.remove('delete-mode');
  }
}

r.deleteModeBtn.addEventListener('click', toggleDeleteMode);

/* زر الحذف التأكيدي */
r.confirmDeleteBtn.addEventListener('click', async function(){
  var selected = state.files.filter(function(f){ return f.selected; });
  if(selected.length === 0){
    O.toast('لم تحدد أي ملفات للحذف', 'warn');
    return;
  }

  if(!await O.confirm({
    title: 'حذف ملفات',
    message: 'سيتم حذف ' + selected.length + ' ملف من القائمة.\n\nلن يتم حذفها من GitHub — فقط من قائمة الرفع الحالية.',
    okText: 'حذف'
  })) return;

  /* حذف من state */
  selected.forEach(function(f){
    state.fileMap.delete(f.path);
  });
  state.files = state.files.filter(function(f){ return !f.selected; });

  /* إعادة بناء الشجرة */
  if(state.files.length === 0){
    if(state.deleteMode) toggleDeleteMode();
  }
  state.dirRegistry = [];
  refreshUI();

  O.toast('تم حذف ' + selected.length + ' ملف من القائمة', 'success');
  O.addLog('حذف ' + selected.length + ' ملف من قائمة الرفع (محلي فقط)', 'info');
});

/* ═══════════════════════════════════════════════════════════
   File input listeners
   ═══════════════════════════════════════════════════════════ */
r.pickFilesBtn.addEventListener('click', function(){
  r.filesInput.value = ''; r.filesInput.click();
});
r.pickFolderBtn.addEventListener('click', async function(){
  var ok = await tryFSAFolderPick();
  if(!ok){ r.folderInput.value = ''; r.folderInput.click(); }
});
r.filesInput.addEventListener('change', function(e){
  var l = Array.prototype.slice.call(e.target.files || []);
  if(l.length) addFiles(l, 'files');
});
r.folderInput.addEventListener('change', function(e){
  var l = Array.prototype.slice.call(e.target.files || []);
  if(l.length) addFiles(l, 'folder');
});
r.optKeepRoot.addEventListener('change', updatePathPreview);

/* ═══════════════════════════════════════════════════════════
   ⭐ Upload Mode toggle (Files / ZIP)
   ═══════════════════════════════════════════════════════════ */
function setUploadMode(mode){
  state.uploadZipMode = (mode === 'zip');
  r.uploadModeFilesCard.classList.toggle('active', !state.uploadZipMode);
  r.uploadModeZipCard.classList.toggle('active', state.uploadZipMode);
  r.zipNameRow.classList.toggle('hidden', !state.uploadZipMode);
  updatePathPreview();
  updateStats();
}

r.uploadModeFilesCard.addEventListener('click', function(){
  setUploadMode('files');
});
r.uploadModeZipCard.addEventListener('click', function(){
  setUploadMode('zip');
});
r.zipNameInput.addEventListener('input', updatePathPreview);

/* ═══════════════════════════════════════════════════════════
   Progress
   ═══════════════════════════════════════════════════════════ */
function setProgress(done, total, path){
  var pct = total ? Math.round((done / total) * 100) : 0;
  r.progressBar.style.width = pct + '%';
  r.progressPct.textContent = pct + '%';
  r.progressLabel.textContent = done + ' / ' + total;
  if(path !== undefined) r.progressFile.textContent = path || '—';
}
function resetProgress(){
  r.progressBar.classList.remove('done', 'fail');
  r.progressBar.style.width = '0%';
  r.progressPct.textContent = '0%';
  r.progressLabel.textContent = 'في الانتظار';
  r.progressFile.textContent = '—';
  r.resultBox.classList.remove('show');
  r.resultUrl.innerHTML = '';
}

/* ═══════════════════════════════════════════════════════════
   ⭐ Upload (individual files OR zip)
   ═══════════════════════════════════════════════════════════ */
r.uploadBtn.addEventListener('click', function(){
  if(state.uploading) return;
  var token = r.tokenInput.value.trim();
  var owner = state.owner, repoName = state.repoName;
  var commitMsg = r.commitInput.value.trim() || 'Initial commit via Orbit';
  if(!token || !owner || !repoName){
    O.toast('اختر مستودعًا أولًا', 'error'); return;
  }
  var selected = state.files.filter(function(f){ return f.selected; });
  if(!selected.length){ O.toast('لم تختر ملفات', 'error'); return; }

  if(state.uploadZipMode){
    uploadAsZip(token, owner, repoName, commitMsg, selected);
  } else {
    uploadIndividual(token, owner, repoName, commitMsg, selected);
  }
});

/* ─── رفع فردي (الطريقة القديمة) ─── */
function uploadIndividual(token, owner, repoName, commitMsg, selected){
  var prefix = getTargetPrefix();
  var finalFiles = selected.map(function(f){
    return {path: prefix + f.path, file: f.file, size: f.size};
  });

  state.uploading = true;
  r.uploadBtn.disabled = true;
  r.pickFilesBtn.disabled = r.pickFolderBtn.disabled = true;
  resetProgress();
  setProgress(0, finalFiles.length, '');
  O.setHeaderBadge('جاري الرفع…', 'warn');
  r.footerStatus.textContent = 'جاري الرفع…';

  var t0 = performance.now();
  var uploaded = [], failed = [];

  O.api('/repos/' + owner + '/' + repoName + '/git/ref/heads/' + encodeURIComponent(state.branch),
    {token: token, allow404: true}).then(function(ref){
    var parentSha = null, baseTreeSha = null, chain = Promise.resolve();
    if(ref && ref.object && ref.object.sha){
      parentSha = ref.object.sha;
      chain = O.api('/repos/' + owner + '/' + repoName + '/git/commits/' + parentSha, {token: token})
        .then(function(pc){ baseTreeSha = pc.tree.sha; })
        .catch(function(){});
    }
    return chain.then(function(){
      var results = new Array(finalFiles.length);
      var queue = finalFiles.map(function(_, i){ return i; });
      var done = 0, failedFlag = null;

      function worker(){
        if(!queue.length || failedFlag) return Promise.resolve();
        var idx = queue.shift();
        var f = finalFiles[idx];
        return f.file.arrayBuffer().then(function(buf){
          return O.api('/repos/' + owner + '/' + repoName + '/git/blobs', {
            method: 'POST',
            token: token,
            body: {content: O.bufferToBase64(buf), encoding: 'base64'}
          }).then(function(blob){
            results[idx] = {path: f.path, sha: blob.sha};
            uploaded.push({path: f.path, size: f.size, status: 'ok'});
            done++;
            setProgress(done, finalFiles.length, f.path);
            return worker();
          });
        }).catch(function(err){
          failed.push({path: f.path, status: 'err'});
          failedFlag = err;
          throw err;
        });
      }
      var n = Math.min(CONCURRENCY, finalFiles.length), ws = [];
      for(var i = 0; i < n; i++) ws.push(worker());
      return Promise.all(ws).then(function(){
        r.progressFile.textContent = 'بناء الشجرة…';
        var treeBody = {
          tree: results.map(function(res){
            return {path: res.path, mode: '100644', type: 'blob', sha: res.sha};
          })
        };
        if(baseTreeSha) treeBody.base_tree = baseTreeSha;
        return O.api('/repos/' + owner + '/' + repoName + '/git/trees',
          {method: 'POST', token: token, body: treeBody});
      }).then(function(treeRes){
        r.progressFile.textContent = 'إنشاء Commit…';
        var cb = {message: commitMsg, tree: treeRes.sha};
        if(parentSha) cb.parents = [parentSha];
        return O.api('/repos/' + owner + '/' + repoName + '/git/commits',
          {method: 'POST', token: token, body: cb});
      }).then(function(commit){
        r.progressFile.textContent = 'تحديث الفرع…';
        state.lastCommitSha = commit.sha;
        if(parentSha){
          return O.api('/repos/' + owner + '/' + repoName + '/git/refs/heads/' +
            encodeURIComponent(state.branch),
            {method: 'PATCH', token: token, body: {sha: commit.sha, force: false}});
        }
        return O.api('/repos/' + owner + '/' + repoName + '/git/refs',
          {method: 'POST', token: token,
           body: {ref: 'refs/heads/' + state.branch, sha: commit.sha}});
      });
    });
  }).then(function(){
    var secs = ((performance.now() - t0) / 1000).toFixed(1);
    r.progressBar.classList.add('done');
    r.progressBar.style.width = '100%';
    r.progressPct.textContent = '100%';
    r.progressLabel.textContent = 'اكتمل';
    r.progressFile.textContent = finalFiles.length + ' ملف في ' + secs + ' ث';
    O.setHeaderBadge('اكتمل الرفع', 'ok');
    r.footerStatus.textContent = 'اكتمل';
    var url = 'https://github.com/' + owner + '/' + repoName;
    r.resultUrl.innerHTML = '';
    var a = el('a', null, url);
    a.href = url; a.target = '_blank'; a.rel = 'noopener';
    r.resultUrl.appendChild(a);
    r.resultBox.classList.add('show');
    O.addLog('تم الرفع: ' + url, 'success');
    O.addToArchive({
      type: 'upload',
      title: 'رفع ' + finalFiles.length + ' ملف',
      status: 'ok',
      repo: repoName, owner: owner, branch: state.branch,
      files: uploaded, commitSha: state.lastCommitSha, duration: secs,
      details: {commit: commitMsg, url: url, prefix: prefix || '(root)'}
    });
    O.refreshAfterOperation('upload', {count: finalFiles.length, commitSha: state.lastCommitSha});
  }).catch(function(err){
    r.progressBar.classList.add('fail');
    r.progressLabel.textContent = 'فشل';
    r.progressFile.textContent = err.message;
    O.setHeaderBadge('فشل الرفع', 'err');
    O.addLog('فشل: ' + err.message, 'error');
    O.addToArchive({
      type: 'error', title: 'فشل رفع الملفات', status: 'err',
      repo: repoName, owner: owner,
      files: uploaded.concat(failed),
      details: {error: err.message}
    });
  }).then(function(){
    state.uploading = false;
    r.pickFilesBtn.disabled = r.pickFolderBtn.disabled = false;
    updateStats();
  });
}

/* ═══════════════════════════════════════════════════════════
   ⭐ رفع كـ ZIP
   ═══════════════════════════════════════════════════════════ */
async function loadJSZip(){
  if(window.JSZip) return window.JSZip;
  return new Promise(function(resolve, reject){
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
    s.onload = function(){ resolve(window.JSZip); };
    s.onerror = function(){ reject(new Error('فشل تحميل مكتبة JSZip')); };
    document.head.appendChild(s);
  });
}

async function uploadAsZip(token, owner, repoName, commitMsg, selected){
  var prefix = getTargetPrefix();
  var zipName = (r.zipNameInput.value.trim() || 'files').replace(/\.zip$/i, '');
  var zipFileName = zipName + '.zip';
  var zipPath = prefix + zipFileName;

  state.uploading = true;
  r.uploadBtn.disabled = true;
  r.pickFilesBtn.disabled = r.pickFolderBtn.disabled = true;
  resetProgress();
  setProgress(0, selected.length + 1, 'جاري تجهيز ZIP…');
  O.setHeaderBadge('جاري الضغط…', 'warn');
  r.footerStatus.textContent = 'جاري الضغط…';

  var t0 = performance.now();

  try{
    /* 1. تحميل JSZip */
    r.progressFile.textContent = 'تحميل مكتبة الضغط…';
    var JSZip = await loadJSZip();
    var zip = new JSZip();

    /* 2. ضغط كل الملفات */
    for(var i = 0; i < selected.length; i++){
      var f = selected[i];
      r.progressFile.textContent = 'ضغط: ' + f.path;
      var buf = await f.file.arrayBuffer();
      zip.file(f.path, buf);
      setProgress(i + 1, selected.length + 1, f.path);
    }

    /* 3. توليد الـ ZIP */
    r.progressFile.textContent = 'إنشاء ملف ZIP…';
    var zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {level: 6}
    });
    var zipSize = zipBlob.size;

    /* 4. الرفع على GitHub كملف واحد */
    O.setHeaderBadge('جاري الرفع…', 'warn');
    r.footerStatus.textContent = 'جاري الرفع…';
    r.progressFile.textContent = 'رفع ' + zipFileName + '…';

    var zipBuffer = await zipBlob.arrayBuffer();
    var zipBase64 = O.bufferToBase64(zipBuffer);

    /* Blob */
    var blobRes = await O.api('/repos/' + owner + '/' + repoName + '/git/blobs', {
      method: 'POST', token: token,
      body: {content: zipBase64, encoding: 'base64'}
    });

    /* Parent commit */
    var refRes = await O.api('/repos/' + owner + '/' + repoName + '/git/ref/heads/' +
      encodeURIComponent(state.branch), {token: token, allow404: true});
    var parentSha = null, baseTreeSha = null;
    if(refRes && refRes.object && refRes.object.sha){
      parentSha = refRes.object.sha;
      var commitRes = await O.api('/repos/' + owner + '/' + repoName + '/git/commits/' + parentSha, {token: token});
      baseTreeSha = commitRes.tree.sha;
    }

    /* Tree */
    var treeBody = {
      tree: [{path: zipPath, mode: '100644', type: 'blob', sha: blobRes.sha}]
    };
    if(baseTreeSha) treeBody.base_tree = baseTreeSha;
    var treeRes = await O.api('/repos/' + owner + '/' + repoName + '/git/trees', {
      method: 'POST', token: token, body: treeBody
    });

    /* Commit */
    var commitBody = {message: commitMsg + ' (ZIP)', tree: treeRes.sha};
    if(parentSha) commitBody.parents = [parentSha];
    var commit = await O.api('/repos/' + owner + '/' + repoName + '/git/commits', {
      method: 'POST', token: token, body: commitBody
    });

    /* Update ref */
    if(parentSha){
      await O.api('/repos/' + owner + '/' + repoName + '/git/refs/heads/' +
        encodeURIComponent(state.branch),
        {method: 'PATCH', token: token, body: {sha: commit.sha, force: false}});
    } else {
      await O.api('/repos/' + owner + '/' + repoName + '/git/refs',
        {method: 'POST', token: token,
         body: {ref: 'refs/heads/' + state.branch, sha: commit.sha}});
    }

    var secs = ((performance.now() - t0) / 1000).toFixed(1);
    r.progressBar.classList.add('done');
    r.progressBar.style.width = '100%';
    r.progressPct.textContent = '100%';
    r.progressLabel.textContent = 'اكتمل';
    r.progressFile.textContent = selected.length + ' ملف → ' + O.formatBytes(zipSize) + ' في ' + secs + ' ث';
    O.setHeaderBadge('اكتمل الرفع', 'ok');
    r.footerStatus.textContent = 'اكتمل';

    var url = 'https://github.com/' + owner + '/' + repoName;
    r.resultUrl.innerHTML = '';
    var a = el('a', null, url); a.href = url; a.target = '_blank'; a.rel = 'noopener';
    r.resultUrl.appendChild(a);
    r.resultBox.classList.add('show');

    O.addLog('تم رفع ZIP: ' + zipPath + ' (' + O.formatBytes(zipSize) + ')', 'success');
    O.addToArchive({
      type: 'upload',
      title: 'رفع ZIP (' + selected.length + ' ملف)',
      status: 'ok',
      repo: repoName, owner: owner, branch: state.branch,
      files: [{path: zipPath, size: zipSize, status: 'ok'}],
      commitSha: commit.sha, duration: secs,
      details: {zip_path: zipPath, source_files: selected.length, zip_size: zipSize}
    });

    O.refreshAfterOperation('upload', {count: selected.length, commitSha: commit.sha});

  } catch(e){
    r.progressBar.classList.add('fail');
    r.progressLabel.textContent = 'فشل';
    r.progressFile.textContent = e.message;
    O.setHeaderBadge('فشل الضغط/الرفع', 'err');
    O.addLog('فشل ZIP: ' + e.message, 'error');
    O.toast('فشل: ' + e.message, 'error');
  } finally {
    state.uploading = false;
    r.pickFilesBtn.disabled = r.pickFolderBtn.disabled = false;
    updateStats();
  }
}

/* ─── Expose ────────────────────────────────────────────── */
O.isExcludedDir = isExcludedDir;
O.isExcludedFile = isExcludedFile;
O.fileExtIcon = fileExtIcon;
O.getTargetPrefix = getTargetPrefix;
O.updatePathPreview = updatePathPreview;
O.refreshUI = refreshUI;
O.updateSelSummary = updateSelSummary;
O.updateUploadRepoText = updateUploadRepoText;
O.setProgress = setProgress;
O.resetProgress = resetProgress;

})();