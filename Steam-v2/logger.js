import config from '../config.js';
import { measure } from './measure.js';
import { draw } from './draw.js';

let enabled = config.console.enabled !== false;

export function setEnabled(value) {
  enabled = Boolean(value);
}

export function isEnabled() {
  return enabled;
}

export function log(title, lines = [], color = 'cyan') {
  if (!enabled) return;
  draw(measure(title, lines), color);
}

export function system(data) {
  log('⎋ STEAM • SYSTEM V2.0.0', [
    `System      : ${data.system || process.platform}`,
    `Time        : ${data.time || new Date().toLocaleTimeString('ar-EG')}`,
    `Loaded      : ${data.loaded ?? 0}`,
    `Status      : ${data.status || 'ready'}`,
    `Mode        : ${data.mode || 'الوضع العام'}`,
    `Bot         : ${data.bot || 'البوت ليس مطور'}`,
    `Permissions : ${data.permissions || 'working'}`,
    `Status      : ${data.connection || 'connecting'}`,
    `Time        : ${data.connectionTime || '-'}`
  ], 'red');
}

export function connection(state, detail = '') {
  const normalized = String(state || '').toLowerCase();
  const color = normalized === 'open' ? 'green' : normalized === 'close' ? 'red' : 'yellow';
  const title = normalized === 'reconnecting'
    ? '⎋ STEAM • RECONNECTING'
    : `⎋ STEAM • ${normalized.toUpperCase() || 'CONNECTION'}`;

  // Never render an empty box: every connection state has a deterministic fallback.
  const text = detail || (
    normalized === 'connecting' ? 'جاري إنشاء اتصال واتساب...' :
    normalized === 'pairing' ? 'جاري تجهيز كود الربط...' :
    normalized === 'reconnecting' ? 'الاتصال انقطع، جاري إعادة الاتصال...' :
    normalized === 'open' ? 'تم فتح الاتصال.' :
    normalized === 'close' ? 'تم إغلاق الاتصال.' :
    'تم تحديث حالة الاتصال.'
  );

  log(title, [text], color);
}

export function command(data) {
  log('⎋ STEAM • COMMANDS', [
    `Permission : ${data.role}`,
    `Number     : ${data.number}`,
    `Group      : ${data.group}`,
    `Command    : ${data.command}`
  ], 'cyan');
}

export function incoming(data) {
  log('⎋ STEAM • MESSAGE', [
    `Sender     : ${data.sender}`,
    `Group      : ${data.group || 'private'}`,
    `Type       : ${data.type}`,
    `Content    : ${data.content || ''}`
  ], 'cyan');
}

export function error(source, e) {
  const stack = String(e?.stack || e || 'Unknown error').split(/\r?\n/);
  log('⎋ STEAM • ERROR', [
    `Source : ${source}`,
    '',
    ...stack
  ], 'red');
}

export function loaded(names) {
  log('⎋ STEAM • COMMANDS LOADED', [
    `Loaded : ${names.length}`,
    names.join(', ')
  ], 'green');
}
