/* Orbit — Actions */
(function () {
  'use strict';
  const { api, ui, i18n } = window.Orbit;
  const {
    Utils, KEY, Storage, STORAGE,
    validateToken, rateLimit, listUserRepos, createRepo,
    listBranches, createBranch, getTree, getContent, putContent,
    deleteContent, listPRs, createPR, mergePR, closePR,
    listIssues, createIssue, updateIssue, listReleases, createRelease,
    uploadFiles, notifyWebhook, request,
  } = api;
  const { el, svg, toast, openModal, closeModal, openPicker, openFolderPicker, initFolderPicker } = ui;
  const { state, core } = window.Orbit;
  const { activeRepo, setHeaderBadge, addLog, addToArchive, updateRepoToolsVisibility, getToken, getCurrentPrefix } = core;
  const { tr, trp } = i18n;

  /* ═══════════════════════════════════════════════
     FILE PICKING
     ═══════════════════════════════════════════════ */
  function addFilesFromList(list, mode) {
    const keepRoot = document.getElementById('optKeepRoot').checked;
    const prefix = getCurrentPrefix();
    const pre = prefix ? prefix + '/' : '';
    let added = 0, skipped = 0, dupes = 0;

    Array.from(list || []).forEach((f) => {
      if (!f || !f.name) return;
      const raw = f.webkitRelativePath || '';
      let rel = raw || f.name;
      if (mode === 'folder' && raw && !keepRoot) {
        const i = rel.indexOf('/');
        if (i !== -1) rel = rel.substring(i + 1);
      }
      rel = pre + rel;
      if (!rel) return;
      const parts = rel.split('/');
      for (const p of parts) if (Utils.isExcludedDir(p)) { skipped++; return; }
      if (Utils.isExcludedFile(parts[parts.length - 1])) { skipped++; return; }
      if (state.fileMap.has(rel)) { dupes++; return; }
      const item = { path: rel, file: f, size: f.size, selected: true };
      state.fileMap.set(rel, item);
      state.files.push(item);
      added++;
    });

    state.files.sort((a, b) => a.path.localeCompare(b.path, 'en'));
    if (added > 0) {
      addLog(() => {
        let msg = trp('log.filesAdded', { n: added });
        if (dupes) msg += trp('log.filesAddedDup', { n: dupes });
        if (skipped) msg += trp('log.filesAddedSkip', { n: skipped });
        return '✓ ' + msg;
      }, 'success');
      toast('✓ ' + trp('log.filesAdded', { n: added }), 'success');
    } else {
      addLog(() => {
        let msg = trp('log.noFiles');
        if (dupes) msg += trp('log.filesAddedDup', { n: dupes });
        if (skipped) msg += trp('log.filesAddedSkip', { n: skipped });
        return msg;
      }, 'warn');
      toast(trp('log.noFiles'), 'warn');
    }
    window.Orbit.render.refreshUploadUI();
  }

  document.getElementById('pickFilesBtn').addEventListener('click', () => {
    document.getElementById('filesInput').click();
  });
  document.getElementById('filesInput').addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      addLog(() => trp('log.pickerEmpty'), 'warn');
    } else {
      addFilesFromList(files, 'files');
    }
    e.target.value = '';
  });

  async function scanDirectoryHandle(handle, path, out) {
    for await (const entry of handle.values()) {
      if (entry.kind === 'directory') {
        if (Utils.isExcludedDir(entry.name)) continue;
        await scanDirectoryHandle(entry, path + entry.name + '/', out);
      } else {
        if (Utils.isExcludedFile(entry.name)) continue;
        try {
          const file = await entry.getFile();
          out.push({ path: path + entry.name, file, size: file.size });
        } catch (e) {}
      }
    }
  }

  document.getElementById('pickFolderBtn').addEventListener('click', async () => {
    if (window.showDirectoryPicker) {
      try {
        const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
        const items = [];
        const keepRoot = document.getElementById('optKeepRoot').checked;
        const prefix = getCurrentPrefix();
        const pre = prefix ? prefix + '/' : '';
        const rootName = dirHandle.name;
        await scanDirectoryHandle(dirHandle, '', items);

        let added = 0, dupes = 0, skipped = 0;
        items.forEach((it) => {
          let rel = it.path;
          if (!keepRoot && rootName && rel.indexOf(rootName + '/') === 0) {
            rel = rel.substring(rootName.length + 1);
          }
          rel = pre + rel;
          if (Utils.isExcludedFile(rel.split('/').pop())) { skipped++; return; }
          if (state.fileMap.has(rel)) { dupes++; return; }
          const item = { path: rel, file: it.file, size: it.size, selected: true };
          state.fileMap.set(rel, item);
          state.files.push(item);
          added++;
        });
        state.files.sort((a, b) => a.path.localeCompare(b.path, 'en'));
        if (added > 0) {
          addLog(() => {
            let msg = trp('log.filesAdded', { n: added });
            if (dupes) msg += trp('log.filesAddedDup', { n: dupes });
            if (skipped) msg += trp('log.filesAddedSkip', { n: skipped });
            return '✓ ' + msg;
          }, 'success');
          toast('✓ ' + trp('log.filesAdded', { n: added }), 'success');
        }
        window.Orbit.render.refreshUploadUI();
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }
    document.getElementById('folderInput').click();
  });
  document.getElementById('folderInput').addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      addLog(() => trp('log.pickerEmpty'), 'warn');
    } else {
      addFilesFromList(files, 'folder');
    }
    e.target.value = '';
  });

  /* ═══════════════════════════════════════════════
     UPLOAD
     ═══════════════════════════════════════════════ */
  function setProgress(done, total, path) {
    const pct = total ? Math.round((done / total) * 100) : 0;
    document.getElementById('progressBar').style.width = pct + '%';
    document.getElementById('progressPct').textContent = pct + '%';
    document.getElementById('progressLabel').textContent =
      `${done} / ${total} ${tr('ملف', 'files')}`;
    if (path !== undefined) document.getElementById('progressFile').textContent = path || '—';
  }
  function resetProgress() {
    const bar = document.getElementById('progressBar');
    bar.classList.remove('done', 'fail');
    bar.style.width = '0%';
    document.getElementById('progressPct').textContent = '0%';
    document.getElementById('progressLabel').textContent = trp('status.waiting');
    document.getElementById('progressFile').textContent = '—';
    document.getElementById('resultBox').classList.remove('show');
    document.getElementById('resultUrl').innerHTML = '';
  }

  document.getElementById('uploadBtn').addEventListener('click', async () => {
    if (state.uploading) return;
    const repo = activeRepo();
    const token = getToken();
    if (!repo || !token) { toast(trp('toast.pickRepo'), 'error'); return; }

    const selected = state.files.filter((f) => f.selected);
    if (!selected.length) { toast(trp('toast.noFiles'), 'error'); return; }

    const commitMsg = document.getElementById('commitInput').value.trim() || 'Initial commit via Orbit';
    const totalBytes = selected.reduce((s, f) => s + (f.size || 0), 0);

    state.uploading = true;
    document.getElementById('uploadBtn').disabled = true;
    document.getElementById('pickFilesBtn').disabled = true;
    document.getElementById('pickFolderBtn').disabled = true;
    resetProgress();
    setProgress(0, selected.length, '');
    setHeaderBadge(trp('status.uploading'), 'warn');
    document.getElementById('footerStatus').textContent = trp('status.uploading');

    addLog(() => `📦 ${trp('log.selected')} ${selected.length} ${tr('ملف', 'file(s)')} (${Utils.fmtBytes(totalBytes)}) — ${trp('log.startingUpload')}`, 'info');
    toast(trp('toast.startingUpload', { n: selected.length }), 'info');

    const t0 = performance.now();
    let lastNotified = 0;

    try {
      const result = await uploadFiles({
        token,
        owner: repo.owner,
        repo: repo.name,
        branch: state.branch,
        commitMsg,
        files: selected,
        onProgress: (done, total, path) => {
          setProgress(done, total, path);
          const pct = done / total;
          if (pct >= lastNotified + 0.25 || done === total) {
            lastNotified = pct;
            const bytesDone = selected.slice(0, done).reduce((s, f) => s + (f.size || 0), 0);
            addLog(`📤 ${done}/${total} (${Math.round(pct * 100)}% · ${Utils.fmtBytes(bytesDone)})`, 'info');
          }
        },
      });

      const secs = ((performance.now() - t0) / 1000).toFixed(1);
      const bar = document.getElementById('progressBar');
      bar.classList.add('done');
      bar.style.width = '100%';
      document.getElementById('progressPct').textContent = '100%';
      document.getElementById('progressLabel').textContent = trp('status.done');
      document.getElementById('progressFile').textContent =
        `${selected.length} ${tr('ملف', 'file(s)')} · ${Utils.fmtBytes(totalBytes)} · ${secs}s`;
      setHeaderBadge(trp('log.uploadComplete'), 'ok');
      document.getElementById('footerStatus').textContent = trp('status.done');

      const url = `https://github.com/${repo.owner}/${repo.name}`;
      const resultUrl = document.getElementById('resultUrl');
      resultUrl.innerHTML = '';
      const a = el('a', null, url);
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
      resultUrl.appendChild(a);
      document.getElementById('resultBox').classList.add('show');

      addLog(() => `✓✓ ${trp('log.uploadComplete')}: ${selected.length} ${tr('ملف', 'file(s)')} · ${Utils.fmtBytes(totalBytes)} · ${secs}s`, 'success');
      toast('✓ ' + trp('toast.uploaded', { n: selected.length, s: secs }), 'success');

      addToArchive({
        type: 'upload',
        title: trp('archive.uploadTitle', { n: selected.length, size: Utils.fmtBytes(totalBytes) }),
        status: 'ok',
        owner: repo.owner, repo: repo.name, branch: state.branch,
        files: result.uploaded,
        commitSha: result.commitSha,
        duration: secs,
        details: { commit: commitMsg, url, size: Utils.fmtBytes(totalBytes) },
      });

      notifyWebhook('upload', `${selected.length} files → ${repo.full_name}`).catch(() => {});
    } catch (err) {
      document.getElementById('progressBar').classList.add('fail');
      document.getElementById('progressLabel').textContent = trp('status.failed');
      document.getElementById('progressFile').textContent = err.message;
      setHeaderBadge(trp('toast.uploadFailed'), 'err');
      addLog(() => '✕ ' + trp('log.uploadFailed') + ' ' + err.message, 'error');
      toast(trp('toast.uploadFailed') + ': ' + err.message, 'error');
      addToArchive({
        type: 'error', title: trp('toast.uploadFailed'), status: 'err',
        owner: repo.owner, repo: repo.name,
        details: { error: err.message },
      });
    } finally {
      state.uploading = false;
      document.getElementById('pickFilesBtn').disabled = false;
      document.getElementById('pickFolderBtn').disabled = false;
      window.Orbit.render.updateStats();
    }
  });

  /* SELECT / DESELECT / CLEAR */
  document.getElementById('selectAllBtn').addEventListener('click', () => {
    state.files.forEach((f) => { f.selected = true; });
    document.querySelectorAll('#tree input[data-file]').forEach((cb) => { cb.checked = true; });
    window.Orbit.render.syncDirs();
    window.Orbit.render.updateStats();
    window.Orbit.render.updateSelSummary();
    toast(trp('toast.allSelected'), 'success');
  });
  document.getElementById('deselectAllBtn').addEventListener('click', () => {
    state.files.forEach((f) => { f.selected = false; });
    document.querySelectorAll('#tree input[data-file]').forEach((cb) => { cb.checked = false; });
    window.Orbit.render.syncDirs();
    window.Orbit.render.updateStats();
    window.Orbit.render.updateSelSummary();
  });
  document.getElementById('clearBtn').addEventListener('click', () => {
    state.files = [];
    state.fileMap = new Map();
    state.dirRegistry = [];
    window.Orbit.render.refreshUploadUI();
  });

  /* ═══════════════════════════════════════════════
     REPO LOAD + REFRESH
     ═══════════════════════════════════════════════ */
  function loadRepoContent() {
    const repo = activeRepo();
    const token = getToken();
    if (!repo || !token) { toast(trp('toast.pickRepoShort'), 'warn'); return; }

    const status = document.getElementById('repoToolsStatus');
    status.innerHTML = `<div class="busy"><div class="spinner"></div><span>${trp('log.loading')}</span></div>`;
    document.getElementById('repoTreeSection').classList.add('hidden');

    getTree(token, repo.owner, repo.name, state.branch)
      .then((files) => {
        state.repoFiles = files;
        addLog(() => `✓ ${trp('log.repo')}: ${files.length} ${tr('ملف', 'file(s)')}`, 'success');
        document.getElementById('newFileBtn').disabled = false;
        status.innerHTML = `<div class="row" style="color:var(--success);font-size:12.5px;padding:8px 0"><svg class="ic"><use href="#i-check-circle"/></svg><span>${trp('log.loaded')} <b>${files.length}</b> ${tr('ملف', 'file(s)')}</span></div>`;
        document.getElementById('repoTreeSection').classList.remove('hidden');
        window.Orbit.render.renderRepoTree();
        loadBranches();
      })
      .catch((err) => {
        addLog(err.message, 'error');
        status.innerHTML = `<div class="empty"><svg class="ic"><use href="#i-alert"/></svg><div class="empty-title">${trp('log.loadFailed')}</div><div class="empty-desc">${Utils.esc(err.message)}</div></div>`;
      });
  }
  document.getElementById('loadRepoBtn').addEventListener('click', loadRepoContent);
  document.getElementById('newFileBtn').addEventListener('click', () => openEditor('', 'new'));

  document.getElementById('refreshControlBtn').addEventListener('click', () => {
    const repo = activeRepo();
    const token = getToken();
    if (!repo || !token) { toast(trp('toast.pickRepoShort'), 'warn'); return; }
    toast(trp('toast.refreshingAll'), 'info');
    addLog(() => '🔄 ' + trp('log.refreshingAll'), 'info');
    request(`/repos/${repo.owner}/${repo.name}`, { token })
      .then((data) => {
        state.branch = data.default_branch || state.branch;
        document.getElementById('repoMetaHint').textContent =
          (data.private ? trp('stats.private') : trp('stats.public')) + ' · ' + trp('stats.defaultBranch') + ' ' + state.branch +
          (data.description ? ' · ' + data.description : '');
        document.getElementById('branchPickerText').textContent = state.branch;
        document.getElementById('activeRepoChipText').textContent = repo.full_name + ' · ' + state.branch;
        return loadRepoContent();
      })
      .catch((e) => { addLog(e.message, 'error'); toast(e.message, 'error'); });
  });

  /* DELETE */
  function deleteRepoFile(path) {
    if (!confirm(trp('confirm.deleteFile', { path }))) return;
    const repo = activeRepo();
    const token = getToken();
    if (!repo || !token) return;

    const tree = document.getElementById('repoTree');
    const rows = tree.querySelectorAll('.tree-row.file');
    rows.forEach((r) => {
      if (r.title === path) { r.style.opacity = '0.4'; r.style.pointerEvents = 'none'; }
    });
    toast(trp('toast.deleting'), 'info');
    addLog(() => '🗑️ ' + trp('log.deleting') + ' ' + path, 'info');

    const t0 = performance.now();
    getContent(token, repo.owner, repo.name, path)
      .then((data) => deleteContent(token, repo.owner, repo.name, path, {
        message: 'Delete ' + path.split('/').pop(),
        sha: data.sha,
        branch: state.branch,
      }))
      .then((r) => {
        const sha = r && r.commit ? r.commit.sha : null;
        state.repoFiles = state.repoFiles.filter((f) => f.path !== path);
        addLog(() => '✓✓ ' + trp('log.deleted') + ' ' + path, 'success');
        toast('✓ ' + trp('toast.deleted') + ' ' + path.split('/').pop(), 'success');
        addToArchive({
          type: 'delete', title: trp('archive.deleteTitle', { name: path.split('/').pop() }), status: 'ok',
          owner: repo.owner, repo: repo.name, branch: state.branch,
          files: [{ path, status: 'ok' }], commitSha: sha,
          duration: ((performance.now() - t0) / 1000).toFixed(2),
          details: { file: path },
        });
        window.Orbit.render.renderRepoTree();
        loadRepoContent();
      })
      .catch((e) => {
        addLog(() => '✕ ' + trp('log.deleteFailed') + ' ' + e.message, 'error');
        toast(trp('toast.deleteFailed') + ': ' + e.message, 'error');
        loadRepoContent();
      });
  }

  /* MOVE / COPY */
  initFolderPicker({
    allRepos: () => state.repos,
    getToken,
    getActiveRepo: () => ({ owner: state.owner, name: activeRepo() ? activeRepo().name : '', branch: state.branch }),
    onDone: () => loadRepoContent(),
  });

  function openMoveCopy(mode, path, isFolder) {
    state._moveCopyIsFolder = !!isFolder;
    openFolderPicker(mode, path, !!isFolder);
  }

  /* ═══════════════════════════════════════════════
     README AUTO-GENERATION
     ═══════════════════════════════════════════════ */
  async function generateREADME() {
    const repo = activeRepo();
    const token = getToken();
    if (!repo || !token) { toast(trp('toast.pickRepoShort'), 'warn'); return; }
    if (!confirm(trp('confirm.readme'))) return;

    toast(trp('toast.readmeGenerating'), 'info');
    addLog(() => '📖 ' + trp('log.readmeGenerating'), 'info');

    try {
      const tree = await getTree(token, repo.owner, repo.name, state.branch);
      const extCount = {}, extBytes = {};
      let totalBytes = 0;
      const folderSet = new Set();

      tree.forEach((f) => {
        const parts = f.path.split('/');
        for (let i = 0; i < parts.length - 1; i++) folderSet.add(parts.slice(0, i + 1).join('/'));
        const ext = f.path.split('.').pop().toLowerCase();
        extCount[ext] = (extCount[ext] || 0) + 1;
        extBytes[ext] = (extBytes[ext] || 0) + (f.size || 0);
        totalBytes += f.size || 0;
      });

      const hasPkg = tree.some((f) => f.path === 'package.json');
      const hasPy = tree.some((f) => /^(requirements\.txt|pyproject\.toml|setup\.py)$/.test(f.path));
      const hasGo = tree.some((f) => f.path === 'go.mod');
      const hasRust = tree.some((f) => f.path === 'Cargo.toml');
      const hasIndex = tree.some((f) => /^index\.html?$/i.test(f.path));
      const hasDocker = tree.some((f) => /^Dockerfile$/i.test(f.path));

      const LANG_NAMES = {
        js: 'JavaScript', mjs: 'JavaScript', cjs: 'JavaScript', jsx: 'React (JSX)',
        ts: 'TypeScript', tsx: 'React (TSX)', css: 'CSS', scss: 'SCSS', less: 'Less',
        html: 'HTML', htm: 'HTML', json: 'JSON', md: 'Markdown',
        py: 'Python', go: 'Go', rs: 'Rust', java: 'Java', rb: 'Ruby',
        php: 'PHP', sh: 'Shell', yml: 'YAML', yaml: 'YAML', xml: 'XML',
      };
      const langs = Object.keys(extCount)
        .filter((e) => LANG_NAMES[e])
        .sort((a, b) => (extBytes[b] || 0) - (extBytes[a] || 0))
        .map((e) => `${LANG_NAMES[e]} (${extCount[e]})`);

      const root = { dirs: new Map(), files: [] };
      tree.forEach((f) => {
        const parts = f.path.split('/');
        let node = root;
        for (let i = 0; i < parts.length - 1; i++) {
          const seg = parts[i];
          if (!node.dirs.has(seg)) node.dirs.set(seg, { dirs: new Map(), files: [] });
          node = node.dirs.get(seg);
        }
        node.files.push(parts[parts.length - 1]);
      });
      const renderTree = (node, prefix = '') => {
        const lines = [];
        const dirs = Array.from(node.dirs.keys()).sort();
        const files = node.files.slice().sort();
        const total = dirs.length + files.length;
        let idx = 0;
        dirs.forEach((d) => {
          idx++;
          const isLast = idx === total;
          lines.push(`${prefix}${isLast ? '└── ' : '├── '}📁 ${d}/`);
          lines.push(...renderTree(node.dirs.get(d), prefix + (isLast ? '    ' : '│   ')));
        });
        files.forEach((f) => {
          idx++;
          const isLast = idx === total;
          lines.push(`${prefix}${isLast ? '└── ' : '├── '}📄 ${f}`);
        });
        return lines;
      };
      const allTree = renderTree(root);
      const treeText = allTree.slice(0, 60).join('\n');
      const truncated = allTree.length > 60;

      const title = repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const desc = repo.description || tr('مشروع تم تطويره باستخدام Orbit.', 'A project created with Orbit.');
      let readme = `# ${title}\n\n> ${desc}\n\n`;
      if (hasIndex) readme += `🌐 **${tr('مشروع ويب جاهز للاستخدام مباشرة من المتصفح.', 'Web project ready to use directly from the browser.')}**\n\n`;
      readme += `## ✨ ${tr('المميزات', 'Features')}\n\n`;
      readme += `- 📦 **${tree.length}** ${tr('ملف في', 'files in')} **${folderSet.size}** ${tr('مجلد', 'folders')}\n`;
      readme += `- 💾 ${tr('الحجم', 'Size')}: **${Utils.fmtBytes(totalBytes)}**\n`;
      if (langs.length) readme += `- 🎨 ${tr('التقنيات', 'Technologies')}: ${langs.slice(0, 5).join(' · ')}\n`;
      if (hasDocker) readme += `- 🐳 ${tr('يدعم Docker', 'Docker support')}\n`;
      readme += `\n## 📂 ${tr('هيكل المشروع', 'Project Structure')}\n\n\`\`\`\n${treeText}\n\`\`\`\n`;
      if (truncated) readme += `\n> ${tr('يعرض 60 سطرًا من', 'Showing 60 of')} ${tree.length} ${tr('ملف.', 'files.')}\n`;
      readme += `\n## 🚀 ${tr('التشغيل', 'Run')}\n\n`;
      if (hasIndex) readme += `\`\`\`bash\nopen index.html\n# ${tr('أو', 'or')}\npython -m http.server 8000\n\`\`\`\n\n`;
      if (hasPkg) readme += `\`\`\`bash\nnpm install && npm start\n\`\`\`\n\n`;
      if (hasPy) readme += `\`\`\`bash\npip install -r requirements.txt\npython main.py\n\`\`\`\n\n`;
      if (hasGo) readme += `\`\`\`bash\ngo run .\n\`\`\`\n\n`;
      if (hasRust) readme += `\`\`\`bash\ncargo run\n\`\`\`\n\n`;
      readme += `## 📄 ${tr('الترخيص', 'License')}\n\nMIT\n\n---\n\n<sub>${tr('تم التوليد بواسطة', 'Generated by')} **Orbit** · ${new Date().toLocaleDateString()}</sub>\n`;

      const t0 = performance.now();
      let existingSha = null;
      try {
        const ex = await getContent(token, repo.owner, repo.name, 'README.md');
        existingSha = ex.sha;
      } catch (e) {}

      const body = {
        message: 'Generate README.md via Orbit',
        content: Utils.textToBase64(readme),
        branch: state.branch,
      };
      if (existingSha) body.sha = existingSha;

      await putContent(token, repo.owner, repo.name, 'README.md', body);
      const secs = ((performance.now() - t0) / 1000).toFixed(2);
      addLog(() => '✓✓ ' + trp('log.readmeDone'), 'success');
      toast('✓ ' + trp('toast.readmeDone'), 'success');
      addToArchive({
        type: 'readme', title: trp('archive.readmeTitle'), status: 'ok',
        owner: repo.owner, repo: repo.name,
        files: [{ path: 'README.md', status: 'ok' }],
        duration: secs,
        details: { files: tree.length, folders: folderSet.size },
      });
      notifyWebhook('README', `README generated for ${repo.full_name}`).catch(() => {});
      loadRepoContent();
    } catch (e) {
      addLog(() => '✕ ' + trp('log.readmeFailed') + ' ' + e.message, 'error');
      toast(tr('فشل', 'Failed') + ': ' + e.message, 'error');
    }
  }

  /* ═══════════════════════════════════════════════
     EDITOR
     ═══════════════════════════════════════════════ */
  function getCM() {
    if (window.__orbitCM) return Promise.resolve(window.__orbitCM);
    if (state._cmResolved) return state._cmResolved;
    state._cmResolved = new Promise((resolve, reject) => {
      window.addEventListener('orbit-cm-ready', () => resolve(window.__orbitCM), { once: true });
      window.addEventListener('orbit-cm-failed', () => reject(new Error('CodeMirror failed')), { once: true });
      setTimeout(() => { if (!window.__orbitCM) reject(new Error('CodeMirror timeout')); }, 12000);
    });
    return state._cmResolved;
  }

  function renderPathChips() {
    const chips = document.getElementById('pathChips');
    chips.innerHTML = '';
    state.pathSegments.forEach((seg, i) => {
      const chip = el('span', 'path-chip');
      chip.appendChild(svg('i-folder', 'chip-ic'));
      chip.appendChild(el('span', null, seg));
      const x = el('button', 'chip-x');
      x.type = 'button'; x.textContent = '×';
      x.addEventListener('click', () => {
        state.pathSegments = state.pathSegments.slice(0, i);
        renderPathChips(); updateFileInfo();
        document.getElementById('editorPath').focus();
      });
      chip.appendChild(x);
      chips.appendChild(chip);
      chips.appendChild(el('span', 'path-sep', '/'));
    });
  }

  function getFullPath() {
    const s = state.pathSegments.slice();
    const n = document.getElementById('editorPath').value.trim();
    if (n) s.push(n);
    return s.join('/');
  }

  function setFullPath(path) {
    state.pathSegments = [];
    document.getElementById('editorPath').value = '';
    if (path) {
      const parts = path.split('/').filter(Boolean);
      if (parts.length) {
        document.getElementById('editorPath').value = parts[parts.length - 1];
        state.pathSegments = parts.slice(0, -1);
      }
    }
    renderPathChips(); updateFileInfo();
  }

  function updateFileInfo() {
    const fn = document.getElementById('editorPath').value.trim();
    const lang = Utils.langFor(fn) || 'TXT';
    const badge = document.getElementById('editorTitleBadge');
    badge.textContent = lang;
    badge.setAttribute('data-lang', lang.toLowerCase());
    if (fn) document.getElementById('editorTitleName').textContent = fn;
    else if (state.pathSegments.length) document.getElementById('editorTitleName').textContent = state.pathSegments[state.pathSegments.length - 1] + '/…';
    else document.getElementById('editorTitleName').textContent = tr('ملف جديد', 'New file');
    if (window.__orbitCM) window.__orbitCM.setLang(lang);
  }

  async function openEditor(path, mode) {
    const repo = activeRepo();
    const token = getToken();
    if (!repo || !token) { toast(trp('toast.pickRepoShort'), 'warn'); return; }

    state.editingPath = path || null;
    document.getElementById('editorCommit').value = '';
    setFullPath(path || '');

    const ghFileName = document.getElementById('editorGhFileName');
    const ghBranch = document.getElementById('editorGhBranch');
    if (ghFileName) ghFileName.textContent = path || tr('(ملف جديد)', '(new file)');
    if (ghBranch) ghBranch.textContent = state.branch || 'main';

    openModal('editorModal');
    document.getElementById('editorSaveBtn').disabled = true;

    let cm;
    try { cm = await getCM(); } catch (e) { toast(trp('toast.editorFailed'), 'error'); return; }
    cm.setValue(''); cm.setDisabled(true);

    if (mode === 'edit' && path) {
      document.getElementById('editorCommit').value = 'Update ' + path.split('/').pop();
      getContent(token, repo.owner, repo.name, path)
        .then((data) => {
          if (data.content && data.encoding === 'base64') {
            cm.setValue(Utils.base64ToText(data.content));
            cm.setDisabled(false);
            setTimeout(() => cm.focus(), 250);
            document.getElementById('editorSaveBtn').disabled = false;
          } else throw new Error(trp('ui.noContent'));
        })
        .catch((e) => {
          addLog(() => trp('log.loadFailed') + ': ' + e.message, 'error');
          cm.setDisabled(false);
          document.getElementById('editorSaveBtn').disabled = false;
        });
    } else {
      document.getElementById('editorCommit').value = 'Create ' + (getFullPath().split('/').pop() || 'file');
      cm.setValue(''); cm.setDisabled(false);
      setTimeout(() => document.getElementById('editorPath').focus(), 200);
      document.getElementById('editorSaveBtn').disabled = false;
    }
  }

  function saveEditor() {
    const fullPath = getFullPath().replace(/^\/+|\/+$/g, '');
    if (!fullPath) { toast(trp('toast.enterPath'), 'error'); document.getElementById('editorPath').focus(); return; }
    const content = window.__orbitCM ? window.__orbitCM.getValue() : '';
    const msg = document.getElementById('editorCommit').value.trim() || (state.editingPath ? 'Edit file' : 'Create file');
    const repo = activeRepo();
    const token = getToken();
    if (!repo || !token) { toast(trp('toast.missingData'), 'error'); return; }

    document.getElementById('editorSaveBtn').disabled = true;
    const t0 = performance.now();
    const isNew = !state.editingPath;

    getContent(token, repo.owner, repo.name, fullPath)
      .catch(() => null)
      .then((ex) => {
        const body = { message: msg, content: Utils.textToBase64(content), branch: state.branch };
        if (ex && ex.sha) body.sha = ex.sha;
        return putContent(token, repo.owner, repo.name, fullPath, body);
      })
      .then((r) => {
        const sha = r && r.commit ? r.commit.sha : null;
        addLog(() => '✓✓ ' + trp('log.saved') + ' ' + fullPath, 'success');
        toast('✓ ' + trp('toast.saved'), 'success');
        addToArchive({
          type: isNew ? 'create' : 'edit',
          title: (isNew ? trp('log.creatingFile') : trp('log.editingFile')) + ' ' + fullPath.split('/').pop(),
          status: 'ok',
          owner: repo.owner, repo: repo.name, branch: state.branch,
          files: [{ path: fullPath, status: 'ok' }],
          commitSha: sha,
          duration: ((performance.now() - t0) / 1000).toFixed(2),
          details: { file: fullPath, message: msg },
        });
        notifyWebhook(isNew ? 'New file' : 'Edit', fullPath).catch(() => {});
        closeEditor();
        loadRepoContent();
      })
      .catch((e) => {
        addLog(() => trp('log.saveFailed') + ' ' + e.message, 'error');
        toast(trp('toast.saveFailed') + ': ' + e.message, 'error');
        document.getElementById('editorSaveBtn').disabled = false;
      });
  }

  function closeEditor() {
    closeModal('editorModal');
    if (window.__orbitCM) window.__orbitCM.setValue('');
    state.pathSegments = [];
    document.getElementById('editorPath').value = '';
    document.getElementById('editorCommit').value = '';
    state.editingPath = null;
    renderPathChips();
  }

  document.getElementById('editorPath').addEventListener('input', () => {
    const v = document.getElementById('editorPath').value;
    if (v.indexOf('/') !== -1) {
      const parts = v.split('/');
      const rest = parts.slice(0, -1).filter(Boolean);
      state.pathSegments = state.pathSegments.concat(rest);
      document.getElementById('editorPath').value = parts[parts.length - 1];
      renderPathChips();
    }
    updateFileInfo();
  });
  document.getElementById('editorPath').addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && document.getElementById('editorPath').value === '' && state.pathSegments.length) {
      e.preventDefault();
      const last = state.pathSegments.pop();
      document.getElementById('editorPath').value = last;
      renderPathChips(); updateFileInfo();
      const len = last.length;
      setTimeout(() => document.getElementById('editorPath').setSelectionRange(len, len), 0);
    }
  });
  document.getElementById('editorSaveBtn').addEventListener('click', saveEditor);
  document.getElementById('editorCancelBtn').addEventListener('click', closeEditor);
  document.getElementById('editorCloseBtn').addEventListener('click', closeEditor);
  document.getElementById('editorModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('editorModal')) closeEditor();
  });

  /* ═══════════════════════════════════════════════
     BRANCHES
     ═══════════════════════════════════════════════ */
  function loadBranches() {
    const repo = activeRepo();
    const token = getToken();
    if (!repo || !token) return;
    listBranches(token, repo.owner, repo.name)
      .then((list) => {
        state.branches = list;
        document.getElementById('branchPickerText').textContent = state.branch;
      })
      .catch((e) => addLog(e.message, 'error'));
  }
  document.getElementById('loadBranchesBtn').addEventListener('click', loadBranches);

  document.getElementById('branchPickerBtn').addEventListener('click', () => {
    const names = state.branches.map((b) => b.name);
    if (names.length === 0) names.push(state.branch || 'main');
    openPicker({
      title: tr('اختر فرعًا', 'Pick a branch'), icon: 'i-branch', selected: state.branch,
      items: names.map((n) => ({ value: n, label: n, icon: 'i-branch' })),
      onSelect: (n) => {
        state.branch = n;
        document.getElementById('branchPickerText').textContent = n;
        document.getElementById('activeRepoChipText').textContent =
          (activeRepo() ? activeRepo().full_name : '') + ' · ' + n;
        addLog(() => trp('log.branch') + ' ' + n, 'info');
      },
    });
  });

  document.getElementById('newBranchBtn').addEventListener('click', () => {
    if (!activeRepo() || !getToken()) { toast(trp('toast.pickRepoShort'), 'warn'); return; }
    document.getElementById('newBranchName').value = '';
    state._newBranchFrom = state.branch;
    document.getElementById('newBranchFromText').textContent = state.branch;
    if (!state.branches.length) loadBranches();
    openModal('newBranchModal');
  });
  document.getElementById('newBranchFromBtn').addEventListener('click', () => {
    let names = state.branches.map((b) => b.name);
    if (names.indexOf(state.branch) === -1) names.push(state.branch);
    if (names.length === 0) names = ['main'];
    openPicker({
      title: tr('اختر الفرع الأم', 'Pick parent branch'), icon: 'i-branch',
      selected: state._newBranchFrom || state.branch,
      items: names.map((n) => ({ value: n, label: n, icon: 'i-branch' })),
      onSelect: (n) => { state._newBranchFrom = n; document.getElementById('newBranchFromText').textContent = n; },
    });
  });
  document.getElementById('newBranchCloseBtn').addEventListener('click', () => closeModal('newBranchModal'));
  document.getElementById('newBranchCancelBtn').addEventListener('click', () => closeModal('newBranchModal'));
  document.getElementById('newBranchCreateBtn').addEventListener('click', () => {
    const name = document.getElementById('newBranchName').value.trim();
    const from = state._newBranchFrom || state.branch;
    if (!name) { toast(trp('toast.writeName'), 'error'); return; }
    const repo = activeRepo();
    const token = getToken();
    if (!repo || !token) { toast(trp('toast.missingData'), 'error'); return; }
    const btn = document.getElementById('newBranchCreateBtn');
    btn.disabled = true;
    createBranch(token, repo.owner, repo.name, name, from)
      .then(() => {
        addLog(() => '✓✓ ' + trp('log.branchCreated') + ' ' + name, 'success');
        toast('✓ ' + trp('toast.repoCreated'), 'success');
        addToArchive({ type: 'branch', title: trp('archive.branchTitle', { name }), status: 'ok', owner: repo.owner, repo: repo.name, details: { name, from } });
        closeModal('newBranchModal');
        loadBranches();
      })
      .catch((e) => { addLog(e.message, 'error'); toast(e.message, 'error'); })
      .then(() => { btn.disabled = false; });
  });

  /* PRs / ISSUES / RELEASES LOADERS */
  function loadPRsList() {
    const repo = activeRepo();
    const token = getToken();
    if (!repo || !token) { toast(trp('toast.pickRepoShort'), 'warn'); return; }
    listPRs(token, repo.owner, repo.name, state.prState || 'open')
      .then((list) => {
        state.prs = list;
        const openCount = list.filter((p) => p.state === 'open').length;
        const tab = document.getElementById('pullsTabCount');
        if (openCount > 0) { tab.textContent = openCount; tab.classList.remove('hidden'); }
        else tab.classList.add('hidden');
        window.Orbit.render.prs();
        addLog(() => trp('log.prsLoaded', { n: list.length }), 'success');
      })
      .catch((e) => { addLog(e.message, 'error'); toast(e.message, 'error'); });
  }

  function loadIssuesList() {
    const repo = activeRepo();
    const token = getToken();
    if (!repo || !token) { toast(trp('toast.pickRepoShort'), 'warn'); return; }
    listIssues(token, repo.owner, repo.name, state.issueState || 'open')
      .then((list) => {
        state.issues = list;
        const openCount = list.filter((i) => i.state === 'open' && !i.pull_request).length;
        const tab = document.getElementById('issuesTabCount');
        if (openCount > 0) { tab.textContent = openCount; tab.classList.remove('hidden'); }
        else tab.classList.add('hidden');
        window.Orbit.render.issues();
        addLog(() => trp('log.issuesLoaded', { n: list.length }), 'success');
      })
      .catch((e) => { addLog(e.message, 'error'); toast(e.message, 'error'); });
  }

  function loadReleasesList() {
    const repo = activeRepo();
    const token = getToken();
    if (!repo || !token) { toast(trp('toast.pickRepoShort'), 'warn'); return; }
    listReleases(token, repo.owner, repo.name)
      .then((list) => {
        state.releases = list;
        const tab = document.getElementById('releasesTabCount');
        tab.textContent = list.length;
        if (list.length) tab.classList.remove('hidden'); else tab.classList.add('hidden');
        window.Orbit.render.releases();
        addLog(() => trp('log.releasesLoaded', { n: list.length }), 'success');
      })
      .catch((e) => { addLog(e.message, 'error'); toast(e.message, 'error'); });
  }

  /* PR DETAIL */
  function openPRDetail(pr) {
    state.currentPR = pr;
    document.getElementById('prDetailTitle').textContent = `#${pr.number} · ${pr.title}`;
    const row = (l, v, cls) => `<div class="detail-row"><div class="label">${Utils.esc(l)}</div><div class="value ${cls || ''}">${v}</div></div>`;
    let html = '';
    html += row(trp('pr.detail.author'), Utils.esc(pr.user ? pr.user.login : ''), 'text');
    html += row(trp('pr.detail.status'), Utils.esc(pr.merged_at ? trp('pr.state.merged') : pr.state === 'open' ? trp('pr.state.open') : trp('pr.state.closed')));
    html += row(trp('pr.detail.head'), Utils.esc(pr.head && pr.head.ref || ''));
    html += row(trp('pr.detail.base'), Utils.esc(pr.base && pr.base.ref || ''));
    html += row(trp('pr.detail.created'), Utils.esc(new Date(pr.created_at).toLocaleString()), 'text');
    if (pr.body) html += row(trp('pr.detail.body'), `<pre style="margin:0;font-family:inherit;white-space:pre-wrap;word-break:break-word;direction:ltr;text-align:left">${Utils.esc(pr.body)}</pre>`);
    html += row(trp('pr.detail.link'), `<a href="${Utils.esc(pr.html_url)}" target="_blank" rel="noopener">${Utils.esc(pr.html_url)}</a>`);
    document.getElementById('prDetailBody').innerHTML = html;
    document.getElementById('prMergeBtn').classList.toggle('hidden', pr.state !== 'open' || !!pr.merged_at);
    document.getElementById('prCloseBtn').classList.toggle('hidden', pr.state !== 'open' || !!pr.merged_at);
    openModal('prDetailModal');
  }
  function closePRDetail() { closeModal('prDetailModal'); state.currentPR = null; }
  document.getElementById('prDetailCloseBtn').addEventListener('click', closePRDetail);
  document.getElementById('prDetailCloseBtn2').addEventListener('click', closePRDetail);
  document.getElementById('prDetailModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('prDetailModal')) closePRDetail();
  });
  document.getElementById('prMergeBtn').addEventListener('click', () => {
    const pr = state.currentPR; if (!pr) return;
    if (!confirm(trp('confirm.mergePR', { n: pr.number }))) return;
    const repo = activeRepo(); const token = getToken();
    mergePR(token, repo.owner, repo.name, pr.number)
      .then(() => { toast('✓ ' + trp('toast.merged'), 'success'); closePRDetail(); loadPRsList(); })
      .catch((e) => toast(e.message, 'error'));
  });
  document.getElementById('prCloseBtn').addEventListener('click', () => {
    const pr = state.currentPR; if (!pr) return;
    if (!confirm(trp('confirm.closePR', { n: pr.number }))) return;
    const repo = activeRepo(); const token = getToken();
    closePR(token, repo.owner, repo.name, pr.number)
      .then(() => { toast('✓ ' + trp('toast.closed'), 'success'); closePRDetail(); loadPRsList(); })
      .catch((e) => toast(e.message, 'error'));
  });

  /* ISSUE DETAIL */
  function openIssueDetail(iss) {
    state.currentIssue = iss;
    document.getElementById('issueDetailTitle').textContent = `#${iss.number} · ${iss.title}`;
    const row = (l, v, cls) => `<div class="detail-row"><div class="label">${Utils.esc(l)}</div><div class="value ${cls || ''}">${v}</div></div>`;
    let html = '';
    html += row(trp('issue.detail.author'), Utils.esc(iss.user ? iss.user.login : ''), 'text');
    html += row(trp('issue.detail.status'), Utils.esc(iss.state === 'open' ? trp('pr.state.open') : trp('pr.state.closed')));
    html += row(trp('issue.detail.created'), Utils.esc(new Date(iss.created_at).toLocaleString()), 'text');
    if (iss.labels && iss.labels.length) html += row(trp('issue.detail.labels'), Utils.esc(iss.labels.map((l) => l.name).join(', ')));
    if (iss.body) html += row(trp('issue.detail.body'), `<pre style="margin:0;font-family:inherit;white-space:pre-wrap;word-break:break-word;direction:ltr;text-align:left">${Utils.esc(iss.body)}</pre>`);
    html += row(trp('issue.detail.link'), `<a href="${Utils.esc(iss.html_url)}" target="_blank" rel="noopener">${Utils.esc(iss.html_url)}</a>`);
    document.getElementById('issueDetailBody').innerHTML = html;
    document.getElementById('issueCloseBtn').classList.toggle('hidden', iss.state !== 'open');
    document.getElementById('issueReopenBtn').classList.toggle('hidden', iss.state !== 'closed');
    openModal('issueDetailModal');
  }
  function closeIssueDetail() { closeModal('issueDetailModal'); state.currentIssue = null; }
  document.getElementById('issueDetailCloseBtn').addEventListener('click', closeIssueDetail);
  document.getElementById('issueDetailCloseBtn2').addEventListener('click', closeIssueDetail);
  document.getElementById('issueDetailModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('issueDetailModal')) closeIssueDetail();
  });
  document.getElementById('issueCloseBtn').addEventListener('click', () => {
    const iss = state.currentIssue; if (!iss) return;
    const repo = activeRepo(); const token = getToken();
    updateIssue(token, repo.owner, repo.name, iss.number, { state: 'closed' })
      .then(() => { toast('✓ ' + trp('toast.closed'), 'success'); closeIssueDetail(); loadIssuesList(); })
      .catch((e) => toast(e.message, 'error'));
  });
  document.getElementById('issueReopenBtn').addEventListener('click', () => {
    const iss = state.currentIssue; if (!iss) return;
    const repo = activeRepo(); const token = getToken();
    updateIssue(token, repo.owner, repo.name, iss.number, { state: 'open' })
      .then(() => { toast('✓ ' + trp('toast.reopened'), 'success'); closeIssueDetail(); loadIssuesList(); })
      .catch((e) => toast(e.message, 'error'));
  });

  /* ARCHIVE DETAIL */
  function openArchiveDetail(id) {
    const entry = state.archive.find((e) => e.id === id);
    if (!entry) return;
    state.currentArchiveEntryId = id;
    const d = new Date(entry.ts);
    document.getElementById('archiveDetailTitleText').textContent = entry.title;
    const row = (l, v, cls) => `<div class="detail-row"><div class="label">${Utils.esc(l)}</div><div class="value ${cls || ''}">${v}</div></div>`;
    let html = '';
    html += row(trp('archive.date'), Utils.esc(d.toLocaleString()), 'text');
    html += row(trp('archive.type'), Utils.esc(entry.type));
    html += row(trp('archive.status'), entry.status === 'ok' ? trp('archive.ok') : entry.status === 'warn' ? trp('archive.warn') : trp('archive.err'));
    if (entry.owner || entry.repo) html += row(trp('archive.repo'), Utils.esc(`${entry.owner || ''}/${entry.repo || ''}`));
    if (entry.branch) html += row(trp('archive.branch'), Utils.esc(entry.branch));
    if (entry.commitSha) html += row('Commit SHA', `<a href="https://github.com/${entry.owner}/${entry.repo}/commit/${entry.commitSha}" target="_blank" rel="noopener">${Utils.esc(entry.commitSha)}</a>`);
    if (entry.duration != null) html += row(trp('archive.duration'), entry.duration + 's');
    if (entry.files && entry.files.length) {
      const fh = entry.files.map((f) => {
        const cls = f.status === 'ok' ? 'ok' : f.status === 'err' ? 'err' : '';
        const ico = f.status === 'ok' ? '✓' : f.status === 'err' ? '✕' : '•';
        const path = typeof f === 'string' ? f : (f.path || '');
        const size = typeof f === 'object' && f.size ? ` (${Utils.fmtBytes(f.size)})` : '';
        return `<div class="file-row ${cls}"><span>${ico}</span><span>${Utils.esc(path + size)}</span></div>`;
      }).join('');
      html += row(trp('archive.files'), `<div class="detail-files">${fh}</div>`);
    }
    if (entry.details && Object.keys(entry.details).length) {
      Object.keys(entry.details).forEach((k) => {
        const v = entry.details[k];
        const vStr = typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v);
        html += row(k, `<pre style="margin:0;font-family:var(--mono);font-size:11px;white-space:pre-wrap;word-break:break-word;direction:ltr;text-align:left">${Utils.esc(vStr)}</pre>`);
      });
    }
    document.getElementById('archiveDetailBody').innerHTML = html;
    openModal('archiveDetailModal');
  }

  document.getElementById('archiveDetailCloseBtn').addEventListener('click', () => closeModal('archiveDetailModal'));
  document.getElementById('archiveDetailCloseBtn2').addEventListener('click', () => closeModal('archiveDetailModal'));
  document.getElementById('archiveDetailModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('archiveDetailModal')) closeModal('archiveDetailModal');
  });
  document.getElementById('archiveDetailDeleteBtn').addEventListener('click', () => {
    if (!state.currentArchiveEntryId) return;
    state.archive = state.archive.filter((e) => e.id !== state.currentArchiveEntryId);
    KEY.archive.save(state.archive);
    window.Orbit.render.archiveList();
    closeModal('archiveDetailModal');
    toast('✓ ' + trp('toast.deleted'), 'success');
  });
  document.getElementById('drawerArchiveClear').addEventListener('click', () => {
    if (!confirm(trp('confirm.clearArchive'))) return;
    state.archive = [];
    KEY.archive.save(state.archive);
    window.Orbit.render.archiveList();
    toast('✓ ' + trp('toast.cleared'), 'success');
  });
  document.getElementById('drawerArchiveExport').addEventListener('click', () => {
    if (!state.archive.length) { toast(trp('toast.archiveEmpty'), 'warn'); return; }
    const data = { exportedAt: new Date().toISOString(), count: state.archive.length, entries: state.archive };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'orbit-archive-' + Date.now() + '.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('✓ ' + trp('toast.exported'), 'success');
  });

  /* DRAFTS */
  function loadDrafts() {
    const d = KEY.drafts.load();
    state.drafts = Object.keys(d).map((id) => ({ id, ...d[id] }));
    window.Orbit.render.draftsList();
  }
  function openDraft(id) {
    const d = KEY.drafts.load()[id];
    if (!d) return;
    state._currentDraftId = id;
    document.getElementById('draftTitle').textContent = trp('drafts.draftLabel') + ' ' + d.name;
    document.getElementById('draftName').value = d.name;
    document.getElementById('draftContent').value = typeof d.content === 'string' ? d.content : JSON.stringify(d.content, null, 2);
    openModal('draftModal');
  }
  document.getElementById('newDraftBtn').addEventListener('click', () => {
    state._currentDraftId = null;
    document.getElementById('draftTitle').textContent = trp('drafts.newDraft');
    document.getElementById('draftName').value = '';
    document.getElementById('draftContent').value = '';
    openModal('draftModal');
  });
  document.getElementById('draftCloseBtn').addEventListener('click', () => closeModal('draftModal'));
  document.getElementById('draftCancelBtn').addEventListener('click', () => closeModal('draftModal'));
  document.getElementById('draftSaveBtn').addEventListener('click', () => {
    const name = document.getElementById('draftName').value.trim();
    if (!name) { toast(trp('toast.writeDraftName'), 'error'); return; }
    const d = KEY.drafts.load();
    const id = state._currentDraftId || 'd_' + Date.now();
    d[id] = {
      name,
      content: document.getElementById('draftContent').value,
      ts: Date.now(),
      repo: activeRepo() ? activeRepo().full_name : '',
    };
    KEY.drafts.save(d);
    toast('✓ ' + trp('toast.saved'), 'success');
    closeModal('draftModal');
    loadDrafts();
  });

  /* STATS */
  function loadStats() {
    const repo = activeRepo();
    const token = getToken();
    if (!repo || !token) { toast(trp('toast.pickRepoShort'), 'warn'); return; }

    const opsByType = {};
    let totalDuration = 0;
    state.archive.forEach((e) => {
      opsByType[e.type] = (opsByType[e.type] || 0) + 1;
      if (e.duration) totalDuration += parseFloat(e.duration) || 0;
    });
    const localBox = document.getElementById('statsLocalInfo');
    localBox.innerHTML = '';
    const addLocal = (icon, label, value) => {
      const s = el('span', 'stat');
      s.style.marginInlineEnd = '18px';
      s.appendChild(svg(icon));
      s.appendChild(el('span', null, label + ' '));
      s.appendChild(el('b', null, value));
      localBox.appendChild(s);
    };
    addLocal('i-activity', trp('stats.ops'), String(state.archive.length));
    addLocal('i-clock', trp('stats.duration'), totalDuration.toFixed(1) + 's');
    addLocal('i-upload', trp('stats.uploads'), String(opsByType.upload || 0));
    addLocal('i-edit', trp('stats.edits'), String(opsByType.edit || 0));
    addLocal('i-create', trp('stats.creates'), String(opsByType.create || 0));
    addLocal('i-pr', trp('stats.prs'), String(opsByType.pr || 0));
    addLocal('i-issue', trp('stats.issues'), String(opsByType.issue || 0));

    document.getElementById('statsRepoInfo').innerHTML = `<div class="busy"><div class="spinner"></div><span>${trp('log.loading')}</span></div>`;
    request(`/repos/${repo.owner}/${repo.name}`, { token })
      .then((data) => {
        const box = document.getElementById('statsRepoInfo');
        box.innerHTML = '';
        const addS = (icon, label, value) => {
          const s = el('span', 'stat');
          s.style.marginInlineEnd = '18px';
          s.appendChild(svg(icon));
          s.appendChild(el('span', null, label + ' '));
          s.appendChild(el('b', null, value));
          box.appendChild(s);
        };
        addS('i-star', trp('stats.stars'), String(data.stargazers_count || 0));
        addS('i-git-pull-request', trp('stats.forks'), String(data.forks_count || 0));
        addS('i-issue', trp('stats.issues'), String(data.open_issues_count || 0));
        addS('i-code', trp('stats.lang'), data.language || '—');
        addS('i-hard-drive', trp('stats.size'), (data.size || 0) + ' KB');
        addS('i-branch', trp('stats.defaultBranch'), data.default_branch || 'main');
        addS('i-clock', trp('stats.updated'), new Date(data.updated_at).toLocaleDateString());
        addS('i-globe', trp('stats.visibility'), data.private ? trp('stats.private') : trp('stats.public'));
        addS('i-user', trp('stats.owner'), data.owner.login);
      })
      .catch((e) => {
        document.getElementById('statsRepoInfo').innerHTML = `<div class="empty"><svg class="ic"><use href="#i-alert"/></svg><div class="empty-title">${tr('فشل', 'Failed')}</div><div class="empty-desc">${Utils.esc(e.message)}</div></div>`;
      });
  }

  /* EXPOSE */
  window.Orbit.actions = {
    loadRepoContent, deleteRepoFile, openEditor, saveEditor, closeEditor,
    renderPathChips, updateFileInfo, setFullPath,
    openMoveCopy, generateREADME,
    loadBranches, loadPRsList, loadIssuesList, loadReleasesList,
    openPRDetail, openIssueDetail, openArchiveDetail, openDraft,
    loadDrafts, loadStats,
    setProgress, resetProgress,
  };
})();