import {
  readArchive,
  writeArchive,
  quotedText,
  parseDirectAdd,
  commandPayload,
  cleanArchiveName
} from '../services/archive.js';

const addCommand = {
  name: 'اضف',
  category: 'أرشيف',
  requiredRole: 'user',

  async execute(ctx) {
    const raw = commandPayload(ctx);

    const direct = parseDirectAdd(raw);
    if (direct) {
      const archive = await readArchive(direct.name);
      archive.entries.push({
        content: direct.content,
        createdAt: Date.now()
      });
      await writeArchive(archive);

      return ctx.message.reply(
        `✅ تمت الإضافة إلى *أرشيف-${archive.name}*.\n` +
        `📌 الإجمالي: *${archive.entries.length}*`
      );
    }

    const name = cleanArchiveName(raw.split(/\s+/u)[0] || '');
    const quoted = quotedText(ctx);

    if (name && quoted) {
      const archive = await readArchive(name);
      archive.entries.push({
        content: quoted,
        createdAt: Date.now()
      });
      await writeArchive(archive);

      return ctx.message.reply(
        `✅ تمت إضافة الرسالة إلى *أرشيف-${archive.name}*.\n` +
        `📌 الإجمالي: *${archive.entries.length}*`
      );
    }

    return ctx.message.reply(
      '⚠️ هناك نوعين من اضف:\n' +
      '1️⃣ `.اضف جداول` مع ريبلاي للرسالة مضافه.\n' +
      '2️⃣ `.اضف-جداول-[جدول يوم ثاني...]`'
    );
  }
};

const archiveCommand = {
  name: 'ارشيف',
  aliases: ['ت'],
  category: 'أرشيف',
  requiredRole: 'user',

  async execute(ctx) {
    const name = cleanArchiveName(commandPayload(ctx));

    if (!name) {
      return ctx.message.reply(
        '⚠️ اكتب اسم الأرشيف.\n' +
        'مثل `[.ت جداول]`'
      );
    }

    const archive = await readArchive(name);

    if (!archive.entries.length) {
      return ctx.message.reply(
        `📂 *أرشيف-${archive.name}* فارغ.`
      );
    }

    if (archive.entries.length === 1) {
      return ctx.message.reply(
        `📂 *أرشيف-${archive.name}*\n\n${archive.entries[0].content}`
      );
    }

    return ctx.message.reply(
      `📂 *أرشيف-${archive.name}*\n\n` +
      archive.entries
        .map((entry, index) => `${index + 1}️⃣\n\n${entry.content}`)
        .join('\n\n')
    );
  }
};

export default {
  commands: [addCommand, archiveCommand]
};
