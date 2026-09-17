import config from '../config.js';
import { read, write } from '../database/index.js';
import { number } from './identity.js';
import { ROLES, hasRole } from './roles.js';

function normalizedNumber(id) {
  return number(id);
}

function developerNumbers() {
  return Array.isArray(config.developers)
    ? config.developers
        .map(normalizedNumber)
        .filter(Boolean)
    : [];
}

export async function roleOf(id) {
  const n = normalizedNumber(id);

  if (n && developerNumbers().includes(n)) {
    return ROLES.DEVELOPER;
  }

  const elite = await read('elite.json', []);
  const eliteNumbers = Array.isArray(elite)
    ? elite.map(normalizedNumber).filter(Boolean)
    : [];

  return n && eliteNumbers.includes(n)
    ? ROLES.ELITE
    : ROLES.USER;
}

export async function allowed(id, required = ROLES.USER) {
  return hasRole(
    await roleOf(id),
    required
  );
}


export async function botIsDeveloper() {
  const settings = await read('settings.json', { bot: 'user' });
  return settings?.bot === 'developer';
}

export async function addElite(id) {
  const n = normalizedNumber(id);

  if (!/^\d+$/.test(n)) {
    throw new Error('رقم غير صالح.');
  }

  const current = await read('elite.json', []);
  const list = Array.isArray(current)
    ? [...new Set(current.map(normalizedNumber).filter(Boolean))]
    : [];

  if (!list.includes(n)) {
    list.push(n);
    await write('elite.json', list);
  }

  return n;
}

export async function removeElite(id) {
  const n = normalizedNumber(id);
  const current = await read('elite.json', []);
  const list = Array.isArray(current)
    ? current.map(normalizedNumber).filter(Boolean)
    : [];

  const next = list.filter(value => value !== n);

  await write(
    'elite.json',
    [...new Set(next)]
  );

  return next.length !== list.length;
}

export async function eliteList() {
  const current = await read('elite.json', []);

  return Array.isArray(current)
    ? [...new Set(current.map(normalizedNumber).filter(Boolean))]
    : [];
}
