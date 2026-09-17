import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';
import { normalizeRole } from '../security/roles.js';

const registry = new Map();
const commandSources = new Map();

function normalizeName(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function normalizeCommand(command, file) {
  if (!command || typeof command !== 'object') return null;
  if (!command.name || typeof command.execute !== 'function') return null;

  const requiredRole = normalizeRole(command.requiredRole || 'user');

  if (!requiredRole) {
    console.error(
      `[COMMAND LOAD] ${file}: invalid requiredRole for ${command.name}`
    );
    return null;
  }

  return {
    ...command,
    requiredRole,
    aliases: Array.isArray(command.aliases)
      ? command.aliases.filter(Boolean)
      : [],
    file
  };
}

function registerKey(key, command, file) {
  const normalized = normalizeName(key);
  if (!normalized) return true;

  const existing = registry.get(normalized);

  if (existing) {
    if (existing.name === command.name && existing.file === file) {
      return true;
    }

    console.error(
      `[COMMAND COLLISION] "${key}" already belongs to "${existing.name}" (${existing.file}); skipped "${command.name}" (${file}).`
    );
    return false;
  }

  registry.set(normalized, command);
  commandSources.set(normalized, file);
  return true;
}

function registerCommand(command, file) {
  const normalized = normalizeCommand(command, file);
  if (!normalized) return false;

  const keys = [normalized.name, ...normalized.aliases];
  let registered = false;

  for (const key of keys) {
    registered = registerKey(key, normalized, file) || registered;
  }

  return registered;
}

export function list() {
  return [
    ...new Map(
      [...registry.values()].map(command => [command.name, command])
    ).values()
  ].map(command => command.name);
}

export function entries() {
  return [
    ...new Map(
      [...registry.values()].map(command => [command.name, command])
    ).values()
  ];
}

export function get(name) {
  return registry.get(
    normalizeName(name)
  );
}

export function clear() {
  registry.clear();
  commandSources.clear();
}

export async function loadCommands(dir = './commands') {
  clear();
  await scan(path.resolve(dir));
  return list();
}

async function scan(dir) {
  let files;

  try {
    files = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    console.error(`[COMMAND SCAN] ${dir}:`, error?.message || error);
    return;
  }

  files.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of files) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await scan(fullPath);
      continue;
    }

    if (
      entry.isFile() &&
      entry.name.endsWith('.js') &&
      !entry.name.startsWith('_')
    ) {
      await loadOne(fullPath);
    }
  }
}

async function loadOne(file) {
  try {
    const mod = await import(
      `${pathToFileURL(file).href}?v=${Date.now()}`
    );

    const exported = mod.default;
    if (!exported) return;

    if (Array.isArray(exported.commands)) {
      for (const command of exported.commands) {
        registerCommand(command, file);
      }
      return;
    }

    registerCommand(exported, file);
  } catch (error) {
    console.error(
      `[COMMAND LOAD] ${file}:`,
      error?.message || error
    );
  }
}

export async function reload() {
  return loadCommands();
}
