import fs from 'fs';
import path from 'path';
const identityFile = path.resolve('./data/identities.json');

const jidToLid = new Map();
const lidToJid = new Map();
let loaded = false;

function ensureLoaded() {
  if (loaded) return;
  loaded = true;

  try {
    const raw = fs.readFileSync(identityFile, 'utf8');
    const data = JSON.parse(raw);

    for (const [jid, lid] of Object.entries(data?.pnToLid || {})) {
      if (jid && lid) {
        jidToLid.set(jid, lid);
        lidToJid.set(lid, jid);
      }
    }
  } catch {
    // ملف الهوية اختياري؛ سيُنشأ عند أول mapping صالح.
  }
}

function normalizeJid(value) {
  if (!value) return '';

  const raw = String(value).trim();
  if (!raw) return '';

  // دعم الرقم الخام.
  if (/^\d+$/.test(raw)) {
    return `${raw}@s.whatsapp.net`;
  }

  const at = raw.indexOf('@');
  if (at > 0) {
    const user = raw.slice(0, at).split(':')[0];
    const server = raw.slice(at + 1);
    if (server === 'c.us') return `${user}@s.whatsapp.net`;
    return `${user}@${server}`;
  }

  return raw;
}

function isPn(value) {
  return String(value || '').endsWith('@s.whatsapp.net');
}

function isLid(value) {
  return String(value || '').endsWith('@lid');
}

function persist() {
  try {
    fs.mkdirSync(path.dirname(identityFile), { recursive: true });
    fs.writeFileSync(
      identityFile,
      JSON.stringify(
        { pnToLid: Object.fromEntries(jidToLid) },
        null,
        2
      )
    );
  } catch {
    // فشل الحفظ لا يمنع تشغيل البوت.
  }
}

export function register(first, second) {
  ensureLoaded();

  const a = normalizeJid(first);
  const b = normalizeJid(second);

  if (!a || !b || a === b) return;

  let pn = '';
  let lid = '';

  if (isPn(a) && isLid(b)) {
    pn = a;
    lid = b;
  } else if (isLid(a) && isPn(b)) {
    pn = b;
    lid = a;
  } else {
    return;
  }

  jidToLid.set(pn, lid);
  lidToJid.set(lid, pn);
  persist();
}

export function resolve(id) {
  ensureLoaded();

  const normalized = normalizeJid(id);
  if (!normalized) return '';

  if (isLid(normalized)) {
    return lidToJid.get(normalized) || normalized;
  }

  return normalized;
}

export function number(id) {
  const resolved = resolve(id);

  return String(resolved || '')
    .split('@')[0]
    .split(':')[0]
    .replace(/\D/g, '');
}

export function lidOf(id) {
  ensureLoaded();

  const normalized = normalizeJid(id);
  if (!normalized) return '';

  if (isLid(normalized)) return normalized;
  return jidToLid.get(normalized) || '';
}

export function isJid(value) {
  return /@(?:s\.whatsapp\.net|g\.us|lid)$/i.test(String(value || '').trim());
}

export function clear() {
  jidToLid.clear();
  lidToJid.clear();
  loaded = false;
}
