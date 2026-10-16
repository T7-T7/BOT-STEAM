/* Orbit — All rendering */
(function () {
  'use strict';
  const { api, ui, i18n } = window.Orbit;
  const { Utils } = api;
  const { el, svg } = ui;
  const { state, core } = window.Orbit;
  const { activeRepo, fmtArchiveTime, archiveIconFor } = core;
  const { tr, trp } = i18n;

  /* ═══════════ Upload tree ═══════════ */
  function refreshUploadUI() {
    const total = state.files.length;
    const tab = document.getElementById('uploadTabCount');
    if (total > 0) { tab.textContent = total; tab.classList.remove('hidden'); }
    else tab.classList.add('hidden');

    if (total === 0) {
      document.getElementById('treeSection').classList.add('hidden');
      document.getElementById('selSummary').classList.add('hidden');
      document.getElementById('emptyState').classList.remove('hidden');
      document.getElementById('selectAllBtn').disabled = true;
      document.getElementById('deselectAllBtn').disabled = true;
      document.getElementById('clearBtn').disabled = true;
      document.getElementById('uploadBtn').disabled = true;
      document.getElementById('uploadSummary').textContent = '—';
      core.updatePathPreview();
      return;
    }
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('treeSection').classList.remove('hidden');
    document.getElementById('selSummary').classList.remove('hidden');
    document.getElementById('selectAllBtn').disabled = false;
    document.getElementById('deselectAllBtn').disabled = false;
    document.getElementById('clearBtn').disabled = false;
    uploadTree(); updateStats(); updateSelSummary(); core.updatePathPreview();
  }

  function updateSelSummary() {
    const sel = state.files.filter((f) => f.selected);
    const size = sel.reduce((s, f) => s + (f.size || 0), 0);
    document.getElementById('selTitle').textContent =
      trp('ui.filesCount', { n: state.files.length });
    const dirs = new Set();
    state.files.forEach((f) => {
      const p = f.path.split('/');
      for (let i = 0; i < p.length - 1; i++) dirs.add(p.slice(0, i + 1).join('/'));
    });
    document.getElementById('selSub').textContent =
      `${sel.length}/${state.files.length} · ${trp('ui.dirsCount', { n: dirs.size })} · ${Utils.fmtBytes(size)}`;
  }

  function buildUploadTree(files) {
    const root = { name: '', path: '', dirs: new Map(), files: [] };
    files.forEach((f) => {
      const parts = f.path.split('/');
      let node = root;
      for (let i = 0; i < parts.length - 1; i++) {
        const seg = parts[i], p = parts.slice(0, i + 1).join('/');
        if (!node.dirs.has(seg)) node.dirs.set(seg, { name: seg, path: p, dirs: new Map(), files: [] });
        node = node.dirs.get(seg);
      }
      node.files.push(f);
    });
    return root;
  }

  function renderUploadNode(node, depth) {
    const frag = document.createDocumentFragment();
    const paths = [];
    const dirs = Array.from(node.dirs.values()).sort((a, b) => a.name.localeCompare(b.name, 'en'));
    const files = node.files.slice().sort((a, b) => a.path.localeCompare(b.path, 'en'));

    dirs.forEach((d) => {
      const sub = renderUploadNode(d, depth + 1);
      const nodeEl = el('div', 'tree-node');
      const row = el('div', 'tree-row dir');
      row.style.paddingInlineStart = (14 + depth * 18) + 'px';

      const chev = el('button', 'tree-chev'); chev.type = 'button';
      chev.appendChild(svg('i-chevron-down'));
      chev.addEventListener('click', (e) => { e.stopPropagation(); nodeEl.classList.toggle('collapsed'); });

      const cb = document.createElement('input');
      cb.type = 'checkbox'; cb.className = 'tree-cb';
      row.append(chev, cb, svg('i-folder', 'folder'), el('span', 'tree-name', d.name), el('span', 'tree-count', String(sub.paths.length)));

      const children = el('div', 'tree-children');
      children.appendChild(sub.frag);
      const dirPaths = sub.paths.slice();
      state.dirRegistry.push({ cb, paths: dirPaths });

      cb.addEventListener('change', () => {
        const v = cb.checked;
        dirPaths.forEach((p) => { const f = state.fileMap.get(p); if (f) f.selected = v; });
        const inner = children.querySelectorAll('input[data-file]');
        for (let i = 0; i < inner.length; i++) inner[i].checked = v;
        syncDirs(); updateStats(); updateSelSummary();
      });

      nodeEl.appendChild(row); nodeEl.appendChild(children); frag.appendChild(nodeEl);
      sub.paths.forEach((p) => paths.push(p));
    });

    files.forEach((f) => {
      const nodeEl = el('div', 'tree-node');
      const row = el('div', 'tree-row file');
      row.style.paddingInlineStart = (14 + depth * 18 + 34) + 'px';

      const cb = document.createElement('input');
      cb.type = 'checkbox'; cb.className = 'tree-cb';
      cb.checked = f.selected; cb.setAttribute('data-file', '1');
      cb.addEventListener('change', () => { f.selected = cb.checked; syncDirs(); updateStats(); updateSelSummary(); });

      row.append(el('span', 'tree-chev placeholder'), cb, svg('i-file'), el('span', 'tree-name', f.path.split('/').pop()), el('span', 'tree-meta', f.size ? Utils.fmtBytes(f.size) : ''));
      nodeEl.appendChild(row); frag.appendChild(nodeEl);
      paths.push(f.path);
    });

    return { frag, paths };
  }

  function uploadTree() {
    state.dirRegistry = [];
    const tree = document.getElementById('tree');
    tree.innerHTML = '';
    const root = buildUploadTree(state.files);
    tree.appendChild(renderUploadNode(root, 0).frag);
    syncDirs();
  }

  function syncDirs() {
    state.dirRegistry.forEach((d) => {
      let sel = 0;
      d.paths.forEach((p) => { const f = state.fileMap.get(p); if (f && f.selected) sel++; });
      d.cb.checked = d.paths.length > 0 && sel === d.paths.length;
      d.cb.indeterminate = sel > 0 && sel < d.paths.length;
    });
  }

  function updateStats() {
    const stats = document.getElementById('stats');
    const total = state.files.length;
    if (!total) { stats.innerHTML = ''; return; }
    const sel = state.files.filter((f) => f.selected);
    const size = sel.reduce((s, f) => s + (f.size || 0), 0);
    const dirs = new Set();
    state.files.forEach((f) => {
      const p = f.path.split('/');
      for (let i = 0; i < p.length - 1; i++) dirs.add(p.slice(0, i + 1).join('/'));
    });
    stats.innerHTML = '';
    const add = (id, label, value) => {
      const s = el('span', 'stat');
      s.appendChild(svg(id)); s.appendChild(el('span', null, label)); s.appendChild(el('b', null, value));
      stats.appendChild(s);
    };
    add('i-file', trp('stats.files'), String(total));
    add('i-folder', trp('stats.folders'), String(dirs.size));
    add('i-check', trp('stats.selected'), String(sel.length));
    add('i-upload', trp('stats.size'), Utils.fmtBytes(size));
    document.getElementById('uploadBtn').disabled = sel.length === 0 || state.uploading;
    document.getElementById('uploadSummary').textContent =
      sel.length === 0 ? '—' : `${sel.length} ${tr('ملف', 'file(s)')} · ${Utils.fmtBytes(size)}`;
  }

  /* ═══════════ Repo tree (remote) ═══════════ */
  function renderRepoTree() {
    const tree = document.getElementById('repoTree');
    tree.innerHTML = '';
    const root = buildRepoTree(state.repoFiles);
    const res = renderRepoNode(root, 0);
    tree.appendChild(res.frag);

    const totalSize = state.repoFiles.reduce((s, f) => s + (f.size || 0), 0);
    const dirs = new Set();
    state.repoFiles.forEach((f) => {
      const p = f.path.split('/');
      for (let i = 0; i < p.length - 1; i++) dirs.add(p.slice(0, i + 1).join('/'));
    });
    const stats = document.getElementById('repoStats');
    stats.innerHTML = '';
    const add = (id, l, v) => { const s = el('span', 'stat'); s.appendChild(svg(id)); s.appendChild(el('span', null, l)); s.appendChild(el('b', null, v)); stats.appendChild(s); };
    add('i-file', trp('stats.files'), String(state.repoFiles.length));
    add('i-folder', trp('stats.folders'), String(dirs.size));
    add('i-download', trp('stats.size'), Utils.fmtBytes(totalSize));
  }

  function buildRepoTree(files) {
    const root = { name: '', path: '', dirs: new Map(), files: [] };
    files.forEach((f) => {
      const parts = f.path.split('/');
      let node = root;
      for (let i = 0; i < parts.length - 1; i++) {
        const seg = parts[i], p = parts.slice(0, i + 1).join('/');
        if (!node.dirs.has(seg)) node.dirs.set(seg, { name: seg, path: p, dirs: new Map(), files: [] });
        node = node.dirs.get(seg);
      }
      node.files.push(f);
    });
    return root;
  }

  function renderRepoNode(node, depth) {
    const frag = document.createDocumentFragment();
    let count = 0;
    const dirs = Array.from(node.dirs.values()).sort((a, b) => a.name.localeCompare(b.name, 'en'));
    const files = node.files.slice().sort((a, b) => a.path.localeCompare(b.path, 'en'));

    dirs.forEach((d) => {
      const sub = renderRepoNode(d, depth + 1); count += sub.count;
      const nodeEl = el('div', 'tree-node');
      const row = el('div', 'tree-row dir');
      row.style.paddingInlineStart = (14 + depth * 18) + 'px';

      const chev = el('button', 'tree-chev'); chev.type = 'button';
      chev.appendChild(svg('i-chevron-down'));
      chev.addEventListener('click', (e) => { e.stopPropagation(); nodeEl.classList.toggle('collapsed'); });

      const actions = el('div', 'tree-actions');
      const copyBtn = el('button', 'tree-action-btn'); copyBtn.type = 'button'; copyBtn.title = tr('نسخ الفولدر', 'Copy folder');
      copyBtn.appendChild(svg('i-copy'));
      copyBtn.addEventListener('click', (e) => { e.stopPropagation(); window.Orbit.actions.openMoveCopy('copy', d.path, true); });
      const moveBtn = el('button', 'tree-action-btn'); moveBtn.type = 'button'; moveBtn.title = tr('نقل الفولدر', 'Move folder');
      moveBtn.appendChild(svg('i-move'));
      moveBtn.addEventListener('click', (e) => { e.stopPropagation(); window.Orbit.actions.openMoveCopy('move', d.path, true); });
      actions.append(copyBtn, moveBtn);

      row.append(chev, svg('i-folder', 'folder'), el('span', 'tree-name', d.name), el('span', 'tree-count', String(sub.count)), actions);

      const children = el('div', 'tree-children');
      children.appendChild(sub.frag);
      nodeEl.appendChild(row); nodeEl.appendChild(children); frag.appendChild(nodeEl);
    });

    files.forEach((f) => {
      count++;
      const nodeEl = el('div', 'tree-node');
      const row = el('div', 'tree-row file');
      row.style.paddingInlineStart = (14 + depth * 18 + 34) + 'px';
      row.title = f.path;

      const actions = el('div', 'tree-actions');
      const editBtn = el('button', 'tree-action-btn'); editBtn.type = 'button'; editBtn.title = tr('تعديل', 'Edit');
      editBtn.appendChild(svg('i-edit'));
      editBtn.addEventListener('click', (e) => { e.stopPropagation(); window.Orbit.actions.openEditor(f.path, 'edit'); });

      const copyBtn = el('button', 'tree-action-btn'); copyBtn.type = 'button'; copyBtn.title = tr('نسخ', 'Copy');
      copyBtn.appendChild(svg('i-copy'));
      copyBtn.addEventListener('click', (e) => { e.stopPropagation(); window.Orbit.actions.openMoveCopy('copy', f.path, false); });

      const moveBtn = el('button', 'tree-action-btn'); moveBtn.type = 'button'; moveBtn.title = tr('نقل', 'Move');
      moveBtn.appendChild(svg('i-move'));
      moveBtn.addEventListener('click', (e) => { e.stopPropagation(); window.Orbit.actions.openMoveCopy('move', f.path, false); });

      const delBtn = el('button', 'tree-action-btn del'); delBtn.type = 'button'; delBtn.title = tr('حذف', 'Delete');
      delBtn.appendChild(svg('i-trash'));
      delBtn.addEventListener('click', (e) => { e.stopPropagation(); window.Orbit.actions.deleteRepoFile(f.path); });

      actions.append(editBtn, copyBtn, moveBtn, delBtn);
      row.append(el('span', 'tree-chev placeholder'), svg('i-file'), el('span', 'tree-name', f.path.split('/').pop()), el('span', 'tree-meta', f.size ? Utils.fmtBytes(f.size) : ''), actions);
      row.addEventListener('click', () => window.Orbit.actions.openEditor(f.path, 'edit'));
      nodeEl.appendChild(row); frag.appendChild(nodeEl);
    });

    return { frag, count };
  }

  /* ═══════════ PRs / Issues / Releases ═══════════ */
  function prs() {
    const list = document.getElementById('prList');
    if (!state.prs.length) {
      list.innerHTML = `<div class="empty"><svg class="ic"><use href="#i-pr"/></svg><div class="empty-title">${tr('لم يتم تحميل الطلبات', 'PRs not loaded')}</div><div class="empty-desc">${tr('اضغط «تحميل»', 'Click Load')}</div></div>`;
      return;
    }
    list.innerHTML = '';
    state.prs.forEach((pr) => {
      const item = el('div', 'list-item');
      const ic = el('div', 'list-icon pr' + (pr.state === 'closed' ? ' closed' : '') + (pr.merged_at ? ' merged' : ''));
      ic.appendChild(svg('i-pr'));
      item.appendChild(ic);
      const body = el('div', 'list-body');
      const title = el('div', 'list-title');
      title.appendChild(el('span', 'num', '#' + pr.number));
      title.appendChild(el('span', null, pr.title));
      const st = el('span', 'badge-mini ' + pr.state + (pr.merged_at ? ' merged' : ''));
      st.textContent = pr.merged_at ? tr('مدمج', 'Merged') : pr.state === 'open' ? tr('مفتوح', 'Open') : tr('مغلق', 'Closed');
      title.appendChild(st); body.appendChild(title);
      const sub = el('div', 'list-sub');
      sub.appendChild(el('span', 'meta', pr.user ? pr.user.login : ''));
      sub.appendChild(el('span', 'meta', `${(pr.head && pr.head.ref) || ''} → ${(pr.base && pr.base.ref) || ''}`));
      body.appendChild(sub); item.appendChild(body);
      item.appendChild(el('div', 'list-time', fmtArchiveTime(new Date(pr.created_at).getTime())));
      item.addEventListener('click', () => window.Orbit.actions.openPRDetail(pr));
      list.appendChild(item);
    });
  }

  function issues() {
    const real = state.issues.filter((i) => !i.pull_request);
    const list = document.getElementById('issueList');
    if (!real.length) {
      list.innerHTML = `<div class="empty"><svg class="ic"><use href="#i-issue"/></svg><div class="empty-title">${tr('لم يتم تحميل البلاغات', 'Issues not loaded')}</div><div class="empty-desc">${tr('اضغط «تحميل»', 'Click Load')}</div></div>`;
      return;
    }
    list.innerHTML = '';
    real.forEach((iss) => {
      const item = el('div', 'list-item');
      const ic = el('div', 'list-icon issue' + (iss.state === 'closed' ? ' closed' : ''));
      ic.appendChild(svg('i-issue')); item.appendChild(ic);
      const body = el('div', 'list-body');
      const title = el('div', 'list-title');
      title.appendChild(el('span', 'num', '#' + iss.number));
      title.appendChild(el('span', null, iss.title));
      const st = el('span', 'badge-mini ' + iss.state);
      st.textContent = iss.state === 'open' ? tr('مفتوح', 'Open') : tr('مغلق', 'Closed');
      title.appendChild(st); body.appendChild(title);
      const sub = el('div', 'list-sub');
      sub.appendChild(el('span', 'meta', iss.user ? iss.user.login : ''));
      if (iss.labels && iss.labels.length) sub.appendChild(el('span', 'meta', iss.labels.map((l) => l.name).join(',')));
      body.appendChild(sub); item.appendChild(body);
      item.appendChild(el('div', 'list-time', fmtArchiveTime(new Date(iss.created_at).getTime())));
      item.addEventListener('click', () => window.Orbit.actions.openIssueDetail(iss));
      list.appendChild(item);
    });
  }

  function releases() {
    const list = document.getElementById('releaseList');
    if (!state.releases.length) {
      list.innerHTML = `<div class="empty"><svg class="ic"><use href="#i-tag"/></svg><div class="empty-title">${tr('لم يتم تحميل الإصدارات', 'Releases not loaded')}</div><div class="empty-desc">${tr('اضغط «تحميل»', 'Click Load')}</div></div>`;
      return;
    }
    list.innerHTML = '';
    state.releases.forEach((rel) => {
      const item = el('div', 'list-item');
      const ic = el('div', 'list-icon release');
      ic.appendChild(svg('i-tag')); item.appendChild(ic);
      const body = el('div', 'list-body');
      const title = el('div', 'list-title');
      title.appendChild(el('span', null, rel.name || rel.tag_name));
      title.appendChild(el('span', 'badge-mini', rel.tag_name));
      if (rel.prerelease) { const p = el('span', 'badge-mini'); p.textContent = tr('تجريبي', 'Pre-release'); title.appendChild(p); }
      if (rel.draft) { const d = el('span', 'badge-mini closed'); d.textContent = tr('مسودة', 'Draft'); title.appendChild(d); }
      body.appendChild(title);
      const sub = el('div', 'list-sub');
      sub.appendChild(el('span', 'meta', rel.author ? rel.author.login : ''));
      sub.appendChild(el('span', 'meta', new Date(rel.published_at || rel.created_at).toLocaleDateString()));
      body.appendChild(sub); item.appendChild(body);
      item.appendChild(el('div', 'list-time', fmtArchiveTime(new Date(rel.created_at).getTime())));
      item.addEventListener('click', () => window.open(rel.html_url, '_blank'));
      list.appendChild(item);
    });
  }

  /* ═══════════ Archive (drawer) ═══════════ */
  function archiveList() {
    const wrap = document.getElementById('drawerArchiveList');
    if (!wrap) return;
    wrap.innerHTML = '';
    if (state.archive.length === 0) {
      wrap.innerHTML = `<div style="padding:14px;text-align:center;color:var(--fg-subtle);font-size:12px">${tr('لا توجد عمليات بعد', 'No operations yet')}</div>`;
      return;
    }
    state.archive.slice(0, 30).forEach((entry) => {
      const item = el('div', 'drawer-archive-item');
      item.appendChild(svg(archiveIconFor(entry.type)));
      item.appendChild(el('div', 'title', entry.title));
      item.appendChild(el('div', 'time', fmtArchiveTime(entry.ts)));
      item.addEventListener('click', () => {
        ui.closeDrawer();
        setTimeout(() => window.Orbit.actions.openArchiveDetail(entry.id), 150);
      });
      wrap.appendChild(item);
    });
    if (state.archive.length > 30) {
      const more = el('div', 'drawer-archive-item');
      more.style.justifyContent = 'center'; more.style.color = 'var(--fg-muted)';
      more.appendChild(el('div', 'title', trp('archive.more', { n: state.archive.length - 30 })));
      wrap.appendChild(more);
    }
  }

  /* ═══════════ Drafts ═══════════ */
  function draftsList() {
    const list = document.getElementById('draftsList');
    if (!state.drafts.length) {
      list.innerHTML = `<div class="empty"><svg class="ic"><use href="#i-bookmark"/></svg><div class="empty-title">${tr('لا توجد مسودات', 'No drafts')}</div><div class="empty-desc">${tr('اضغط «مسودة جديدة»', 'Click "New draft"')}</div></div>`;
      document.getElementById('draftsTabCount').classList.add('hidden');
      return;
    }
    list.innerHTML = '';
    state.drafts.sort((a, b) => b.ts - a.ts).forEach((d) => {
      const item = el('div', 'list-item');
      const ic = el('div', 'list-icon');
      ic.appendChild(svg('i-bookmark')); item.appendChild(ic);
      const body = el('div', 'list-body');
      const title = el('div', 'list-title');
      title.appendChild(el('span', null, d.name));
      body.appendChild(title);
      const sub = el('div', 'list-sub');
      sub.appendChild(el('span', 'meta', d.repo || ''));
      sub.appendChild(el('span', 'meta', new Date(d.ts).toLocaleDateString()));
      body.appendChild(sub); item.appendChild(body);
      item.appendChild(el('div', 'list-time', fmtArchiveTime(d.ts)));
      item.addEventListener('click', () => window.Orbit.actions.openDraft(d.id));
      list.appendChild(item);
    });
    const tab = document.getElementById('draftsTabCount');
    tab.textContent = state.drafts.length;
    tab.classList.remove('hidden');
  }

  window.Orbit.render = {
    refreshUploadUI, uploadTree, updateStats, updateSelSummary, syncDirs,
    renderRepoTree, prs, issues, releases, archiveList, draftsList,
  };
})();