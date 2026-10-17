/* ════════════════════════════════════════════════════════════
   Orbit · remote.js — شجرة المستودع + الفروع + Folder Picker
   + إعادة تسمية/حذف/نقل المجلدات
   ════════════════════════════════════════════════════════════ */
(function(){
'use strict';
var O = window.Orbit;
var el = O.el, makeSvg = O.makeSvg;
var r = O.refs, state = O.state;

/* ─── كشف اللمس ────────────────────────────────────────── */
function isTouchDevice(){
  return window.matchMedia('(hover: none), (pointer: coarse)').matches;
}

/* ─── Build Repo Tree ───────────────────────────────────── */
function buildRepoTree(files){
  var root={name:'',path:'',dirs:new Map(),files:[]};
  files.forEach(function(f){
    var parts=f.path.split('/'),node=root;
    for(var i=0;i<parts.length-1;i++){
      var seg=parts[i],p=parts.slice(0,i+1).join('/');
      if(!node.dirs.has(seg)) node.dirs.set(seg,{name:seg,path:p,dirs:new Map(),files:[]});
      node=node.dirs.get(seg);
    }
    node.files.push(f);
  });
  return root;
}
function renderRepoNode(node,depth){
  var frag=document.createDocumentFragment(),count=0;
  var dirs=Array.from(node.dirs.values()).sort(function(a,b){return a.name.localeCompare(b.name,'en');});
  var files=node.files.slice().sort(function(a,b){return a.path.localeCompare(b.path,'en');});

  /* ─── المجلدات ─── */
  dirs.forEach(function(d){
    var sub=renderRepoNode(d,depth+1); count+=sub.count;
    var nodeEl=el('div','tree-node');
    var row=el('div','tree-row dir');
    row.style.paddingInlineStart=(14+depth*18)+'px';
    row.title = d.path;

    var chev=el('button','tree-chev'); chev.type='button'; chev.appendChild(makeSvg('i-chevron-down'));
    chev.addEventListener('click',function(e){e.stopPropagation();nodeEl.classList.toggle('collapsed');});

    var ico=makeSvg('i-folder','folder');
    var name=el('span','tree-name',d.name);
    var cnt=el('span','tree-count',String(sub.count));

    var actions=el('div','tree-actions');

    var editBtn=el('button','tree-action-btn'); editBtn.type='button'; editBtn.title='إعادة تسمية';
    editBtn.appendChild(makeSvg('i-edit'));
    editBtn.addEventListener('click',function(e){
      e.stopPropagation();
      closeActiveRows();
      openRenameFolder(d.path);
    });

    var moveBtn=el('button','tree-action-btn'); moveBtn.type='button'; moveBtn.title='نقل المجلد';
    moveBtn.appendChild(makeSvg('i-move'));
    moveBtn.addEventListener('click',function(e){
      e.stopPropagation();
      closeActiveRows();
      openFolderPicker('move', d.path, 'folder');
    });

    var delBtn=el('button','tree-action-btn del'); delBtn.type='button'; delBtn.title='حذف المجلد';
    delBtn.appendChild(makeSvg('i-trash'));
    delBtn.addEventListener('click',function(e){
      e.stopPropagation();
      closeActiveRows();
      deleteFolder(d.path);
    });

    actions.appendChild(editBtn);
    actions.appendChild(moveBtn);
    actions.appendChild(delBtn);

    row.appendChild(chev);
    row.appendChild(ico);
    row.appendChild(name);
    row.appendChild(cnt);
    row.appendChild(actions);

    row.addEventListener('click',function(e){
      if(!isTouchDevice()) return;
      if(e.target.closest('.tree-action-btn')) return;
      if(e.target.closest('.tree-chev')) return;
      var wasActive = row.classList.contains('row-active');
      closeActiveRows(row);
      row.classList.toggle('row-active', !wasActive);
    });

    var children=el('div','tree-children'); children.appendChild(sub.frag);
    nodeEl.appendChild(row); nodeEl.appendChild(children); frag.appendChild(nodeEl);
  });

  /* ─── الملفات ─── */
  files.forEach(function(f){
    count++;
    var nodeEl=el('div','tree-node');
    var row=el('div','tree-row file');
    row.style.paddingInlineStart=(14+depth*18+34)+'px';
    row.title=f.path;

    var ph=el('span','tree-chev placeholder');
    var info=O.fileExtIcon(f.path.split('/').pop());
    var ico=makeSvg(info.icon,info.cls);
    var name=el('span','tree-name',f.path.split('/').pop());
    var meta=el('span','tree-meta',f.size?O.formatBytes(f.size):'');

    var actions=el('div','tree-actions');

    var editBtn=el('button','tree-action-btn'); editBtn.type='button'; editBtn.title='تعديل';
    editBtn.appendChild(makeSvg('i-edit'));
    editBtn.addEventListener('click',function(e){
      e.stopPropagation(); closeActiveRows();
      O.openEditor(f.path,'edit');
    });

    var copyBtn=el('button','tree-action-btn'); copyBtn.type='button'; copyBtn.title='نسخ';
    copyBtn.appendChild(makeSvg('i-copy'));
    copyBtn.addEventListener('click',function(e){
      e.stopPropagation(); closeActiveRows();
      openFolderPicker('copy', f.path, 'file');
    });

    var moveBtn=el('button','tree-action-btn'); moveBtn.type='button'; moveBtn.title='نقل';
    moveBtn.appendChild(makeSvg('i-move'));
    moveBtn.addEventListener('click',function(e){
      e.stopPropagation(); closeActiveRows();
      openFolderPicker('move', f.path, 'file');
    });

    var delBtn=el('button','tree-action-btn del'); delBtn.type='button'; delBtn.title='حذف';
    delBtn.appendChild(makeSvg('i-trash'));
    delBtn.addEventListener('click',function(e){
      e.stopPropagation(); closeActiveRows();
      deleteRepoFile(f.path);
    });

    actions.appendChild(editBtn);
    actions.appendChild(copyBtn);
    actions.appendChild(moveBtn);
    actions.appendChild(delBtn);

    row.appendChild(ph);
    row.appendChild(ico);
    row.appendChild(name);
    row.appendChild(meta);
    row.appendChild(actions);

    row.addEventListener('click',function(e){
      if(!isTouchDevice()) return;
      if(e.target.closest('.tree-action-btn')) return;
      var wasActive = row.classList.contains('row-active');
      closeActiveRows(row);
      row.classList.toggle('row-active', !wasActive);
    });

    nodeEl.appendChild(row);
    frag.appendChild(nodeEl);
  });

  return {frag:frag,count:count};
}

function closeActiveRows(except){
  document.querySelectorAll('.tree-row.row-active').forEach(function(other){
    if(other !== except) other.classList.remove('row-active');
  });
}
document.addEventListener('click',function(e){
  if(!e.target.closest('.tree-row')){
    closeActiveRows();
  }
},true);

function renderRepoTree(){
  r.repoTree.innerHTML='';
  var root=buildRepoTree(state.repoFiles);
  var res=renderRepoNode(root,0);
  r.repoTree.appendChild(res.frag);
  var totalSize=state.repoFiles.reduce(function(s,f){return s+(f.size||0);},0);
  var dirs=new Set();
  state.repoFiles.forEach(function(f){var p=f.path.split('/'); for(var i=0;i<p.length-1;i++) dirs.add(p.slice(0,i+1).join('/'));});
  r.repoStats.innerHTML='';
  function add(id,l,v){var s=el('span','stat');s.appendChild(makeSvg(id));s.appendChild(el('span',null,l));s.appendChild(el('b',null,v));r.repoStats.appendChild(s);}
  add('i-file','ملفات:',String(state.repoFiles.length));
  add('i-folder','مجلدات:',String(dirs.size));
  add('i-download','الحجم:',O.formatBytes(totalSize));
}

/* ─── Load Repo Content ─────────────────────────────────── */
function loadRepoContent(commitSha, onDone){
  var token=r.tokenInput.value.trim(),owner=state.owner,repo=state.repoName;
  if(!token||!owner||!repo){O.toast('اختر مستودعًا','warn'); return;}

  r.repoToolsStatus.innerHTML='<div class="busy"><div class="spinner"></div><span>جاري التحميل…</span></div>';
  r.repoTreeSection.classList.add('hidden');

  var treeRef = commitSha ? commitSha : encodeURIComponent(state.branch);
  var url = '/repos/'+owner+'/'+repo+'/git/trees/'+treeRef+'?recursive=1';

  O.api(url,{token:token}).then(function(data){
    if(!data||!data.tree) throw new Error('فشل الاسترجاع');
    var newSha = data.sha;
    state.repoFiles=data.tree.filter(function(t){return t.type==='blob';});
    state.repoNeedsRefresh=false;
    state.lastLoadedTreeSha = newSha;
    O.addLog('المستودع: '+state.repoFiles.length+' ملف','success');
    O.updateRemoteTabCount();

    r.newFileBtn.disabled=false;
    r.repoToolsStatus.innerHTML='<div class="row" style="color:var(--success);font-size:12.5px;padding:8px 0"><i class="oi oi-check-circle"></i><span>تم تحميل <b>'+state.repoFiles.length+'</b> ملف</span></div>';
    r.repoTreeSection.classList.remove('hidden');
    renderRepoTree();
    loadBranches();

    if(typeof onDone==='function') onDone(newSha, state.repoFiles.length);
  }).catch(function(err){
    O.addLog(err.message,'error');
    r.repoToolsStatus.innerHTML='<div class="empty"><i class="oi oi-alert"></i><div class="empty-title">فشل التحميل</div><div class="empty-desc">'+O.escapeHtml(err.message)+'</div></div>';
  });
}
r.loadRepoBtn.addEventListener('click',function(){ loadRepoContent(); });
r.newFileBtn.addEventListener('click',function(){O.openEditor('','new');});

/* ═══════════════════════════════════════════════════════════
   عمليات الملفات
   ═══════════════════════════════════════════════════════════ */
async function deleteRepoFile(path){
  if(!await O.confirm({
    title:'حذف ملف',
    message:'هل تريد حذف هذا الملف؟\n\n' + path + '\n\nلا يمكن التراجع.',
    okText:'حذف'
  })) return;
  var token=r.tokenInput.value.trim(),owner=state.owner,repo=state.repoName;
  if(!token||!owner||!repo){O.toast('بيانات ناقصة','error'); return;}
  var t0=performance.now();
  O.api('/repos/'+owner+'/'+repo+'/contents/'+encodeURI(path),{token:token})
    .then(function(data){
      return O.api('/repos/'+owner+'/'+repo+'/contents/'+encodeURI(path),{
        method:'DELETE',token:token,
        body:{message:'حذف '+path.split('/').pop(),sha:data.sha,branch:state.branch}
      });
    })
    .then(function(res){
      var sha=res&&res.commit?res.commit.sha:null;
      O.addLog('تم الحذف: '+path,'success');
      O.addToArchive({type:'delete',title:'حذف ملف',status:'ok',repo:repo,owner:owner,branch:state.branch,files:[{path:path,status:'ok'}],commitSha:sha,duration:((performance.now()-t0)/1000).toFixed(2),details:{file:path}});
      O.refreshAfterOperation('delete', {path: path, commitSha: sha});
    })
    .catch(function(e){O.addLog('فشل الحذف: '+e.message,'error');});
}

/* ═══════════════════════════════════════════════════════════
   إعادة تسمية المجلد
   ═══════════════════════════════════════════════════════════ */
var renameFolderOldPath = null;

function openRenameFolder(path){
  renameFolderOldPath = path;
  var parts = path.split('/');
  var oldName = parts[parts.length - 1];
  r.renameOldPath.textContent = '/' + path;
  r.renameFolderInput.value = oldName;
  r.renameNewPath.textContent = '/' + path;
  r.renameFolderModal.classList.add('open');
  document.body.classList.add('modal-open');
  setTimeout(function(){
    r.renameFolderInput.focus();
    r.renameFolderInput.select();
  }, 120);
}

function closeRenameFolder(){
  r.renameFolderModal.classList.remove('open');
  document.body.classList.remove('modal-open');
  renameFolderOldPath = null;
  r.renameFolderInput.value = '';
  r.renameOldPath.textContent = '—';
  r.renameNewPath.textContent = '—';
}

r.renameFolderCloseBtn.addEventListener('click', closeRenameFolder);
r.renameFolderCancelBtn.addEventListener('click', closeRenameFolder);
r.renameFolderModal.addEventListener('click', function(e){
  if(e.target === r.renameFolderModal) closeRenameFolder();
});

r.renameFolderInput.addEventListener('input', function(){
  if(!renameFolderOldPath) return;
  var parts = renameFolderOldPath.split('/');
  var newName = r.renameFolderInput.value.trim() || parts[parts.length - 1];
  parts[parts.length - 1] = newName;
  r.renameNewPath.textContent = '/' + parts.join('/');
});

/* ─── Tree helpers ──────────────────────────────────────── */
async function getCurrentTree(token, owner, repo, branch){
  var data = await O.api('/repos/'+owner+'/'+repo+
    '/git/trees/'+encodeURIComponent(branch)+'?recursive=1', {token:token});
  if(!data || !data.tree) throw new Error('فشل جلب الشجرة');
  return data;
}
async function getBranchCommit(token, owner, repo, branch){
  var refData = await O.api('/repos/'+owner+'/'+repo+
    '/git/ref/heads/'+encodeURIComponent(branch), {token:token});
  if(!refData || !refData.object) throw new Error('فشل جلب الفرع');
  var parentSha = refData.object.sha;
  var commitData = await O.api('/repos/'+owner+'/'+repo+
    '/git/commits/'+parentSha, {token:token});
  return {parentSha:parentSha, treeSha:commitData.tree.sha};
}
async function createTreeAndCommit(token, owner, repo, branch, entries, message){
  var ctx = await getBranchCommit(token, owner, repo, branch);
  var newTree = await O.api('/repos/'+owner+'/'+repo+'/git/trees', {
    method:'POST', token:token,
    body:{tree:entries, base_tree:ctx.treeSha}
  });
  var commit = await O.api('/repos/'+owner+'/'+repo+'/git/commits', {
    method:'POST', token:token,
    body:{message:message, tree:newTree.sha, parents:[ctx.parentSha]}
  });
  await O.api('/repos/'+owner+'/'+repo+'/git/refs/heads/'+encodeURIComponent(branch), {
    method:'PATCH', token:token,
    body:{sha:commit.sha, force:false}
  });
  return commit.sha;
}

/* ⭐ نقل/إعادة تسمية مجلد داخل نفس المستودع */
async function moveFolderInRepo(oldPath, newPath){
  var token = r.tokenInput.value.trim();
  var owner = state.owner, repo = state.repoName;
  var t0 = performance.now();

  var treeData = await getCurrentTree(token, owner, repo, state.branch);
  var prefixOld = oldPath + '/';
  var files = treeData.tree.filter(function(t){
    return t.type === 'blob' && t.path.indexOf(prefixOld) === 0;
  });

  if(files.length === 0) throw new Error('المجلد فارغ أو غير موجود');

  var entries = [];
  files.forEach(function(f){
    var relative = f.path.substring(prefixOld.length);
    entries.push({path:f.path, mode:'100644', type:'blob', sha:null});
    entries.push({path:newPath + '/' + relative, mode:'100644', type:'blob', sha:f.sha});
  });

  var commitSha = await createTreeAndCommit(token, owner, repo, state.branch,
    entries, 'نقل المجلد: ' + oldPath + ' → ' + newPath);

  var secs = ((performance.now() - t0)/1000).toFixed(2);
  O.addToArchive({
    type:'edit', title:'نقل مجلد ('+files.length+' ملف)', status:'ok',
    repo:repo, owner:owner, branch:state.branch,
    files:files.map(function(f){
      return {path:newPath + '/' + f.path.substring(prefixOld.length), status:'ok'};
    }),
    commitSha:commitSha, duration:secs,
    details:{from:oldPath, to:newPath, count:files.length}
  });
  state.lastCommitSha = commitSha;
  return commitSha;
}

/* ⭐ حذف مجلد */
async function deleteFolder(path){
  var count = (state.repoFiles || []).filter(function(f){
    return f.path.indexOf(path + '/') === 0;
  }).length;

  if(!await O.confirm({
    title:'حذف مجلد',
    message:'سيتم حذف المجلد:\n' + path + '\n\nوكل محتوياته (' + count + ' ملف).\nلا يمكن التراجع.',
    okText:'حذف الكل'
  })) return;

  var token = r.tokenInput.value.trim();
  var owner = state.owner, repo = state.repoName;
  if(!token || !owner || !repo){O.toast('بيانات ناقصة','error'); return;}

  var t0 = performance.now();
  try{
    var treeData = await getCurrentTree(token, owner, repo, state.branch);
    var prefix = path + '/';
    var files = treeData.tree.filter(function(t){
      return t.type === 'blob' && t.path.indexOf(prefix) === 0;
    });

    if(files.length === 0){
      O.toast('المجلد فارغ','warn');
      return;
    }

    var entries = files.map(function(f){
      return {path:f.path, mode:'100644', type:'blob', sha:null};
    });

    var commitSha = await createTreeAndCommit(token, owner, repo, state.branch,
      entries, 'حذف المجلد: ' + path);

    var secs = ((performance.now() - t0)/1000).toFixed(2);
    O.addToArchive({
      type:'delete', title:'حذف مجلد ('+files.length+' ملف)', status:'ok',
      repo:repo, owner:owner, branch:state.branch,
      files:files.map(function(f){return {path:f.path, status:'ok'};}),
      commitSha:commitSha, duration:secs,
      details:{folder:path, count:files.length}
    });
    state.lastCommitSha = commitSha;
    O.refreshAfterOperation('delete', {path:path, commitSha:commitSha});

  }catch(e){
    O.addLog('فشل حذف المجلد: ' + e.message, 'error');
    O.toast(e.message, 'error');
  }
}

/* ⭐ نقل مجلد لمستودع آخر */
async function moveFolderToAnotherRepo(sourcePath, targetRepo, targetBasePath){
  var token = r.tokenInput.value.trim();
  var srcOwner = state.owner, srcRepo = state.repoName;
  var srcBranch = state.branch;
  var targetBranch = targetRepo.default_branch || 'main';

  var treeData = await getCurrentTree(token, srcOwner, srcRepo, srcBranch);
  var prefix = sourcePath + '/';
  var srcFiles = treeData.tree.filter(function(t){
    return t.type === 'blob' && t.path.indexOf(prefix) === 0;
  });

  if(srcFiles.length === 0) throw new Error('المجلد فارغ');

  var folderName = sourcePath.split('/').pop();
  var basePath = targetBasePath ? targetBasePath + '/' : '';
  var finalPrefix = basePath + folderName + '/';

  var success = 0, failed = 0;

  for(var i = 0; i < srcFiles.length; i++){
    var f = srcFiles[i];
    var relative = f.path.substring(prefix.length);
    var targetPath = finalPrefix + relative;
    try{
      var data = await O.api('/repos/'+srcOwner+'/'+srcRepo+
        '/contents/'+encodeURI(f.path), {token:token});
      await O.api('/repos/'+targetRepo.owner+'/'+targetRepo.name+
        '/contents/'+encodeURI(targetPath), {
        method:'PUT', token:token,
        body:{
          message:'نقل: ' + f.path,
          content:data.content,
          branch:targetBranch
        }
      });
      success++;
    }catch(err){
      failed++;
      console.error('فشل نقل ' + f.path, err);
    }
  }

  if(success === 0) throw new Error('فشل نقل كل الملفات');

  try{
    var delEntries = srcFiles.map(function(sf){
      return {path:sf.path, mode:'100644', type:'blob', sha:null};
    });
    await createTreeAndCommit(token, srcOwner, srcRepo, srcBranch,
      delEntries, 'حذف بعد النقل: ' + sourcePath);
  }catch(err){
    console.error('فشل حذف الأصل', err);
  }

  return {success:success, failed:failed, targetPath:finalPrefix};
}

r.renameFolderConfirmBtn.addEventListener('click', async function(){
  if(!renameFolderOldPath) return;
  var newName = r.renameFolderInput.value.trim();
  if(!newName){
    O.toast('اكتب الاسم الجديد','error'); return;
  }
  if(!/^[A-Za-z0-9._\-\u0600-\u06FF]+$/.test(newName)){
    O.toast('الاسم يحتوي على رموز غير مسموحة','error'); return;
  }
  var parts = renameFolderOldPath.split('/');
  var oldName = parts[parts.length - 1];
  if(oldName === newName){
    O.toast('الاسم لم يتغير','warn'); return;
  }
  parts[parts.length - 1] = newName;
  var newPath = parts.join('/');

  r.renameFolderConfirmBtn.disabled = true;
  try{
    await moveFolderInRepo(renameFolderOldPath, newPath);
    closeRenameFolder();
    O.refreshAfterOperation('edit', {path:newPath, commitSha:state.lastCommitSha});
  }catch(e){
    O.addLog('فشل: ' + e.message, 'error');
    O.toast(e.message, 'error');
  }
  r.renameFolderConfirmBtn.disabled = false;
});

/* ═══════════════════════════════════════════════════════════
   الفروع
   ═══════════════════════════════════════════════════════════ */
function loadBranches(){
  var token=r.tokenInput.value.trim(),owner=state.owner,repo=state.repoName;
  if(!token||!owner||!repo) return;
  O.api('/repos/'+owner+'/'+repo+'/branches?per_page=100',{token:token}).then(function(list){
    state.repoBranches=Array.isArray(list)?list:[];
    r.branchPickerText.textContent=state.branch;
  }).catch(function(e){O.addLog(e.message,'error');});
}
r.loadBranchesBtn.addEventListener('click',loadBranches);
r.branchPickerBtn.addEventListener('click',function(){
  var names=state.repoBranches.map(function(b){return b.name;});
  if(names.length===0) names=[state.branch||'main'];
  O.openPicker({
    title:'اختر فرعًا', icon:'i-branch', selected:state.branch,
    items:names.map(function(n){return {value:n,label:n,icon:'i-branch'};}),
    onSelect:function(n){
      state.branch=n;
      r.branchPickerText.textContent=n;
      O.updateActiveRepoChip();
      var rp=state.allRepos.find(function(x){return x.name===state.repoName&&x.owner===state.owner;});
      if(rp) rp.default_branch=n;
      if(state.reposLogin) O.saveReposToStorage(state.reposLogin,state.allRepos);
      O.addLog('الفرع: '+n,'info');
    }
  });
});
r.newBranchBtn.addEventListener('click',function(){
  var owner=state.owner,token=r.tokenInput.value.trim();
  if(!owner||!token){O.toast('اختر مستودعًا','warn'); return;}
  r.newBranchName.value='';
  r.newBranchFromText.textContent=state.branch;
  state._newBranchFrom=state.branch;
  if(!state.repoBranches.length) loadBranches();
  r.newBranchModal.classList.add('open'); document.body.classList.add('modal-open');
});
r.newBranchFromBtn.addEventListener('click',function(){
  var names=state.repoBranches.map(function(b){return b.name;});
  if(names.indexOf(state.branch)===-1) names.push(state.branch);
  if(names.length===0) names=['main'];
  O.openPicker({
    title:'اختر الفرع الأم', icon:'i-branch', selected:state._newBranchFrom||state.branch,
    items:names.map(function(n){return {value:n,label:n,icon:'i-branch'};}),
    onSelect:function(n){state._newBranchFrom=n;r.newBranchFromText.textContent=n;}
  });
});
r.newBranchCloseBtn.addEventListener('click',function(){r.newBranchModal.classList.remove('open');document.body.classList.remove('modal-open');});
r.newBranchCancelBtn.addEventListener('click',function(){r.newBranchModal.classList.remove('open');document.body.classList.remove('modal-open');});
r.newBranchCreateBtn.addEventListener('click',function(){
  var name=r.newBranchName.value.trim();
  var from=state._newBranchFrom||state.branch;
  if(!name){O.toast('اكتب الاسم','error'); return;}
  var owner=state.owner,repo=state.repoName,token=r.tokenInput.value.trim();
  if(!owner||!repo||!token){O.toast('بيانات ناقصة','error'); return;}
  r.newBranchCreateBtn.disabled=true;
  O.api('/repos/'+owner+'/'+repo+'/git/ref/heads/'+encodeURIComponent(from),{token:token})
    .then(function(ref){
      if(!ref||!ref.object||!ref.object.sha) throw new Error('الفرع الأم غير موجود');
      return O.api('/repos/'+owner+'/'+repo+'/git/refs',{method:'POST',token:token,body:{ref:'refs/heads/'+name,sha:ref.object.sha}});
    })
    .then(function(){
      O.addLog('تم إنشاء الفرع: '+name,'success');
      O.addToArchive({type:'branch',title:'إنشاء فرع',status:'ok',repo:repo,owner:owner,details:{name:name,from:from}});
      O.toast('تم الإنشاء','success');
      r.newBranchModal.classList.remove('open'); document.body.classList.remove('modal-open');
      loadBranches();
    })
    .catch(function(e){O.addLog(e.message,'error');O.toast(e.message,'error');})
    .then(function(){r.newBranchCreateBtn.disabled=false;});
});

/* ═══════════════════════════════════════════════════════════
   Folder Picker (Move/Copy)
   ═══════════════════════════════════════════════════════════ */
function buildFolderIndex(files){
  var root={name:'',path:'',dirs:new Map(),files:[]};
  files.forEach(function(f){
    var parts=f.path.split('/'); var node=root;
    for(var i=0;i<parts.length-1;i++){
      var seg=parts[i],p=parts.slice(0,i+1).join('/');
      if(!node.dirs.has(seg)) node.dirs.set(seg,{name:seg,path:p,dirs:new Map(),files:[]});
      node=node.dirs.get(seg);
    }
    node.files.push({name:parts[parts.length-1],path:f.path,size:f.size});
  });
  return root;
}
function getFolderNodeByPath(root,pathArr){
  var node=root;
  for(var i=0;i<pathArr.length;i++){
    if(!node.dirs.has(pathArr[i])) return null;
    node=node.dirs.get(pathArr[i]);
  }
  return node;
}
async function loadFolderPickerRepoFiles(){
  var rp=state.allRepos[state.fpRepoIdx];
  if(!rp){return [];}
  var token=r.tokenInput.value.trim();
  var branch=(rp.owner===state.owner&&rp.name===state.repoName)?state.branch:(rp.default_branch||'main');
  try{
    var data=await O.api('/repos/'+rp.owner+'/'+rp.name+'/git/trees/'+encodeURIComponent(branch)+'?recursive=1',{token:token});
    return (data.tree||[]).filter(function(t){return t.type==='blob';});
  }catch(e){ return []; }
}
function renderFolderPickerPath(){
  r.fpPath.innerHTML='';
  var crumb=el('span','fp-crumb');
  crumb.appendChild(makeSvg('i-folder'));
  crumb.appendChild(el('span',null,'الجذر'));
  crumb.addEventListener('click',function(){state.fpPath=[];renderFolderPickerContents();});
  r.fpPath.appendChild(crumb);
  state.fpPath.forEach(function(seg,i){
    r.fpPath.appendChild(el('span','fp-crumb-sep','/'));
    var c=el('span','fp-crumb');
    c.appendChild(makeSvg('i-folder'));
    c.appendChild(el('span',null,seg));
    c.addEventListener('click',function(){state.fpPath=state.fpPath.slice(0,i+1);renderFolderPickerContents();});
    r.fpPath.appendChild(c);
  });
}
function renderFolderPickerContents(){
  renderFolderPickerPath();
  r.fpContents.innerHTML='';
  var root=buildFolderIndex(state.fpRepoFiles);
  var node=getFolderNodeByPath(root,state.fpPath);
  if(!node){ r.fpContents.innerHTML='<div class="fp-empty">لا يوجد محتوى</div>'; return; }
  var dirs=Array.from(node.dirs.values()).sort(function(a,b){return a.name.localeCompare(b.name,'en');});
  var files=node.files.slice().sort(function(a,b){return a.name.localeCompare(b.name,'en');});
  if(dirs.length===0&&files.length===0){ r.fpContents.innerHTML='<div class="fp-empty">مجلد فارغ</div>'; return; }
  dirs.forEach(function(d){
    var item=el('div','fp-item folder');
    var ic=makeSvg('i-folder'); ic.classList.add('folder');
    item.appendChild(ic);
    item.appendChild(el('div','name',d.name));
    var cnt=el('div','size',String(d.files.length+d.dirs.size));
    item.appendChild(cnt);
    var enter=makeSvg('i-chevron-left'); enter.classList.add('enter-ic');
    item.appendChild(enter);
    item.addEventListener('click',function(){ state.fpPath.push(d.name); renderFolderPickerContents(); });
    r.fpContents.appendChild(item);
  });
  files.forEach(function(f){
    var item=el('div','fp-item file');
    var ic=makeSvg('i-file'); ic.classList.add('file');
    item.appendChild(ic);
    item.appendChild(el('div','name',f.name));
    if(f.size) item.appendChild(el('div','size',O.formatBytes(f.size)));
    r.fpContents.appendChild(item);
  });
}
function openFolderPicker(mode, sourcePath, sourceType){
  state.fpMode = mode;
  state.fpSourcePath = sourcePath;
  state.fpSourceType = sourceType || 'file';
  state.fpPath = [];

  var idx = state.allRepos.findIndex(function(rp){
    return rp.name === state.repoName && rp.owner === state.owner;
  });
  state.fpRepoIdx = idx >= 0 ? idx : 0;

  r.fpModeIcon.className = 'oi ' + (mode === 'copy' ? 'oi-copy' : 'oi-move');

  var lastName = sourcePath.split('/').pop();
  var typeLabel = sourceType === 'folder' ? ' (مجلد)' : '';
  r.fpModeTitle.textContent = (mode === 'copy' ? 'نسخ' : 'نقل') + ' — ' + lastName + typeLabel;

  r.fpConfirmText.textContent = mode === 'copy' ? 'نسخ هنا' : 'إفلات هنا';

  var rp = state.allRepos[state.fpRepoIdx];
  r.fpRepoText.textContent = rp ? rp.full_name : '—';

  r.folderPickerModal.classList.add('open');
  document.body.classList.add('modal-open');
  r.fpContents.innerHTML = '<div class="busy"><div class="spinner"></div><span>جاري التحميل…</span></div>';

  loadFolderPickerRepoFiles().then(function(files){
    state.fpRepoFiles = files;
    renderFolderPickerContents();
  });
}
r.fpRepoBtn.addEventListener('click',function(){
  if(state.allRepos.length===0){O.toast('لا مستودعات','warn'); return;}
  var selFull=state.allRepos[state.fpRepoIdx]?state.allRepos[state.fpRepoIdx].full_name:'';
  O.openPicker({
    title:'اختر المستودع الهدف', icon:'i-branch', selected:selFull,
    items:state.allRepos.map(function(rp){return {value:rp.full_name,label:rp.full_name,icon:'i-folder',lock:rp.private};}),
    onSelect:function(fullName){
      var idx=state.allRepos.findIndex(function(x){return x.full_name===fullName;});
      if(idx!==-1){
        state.fpRepoIdx=idx;
        r.fpRepoText.textContent=state.allRepos[idx].full_name;
        state.fpPath=[];
        r.fpContents.innerHTML='<div class="busy"><div class="spinner"></div><span>جاري التحميل…</span></div>';
        loadFolderPickerRepoFiles().then(function(files){ state.fpRepoFiles=files; renderFolderPickerContents(); });
      }
    }
  });
});
function closeFolderPicker(){r.folderPickerModal.classList.remove('open');document.body.classList.remove('modal-open');}
r.fpCloseBtn.addEventListener('click',closeFolderPicker);
r.fpCancelBtn.addEventListener('click',closeFolderPicker);
r.folderPickerModal.addEventListener('click',function(e){if(e.target===r.folderPickerModal) closeFolderPicker();});

/* ═══════════════════════════════════════════════════════════
   Move/Copy — يدعم ملفات ومجلدات + مستودعات مختلفة
   ═══════════════════════════════════════════════════════════ */
r.fpConfirmBtn.addEventListener('click', async function(){
  var targetRepo = state.allRepos[state.fpRepoIdx];
  if(!targetRepo){ O.toast('اختر مستودعًا','error'); return; }

  var token = r.tokenInput.value.trim();
  var srcOwner = state.owner, srcRepo = state.repoName, srcBranch = state.branch;
  var mode = state.fpMode;
  var srcPath = state.fpSourcePath;
  var srcType = state.fpSourceType || 'file';
  var targetBasePath = state.fpPath.join('/');

  var sameRepo = (srcOwner === targetRepo.owner && srcRepo === targetRepo.name);

  /* حالة المجلد */
  if(srcType === 'folder'){
    var folderName = srcPath.split('/').pop();
    var newPath = (targetBasePath ? targetBasePath + '/' : '') + folderName;

    if(sameRepo && newPath === srcPath){
      O.toast('المجلد بالفعل هنا','warn'); return;
    }

    r.fpConfirmBtn.disabled = true;
    var t0 = performance.now();
    try{
      if(sameRepo){
        if(mode === 'copy'){
          var treeData = await getCurrentTree(token, srcOwner, srcRepo, srcBranch);
          var prefix = srcPath + '/';
          var files = treeData.tree.filter(function(t){
            return t.type === 'blob' && t.path.indexOf(prefix) === 0;
          });
          if(files.length === 0) throw new Error('المجلد فارغ');
          var entries = files.map(function(f){
            var relative = f.path.substring(prefix.length);
            return {path:newPath + '/' + relative, mode:'100644', type:'blob', sha:f.sha};
          });
          var sha = await createTreeAndCommit(token, srcOwner, srcRepo, srcBranch,
            entries, 'نسخ المجلد: ' + srcPath + ' → ' + newPath);
          state.lastCommitSha = sha;
          O.addToArchive({
            type:'create', title:'نسخ مجلد ('+files.length+' ملف)', status:'ok',
            repo:srcRepo, owner:srcOwner, branch:srcBranch,
            files:files.map(function(f){
              return {path:newPath + '/' + f.path.substring(prefix.length), status:'ok'};
            }),
            commitSha:sha, duration:((performance.now()-t0)/1000).toFixed(2),
            details:{from:srcPath, to:newPath, count:files.length}
          });
        } else {
          await moveFolderInRepo(srcPath, newPath);
        }
        closeFolderPicker();
        O.refreshAfterOperation(mode === 'copy' ? 'copy' : 'move',
          {path:newPath, commitSha:state.lastCommitSha});
      } else {
        var result = await moveFolderToAnotherRepo(srcPath, targetRepo, targetBasePath);
        O.addLog((mode === 'copy' ? 'نُسخ' : 'نُقل') + ' → ' + targetRepo.full_name + '/' + result.targetPath, 'success');
        O.addToArchive({
          type:mode === 'copy' ? 'create' : 'edit',
          title:(mode === 'copy' ? 'نسخ' : 'نقل') + ' مجلد ('+result.success+' ملف)',
          status:result.failed ? 'warn' : 'ok',
          repo:targetRepo.name, owner:targetRepo.owner,
          branch:targetRepo.default_branch || 'main',
          files:[],
          duration:((performance.now()-t0)/1000).toFixed(2),
          details:{from:srcPath, to:result.targetPath, to_repo:targetRepo.full_name,
                   success:result.success, failed:result.failed}
        });
        closeFolderPicker();
        O.toast('تم نقل ' + result.success + ' ملف' +
          (result.failed ? ' (' + result.failed + ' فشل)' : ''), 'success');
        O.refreshAfterOperation(mode === 'copy' ? 'copy' : 'move', {path:result.targetPath});
      }
    }catch(e){
      O.addLog('فشل: ' + e.message, 'error');
      O.toast(e.message, 'error');
    }
    r.fpConfirmBtn.disabled = false;
    return;
  }

  /* حالة ملف */
  var targetPath = (targetBasePath ? targetBasePath + '/' : '') + srcPath.split('/').pop();
  if(sameRepo && srcPath === targetPath){
    O.toast('الملف بالفعل هنا','warn'); return;
  }

  r.fpConfirmBtn.disabled = true;
  var t1 = performance.now();
  try{
    var data = await O.api('/repos/'+srcOwner+'/'+srcRepo+
      '/contents/'+encodeURI(srcPath), {token:token});
    if(!data.content) throw new Error('لا يوجد محتوى');

    var targetBranch = sameRepo ? srcBranch : (targetRepo.default_branch || 'main');

    var putRes = await O.api('/repos/'+targetRepo.owner+'/'+targetRepo.name+
      '/contents/'+encodeURI(targetPath), {
      method:'PUT', token:token,
      body:{
        message:(mode === 'copy' ? 'نسخ ' : 'نقل ') + srcPath.split('/').pop(),
        content:data.content,
        branch:targetBranch
      }
    });

    var lastSha = putRes && putRes.commit ? putRes.commit.sha : null;

    if(mode === 'move'){
      var delRes = await O.api('/repos/'+srcOwner+'/'+srcRepo+
        '/contents/'+encodeURI(srcPath), {
        method:'DELETE', token:token,
        body:{
          message:'حذف الأصل: ' + srcPath,
          sha:data.sha,
          branch:srcBranch
        }
      });
      if(delRes && delRes.commit) lastSha = delRes.commit.sha;
    }

    O.addLog((mode === 'copy' ? 'نُسخ' : 'نُقل') + ' → ' +
      targetRepo.full_name + '/' + targetPath, 'success');
    O.addToArchive({
      type:mode === 'copy' ? 'create' : 'edit',
      title:mode === 'copy' ? 'نسخ ملف' : 'نقل ملف',
      status:'ok',
      repo:targetRepo.name, owner:targetRepo.owner, branch:targetBranch,
      files:[{path:targetPath, status:'ok'}],
      commitSha:lastSha,
      duration:((performance.now()-t1)/1000).toFixed(2),
      details:{source:srcPath, target:targetPath, to_repo:targetRepo.full_name}
    });
    closeFolderPicker();
    O.refreshAfterOperation(mode === 'copy' ? 'copy' : 'move',
      {path:targetPath, commitSha:lastSha});
  }catch(e){
    O.addLog('فشل: ' + e.message, 'error');
    O.toast(e.message, 'error');
  }
  r.fpConfirmBtn.disabled = false;
});

/* ─── Expose ────────────────────────────────────────────── */
O.loadRepoContent = loadRepoContent;
O.loadBranches = loadBranches;
O.openFolderPicker = openFolderPicker;
O.closeFolderPicker = closeFolderPicker;
O.openRenameFolder = openRenameFolder;
O.closeRenameFolder = closeRenameFolder;
O.deleteFolder = deleteFolder;
O.moveFolderInRepo = moveFolderInRepo;

})();