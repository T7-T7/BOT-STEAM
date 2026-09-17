import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const commandsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const root = path.resolve(commandsDir, '..');

async function commandFiles() {
  return (await fs.readdir(commandsDir, { withFileTypes: true }))
    .filter(f => f.isFile() && f.name.endsWith('.js'))
    .map(f => f.name)
    .sort();
}

function toRootRelative(abs) {
  return path.relative(root, abs).replaceAll(path.sep, '/');
}

async function dependencyTree(file, seen = new Set()) {
  const abs = path.resolve(commandsDir, file);
  const rootName = toRootRelative(abs);
  if (seen.has(rootName)) return seen;
  seen.add(rootName);

  const src = await fs.readFile(abs, 'utf8');
  const re = /from\s+['"](\.\.?\/[^'"]+)['"]/g;
  let match;
  while ((match = re.exec(src))) {
    const dep = path.resolve(path.dirname(abs), match[1]);
    if (dep.startsWith(root + path.sep) && dep.endsWith('.js')) {
      await dependencyTree(path.relative(commandsDir, dep), seen);
    }
  }
  return seen;
}

export default {
  name: 'سيستم',
  category: 'نظام',
  aliases: ['system'],
  requiredRole: 'developer',
  async execute(ctx) {
    const arg = String(ctx.args[0] || '').trim();

    if (arg.toLowerCase() === 'al') {
      const { createProjectZip } = await import('../services/project-pack.js');
      const zip = await createProjectZip();
      return ctx.message.reply({
        document: zip,
        mimetype: 'application/zip',
        fileName: 'STEAM-BOT-V2-CLEAN.zip'
      }, {
        caption: '📦 *STEAM-BOT-V2-CLEAN.zip*\n\n✅ نسخة نظيفة وجاهزة للتشغيل.\n📄 package.json + package-lock.json موجودان.\n👑 رقم المطور الأساسي محفوظ.\n\n⚙️ بعد فك الضغط:\n1️⃣ npm install\n2️⃣ npm start'
      });
    }

    const list = await commandFiles();
    const n = Number(arg);
    if (!Number.isInteger(n) || n < 1 || n > list.length) {
      const listing = list.map((x, i) => `📄 *#${i + 1} ${x}*`).join('\n');
      return ctx.message.reply(
        `📁 *ملفات سيستم:*\n\n${listing}\n\n• استخدم .سيستم 1 لإرسال الملف.\n• استخدم .سيستم al لإرسال نسخة كاملة نظيفة.`
      );
    }

    const name = list[n - 1];
    const files = [...await dependencyTree(name)];
    const payload = await Promise.all(files.map(async rel => ({
      name: rel,
      data: await fs.readFile(path.join(root, rel))
    })));

    if (payload.length === 1) {
      return ctx.message.reply({
        document: payload[0].data,
        mimetype: 'text/javascript',
        fileName: path.basename(payload[0].name)
      }, { caption: `📄 *إليك ملف رقم-${n}:* ${name}` });
    }

    const { createZip } = await import('../services/archive-pack.js');
    const zip = await createZip(payload);
    return ctx.message.reply({
      document: zip,
      mimetype: 'application/zip',
      fileName: `${path.basename(name, '.js')}-bundle.zip`
    }, { caption: `📦 *حزمة الأمر رقم-${n}:* ${name}` });
  }
};
