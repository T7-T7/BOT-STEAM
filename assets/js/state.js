/* Orbit — State + shared helpers */
(function () {
  'use strict';
  const { api, ui, i18n } = window.Orbit;
  const { Utils, KEY, Storage, STORAGE } = api;
  const { el, svg } = ui;
  const { tr, trp } = i18n;

  const state = {
    owner: null, login: null, scopes: null,
    repos: [], activeRepoIdx: 0,
    branch: 'main', branches: [],
    files: [], fileMap: new Map(), dirRegistry: [],
    repoFiles: [],
    prs: [], issues: [], releases: [], drafts: [],
    archive: [], logs: [],
    uploading: false, currentTab: 'setup',
    editingPath: null, pathSegments: [],
    currentPR: null, currentIssue: null,
    currentArchiveEntryId: null,
    _prHead: null, _prBase: null,
    _newBranchFrom: null, _currentDraftId: null,
    _cmResolved: null, _previewUrl: null,
  };

  const activeRepo = () => state.repos[state.activeRepoIdx] || null;

  const setHeaderBadge = (text, type) => {
    document.getElementById('headerBadgeText').textContent = text;
    const b = document.getElementById('headerBadge');
    b.classList.remove('ok', 'warn', 'err');
    if (type) b.classList.add(type);
  };

  const updateRate = (rate) => {
    const r = document.getElementById('rateBadge');
    if (!r || !rate || !rate.limit) return;
    r.classList.remove('hidden');
    document.getElementById('rateRemaining').textContent = rate.remaining;
    document.getElementById('rateLimit').textContent = rate.limit;
    r.classList.remove('ok', 'warn', 'err');
    if (rate.remaining < 10) r.classList.add('err');
    else if (rate.remaining < rate.limit * 0.2) r.classList.add('warn');
    else r.classList.add('ok');
  };

  /* ═══ Logging — يدعم النصوص القابلة لإعادة الترجمة ═══ */
  const LOG_ICONS = {
    info: 'i-info', success: 'i-check-circle', warn: 'i-alert',
    error: 'i-x-circle', debug: 'i-commit',
  };

  function resolveLogMessage(msg) {
    if (typeof msg === 'function') {
      try { return msg(); } catch (e) { return ''; }
    }
    if (msg && typeof msg === 'object' && msg.ar !== undefined) {
      const lang = (i18n.getLang && i18n.getLang()) || 'ar';
      return lang === 'en' ? (msg.en || msg.ar) : msg.ar;
    }
    return msg;
  }

  function buildLogRow(entry) {
    const row = el('div', 'log-row log-' + entry.level);
    row.appendChild(el('span', 'log-time', entry.time));
    row.appendChild(svg(LOG_ICONS[entry.level] || 'i-info', 'log-ic'));
    row.appendChild(el('span', 'log-msg', resolveLogMessage(entry.message)));
    return row;
  }

  const addLog = (msg, level = 'info') => {
    const d = new Date();
    const time = [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map((n) => String(n).padStart(2, '0')).join(':');
    const log = document.getElementById('log');
    if (!log) return;
    const entry = { time, level, message: msg };
    log.appendChild(buildLogRow(entry));
    log.scrollTop = log.scrollHeight;
    state.logs.push(entry);
  };

  const rerenderLogs = () => {
    const log = document.getElementById('log');
    if (!log) return;
    log.innerHTML = '';
    state.logs.forEach((entry) => log.appendChild(buildLogRow(entry)));
    log.scrollTop = log.scrollHeight;
  };

  const addToArchive = (entry) => {
    const full = {
      id: 'op_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      ts: Date.now(),
      type: entry.type || 'info',
      title: entry.title || trp('archive.op'),
      status: entry.status || 'ok',
      repo: entry.repo || (activeRepo() ? activeRepo().name : null),
      owner: entry.owner || state.owner,
      branch: entry.branch || state.branch,
      files: entry.files || [],
      details: entry.details || {},
      commitSha: entry.commitSha || null,
      duration: entry.duration || null,
    };
    state.archive.unshift(full);
    KEY.archive.save(state.archive);
    if (window.Orbit.render) window.Orbit.render.archiveList();
    return full;
  };

  const archiveIconFor = (type) => {
    const m = {
      upload: 'i-upload', edit: 'i-edit', delete: 'i-trash', create: 'i-plus',
      validate: 'i-check', error: 'i-x-circle', pr: 'i-pr', issue: 'i-issue',
      release: 'i-tag', branch: 'i-branch', template: 'i-gift',
      draft: 'i-bookmark', readme: 'i-book', move: 'i-move', copy: 'i-copy',
    };
    return m[type] || 'i-info';
  };

  const fmtArchiveTime = (ts) => {
    const d = new Date(ts), today = new Date();
    const p = (n) => String(n).padStart(2, '0');
    const t = `${p(d.getHours())}:${p(d.getMinutes())}`;
    if (d.toDateString() === today.toDateString()) return t;
    return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${t}`;
  };

  const updateRepoToolsVisibility = () => {
    const inp = document.getElementById('tokenInput');
    const field = document.getElementById('tokenField');
    const hasToken = !!(inp && inp.value.trim()) && field.classList.contains('valid');
    const hasRepo = !!activeRepo();
    const lb = document.getElementById('loadRepoBtn');
    const nf = document.getElementById('newFileBtn');
    if (lb) lb.disabled = !(hasToken && hasRepo);
    if (nf) nf.disabled = !(hasToken && hasRepo);
  };

  const getToken = () => document.getElementById('tokenInput').value.trim();

  const getCurrentPrefix = () => {
    const inp = document.getElementById('pathPrefix');
    const raw = inp ? inp.value.trim() : '';
    if (!raw) return '';
    let p = raw.replace(/^[\/\\]+|[\/\\]+$/g, '');
    const parts = p.split(/[\/\\]+/).filter(Boolean);
    const repoName = activeRepo() ? activeRepo().name : '';
    if (repoName && parts.length) {
      const f = parts[0].toLowerCase().replace(/[\s\-_]/g, '');
      const r = repoName.toLowerCase().replace(/[\s\-_]/g, '');
      if (f && r && f === r) parts.shift();
    }
    return parts.join('/');
  };

  const updatePathPreview = () => {
    const prefix = getCurrentPrefix();
    const target = document.getElementById('pathPreviewValue');
    if (!target) return;
    if (state.files.length > 0) target.textContent = state.files[0].path;
    else target.textContent = (prefix ? prefix + '/' : '') + 'file.html';
  };

  window.Orbit.state = state;
  window.Orbit.core = {
    activeRepo, setHeaderBadge, updateRate, addLog, addToArchive,
    archiveIconFor, fmtArchiveTime, updateRepoToolsVisibility,
    getToken, getCurrentPrefix, updatePathPreview,
    rerenderLogs,
  };
})();