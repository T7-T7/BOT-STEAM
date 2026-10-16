/* Orbit UI — modals, drawer, picker, folder picker, toast */
(function () {
  'use strict';

  const { Utils } = window.Orbit.api;
  const { i18n } = window.Orbit;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  function el(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function svg(id, cls) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('class', 'ic ' + (cls || ''));
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '2');
    s.setAttribute('stroke-linecap', 'round');
    s.setAttribute('stroke-linejoin', 'round');
    const u = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    u.setAttribute('href', '#' + id);
    s.appendChild(u);
    return s;
  }

  /* ═══ Toast ═══ */
  function toast(msg, type) {
    const el2 = $('#toast');
    if (!el2) return;
    el2.textContent = msg;
    el2.style.display = 'flex';
    el2.style.borderColor =
      type === 'error' ? 'var(--danger-border)'
        : type === 'success' ? 'var(--success-border)'
          : 'var(--border-strong)';
    el2.style.color =
      type === 'error' ? 'var(--danger)'
        : type === 'success' ? 'var(--success)'
          : 'var(--fg)';
    clearTimeout(el2._t);
    el2._t = setTimeout(() => { el2.style.display = 'none'; }, 3200);
  }

  /* ═══ Theme ═══ */
  function setTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    try { localStorage.setItem('orbit_theme_v3', mode); } catch (e) {}
    $$('[data-theme-choice]').forEach((b) => {
      b.classList.toggle('active', b.dataset.themeChoice === mode);
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', mode === 'dark' ? '#122C4F' : '#F4F6F8');
  }

  /* ═══ Drawer ═══ */
  function openDrawer() {
    const d = $('#settingsDrawer'), b = $('#drawerBackdrop');
    if (!d) return;
    d.classList.add('open');
    d.setAttribute('aria-hidden', 'false');
    b.classList.add('open');
  }
  function closeDrawer() {
    const d = $('#settingsDrawer'), b = $('#drawerBackdrop');
    if (!d) return;
    d.classList.remove('open');
    d.setAttribute('aria-hidden', 'true');
    b.classList.remove('open');
  }

  /* ═══ Modal helpers ═══ */
  function lockModalHeight() {
    if (window.innerWidth > 720) return;
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const h = Math.round(vh * 0.86);
    document.documentElement.style.setProperty('--modal-locked-h', h + 'px');
  }
  function unlockModalHeight() {
    document.documentElement.style.removeProperty('--modal-locked-h');
  }

  function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    lockModalHeight();
    m.classList.add('open');
    document.body.classList.add('modal-open');
  }
  function closeModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.remove('open');
    if ($$('.modal-bg.open').length === 0) {
      document.body.classList.remove('modal-open');
      unlockModalHeight();
    }
  }

  /* ═══ Generic Picker ═══ */
  let pickerCb = null;

  function openPicker(opts) {
    pickerCb = opts.onSelect;
    const modal = $('#pickerModal');
    const title = $('#pickerTitle');
    const titleIcon = $('#pickerTitleIcon');
    const list = $('#pickerList');
    if (!modal || !list) return;

    title.textContent = opts.title || i18n.tr('اختر', 'Pick');
    titleIcon.querySelector('use').setAttribute('href', opts.icon || 'i-list');
    list.innerHTML = '';

    opts.items.forEach((item) => {
      const btn = el('button', 'picker-item' + (item.value === opts.selected ? ' selected' : ''));
      btn.type = 'button';

      const icWrap = el('div', 'picker-item-ic');
      icWrap.appendChild(svg(item.icon || 'i-folder'));
      btn.appendChild(icWrap);

      const body = el('div', 'picker-item-body');
      const titleEl = el('div', 'picker-item-title', item.label);
      titleEl.style.direction = item.dir || 'ltr';
      titleEl.style.textAlign = 'start';
      body.appendChild(titleEl);
      if (item.sub) {
        const sub = el('div', 'picker-item-sub', item.sub);
        body.appendChild(sub);
      }
      btn.appendChild(body);

      if (item.lock) {
        const lock = svg('i-lock');
        lock.style.color = 'var(--warn)';
        lock.style.width = '13px';
        lock.style.height = '13px';
        btn.appendChild(lock);
      }

      btn.addEventListener('click', () => {
        const cb = pickerCb;
        closeModal('pickerModal');
        pickerCb = null;
        if (cb) cb(item.value, item);
      });

      list.appendChild(btn);
    });

    openModal('pickerModal');
  }

  /* ═══ Folder Picker (Move / Copy) ═══ */
  const fpState = {
    mode: null, sourcePath: null, repoIdx: 0, path: [], repoFiles: [],
    allRepos: () => [], getToken: () => '', getActiveRepo: () => ({}), onDone: null,
  };

  function initFolderPicker(cfg) {
    fpState.allRepos = cfg.allRepos;
    fpState.getToken = cfg.getToken;
    fpState.getActiveRepo = cfg.getActiveRepo;
    fpState.onDone = cfg.onDone;
  }

  function fpBuildIndex(files) {
    const root = { name: '', path: '', dirs: new Map(), files: [] };
    files.forEach((f) => {
      const parts = f.path.split('/');
      let node = root;
      for (let i = 0; i < parts.length - 1; i++) {
        const seg = parts[i];
        const p = parts.slice(0, i + 1).join('/');
        if (!node.dirs.has(seg)) node.dirs.set(seg, { name: seg, path: p, dirs: new Map(), files: [] });
        node = node.dirs.get(seg);
      }
      node.files.push({ name: parts[parts.length - 1], path: f.path, size: f.size });
    });
    return root;
  }

  function fpNodeByPath(root, pathArr) {
    let node = root;
    for (const seg of pathArr) {
      if (!node.dirs.has(seg)) return null;
      node = node.dirs.get(seg);
    }
    return node;
  }

  async function fpLoadFiles() {
    const repos = fpState.allRepos();
    const r = repos[fpState.repoIdx];
    if (!r) return [];
    const token = fpState.getToken();
    const active = fpState.getActiveRepo();
    const branch = (r.owner === active.owner && r.name === active.name)
      ? active.branch : (r.default_branch || 'main');
    try {
      const { api } = window.Orbit;
      return await api.getTree(token, r.owner, r.name, branch);
    } catch (e) { return []; }
  }

  function fpRenderPath() {
    const wrap = $('#fpPath');
    if (!wrap) return;
    wrap.innerHTML = '';

    const root = el('span', 'fp-crumb');
    root.appendChild(svg('i-folder'));
    root.appendChild(el('span', null, i18n.tr('الجذر', 'Root')));
    root.addEventListener('click', () => { fpState.path = []; fpRenderContents(); });
    wrap.appendChild(root);

    fpState.path.forEach((seg, i) => {
      wrap.appendChild(el('span', 'fp-crumb-sep', '/'));
      const c = el('span', 'fp-crumb');
      c.appendChild(svg('i-folder'));
      c.appendChild(el('span', null, seg));
      c.addEventListener('click', () => {
        fpState.path = fpState.path.slice(0, i + 1);
        fpRenderContents();
      });
      wrap.appendChild(c);
    });
  }

  function fpRenderContents() {
    fpRenderPath();
    const wrap = $('#fpContents');
    if (!wrap) return;
    wrap.innerHTML = '';

    const root = fpBuildIndex(fpState.repoFiles);
    const node = fpNodeByPath(root, fpState.path);
    if (!node) {
      wrap.innerHTML = `<div class="fp-empty">${i18n.tr('لا يوجد محتوى', 'No content')}</div>`;
      return;
    }

    const dirs = Array.from(node.dirs.values()).sort((a, b) => a.name.localeCompare(b.name, 'en'));
    const files = node.files.slice().sort((a, b) => a.name.localeCompare(b.name, 'en'));

    if (dirs.length === 0 && files.length === 0) {
      wrap.innerHTML = `<div class="fp-empty">${i18n.tr('مجلد فارغ', 'Empty folder')}</div>`;
      return;
    }

    dirs.forEach((d) => {
      const item = el('div', 'fp-item folder');
      item.appendChild(svg('i-folder', 'folder'));
      item.appendChild(el('div', 'name', d.name));
      item.appendChild(el('div', 'size', String(d.files.length + d.dirs.size)));
      item.appendChild(svg('i-chevron-left', 'enter-ic'));
      item.addEventListener('click', () => { fpState.path.push(d.name); fpRenderContents(); });
      wrap.appendChild(item);
    });

    files.forEach((f) => {
      const item = el('div', 'fp-item file');
      item.appendChild(svg('i-file', 'file'));
      item.appendChild(el('div', 'name', f.name));
      if (f.size) item.appendChild(el('div', 'size', Utils.fmtBytes(f.size)));
      wrap.appendChild(item);
    });
  }

  async function openFolderPicker(mode, sourcePath) {
    fpState.mode = mode;
    fpState.sourcePath = sourcePath;
    fpState.path = [];
    const repos = fpState.allRepos();
    const active = fpState.getActiveRepo();
    const idx = repos.findIndex((r) => r.name === active.name && r.owner === active.owner);
    fpState.repoIdx = idx >= 0 ? idx : 0;

    $('#fpModeIcon').querySelector('use').setAttribute('href', mode === 'copy' ? '#i-copy' : '#i-move');
    $('#fpModeTitle').textContent =
      (mode === 'copy' ? i18n.tr('نسخ', 'Copy') : i18n.tr('نقل', 'Move')) +
      ' — ' + sourcePath.split('/').pop();
    $('#fpConfirmText').textContent = mode === 'copy' ? i18n.tr('نسخ هنا', 'Copy here') : i18n.tr('إفلات هنا', 'Drop here');
    $('#fpRepoText').textContent = repos[fpState.repoIdx] ? repos[fpState.repoIdx].full_name : '—';

    $('#fpContents').innerHTML = `<div class="busy"><div class="spinner"></div><span>${i18n.tr('جاري التحميل…', 'Loading…')}</span></div>`;
    openModal('folderPickerModal');

    const files = await fpLoadFiles();
    fpState.repoFiles = files;
    fpRenderContents();
  }

  function fpSelectRepo() {
    const repos = fpState.allRepos();
    if (!repos.length) { toast(i18n.tr('لا مستودعات', 'No repositories'), 'warn'); return; }
    const current = repos[fpState.repoIdx];
    openPicker({
      title: i18n.tr('اختر المستودع الهدف', 'Pick target repository'),
      icon: 'i-branch',
      selected: current ? current.full_name : '',
      items: repos.map((r) => ({
        value: r.full_name, label: r.full_name,
        icon: 'i-folder', lock: r.private,
      })),
      onSelect: async (fullName) => {
        const idx = repos.findIndex((x) => x.full_name === fullName);
        if (idx !== -1) {
          fpState.repoIdx = idx;
          $('#fpRepoText').textContent = repos[idx].full_name;
          fpState.path = [];
          $('#fpContents').innerHTML = `<div class="busy"><div class="spinner"></div><span>${i18n.tr('جاري التحميل…', 'Loading…')}</span></div>`;
          const files = await fpLoadFiles();
          fpState.repoFiles = files;
          fpRenderContents();
        }
      },
    });
  }

  async function fpConfirm() {
    const repos = fpState.allRepos();
    const targetRepo = repos[fpState.repoIdx];
    if (!targetRepo) { toast(i18n.tr('اختر مستودعًا', 'Pick a repo'), 'error'); return; }

    const fileName = fpState.sourcePath.split('/').pop();
    const targetPath = (fpState.path.length ? fpState.path.join('/') + '/' : '') + fileName;
    const token = fpState.getToken();
    const active = fpState.getActiveRepo();
    const srcOwner = active.owner, srcRepo = active.name, srcBranch = active.branch;

    if (srcOwner === targetRepo.owner && srcRepo === targetRepo.name && fpState.sourcePath === targetPath) {
      toast(i18n.tr('الملف بالفعل هنا', 'File already here'), 'warn');
      return;
    }

    const btn = $('#fpConfirmBtn');
    btn.disabled = true;
    const { api } = window.Orbit;

    try {
      const data = await api.getContent(token, srcOwner, srcRepo, fpState.sourcePath);
      if (!data.content) throw new Error(i18n.tr('لا يوجد محتوى', 'No content'));

      const targetBranch = (targetRepo.owner === active.owner && targetRepo.name === active.name)
        ? active.branch : (targetRepo.default_branch || 'main');

      await api.putContent(token, targetRepo.owner, targetRepo.name, targetPath, {
        message: (fpState.mode === 'copy' ? 'Copy ' : 'Move ') + fileName,
        content: data.content,
        branch: targetBranch,
      });

      if (fpState.mode === 'move') {
        await api.deleteContent(token, srcOwner, srcRepo, fpState.sourcePath, {
          message: 'Remove source: ' + fpState.sourcePath,
          sha: data.sha,
          branch: srcBranch,
        });
      }

      toast(fpState.mode === 'copy' ? i18n.tr('تم النسخ', 'Copied') : i18n.tr('تم النقل', 'Moved'), 'success');
      if (fpState.onDone) fpState.onDone();
      closeModal('folderPickerModal');
    } catch (e) {
      toast(e.message, 'error');
    }
    btn.disabled = false;
  }

  /* ═══ إعادة رسم كل المحتوى الديناميكي (يُستدعى عند تبديل اللغة) ═══ */
  function rerenderAll() {
    const R = window.Orbit.render;
    if (R) {
      try { if (R.refreshUploadUI) R.refreshUploadUI(); } catch (e) {}
      try { if (R.draftsList) R.draftsList(); } catch (e) {}
      try { if (R.prs) R.prs(); } catch (e) {}
      try { if (R.issues) R.issues(); } catch (e) {}
      try { if (R.releases) R.releases(); } catch (e) {}
      try { if (R.archiveList) R.archiveList(); } catch (e) {}
      try { if (R.renderRepoTree) R.renderRepoTree(); } catch (e) {}
    }
    const core = window.Orbit.core;
    if (core && core.rerenderLogs) {
      try { core.rerenderLogs(); } catch (e) {}
    }
  }

  /* ═══ Binds ═══ */
  function bind() {
    $$('[data-theme-choice]').forEach((b) => {
      b.addEventListener('click', () => {
        setTheme(b.dataset.themeChoice);
        toast(i18n.tr('تم تغيير المظهر', 'Theme changed'));
      });
    });

    $$('[data-lang-choice]').forEach((b) => {
      b.addEventListener('click', () => {
        const lang = b.dataset.langChoice;
        i18n.applyLang(lang);
        rerenderAll();
        toast(lang === 'ar' ? 'تم التحويل للعربية' : 'Switched to English');
      });
    });

    const sBtn = $('#settingsBtn');
    if (sBtn) sBtn.addEventListener('click', openDrawer);
    const sClose = $('#settingsCloseBtn');
    if (sClose) sClose.addEventListener('click', closeDrawer);
    const backdrop = $('#drawerBackdrop');
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    $$('.drawer-section-head').forEach((h) => {
      h.addEventListener('click', () => {
        const sec = h.parentElement;
        sec.classList.toggle('open', !sec.classList.contains('open'));
      });
    });

    ['pickerCloseBtn', 'pickerCancelBtn'].forEach((id) => {
      const b = document.getElementById(id);
      if (b) b.addEventListener('click', () => { closeModal('pickerModal'); pickerCb = null; });
    });
    const pModal = $('#pickerModal');
    if (pModal) {
      pModal.addEventListener('click', (e) => {
        if (e.target === pModal) { closeModal('pickerModal'); pickerCb = null; }
      });
    }

    const fpClose = $('#fpCloseBtn');
    const fpCancel = $('#fpCancelBtn');
    if (fpClose) fpClose.addEventListener('click', () => closeModal('folderPickerModal'));
    if (fpCancel) fpCancel.addEventListener('click', () => closeModal('folderPickerModal'));
    const fpModal = $('#folderPickerModal');
    if (fpModal) {
      fpModal.addEventListener('click', (e) => {
        if (e.target === fpModal) closeModal('folderPickerModal');
      });
    }
    const fpRepo = $('#fpRepoBtn');
    if (fpRepo) fpRepo.addEventListener('click', fpSelectRepo);
    const fpConfirmBtn = $('#fpConfirmBtn');
    if (fpConfirmBtn) fpConfirmBtn.addEventListener('click', fpConfirm);
  }

  function bindEscape() {
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const openModals = $$('.modal-bg.open');
      if (openModals.length > 0) {
        const top = openModals[openModals.length - 1];
        top.classList.remove('open');
        if ($$('.modal-bg.open').length === 0) {
          document.body.classList.remove('modal-open');
          unlockModalHeight();
        }
        return;
      }
      const drawer = $('#settingsDrawer');
      if (drawer && drawer.classList.contains('open')) closeDrawer();
    });
  }

  window.Orbit = window.Orbit || {};
  window.Orbit.ui = {
    $, $$, el, svg,
    toast, setTheme,
    openDrawer, closeDrawer,
    openModal, closeModal,
    openPicker,
    initFolderPicker, openFolderPicker,
    bind, bindEscape,
    lockModalHeight, unlockModalHeight,
  };
})();