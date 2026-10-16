/* Orbit — App bootstrap + events */
(function () {
  'use strict';
  const { api, ui, i18n } = window.Orbit;
  const {
    Utils, KEY, Storage, STORAGE,
    validateToken, rateLimit, listUserRepos, createRepo,
    listPRs, createPR, listIssues, createIssue, listReleases, createRelease,
  } = api;
  const { el, svg, toast, openModal, closeModal, openPicker, setTheme, openDrawer, closeDrawer } = ui;
  const { state, core, render, actions } = window.Orbit;
  const { activeRepo, setHeaderBadge, addLog, addToArchive, updateRepoToolsVisibility, getToken, updatePathPreview } = core;
  const { tr, trp } = i18n;

  /* ═══════════════════════════════════════════════
     TABS
     ═══════════════════════════════════════════════ */
  function switchTab(name) {
    state.currentTab = name;
    document.querySelectorAll('#tabsNav .tab').forEach((t) =>
      t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('.panel').forEach((p) =>
      p.classList.toggle('active', p.dataset.panel === name));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  document.querySelectorAll('#tabsNav .tab').forEach((t) => {
    t.addEventListener('click', () => switchTab(t.dataset.tab));
  });
  window.Orbit.switchTab = switchTab;

  /* ═══════════════════════════════════════════════
     BACK NAVIGATION
     ═══════════════════════════════════════════════ */
  (function installBackNavigation() {
    const HOME_TAB = 'setup';
    const baseUrl = location.href.split('#')[0];
    const BUFFER_STATE = { orbit: true, level: 1 };

    try { history.replaceState({ orbit: true, level: 0 }, '', baseUrl); } catch (e) {}
    try { history.pushState(BUFFER_STATE, '', baseUrl); } catch (e) {}

    function handleBack() {
      const openModals = document.querySelectorAll('.modal-bg.open');
      if (openModals.length > 0) {
        const top = openModals[openModals.length - 1];
        top.classList.remove('open');
        if (document.querySelectorAll('.modal-bg.open').length === 0) {
          document.body.classList.remove('modal-open');
        }
        return true;
      }
      const drawer = document.getElementById('settingsDrawer');
      if (drawer && drawer.classList.contains('open')) { ui.closeDrawer(); return true; }
      if (state.currentTab !== HOME_TAB) { window.Orbit.switchTab(HOME_TAB); return true; }
      return false;
    }

    window.addEventListener('popstate', () => {
      const handled = handleBack();
      if (handled) {
        try { history.pushState(BUFFER_STATE, '', baseUrl); } catch (e) {}
      }
    });
  })();

  /* ═══════════════════════════════════════════════
     TOKEN
     ═══════════════════════════════════════════════ */
  document.getElementById('toggleTokenBtn').addEventListener('click', () => {
    const inp = document.getElementById('tokenInput');
    const isPass = inp.type === 'password';
    inp.type = isPass ? 'text' : 'password';
    const use = document.getElementById('toggleTokenBtn').querySelector('use');
    if (use) use.setAttribute('href', isPass ? '#i-eye-off' : '#i-eye');
  });

  document.getElementById('rememberToken').addEventListener('change', () => {
    const on = document.getElementById('rememberToken').checked;
    document.getElementById('rememberRow').classList.toggle('warn-active', on);
    document.getElementById('rememberWarning').classList.toggle('hidden', !on);
  });

  document.getElementById('clearSavedTokenBtn').addEventListener('click', () => {
    if (!confirm(tr('مسح التوكن المحفوظ؟', 'Clear saved token?'))) return;
    KEY.clearToken();
    document.getElementById('savedBanner').classList.remove('show');
    toast('✓ ' + trp('toast.tokenCleared'), 'success');
  });

  document.getElementById('tokenInput').addEventListener('input', () => {
    document.getElementById('tokenField').classList.remove('valid', 'invalid');
    document.getElementById('tokenScopes').innerHTML = '';
    if (state.owner) {
      state.owner = null;
      state.login = null;
      document.getElementById('ownerPrefixCreate').textContent = 'owner /';
    }
    document.getElementById('rateBadge').classList.add('hidden');
    updateRepoToolsVisibility();
  });

  function showSavedBanner() {
    const s = KEY.loadToken();
    if (!s) { document.getElementById('savedBanner').classList.remove('show'); return; }
    document.getElementById('savedBanner').classList.add('show');
    document.getElementById('savedBannerText').textContent =
      tr('ينتهي بعد', 'expires in') + ' ' + KEY.formatRemaining(s.expires);
  }

  function renderScopes(scopes) {
    const wrap = document.getElementById('tokenScopes');
    wrap.innerHTML = '';
    if (scopes === null) {
      wrap.appendChild(el('span', 'scope-pill', 'fine-grained'));
      return;
    }
    if (!scopes) return;
    scopes.split(',').map((s) => s.trim()).filter(Boolean).forEach((s) => {
      const p = el('span', 'scope-pill');
      if (s === 'repo' || s === 'public_repo') p.classList.add('ok');
      p.textContent = s;
      wrap.appendChild(p);
    });
  }

  document.getElementById('checkTokenBtn').addEventListener('click', () => {
    const token = document.getElementById('tokenInput').value.trim();
    if (!token) {
      toast(trp('toast.enterToken'), 'warn');
      document.getElementById('tokenInput').focus();
      return;
    }
    const btn = document.getElementById('checkTokenBtn');
    btn.disabled = true;
    setHeaderBadge(tr('جاري التحقق…', 'Verifying…'), 'warn');
    document.getElementById('tokenField').classList.remove('valid', 'invalid');
    const t0 = performance.now();

    validateToken(token)
      .then((r) => {
        state.owner = r.user.login;
        state.login = r.user.login;
        state.scopes = r.scopes;
        document.getElementById('ownerPrefixCreate').textContent = r.user.login + ' /';
        document.getElementById('tokenField').classList.add('valid');
        renderScopes(r.scopes);
        addLog(() => '✓✓ ' + tr('التوكن صالح', 'Token valid') + ' — ' + r.user.login, 'success');
        setHeaderBadge(tr('صالح', 'Valid') + ' · ' + r.user.login, 'ok');
        addToArchive({
          type: 'validate', title: tr('التحقق من التوكن', 'Token verification'), status: 'ok', owner: r.user.login,
          details: { user: r.user.login, scopes: r.scopes || '(fine-grained)' },
          duration: ((performance.now() - t0) / 1000).toFixed(2),
        });
        if (document.getElementById('rememberToken').checked && KEY.saveToken(token)) {
          addLog(() => tr('تم حفظ التوكن لمدة 30 يوم', 'Token saved for 30 days'), 'success');
          showSavedBanner();
        }
        return rateLimit(token).then(() => r.user.login);
      })
      .then((login) => loadAllRepos(token, login))
      .then(() => {
        updateRepoToolsVisibility();
        toast('✓ ' + trp('toast.reposLoaded'), 'success');
      })
      .catch((e) => {
        document.getElementById('tokenField').classList.add('invalid');
        document.getElementById('tokenScopes').innerHTML = '';
        addLog(e.message, 'error');
        setHeaderBadge(e.message, 'err');
      })
      .then(() => { btn.disabled = false; });
  });

  /* ═══════════════════════════════════════════════
     REPOS
     ═══════════════════════════════════════════════ */
  function loadAllRepos(token, login) {
    addLog(() => tr('جاري تحميل المستودعات…', 'Loading repositories…'), 'info');
    return listUserRepos(token).then((list) => {
      state.repos = list;
      state.login = login;
      KEY.repos.save(login, list);
      addLog(() => '✓✓ ' + tr('تم تحميل', 'Loaded') + ' ' + list.length + ' ' + tr('مستودع', 'repos'), 'success');
      renderRepoPicker();
      return list;
    });
  }

  function renderRepoPicker() {
    if (state.repos.length === 0) {
      document.getElementById('repoPickerText').textContent = tr('— لا توجد مستودعات —', '— No repositories —');
      document.getElementById('repoMetaHint').textContent = tr('لا يوجد أي مستودع — أنشئ واحدًا.', 'No repositories — create one.');
      return;
    }
    const saved = Storage.get(STORAGE.activeRepo);
    let idx = state.repos.findIndex((r) => r.full_name === saved);
    if (idx === -1) idx = 0;
    applyActiveRepo(idx, true);
  }

  function applyActiveRepo(idx, silent) {
    const r = state.repos[idx];
    if (!r) return;
    state.activeRepoIdx = idx;
    state.owner = r.owner;
    state.branch = r.default_branch || 'main';
    document.getElementById('ownerPrefixCreate').textContent = r.owner + ' /';
    Storage.set(STORAGE.activeRepo, r.full_name);
    document.getElementById('repoPickerText').textContent = r.full_name + (r.private ? ' ' + tr('(خاص)', '(private)') : '');
    document.getElementById('repoMetaHint').textContent =
      (r.private ? trp('stats.private') : trp('stats.public')) + ' · ' + tr('فرع:', 'branch:') + ' ' + state.branch +
      (r.description ? ' · ' + r.description : '');
    document.getElementById('branchPickerText').textContent = state.branch;
    document.getElementById('activeRepoChipText').textContent = r.full_name + ' · ' + state.branch;
    if (!silent) addLog(() => tr('المستودع النشط:', 'Active repo:') + ' ' + r.full_name, 'info');
    updateRepoToolsVisibility();
  }

  document.getElementById('repoPickerBtn').addEventListener('click', () => {
    if (state.repos.length === 0) { toast(trp('ui.noRepos'), 'warn'); return; }
    const cur = state.repos[state.activeRepoIdx];
    openPicker({
      title: tr('اختر مستودعًا', 'Pick a repo'), icon: 'i-branch',
      selected: cur ? cur.full_name : '',
      items: state.repos.map((r) => ({
        value: r.full_name, label: r.full_name,
        icon: 'i-folder', sub: r.description || '', lock: r.private,
      })),
      onSelect: (fullName) => {
        const i = state.repos.findIndex((x) => x.full_name === fullName);
        if (i !== -1) applyActiveRepo(i, false);
      },
    });
  });

  document.getElementById('refreshReposBtn').addEventListener('click', () => {
    const token = getToken();
    if (!token || !document.getElementById('tokenField').classList.contains('valid')) {
      toast(trp('toast.verifyFirst'), 'warn');
      return;
    }
    loadAllRepos(token, state.login).catch((e) => {
      addLog(e.message, 'error');
      toast(e.message, 'error');
    });
  });

  document.getElementById('newRepoBtn').addEventListener('click', () => {
    if (!state.owner || !getToken()) { toast(trp('toast.verifyFirst'), 'warn'); return; }
    document.getElementById('newRepoNameInput2').value = '';
    document.getElementById('newRepoPrivateCb').checked = true;
    openModal('newRepoModal');
    setTimeout(() => document.getElementById('newRepoNameInput2').focus(), 150);
  });
  document.getElementById('newRepoCloseBtn').addEventListener('click', () => closeModal('newRepoModal'));
  document.getElementById('newRepoCancelBtn').addEventListener('click', () => closeModal('newRepoModal'));
  document.getElementById('newRepoCreateBtn').addEventListener('click', () => {
    const name = document.getElementById('newRepoNameInput2').value.trim();
    if (!name) { toast(trp('toast.enterRepoName'), 'error'); return; }
    if (!/^[A-Za-z0-9._-]{1,100}$/.test(name)) { toast(trp('toast.invalidName'), 'error'); return; }
    const token = getToken();
    const btn = document.getElementById('newRepoCreateBtn');
    btn.disabled = true;
    createRepo(token, name, document.getElementById('newRepoPrivateCb').checked)
      .then((repo) => {
        addLog(() => '✓✓ ' + tr('تم الإنشاء:', 'Created:') + ' ' + repo.full_name, 'success');
        toast('✓ ' + trp('toast.repoCreated'), 'success');
        addToArchive({
          type: 'create', title: tr('مستودع جديد', 'New repository'), status: 'ok',
          owner: repo.owner.login, repo: repo.name,
          details: { full_name: repo.full_name },
        });
        closeModal('newRepoModal');
        return loadAllRepos(token, repo.owner.login).then(() => {
          const i = state.repos.findIndex((r) => r.full_name === repo.full_name);
          if (i !== -1) applyActiveRepo(i, true);
        });
      })
      .catch((e) => { addLog(e.message, 'error'); toast(e.message, 'error'); })
      .then(() => { btn.disabled = false; });
  });

  /* ═══════════════════════════════════════════════
     PRs
     ═══════════════════════════════════════════════ */
  document.getElementById('loadPRsBtn').addEventListener('click', actions.loadPRsList);
  document.getElementById('prStateBtn').addEventListener('click', () => {
    const opts = [
      { value: 'open', label: trp('pulls.open') },
      { value: 'closed', label: trp('pulls.closed') },
      { value: 'all', label: trp('pulls.all') },
    ];
    openPicker({
      title: tr('حالة الطلبات', 'PR state'), icon: 'i-filter',
      selected: state.prState || 'open',
      items: opts.map((o) => ({ value: o.value, label: o.label, icon: 'i-pr' })),
      onSelect: (v) => {
        state.prState = v;
        const o = opts.find((x) => x.value === v);
        document.getElementById('prStateText').textContent = o ? o.label : v;
        actions.loadPRsList();
      },
    });
  });

  document.getElementById('newPRBtn').addEventListener('click', () => {
    if (!activeRepo() || !getToken()) { toast(trp('toast.pickRepoShort'), 'warn'); return; }
    document.getElementById('prTitle').value = '';
    document.getElementById('prBody').value = '';
    const names = state.branches.map((b) => b.name);
    if (names.length === 0) names.push(state.branch || 'main');
    state._prHead = names[0];
    state._prBase = state.branch || names[0];
    document.getElementById('prHeadText').textContent = state._prHead;
    document.getElementById('prBaseText').textContent = state._prBase;
    if (!state.branches.length) actions.loadBranches();
    openModal('newPRModal');
  });
  document.getElementById('prHeadBtn').addEventListener('click', () => {
    const names = state.branches.map((b) => b.name);
    if (names.length === 0) names.push(state.branch || 'main');
    openPicker({
      title: tr('من فرع', 'Head branch'), icon: 'i-branch', selected: state._prHead,
      items: names.map((n) => ({ value: n, label: n, icon: 'i-branch' })),
      onSelect: (v) => { state._prHead = v; document.getElementById('prHeadText').textContent = v; },
    });
  });
  document.getElementById('prBaseBtn').addEventListener('click', () => {
    const names = state.branches.map((b) => b.name);
    if (names.length === 0) names.push(state.branch || 'main');
    openPicker({
      title: tr('إلى فرع', 'Base branch'), icon: 'i-branch', selected: state._prBase,
      items: names.map((n) => ({ value: n, label: n, icon: 'i-branch' })),
      onSelect: (v) => { state._prBase = v; document.getElementById('prBaseText').textContent = v; },
    });
  });
  document.getElementById('newPRCloseBtn').addEventListener('click', () => closeModal('newPRModal'));
  document.getElementById('newPRCancelBtn').addEventListener('click', () => closeModal('newPRModal'));
  document.getElementById('newPRCreateBtn').addEventListener('click', () => {
    const title = document.getElementById('prTitle').value.trim();
    if (!title) { toast(trp('toast.writeTitle'), 'error'); return; }
    if (state._prHead === state._prBase) { toast(trp('toast.branchesMustDiffer'), 'error'); return; }
    const repo = activeRepo();
    const token = getToken();
    const btn = document.getElementById('newPRCreateBtn');
    btn.disabled = true;
    createPR(token, repo.owner, repo.name, {
      title, body: document.getElementById('prBody').value,
      head: state._prHead, base: state._prBase,
    })
      .then((pr) => {
        addLog(() => '✓✓ ' + trp('log.prCreated', { n: pr.number }), 'success');
        toast('✓ ' + trp('toast.prCreated'), 'success');
        addToArchive({
          type: 'pr', title: trp('archive.prTitle', { n: pr.number }), status: 'ok',
          owner: repo.owner, repo: repo.name,
          details: { number: pr.number },
        });
        closeModal('newPRModal');
        actions.loadPRsList();
      })
      .catch((e) => { addLog(e.message, 'error'); toast(e.message, 'error'); })
      .then(() => { btn.disabled = false; });
  });

  /* ═══════════════════════════════════════════════
     ISSUES
     ═══════════════════════════════════════════════ */
  document.getElementById('loadIssuesBtn').addEventListener('click', actions.loadIssuesList);
  document.getElementById('issueStateBtn').addEventListener('click', () => {
    const opts = [
      { value: 'open', label: trp('pulls.open') },
      { value: 'closed', label: trp('pulls.closed') },
      { value: 'all', label: trp('pulls.all') },
    ];
    openPicker({
      title: tr('حالة البلاغات', 'Issue state'), icon: 'i-filter',
      selected: state.issueState || 'open',
      items: opts.map((o) => ({ value: o.value, label: o.label, icon: 'i-issue' })),
      onSelect: (v) => {
        state.issueState = v;
        const o = opts.find((x) => x.value === v);
        document.getElementById('issueStateText').textContent = o ? o.label : v;
        actions.loadIssuesList();
      },
    });
  });
  document.getElementById('newIssueBtn').addEventListener('click', () => {
    document.getElementById('issueTitle').value = '';
    document.getElementById('issueBody').value = '';
    document.getElementById('issueLabels').value = '';
    openModal('newIssueModal');
  });
  document.getElementById('newIssueCloseBtn').addEventListener('click', () => closeModal('newIssueModal'));
  document.getElementById('newIssueCancelBtn').addEventListener('click', () => closeModal('newIssueModal'));
  document.getElementById('newIssueCreateBtn').addEventListener('click', () => {
    const title = document.getElementById('issueTitle').value.trim();
    if (!title) { toast(trp('toast.writeTitle'), 'error'); return; }
    const labels = document.getElementById('issueLabels').value.split(',').map((s) => s.trim()).filter(Boolean);
    const repo = activeRepo();
    const token = getToken();
    const btn = document.getElementById('newIssueCreateBtn');
    btn.disabled = true;
    createIssue(token, repo.owner, repo.name, {
      title, body: document.getElementById('issueBody').value, labels,
    })
      .then((iss) => {
        addLog(() => '✓✓ ' + trp('log.issueCreated', { n: iss.number }), 'success');
        toast('✓ ' + trp('toast.prCreated'), 'success');
        addToArchive({
          type: 'issue', title: trp('archive.issueTitle', { n: iss.number }), status: 'ok',
          owner: repo.owner, repo: repo.name,
          details: { number: iss.number },
        });
        closeModal('newIssueModal');
        actions.loadIssuesList();
      })
      .catch((e) => { addLog(e.message, 'error'); toast(e.message, 'error'); })
      .then(() => { btn.disabled = false; });
  });

  /* ═══════════════════════════════════════════════
     RELEASES
     ═══════════════════════════════════════════════ */
  document.getElementById('loadReleasesBtn').addEventListener('click', actions.loadReleasesList);
  document.getElementById('newReleaseBtn').addEventListener('click', () => {
    document.getElementById('releaseTag').value = '';
    document.getElementById('releaseName').value = '';
    document.getElementById('releaseBody').value = '';
    document.getElementById('releasePrerelease').checked = false;
    document.getElementById('releaseDraft').checked = false;
    openModal('newReleaseModal');
  });
  document.getElementById('newReleaseCloseBtn').addEventListener('click', () => closeModal('newReleaseModal'));
  document.getElementById('newReleaseCancelBtn').addEventListener('click', () => closeModal('newReleaseModal'));
  document.getElementById('newReleaseCreateBtn').addEventListener('click', () => {
    const tag = document.getElementById('releaseTag').value.trim();
    if (!tag) { toast(trp('toast.writeTag'), 'error'); return; }
    const repo = activeRepo();
    const token = getToken();
    const btn = document.getElementById('newReleaseCreateBtn');
    btn.disabled = true;
    createRelease(token, repo.owner, repo.name, {
      tag_name: tag,
      name: document.getElementById('releaseName').value.trim() || tag,
      body: document.getElementById('releaseBody').value,
      draft: document.getElementById('releaseDraft').checked,
      prerelease: document.getElementById('releasePrerelease').checked,
      target_commitish: state.branch,
    })
      .then((rel) => {
        addLog(() => '✓✓ ' + trp('log.releaseCreated', { tag: rel.tag_name }), 'success');
        toast('✓ ' + trp('toast.prCreated'), 'success');
        addToArchive({
          type: 'release', title: trp('archive.releaseTitle', { tag: rel.tag_name }), status: 'ok',
          owner: repo.owner, repo: repo.name,
          details: { tag: rel.tag_name },
        });
        closeModal('newReleaseModal');
        actions.loadReleasesList();
      })
      .catch((e) => { addLog(e.message, 'error'); toast(e.message, 'error'); })
      .then(() => { btn.disabled = false; });
  });

  /* ═══════════════════════════════════════════════
     STATS + README
     ═══════════════════════════════════════════════ */
  document.getElementById('loadStatsBtn').addEventListener('click', actions.loadStats);

  (function addReadmeBtn() {
    const target = document.querySelector('[data-panel="remote"] .panel-head .btn-group');
    if (!target) return;
    const btn = el('button', 'btn btn-default btn-sm');
    btn.type = 'button';
    btn.id = 'generateReadmeBtn';
    btn.appendChild(svg('i-book'));
    btn.appendChild(el('span', null, tr('توليد README', 'Generate README')));
    btn.addEventListener('click', actions.generateREADME);
    target.appendChild(btn);
  })();

  /* ═══════════════════════════════════════════════
     LOGS
     ═══════════════════════════════════════════════ */
  document.getElementById('clearLogsBtn').addEventListener('click', () => {
    document.getElementById('log').innerHTML = '';
    state.logs = [];
    addLog(() => trp('log.logsCleared'), 'info');
  });
  document.getElementById('downloadLogsBtn').addEventListener('click', () => {
    const lines = state.logs.map((l) => {
      let msg = l.message;
      if (typeof msg === 'function') { try { msg = msg(); } catch (e) { msg = ''; } }
      else if (msg && typeof msg === 'object' && msg.ar !== undefined) {
        msg = i18n.getLang() === 'en' ? (msg.en || msg.ar) : msg.ar;
      }
      return `[${l.time}] [${l.level.toUpperCase()}] ${msg}`;
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orbit-log-' + Date.now() + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  /* ═══════════════════════════════════════════════
     WEBHOOK
     ═══════════════════════════════════════════════ */
  function loadWebhook() {
    const w = KEY.webhook.load();
    document.getElementById('webhookEnabled').checked = !!w.enabled;
    document.getElementById('webhookDiscord').value = w.discord || '';
    document.getElementById('webhookTelegram').value = w.telegram || '';
  }
  document.getElementById('saveWebhookBtn').addEventListener('click', () => {
    KEY.webhook.save({
      enabled: document.getElementById('webhookEnabled').checked,
      discord: document.getElementById('webhookDiscord').value.trim(),
      telegram: document.getElementById('webhookTelegram').value.trim(),
    });
    toast('✓ ' + trp('toast.saved'), 'success');
  });

  /* ═══════════════════════════════════════════════
     PATH PREVIEW
     ═══════════════════════════════════════════════ */
  document.getElementById('pathPrefix').addEventListener('input', updatePathPreview);
  document.getElementById('optKeepRoot').addEventListener('change', updatePathPreview);

  /* ═══════════════════════════════════════════════
     KEYBOARD SHORTCUTS
     ═══════════════════════════════════════════════ */
  document.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (e.key === 'Escape') return;
    if (mod && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const d = document.getElementById('settingsDrawer');
      if (d.classList.contains('open')) closeDrawer();
      else openDrawer();
      return;
    }
    if (mod && e.key === 'Enter') {
      e.preventDefault();
      if (state.currentTab === 'upload' && !document.getElementById('uploadBtn').disabled) {
        document.getElementById('uploadBtn').click();
      }
      return;
    }
    if (mod && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (document.getElementById('editorModal').classList.contains('open')
          && !document.getElementById('editorSaveBtn').disabled) {
        actions.saveEditor();
      }
      return;
    }
    if (e.altKey && /^[1-9]$/.test(e.key)) {
      e.preventDefault();
      const tabs = document.querySelectorAll('#tabsNav .tab');
      const idx = parseInt(e.key, 10) - 1;
      if (tabs[idx]) switchTab(tabs[idx].dataset.tab);
    }
  });

  /* ═══════════════════════════════════════════════
     OFFLINE
     ═══════════════════════════════════════════════ */
  function updateOnlineStatus() {
    const b = document.getElementById('offlineBanner');
    if (navigator.onLine) b.classList.remove('show');
    else b.classList.add('show');
  }
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  /* ═══════════════════════════════════════════════
     PWA
     ═══════════════════════════════════════════════ */
  if ('serviceWorker' in navigator) {
    try {
      const swCode = "self.addEventListener('install',e=>self.skipWaiting());" +
        "self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));" +
        "self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;" +
        "e.respondWith(caches.open('orbit-v3').then(c=>c.match(e.request).then(r=>r||" +
        "fetch(e.request).then(res=>{try{c.put(e.request,res.clone())}catch(x){}return res}).catch(()=>c.match(e.request)))))});";
      const blob = new Blob([swCode], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      navigator.serviceWorker.register(url, { scope: './' }).catch(() => {});
    } catch (e) {}
  }

  /* ═══════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════ */
  function init() {
    ui.bind();
    ui.bindEscape();

    const savedTheme = Storage.get(STORAGE.theme) || 'dark';
    setTheme(savedTheme);

    const savedLang = Storage.get(STORAGE.lang) || 'ar';
    i18n.applyLang(savedLang);

    state.archive = KEY.archive.load();
    render.archiveList();

    actions.loadDrafts();
    loadWebhook();

    const stored = KEY.loadToken();
    if (stored) {
      document.getElementById('tokenInput').value = stored.token;
      document.getElementById('rememberToken').checked = true;
      document.getElementById('rememberRow').classList.add('warn-active');
      document.getElementById('rememberWarning').classList.remove('hidden');
      showSavedBanner();
      addLog(() => tr('تم استرجاع التوكن', 'Token restored') + ' — ' + tr('ينتهي بعد', 'expires in') + ' ' + KEY.formatRemaining(stored.expires), 'success');
      setTimeout(() => document.getElementById('checkTokenBtn').click(), 500);
    }

    addLog(() => tr('مرحبًا بك في Orbit v3.0.4', 'Welcome to Orbit v3.0.4'), 'info');
    updatePathPreview();
    actions.resetProgress();
    render.refreshUploadUI();
    updateRepoToolsVisibility();
    actions.renderPathChips();

    document.getElementById('footerStatus').textContent = trp('status.ready');
    setHeaderBadge(trp('badge.ready'), null);

    window.__orbitState = state;
  }

  init();
})();