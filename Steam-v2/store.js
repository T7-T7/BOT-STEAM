import fs from 'fs/promises';
import path from 'path';
import config from '../config.js';

const cache = new Map();

export async function init() {
  await fs.mkdir(config.dataDir, { recursive: true });
}

export async function read(name, fallback = {}) {
  if (cache.has(name)) return cache.get(name);

  const file = path.join(config.dataDir, name);

  try {
    const value = JSON.parse(await fs.readFile(file, 'utf8'));
    cache.set(name, value);
    return value;
  } catch {
    const value = structuredClone(fallback);
    cache.set(name, value);
    return value;
  }
}

export async function write(name, value) {
  cache.set(name, value);

  const file = path.join(config.dataDir, name);
  const temp = `${file}.tmp`;

  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(temp, JSON.stringify(value, null, 2));
  await fs.rename(temp, file);
}

export async function update(name, fn) {
  const current = await read(name, {});
  const result = await fn(current);
  const next = result === undefined ? current : result;

  await write(name, next);
  return next;
}

export async function close() {}
