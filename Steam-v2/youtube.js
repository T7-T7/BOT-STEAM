import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

const exec = promisify(execFile);

const HIDENFREE = 'https://2b.hidenfree.com';
const ENGEZ = 'https://engez.a7a.online/api/v1';

// Static safety net. The official Invidious docs explicitly recommend
// using only instances from their current public list.
let INVIDIOUS = [
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
  'https://yt.chocolatemoo53.com',
  'https://invidious.tiekoetter.com'
];

let PIPED = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.tokhmi.xyz',
  'https://pipedapi.moomoo.me',
  'https://pipedapi.syncpundit.io',
  'https://api-piped.mha.fi'
];

let instanceRefreshAt = 0;

const blocked = [
  /اغنيه|اغنية|أغنية|اغاني|أغاني|موسيقى|موسيق|music|song|songs|remix|ريمكس|راب|rap/i,
  /كليب|clip|حفله|حفلة|concert|dj|lyrics|lyric/i,
  /البوم|ألبوم|album|سينجل|single|مطرب|مطربة|مغني|مغنية/i,
  /كلمات\s*(الأغنية|اغنيه|أغنية)/i
];

export function forbidden(text) {
  return blocked.some(r => r.test(String(text || '')));
}

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

async function requestText(url, params = {}, timeout = 15_000) {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
  }

  const response = await fetch(u, {
    headers: {
      accept: 'application/json,text/plain,*/*',
      'user-agent': 'STEAM-BOT/2.0'
    },
    signal: AbortSignal.timeout(timeout)
  });

  const text = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return text;
}

async function getJson(url, params = {}, timeout = 15_000) {
  const text = await requestText(url, params, timeout);
  if (/^\s*<!doctype\s+html|^\s*<html/i.test(text)) {
    throw new Error('الخادم أعاد HTML بدل JSON');
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`استجابة غير صالحة JSON: ${text.slice(0, 100)}`);
  }
}

async function refreshInstances() {
  if (Date.now() < instanceRefreshAt) return;
  instanceRefreshAt = Date.now() + 6 * 60 * 60 * 1000;

  await Promise.allSettled([
    (async () => {
      const data = await getJson('https://api.invidious.io/instances.json', {}, 10_000);
      const list = Object.entries(data || {})
        .filter(([, meta]) => meta?.api && meta?.type === 'https')
        .map(([host]) => `https://${host}`);
      if (list.length) INVIDIOUS = [...new Set([...list, ...INVIDIOUS])].slice(0, 12);
    })(),
    // Piped's official API docs point to its public instance registry.
    (async () => {
      const text = await requestText(
        'https://raw.githubusercontent.com/TeamPiped/Piped/main/.github/instances.json',
        {},
        10_000
      );
      const data = JSON.parse(text);
      const list = (Array.isArray(data) ? data : [])
        .map(x => x.api_url || x.apiUrl || x.api)
        .filter(x => /^https:\/\//i.test(x));
      if (list.length) PIPED = [...new Set([...list, ...PIPED])].slice(0, 12);
    })()
  ]);
}

function parseDuration(value) {
  if (Number.isFinite(Number(value))) return Number(value);
  const text = String(value || '').trim();
  if (!text) return null;
  const direct = text.match(/^(\d+(?:\.\d+)?)\s*(?:ث|ثانيه|ثانية|ثواني|sec|secs|second|seconds)$/iu);
  if (direct) return Number(direct[1]);
  const directMin = text.match(/^(\d+(?:\.\d+)?)\s*(?:د|دقيقه|دقيقة|دقائق|min|mins|minute|minutes)$/iu);
  if (directMin) return Number(directMin[1]) * 60;
  const parts = text.split(':').map(Number);
  if (parts.some(x => !Number.isFinite(x))) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
}

function formatDuration(seconds) {
  const n = Number(seconds);
  if (!Number.isFinite(n) || n < 0) return '?';
  const h = Math.floor(n / 3600);
  const m = Math.floor((n % 3600) / 60);
  const s = Math.floor(n % 60);
  return h
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

export function parseDurationIntent(input) {
  const text = clean(input);
  const patterns = [
    /(?:مدته|مدت|مده)\s*(\d+)\s*(?:ثانية|ثواني|ثانيه|ث|دقيقة|دقائق|دقيقه|د)/iu,
    /(\d+)\s*(?:ثانية|ثواني|ثانيه|ث|دقيقة|دقائق|دقيقه|د)/iu
  ];

  for (const re of patterns) {
    const match = text.match(re);
    if (!match) continue;
    const n = Number(match[1]);
    if (!Number.isFinite(n) || n <= 0) continue;
    const unit = match[0];
    const seconds = /دقيقة|دقائق|دقيقه|\bد\b/u.test(unit) ? n * 60 : n;
    const query = clean(text.replace(match[0], ' '));
    return { seconds, query };
  }

  return { seconds: null, query: text };
}

function normalizeResult(v) {
  const title = clean(v.title || v.name);
  const channel = clean(v.channel || v.author || v.uploaderName || v.uploader);
  const url = v.url || v.webpage_url || (v.id ? `https://www.youtube.com/watch?v=${v.id}` : '');
  const durationSeconds = parseDuration(v.durationSeconds ?? v.lengthSeconds ?? v.duration ?? v.duration_string);
  const thumbnail = v.thumbnail || v.image || v.thumb || v.videoThumbnails?.[0]?.url || '';

  return {
    title,
    channel: channel || 'غير معروف',
    url,
    thumbnail,
    durationSeconds,
    duration_string: durationSeconds == null ? (v.duration_string || '?') : formatDuration(durationSeconds)
  };
}

function filterResults(rows) {
  return rows
    .map(normalizeResult)
    .filter(v => v.title && v.url && !forbidden(`${v.title} ${v.channel}`));
}

async function engezSearch(query, limit) {
  const d = await getJson(`${ENGEZ}/search/youtube`, { q: query }, 60_000);
  return filterResults((d.results || []).slice(0, Math.max(limit, 8))).slice(0, limit);
}

async function hidenfreeSearch(query, limit) {
  const d = await getJson(`${HIDENFREE}/api/youtube/search`, { q: query, limit }, 20_000);
  return filterResults(d.results || []).slice(0, limit);
}

async function invidiousSearch(query, limit) {
  await refreshInstances();
  let last;
  for (const base of INVIDIOUS) {
    try {
      const d = await getJson(`${base}/api/v1/search`, {
        q: query,
        type: 'video',
        page: 1,
        sort_by: 'relevance'
      }, 12_000);
      const rows = (Array.isArray(d) ? d : [])
        .filter(v => v.type === 'video')
        .map(v => ({
          title: v.title,
          author: v.author,
          videoId: v.videoId,
          lengthSeconds: v.lengthSeconds,
          videoThumbnails: v.videoThumbnails
        }));
      const results = filterResults(rows).slice(0, limit);
      if (results.length) return results;
    } catch (error) {
      last = error;
    }
  }
  throw last || new Error('تعذر الوصول إلى Invidious');
}

async function pipedSearch(query, limit) {
  await refreshInstances();
  let last;
  for (const base of PIPED) {
    try {
      const d = await getJson(`${base}/search`, { q: query, filter: 'videos' }, 12_000);
      const rows = (d.items || []).filter(v => v.type === 'stream' || v.url?.includes('/watch?v='));
      const results = filterResults(rows).slice(0, limit);
      if (results.length) return results;
    } catch (error) {
      last = error;
    }
  }
  throw last || new Error('تعذر الوصول إلى Piped');
}

async function hasYtDlp() {
  try {
    await exec('yt-dlp', ['--version'], { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

async function ytDlpSearch(query, limit) {
  if (!(await hasYtDlp())) throw new Error('yt-dlp غير مثبت');

  const { stdout } = await exec(
    'yt-dlp',
    [
      '--flat-playlist',
      '--dump-single-json',
      '--no-warnings',
      `ytsearch${Math.max(8, limit)}:${query}`
    ],
    { timeout: 45_000, maxBuffer: 8 * 1024 * 1024 }
  );

  const data = JSON.parse(stdout);
  return filterResults(data.entries || []).slice(0, limit);
}

export async function search(query, limit = 8) {
  const q = clean(query);
  if (!q) return { blocked: false, results: [] };
  if (forbidden(q)) return { blocked: true, results: [] };

  const providers = [
    ['engez', () => engezSearch(q, limit)],
    ['hidenfree', () => hidenfreeSearch(q, limit)],
    ['invidious', () => invidiousSearch(q, limit)],
    ['piped', () => pipedSearch(q, limit)],
    ['yt-dlp', () => ytDlpSearch(q, limit)]
  ];

  const merged = [];
  const seen = new Set();
  const errors = [];
  let source = '';

  // Waterfall instead of hitting every provider at once: this keeps the bot
  // responsive and uses fallbacks only when the first provider is insufficient.
  for (const [name, fn] of providers) {
    try {
      const rows = await fn();
      if (!source && rows?.length) source = name;
      for (const item of rows || []) {
        const key = item.url || `${item.title}|${item.channel}`;
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(item);
        if (merged.length >= Math.max(limit, 8)) break;
      }
      if (merged.length >= Math.max(3, Math.min(limit, 8))) break;
    } catch (error) {
      errors.push(`${name}: ${error?.message || error}`);
    }
  }

  if (merged.length) return { blocked: false, source: source || 'multi', results: merged.slice(0, limit) };

  const error = new Error(`تعذر البحث في يوتيوب: ${errors.join(' / ')}`);
  error.code = 'YOUTUBE_SEARCH_FAILED';
  throw error;
}

export async function searchSmart(input, limit = 8) {
  const intent = parseDurationIntent(input);
  const result = await search(intent.query, limit);
  if (result.blocked || intent.seconds == null) return result;

  const target = intent.seconds;
  const ranked = [...result.results]
    .map(item => ({
      ...item,
      durationDelta: item.durationSeconds == null ? Number.POSITIVE_INFINITY : Math.abs(item.durationSeconds - target),
      exactDuration: item.durationSeconds === target
    }))
    .sort((a, b) => {
      if (a.exactDuration !== b.exactDuration) return Number(b.exactDuration) - Number(a.exactDuration);
      return a.durationDelta - b.durationDelta;
    });

  return {
    ...result,
    requestedDuration: target,
    results: ranked.slice(0, 3)
  };
}

export async function info(url) {
  if (forbidden(url)) return { blocked: true };

  try {
    const d = await getJson(`${ENGEZ}/search/youtube`, { q: url }, 30_000);
    const first = filterResults(d.results || [])[0];
    if (first) return { blocked: false, ...first, url };
  } catch {}

  try {
    const d = await getJson(`${HIDENFREE}/api/youtube/info`, { url }, 20_000);
    if (forbidden(`${d.title || ''} ${d.uploader || d.channel || ''}`)) return { blocked: true };
    return {
      blocked: false,
      url,
      title: clean(d.title || 'فيديو يوتيوب'),
      thumbnail: d.thumbnail || '',
      durationSeconds: parseDuration(d.duration),
      duration_string: formatDuration(parseDuration(d.duration)),
      channel: clean(d.uploader || d.channel || '')
    };
  } catch {}

  if (await hasYtDlp()) {
    try {
      const { stdout } = await exec(
        'yt-dlp',
        ['--dump-single-json', '--no-warnings', '--skip-download', url],
        { timeout: 45_000, maxBuffer: 4 * 1024 * 1024 }
      );
      const d = JSON.parse(stdout);
      const item = normalizeResult(d);
      if (forbidden(`${item.title} ${item.channel}`)) return { blocked: true };
      return { blocked: false, ...item, url };
    } catch {}
  }

  return { blocked: false, url, title: 'فيديو يوتيوب', thumbnail: '', duration_string: '?', durationSeconds: null, channel: '' };
}

function videoId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0];
    return u.searchParams.get('v');
  } catch {
    return null;
  }
}

async function ytdlpDownload(url, type, quality) {
  if (!(await hasYtDlp())) throw new Error('yt-dlp غير مثبت');

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'steam-yt-'));
  try {
    const output = path.join(dir, type === 'audio' ? 'audio.%(ext)s' : 'video.%(ext)s');
    const args = type === 'audio'
      ? ['--no-warnings', '--no-playlist', '-f', 'bestaudio/best', '-o', output, url]
      : ['--no-warnings', '--no-playlist', '-f', `bv*[height<=${Number(quality) || 720}]+ba/b[height<=${Number(quality) || 720}]/b`, '--merge-output-format', 'mp4', '-o', output, url];

    await exec('yt-dlp', args, { timeout: 300_000, maxBuffer: 4 * 1024 * 1024 });
    const files = await fs.readdir(dir);
    const media = files.find(f => /\.(mp4|m4a|webm|mp3|opus|aac)$/i.test(f));
    if (!media) throw new Error('yt-dlp لم ينتج ملف وسائط');

    const buffer = await fs.readFile(path.join(dir, media));
    return { buffer, filename: `steam-${Date.now()}${path.extname(media)}` };
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

async function engezDownload(url, type, quality) {
  const endpoints = ['/download/youtubev2', '/download/ytdl', '/download/youtube'];
  let last;

  for (const endpoint of endpoints) {
    try {
      const d = await getJson(`${ENGEZ}${endpoint}`, { url, type }, 90_000);
      const payload = d?.response || d?.data || d;
      const direct = payload?.download_url || payload?.downloadUrl || payload?.url;
      if (!direct) throw new Error(payload?.error || 'لم يرجع رابط تحميل');

      const r = await fetch(direct, { signal: AbortSignal.timeout(300_000) });
      if (!r.ok) throw new Error(`تنزيل الوسائط HTTP ${r.status}`);
      const buffer = Buffer.from(await r.arrayBuffer());
      if (!buffer.length) throw new Error('ملف التحميل فارغ');

      return {
        buffer,
        filename: payload.filename || `steam-${Date.now()}.${type === 'audio' ? 'm4a' : 'mp4'}`
      };
    } catch (error) {
      last = error;
    }
  }

  throw last || new Error('فشل التحميل من Engez');
}

async function pipedDownload(url, type, quality) {
  const id = videoId(url);
  if (!id) throw new Error('رابط يوتيوب غير صالح');
  await refreshInstances();

  let last;
  for (const base of PIPED) {
    try {
      const d = await getJson(`${base}/streams/${encodeURIComponent(id)}`, {}, 20_000);
      const streams = type === 'audio' ? (d.audioStreams || []) : (d.videoStreams || []);
      const usable = streams.filter(x => x.url);
      if (!usable.length) throw new Error('لا توجد وسائط قابلة للتحميل');

      const target = Number(quality) || (type === 'audio' ? 128 : 720);
      const chosen = [...usable].sort((a, b) => {
        const av = type === 'audio' ? Number(a.bitrate || 0) : Number(a.height || 0);
        const bv = type === 'audio' ? Number(b.bitrate || 0) : Number(b.height || 0);
        return Math.abs(av - (type === 'audio' ? target * 1000 : target)) - Math.abs(bv - (type === 'audio' ? target * 1000 : target));
      })[0];

      const r = await fetch(chosen.url, { signal: AbortSignal.timeout(300_000) });
      if (!r.ok) throw new Error(`تنزيل الوسائط HTTP ${r.status}`);
      const buffer = Buffer.from(await r.arrayBuffer());
      return { buffer, filename: `steam-${id}.${type === 'audio' ? 'm4a' : 'mp4'}` };
    } catch (error) {
      last = error;
    }
  }
  throw last || new Error('فشل تحميل الوسائط');
}

export async function download(data) {
  if (!data?.url) throw new Error('رابط يوتيوب غير موجود');
  if (forbidden(`${data.title || ''} ${data.channel || ''}`)) {
    throw new Error('هذا المحتوى محظور حسب فلتر STEAM.');
  }

  const errors = [];
  const providers = data.type === 'audio'
    ? [
        ['yt-dlp', () => ytdlpDownload(data.url, 'audio', data.quality || 128)],
        ['engez', () => engezDownload(data.url, 'audio', data.quality || 128)],
        ['piped', () => pipedDownload(data.url, 'audio', data.quality || 128)]
      ]
    : [
        ['yt-dlp', () => ytdlpDownload(data.url, 'video', data.quality || 720)],
        ['engez', () => engezDownload(data.url, 'video', data.quality || 720)],
        ['piped', () => pipedDownload(data.url, 'video', data.quality || 720)]
      ];

  for (const [name, fn] of providers) {
    try {
      return await fn();
    } catch (error) {
      errors.push(`${name}: ${error.message}`);
    }
  }

  throw new Error(`فشل تحميل الوسائط: ${errors.join(' / ')}`);
}
