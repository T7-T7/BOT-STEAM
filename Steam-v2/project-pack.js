import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execFile);

const root = path.resolve('.');

// مجلدات وملفات لا يجب أن تدخل في النسخة المرسلة
const excluded = new Set([
  'node_modules',
  '.git',
  '.npm',
  'session'
]);

// بيانات النظام المسموح بنقلها
const allowedData = new Set([
  'settings.json',
  'elite.json'
]);

// بيانات خاصة بالمستخدم لا يجب أن تدخل في النسخة
const excludedData = new Set([
  'archives'
]);

export async function createProjectZip() {
  const tmp = await fs.mkdtemp(
    path.join(os.tmpdir(), 'steam-project-')
  );

  try {
    await fs.cp(root, tmp, {
      recursive: true,

      filter(source) {
        const rel = path.relative(root, source);

        // الجذر نفسه
        if (!rel) return true;

        const parts = rel.split(path.sep);

        /*
         * حماية مجلد data:
         *
         * نسمح فقط بملفات البيانات العامة المحددة،
         * ونمنع أي بيانات شخصية مثل:
         *
         * data/archives/
         */
        if (parts[0] === 'data') {
          // مجلد data نفسه
          if (parts.length === 1) return true;

          // منع مجلدات البيانات الخاصة
          if (excludedData.has(parts[1])) return false;

          // السماح فقط بالبيانات العامة المحددة
          return parts.length === 2 && allowedData.has(parts[1]);
        }

        // استبعاد المجلدات العامة الحساسة/غير المطلوبة
        if (
          [...excluded].some(
            item =>
              rel === item ||
              rel.startsWith(`${item}${path.sep}`)
          )
        ) {
          return false;
        }

        // منع ملفات ZIP المؤقتة
        if (rel.endsWith('.zip')) return false;

        // منع الملفات المؤقتة
        if (rel.endsWith('.tmp')) return false;

        return true;
      }
    });

    /*
     * نضمن وجود data في النسخة المؤقتة،
     * حتى لو لم يوجد أي ملف بيانات مسموح بنقله.
     */
    await fs.mkdir(
      path.join(tmp, 'data'),
      { recursive: true }
    );

    const out = path.join(
      os.tmpdir(),
      `steam-clean-${Date.now()}.zip`
    );

    try {
      await exec(
        'zip',
        ['-qr', out, '.'],
        { cwd: tmp }
      );

      return await fs.readFile(out);
    } finally {
      await fs.rm(
        out,
        { force: true }
      ).catch(() => {});
    }
  } finally {
    await fs.rm(
      tmp,
      {
        recursive: true,
        force: true
      }
    ).catch(() => {});
  }
}
