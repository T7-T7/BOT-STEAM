/* Orbit API — GitHub + storage + helpers */
(function () {
  'use strict';

  const GH_API = 'https://api.github.com';
  const API_VERSION = '2022-11-28';
  const CONCURRENCY = 4;
  const TOKEN_TTL_DAYS = 30;
  const ARCHIVE_MAX = 200;

  const STORAGE = {
    token: 'orbit_token_v3',
    archive: 'orbit_archive_v3',
    theme: 'orbit_theme_v3',
    lang: 'orbit_lang_v3',
    activeRepo: 'orbit_active_repo_v3',
    reposKey: 'orbit_repos_key_v3',
    drafts: 'orbit_drafts_v3',
    webhook: 'orbit_webhook_v3',
    lastFolder: 'orbit_last_folder_v3',
  };

  const SKIP_DIRS = {
    '.git': 1, node_modules: 1, '.vscode': 1, '.idea': 1,
    dist: 1, build: 1, '.cache': 1, __pycache__: 1, '.next': 1, '.nuxt': 1,
  };
  const SKIP_FILES = { '.ds_store': 1, 'thumbs.db': 1, 'desktop.ini': 1 };

  const EXT_TO_LANG = {
    html: 'HTML', htm: 'HTML', xhtml: 'HTML',
    css: 'CSS', scss: 'CSS', sass: 'CSS', less: 'CSS',
    js: 'JS', mjs: 'JS', cjs: 'JS', jsx: 'JSX',
    ts: 'TS', mts: 'TS', cts: 'TS', tsx: 'TSX',
    json: 'JSON', jsonc: 'JSON',
    md: 'MD', markdown: 'MD',
    svg: 'SVG', xml: 'XML',
    yml: 'YAML', yaml: 'YAML',
    txt: 'TXT', log: 'TXT',
  };

  /* ─── Utils ─── */
  const Utils = {
    esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
      }[c]));
    },
    fmtBytes(b) {
      if (!b) return '0 B';
      const u = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(b) / Math.log(1024));
      const v = b / Math.pow(1024, i);
      return `${i === 0 ? v : v.toFixed(v >= 10 ? 1 : 2)} ${u[i]}`;
    },
    bufToBase64(buf) {
      const bytes = new Uint8Array(buf), CH = 0x8000;
      let bin = '';
      for (let i = 0; i < bytes.length; i += CH) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
      }
      return btoa(bin);
    },
    base64ToText(b64) {
      try {
        const bin = atob(b64.replace(/\n/g, ''));
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new TextDecoder('utf-8').decode(bytes);
      } catch (e) { return ''; }
    },
    textToBase64(str) {
      const bytes = new TextEncoder().encode(str);
      let bin = '';
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      return btoa(bin);
    },
    hashStr(str) {
      let h = 5381;
      for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
      return h.toString(36);
    },
    async hashFile(file) {
      const buf = await file.arrayBuffer();
      if (window.crypto && window.crypto.subtle) {
        const hash = await crypto.subtle.digest('SHA-1', buf);
        return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
      }
      return String(file.size) + '-' + String(file.lastModified || 0);
    },
    langFor(name) {
      const n = String(name || '').toLowerCase();
      const i = n.lastIndexOf('.');
      if (i === -1 || i === n.length - 1) return null;
      return EXT_TO_LANG[n.slice(i + 1)] || null;
    },
    isExcludedDir: (n) => !!SKIP_DIRS[n],
    isExcludedFile: (n) => !!SKIP_FILES[String(n).toLowerCase()],
  };

  /* ─── Storage ─── */
  const Storage = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); return true; } catch (e) { return false; } },
    json(k, fallback = null) {
      try {
        const raw = this.get(k);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) { return fallback; }
    },
    saveJson(k, obj) { try { this.set(k, JSON.stringify(obj)); return true; } catch (e) { return false; } },
  };

  const KEY = {
    saveToken(token) {
      const exp = Date.now() + TOKEN_TTL_DAYS * 864e5;
      return Storage.saveJson(STORAGE.token, {
        t: btoa(unescape(encodeURIComponent(token))),
        e: exp, v: 3,
      });
    },
    loadToken() {
      const d = Storage.json(STORAGE.token);
      if (!d || !d.t || !d.e) { Storage.del(STORAGE.token); return null; }
      if (Date.now() > d.e) { Storage.del(STORAGE.token); return null; }
      try {
        return {
          token: decodeURIComponent(escape(atob(d.t))),
          expires: d.e,
        };
      } catch (e) { Storage.del(STORAGE.token); return null; }
    },
    clearToken() { return Storage.del(STORAGE.token); },
    formatRemaining(exp) {
      const ms = exp - Date.now();
      if (ms <= 0) return '—';
      const d = Math.floor(ms / 864e5);
      const h = Math.floor((ms % 864e5) / 36e5);
      return d > 0 ? `${d}d ${h > 0 ? h + 'h' : ''}`.trim() : `${h}h`;
    },
    archive: {
      load() { return Storage.json(STORAGE.archive, []) || []; },
      save(list) {
        if (list.length > ARCHIVE_MAX) list = list.slice(0, ARCHIVE_MAX);
        return Storage.saveJson(STORAGE.archive, list);
      },
    },
    repos: {
      load(login) { return Storage.json(STORAGE.reposKey + '_' + login, []) || []; },
      save(login, list) { return Storage.saveJson(STORAGE.reposKey + '_' + login, list); },
    },
    drafts: {
      load() { return Storage.json(STORAGE.drafts, {}) || {}; },
      save(d) { return Storage.saveJson(STORAGE.drafts, d); },
    },
    webhook: {
      load() { return Storage.json(STORAGE.webhook, { discord: '', telegram: '', enabled: false }); },
      save(w) { return Storage.saveJson(STORAGE.webhook, w); },
    },
  };

  /* ─── Describe errors ─── */
  function describeError(res, data) {
    const msg = (data && data.message) || res.statusText || 'Error';
    switch (res.status) {
      case 401: return 'التوكن غير صالح أو منتهي (401).';
      case 403: return 'صلاحية مرفوضة (403).';
      case 404: return 'غير موجود (404).';
      case 409: return 'تعارض (409).';
      case 422: return `بيانات غير صحيحة (422): ${msg}`;
      default: return `خطأ (${res.status}): ${msg}`;
    }
  }

  /* ─── Core API request ─── */
  function request(path, opts = {}) {
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': API_VERSION,
    };
    if (opts.token) headers.Authorization = 'Bearer ' + opts.token;
    if (opts.body !== undefined) headers['Content-Type'] = 'application/json';

    return fetch(GH_API + path, {
      method: opts.method || 'GET',
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    })
      .catch(() => { throw new Error('تعذّر الاتصال بـ GitHub.'); })
      .then((res) => {
        const rl = {
          remaining: parseInt(res.headers.get('x-ratelimit-remaining') || '0', 10),
          limit: parseInt(res.headers.get('x-ratelimit-limit') || '0', 10),
        };
        /* ─── FIX: دائماً حدّث badge المعدل في الهيدر ─── */
        if (!isNaN(rl.remaining) && rl.limit) {
          if (opts.onRate) opts.onRate(rl);
          try {
            const core = window.Orbit && window.Orbit.core;
            if (core && typeof core.updateRate === 'function') core.updateRate(rl);
          } catch (e) {}
        }

        if (opts.allow404 && res.status === 404) return null;

        return res.text().then((text) => {
          let data = null;
          if (text) { try { data = JSON.parse(text); } catch (e) {} }
          if (!res.ok) {
            const err = new Error(describeError(res, data));
            err.status = res.status;
            err.data = data;
            throw err;
          }
          return data;
        });
      });
  }

  /* ─── Token / User ─── */
  function validateToken(token) {
    return fetch(`${GH_API}/user`, {
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': API_VERSION,
      },
    })
      .then((res) => {
        /* ─── FIX: حدّث badge المعدل من رد /user أيضاً ─── */
        const rl = {
          remaining: parseInt(res.headers.get('x-ratelimit-remaining') || '0', 10),
          limit: parseInt(res.headers.get('x-ratelimit-limit') || '0', 10),
        };
        if (!isNaN(rl.remaining) && rl.limit) {
          try {
            const core = window.Orbit && window.Orbit.core;
            if (core && typeof core.updateRate === 'function') core.updateRate(rl);
          } catch (e) {}
        }

        if (res.status === 401) throw new Error('التوكن غير صالح.');
        if (!res.ok) {
          return res.json().catch(() => null).then((d) => {
            throw new Error(describeError(res, d));
          });
        }
        let scopes = null;
        try { scopes = res.headers.get('x-oauth-scopes'); } catch (e) {}
        return res.json().then((user) => ({ user, scopes }));
      })
      .catch((err) => {
        if (err.message && /^(التوكن|صلاحية|غير موجود|تعارض|بيانات|خطأ)/.test(err.message)) throw err;
        throw new Error('تعذّر الاتصال بـ GitHub.');
      });
  }

  function rateLimit(token) {
    return request('/rate_limit', { token }).catch(() => {});
  }

  /* ─── Repos ─── */
  function listUserRepos(token) {
    return request(
      '/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member',
      { token }
    ).then((list) => (Array.isArray(list) ? list : []).map((r) => ({
      full_name: r.full_name,
      name: r.name,
      owner: (r.owner && r.owner.login) || '',
      private: !!r.private,
      default_branch: r.default_branch || 'main',
      description: r.description || '',
      updated_at: r.updated_at || null,
      size: r.size || 0,
      language: r.language || '',
      stars: r.stargazers_count || 0,
    })));
  }

  function createRepo(token, name, isPrivate) {
    return request('/user/repos', {
      method: 'POST', token,
      body: { name, private: isPrivate, auto_init: true, description: 'Created via Orbit' },
    });
  }

  function getRepo(token, owner, repo) {
    return request(`/repos/${owner}/${repo}`, { token, allow404: true });
  }

  /* ─── Branches ─── */
  function listBranches(token, owner, repo) {
    return request(`/repos/${owner}/${repo}/branches?per_page=100`, { token })
      .then((list) => (Array.isArray(list) ? list : []));
  }

  function createBranch(token, owner, repo, name, from) {
    return request(`/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(from)}`, { token })
      .then((ref) => {
        if (!ref || !ref.object || !ref.object.sha) throw new Error('الفرع الأم غير موجود');
        return request(`/repos/${owner}/${repo}/git/refs`, {
          method: 'POST', token,
          body: { ref: 'refs/heads/' + name, sha: ref.object.sha },
        });
      });
  }

  /* ─── Tree ─── */
  function getTree(token, owner, repo, branch) {
    return request(`/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`, { token })
      .then((d) => (d && d.tree ? d.tree.filter((t) => t.type === 'blob') : []));
  }

  /* ─── Contents ─── */
  function getContent(token, owner, repo, path) {
    return request(`/repos/${owner}/${repo}/contents/${encodeURI(path)}`, { token });
  }
  function putContent(token, owner, repo, path, body) {
    return request(`/repos/${owner}/${repo}/contents/${encodeURI(path)}`, {
      method: 'PUT', token, body,
    });
  }
  function deleteContent(token, owner, repo, path, body) {
    return request(`/repos/${owner}/${repo}/contents/${encodeURI(path)}`, {
      method: 'DELETE', token, body,
    });
  }

  /* ─── Blobs / Trees / Commits ─── */
  function createBlob(token, owner, repo, contentB64) {
    return request(`/repos/${owner}/${repo}/git/blobs`, {
      method: 'POST', token,
      body: { content: contentB64, encoding: 'base64' },
    });
  }
  function createTree(token, owner, repo, body) {
    return request(`/repos/${owner}/${repo}/git/trees`, { method: 'POST', token, body });
  }
  function createCommit(token, owner, repo, body) {
    return request(`/repos/${owner}/${repo}/git/commits`, { method: 'POST', token, body });
  }
  function updateRef(token, owner, repo, branch, sha) {
    return request(`/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, {
      method: 'PATCH', token, body: { sha, force: false },
    });
  }
  function createRef(token, owner, repo, branch, sha) {
    return request(`/repos/${owner}/${repo}/git/refs`, {
      method: 'POST', token,
      body: { ref: 'refs/heads/' + branch, sha },
    });
  }

  /* ─── Pull Requests ─── */
  function listPRs(token, owner, repo, state) {
    return request(`/repos/${owner}/${repo}/pulls?state=${state}&per_page=50`, { token })
      .then((list) => (Array.isArray(list) ? list : []));
  }
  function createPR(token, owner, repo, body) {
    return request(`/repos/${owner}/${repo}/pulls`, { method: 'POST', token, body });
  }
  function mergePR(token, owner, repo, num) {
    return request(`/repos/${owner}/${repo}/pulls/${num}/merge`, {
      method: 'PUT', token, body: { merge_method: 'merge' },
    });
  }
  function closePR(token, owner, repo, num) {
    return request(`/repos/${owner}/${repo}/pulls/${num}`, {
      method: 'PATCH', token, body: { state: 'closed' },
    });
  }

  /* ─── Issues ─── */
  function listIssues(token, owner, repo, state) {
    return request(`/repos/${owner}/${repo}/issues?state=${state}&per_page=50`, { token })
      .then((list) => (Array.isArray(list) ? list : []));
  }
  function createIssue(token, owner, repo, body) {
    return request(`/repos/${owner}/${repo}/issues`, { method: 'POST', token, body });
  }
  function updateIssue(token, owner, repo, num, body) {
    return request(`/repos/${owner}/${repo}/issues/${num}`, { method: 'PATCH', token, body });
  }

  /* ─── Releases ─── */
  function listReleases(token, owner, repo) {
    return request(`/repos/${owner}/${repo}/releases?per_page=50`, { token })
      .then((list) => (Array.isArray(list) ? list : []));
  }
  function createRelease(token, owner, repo, body) {
    return request(`/repos/${owner}/${repo}/releases`, { method: 'POST', token, body });
  }

  /* ─── Smart upload (hash-based diff) ─── */
  async function uploadFiles(opt) {
    const {
      token, owner, repo, branch, commitMsg, files, onProgress, onLog,
    } = opt;

    const ref = await request(
      `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`,
      { token, allow404: true }
    );

    let parentSha = null;
    let baseTreeSha = null;

    if (ref && ref.object && ref.object.sha) {
      parentSha = ref.object.sha;
      try {
        const pc = await request(`/repos/${owner}/${repo}/git/commits/${parentSha}`, { token });
        baseTreeSha = pc.tree.sha;
      } catch (e) {}
    }

    const results = new Array(files.length);
    const queue = files.map((_, i) => i);
    let done = 0;
    let failedFlag = null;
    const uploaded = [];
    const failed = [];

    const worker = async () => {
      if (queue.length === 0 || failedFlag) return;
      const idx = queue.shift();
      const f = files[idx];
      try {
        const buf = await f.file.arrayBuffer();
        const blob = await createBlob(token, owner, repo, Utils.bufToBase64(buf));
        results[idx] = { path: f.path, sha: blob.sha };
        uploaded.push({ path: f.path, size: f.size, status: 'ok' });
        done++;
        if (onProgress) onProgress(done, files.length, f.path);
        return worker();
      } catch (err) {
        failed.push({ path: f.path, status: 'err' });
        failedFlag = err;
        throw err;
      }
    };

    const n = Math.min(CONCURRENCY, files.length);
    const workers = [];
    for (let i = 0; i < n; i++) workers.push(worker());
    await Promise.all(workers);

    if (onLog) onLog('building tree…');
    const treeBody = {
      tree: results.map((r) => ({
        path: r.path, mode: '100644', type: 'blob', sha: r.sha,
      })),
    };
    if (baseTreeSha) treeBody.base_tree = baseTreeSha;
    const treeRes = await createTree(token, owner, repo, treeBody);

    if (onLog) onLog('creating commit…');
    const commitBody = { message: commitMsg, tree: treeRes.sha };
    if (parentSha) commitBody.parents = [parentSha];
    const commit = await createCommit(token, owner, repo, commitBody);

    if (onLog) onLog('updating branch…');
    if (parentSha) await updateRef(token, owner, repo, branch, commit.sha);
    else await createRef(token, owner, repo, branch, commit.sha);

    return { commitSha: commit.sha, uploaded, failed };
  }

  /* ─── Webhook notify ─── */
  async function notifyWebhook(event, message) {
    const w = KEY.webhook.load();
    if (!w || !w.enabled) return;
    const tasks = [];
    if (w.discord) {
      tasks.push(fetch(w.discord, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: `**Orbit · ${event}**\n${message}` }),
      }).catch(() => {}));
    }
    if (w.telegram) {
      const parts = w.telegram.split('|');
      if (parts.length === 2) {
        tasks.push(fetch(`https://api.telegram.org/bot${parts[0].trim()}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: parts[1].trim(), text: `Orbit · ${event}\n${message}` }),
        }).catch(() => {}));
      }
    }
    return Promise.all(tasks);
  }

  /* ─── Templates ─── */
  const TEMPLATES = {
    'static-site': {
      name: 'موقع ثابت',
      desc: 'HTML + CSS + JS بسيط',
      files: {
        'index.html':
          '<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head>\n' +
          '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
          '<title>موقعي</title>\n<link rel="stylesheet" href="style.css">\n</head>\n<body>\n' +
          '<header><h1>مرحبًا بك</h1><p>موقعك الجديد جاهز.</p></header>\n' +
          '<main><p>ابدأ التعديل من هنا.</p></main>\n' +
          '<script src="script.js"></script>\n</body>\n</html>',
        'style.css':
          '*{box-sizing:border-box}\nbody{margin:0;font-family:system-ui,sans-serif;' +
          'background:#fafafa;color:#111}\nheader{padding:60px 20px;text-align:center;' +
          'background:linear-gradient(135deg,#5B88B2,#122C4F);color:#fff}\n' +
          'main{padding:40px 20px;max-width:800px;margin:0 auto}',
        'script.js': "console.log('مرحبًا من Orbit');\n",
      },
    },
    'game': {
      name: 'لعبة Canvas',
      desc: 'لعبة بسيطة بـ Canvas',
      files: {
        'index.html':
          '<!DOCTYPE html>\n<html><head><meta charset="UTF-8">\n' +
          '<title>لعبتي</title>\n<style>body{margin:0;display:grid;' +
          'place-items:center;min-height:100vh;background:#111}\n' +
          'canvas{background:#222;border-radius:12px}</style></head>\n<body>\n' +
          '<canvas id="c" width="600" height="400"></canvas>\n' +
          '<script src="game.js"></script>\n</body></html>',
        'game.js':
          'const c=document.getElementById("c");const x=c.getContext("2d");\n' +
          'let px=300,py=200;const keys={};\n' +
          'addEventListener("keydown",e=>keys[e.key]=1);\n' +
          'addEventListener("keyup",e=>keys[e.key]=0);\n' +
          'setInterval(()=>{if(keys.ArrowLeft)px-=5;if(keys.ArrowRight)px+=5;' +
          'if(keys.ArrowUp)py-=5;if(keys.ArrowDown)py+=5;\n' +
          'x.fillStyle="#111";x.fillRect(0,0,600,400);\n' +
          'x.fillStyle="#5B88B2";x.beginPath();x.arc(px,py,20,0,7);x.fill();},16);',
      },
    },
    'blog': {
      name: 'مدونة Markdown',
      desc: 'صفحة تدعم Markdown',
      files: {
        'index.html':
          '<!DOCTYPE html>\n<html lang="ar" dir="rtl"><head><meta charset="UTF-8">\n' +
          '<title>مدونتي</title>\n<style>body{max-width:720px;margin:40px auto;' +
          'padding:0 20px;font-family:system-ui,sans-serif;line-height:1.8}</style>\n' +
          '</head><body>\n<article id="post">جاري التحميل…</article>\n' +
          '<script src="md.js"></script>\n</body></html>',
        'post.md': '# مقالتي\n\nهذا أول مقال.\n\n## عنوان فرعي\n\n- نقطة\n- نقطة',
        'md.js':
          'fetch("post.md").then(r=>r.text()).then(t=>{\n' +
          'const html=t.replace(/^# (.+)$/gm,"<h1>$1</h1>")\n' +
          '.replace(/^## (.+)$/gm,"<h2>$1</h2>")\n' +
          '.replace(/^- (.+)$/gm,"<li>$1</li>")\n' +
          '.replace(/\\n/g,"<br>");\n' +
          'document.getElementById("post").innerHTML=html;});',
      },
    },
    'api-proxy': {
      name: 'API Proxy',
      desc: 'Cloudflare Worker بسيط',
      files: {
        'worker.js':
          'export default {\n  async fetch(req) {\n' +
          '    const url = new URL(req.url);\n' +
          '    const target = url.searchParams.get("url");\n' +
          '    if (!target) return new Response("Missing url", { status: 400 });\n' +
          '    return fetch(target, { method: req.method, body: req.body, headers: req.headers });\n' +
          '  }\n};',
        'wrangler.toml': 'name = "api-proxy"\nmain = "worker.js"\ncompatibility_date = "2026-01-01"\n',
      },
    },
  };

  /* ─── Public API ─── */
  window.Orbit = window.Orbit || {};
  window.Orbit.api = {
    GH_API, STORAGE, SKIP_DIRS, SKIP_FILES, EXT_TO_LANG, CONCURRENCY,
    Utils, Storage, KEY,
    request, validateToken, rateLimit,
    listUserRepos, createRepo, getRepo,
    listBranches, createBranch,
    getTree, getContent, putContent, deleteContent,
    createBlob, createTree, createCommit, updateRef, createRef,
    listPRs, createPR, mergePR, closePR,
    listIssues, createIssue, updateIssue,
    listReleases, createRelease,
    uploadFiles, notifyWebhook,
    TEMPLATES,
  };
})();