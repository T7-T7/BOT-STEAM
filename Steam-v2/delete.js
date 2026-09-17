import fs from 'fs/promises';
import path from 'path';
import { cleanArchiveName, readArchive, writeArchive } from '../services/archive.js';

const cdir = path.resolve('./commands');
const adir = path.resolve('./data/archives');

async function commandFiles() {
  return (
    await fs.readdir(cdir)
  )
    .filter(
      x =>
        x.endsWith('.js') &&
        !['system.js', 'delete.js'].includes(x)
    )
    .sort();
}

const safe = cleanArchiveName;

const deleteCommand = {
  name: 'حذف',
  aliases: [],
  category: 'إدارة',
  requiredRole: 'developer',

  async execute(ctx) {
    const raw = ctx.args.join(' ').trim();

    if (!raw) {
      return ctx.message.reply(
        '⚠️ `.حذف رقم` لحذف أمر، أو `.حذف اسم` لحذف أرشيف كامل، أو `.حذف اسم "1-2-3"` لحذف عناصر من الأرشيف.'
      );
    }

    const qm = raw.match(
      /^(.+?)\s+"(\d+(?:-\d+)*)"\s*$/
    );

    if (qm) {
      const name = safe(qm[1]);

      const ids = qm[2]
        .split('-')
        .map(Number)
        .sort((a, b) => b - a);

      try {
        const a = await readArchive(name);
        if (!a.entries.length) {
          return ctx.message.reply('❌ الأرشيف غير موجود.');
        }

        const old = a.entries.length;
        a.entries = a.entries.filter((_, i) => !ids.includes(i + 1));
        await writeArchive(a);

        return ctx.message.reply(
          `🗑️ تم حذف ${old - a.entries.length} عنصر من *أرشيف-${name}*.`
        );
      } catch {
        return ctx.message.reply('❌ الأرشيف غير موجود.');
      }
    }

    const n =
      raw.match(/^\d+$/)
        ? (await commandFiles())[Number(raw) - 1]
        : `${path.basename(raw.replace(/\.js$/i, ''))}.js`;

    if (!n || n === 'undefined.js') {
      return ctx.message.reply('❌ رقم الأمر غير صحيح.');
    }

    try {
      await fs.unlink(
        path.join(cdir, n)
      );

      return ctx.message.reply(
        `🗑️ تم حذف الأمر: *${n}*`
      );

    } catch {}

    try {
      await fs.unlink(
        path.join(
          adir,
          `${safe(raw)}.json`
        )
      );

      return ctx.message.reply(
        `🗑️ تم حذف الأرشيف: *${safe(raw)}*`
      );

    } catch {
      return ctx.message.reply(
        '❌ لم أجد الملف أو الأرشيف.'
      );
    }
  }
};


const delitCommand = {
  name: 'دليت',
  aliases: [],
  category: 'Tools',
  requiredRole: 'user',

  async execute(ctx) {
    const {
      message,
      sock
    } = ctx;

    if (!message?.chatId || !sock) {
      return false;
    }

    const quoted =
      message.quoted;

    if (!quoted?.id) {
      return message.reply(
        '⚠️ اعمل رد على الرسالة التي تريد حذفها ثم اكتب `.دليت`.'
      );
    }

    const deleteKey = {
      remoteJid: message.chatId,
      id: quoted.id,
      fromMe: Boolean(
        quoted.fromMe
      )
    };

    if (quoted.participant) {
      deleteKey.participant =
        quoted.participant;
    }

    if (quoted.participantAlt) {
      deleteKey.participantAlt =
        quoted.participantAlt;
    }

    try {
      await sock.sendMessage(
        message.chatId,
        {
          delete: deleteKey
        }
      );

      return true;

    } catch (error) {
      console.error(
        '[DELIT]',
        error
      );

      return message.reply(
        `❌ تعذر حذف الرسالة.\nالسبب: ${
          error?.message || error
        }`
      );
    }
  }
};


export default {
  commands: [
    deleteCommand,
    delitCommand
  ]
};
