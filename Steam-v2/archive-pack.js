import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

const exec = promisify(execFile);

function safeEntryName(value) {
  const name = String(value || '').replaceAll('\\', '/');
  if (!name || name.startsWith('/') || name.split('/').includes('..')) {
    throw new Error('مسار ملف الأرشيف غير صالح.');
  }
  return name.replace(/^\.\//, '');
}

export async function createZip(files = []) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'steam-'));
  const out = path.join(os.tmpdir(), `steam-${Date.now()}-${process.pid}.zip`);

  try {
    for (const file of files) {
      const name = safeEntryName(file?.name);
      if (!name) continue;

      const target = path.join(dir, name);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, file?.data ?? '');
    }

    await exec('zip', ['-qr', out, '.'], { cwd: dir });
    return await fs.readFile(out);
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
    await fs.rm(out, { force: true }).catch(() => {});
  }
}
