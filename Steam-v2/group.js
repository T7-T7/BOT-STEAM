import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { groupContext, isGroupMessage } from '../services/group.js';


function getQuotedMessage(message) {
  return message?.quoted || null;
}

function getQuotedRaw(quoted) {
  return (
    quoted?.raw ||
    quoted?.message ||
    quoted?.msg ||
    null
  );
}

function getImageMessage(quoted) {
  const raw = getQuotedRaw(quoted);

  if (!raw) return null;

  if (raw.imageMessage) {
    return raw;
  }

  if (raw.message?.imageMessage) {
    return raw.message;
  }

  if (raw.viewOnceMessage?.message?.imageMessage) {
    return raw.viewOnceMessage.message;
  }

  if (
    raw.viewOnceMessageV2?.message?.imageMessage
  ) {
    return raw.viewOnceMessageV2.message;
  }

  return null;
}

async function downloadQuotedImage(sock, quoted) {
  /*
   * الطريقة الأولى:
   * إذا كان نظام الرسائل عندك يوفر download()
   */
  if (
    typeof quoted?.download === 'function'
  ) {
    const buffer =
      await quoted.download();

    if (buffer) {
      return buffer;
    }
  }

  /*
   * الطريقة الثانية:
   * تنزيل مباشر من Baileys.
   */
  const raw =
    getQuotedRaw(quoted);

  if (!raw) {
    throw new Error(
      'تعذر الوصول إلى الصورة المرفقة.'
    );
  }

  const imageMessage =
    getImageMessage(quoted);

  if (!imageMessage) {
    throw new Error(
      'الرسالة التي عملت عليها Reply ليست صورة.'
    );
  }

  return downloadMediaMessage(
    {
      key: {
        remoteJid:
          quoted.chatId ||
          quoted.remoteJid,
        id:
          quoted.id ||
          quoted.key?.id,
        fromMe:
          Boolean(
            quoted.fromMe ||
            quoted.key?.fromMe
          ),
        participant:
          quoted.participant ||
          quoted.key?.participant
      },
      message: imageMessage
    },
    'buffer',
    {},
    {
      logger: console,
      reuploadRequest:
        sock.updateMediaMessage
    }
  );
}

const changeNameCommand = {
  name: 'تغيير',
  aliases: [],
  category: 'Tools',
  requiredRole: 'user',

  async execute(ctx) {
    const {
      message,
      sock
    } = ctx;

    if (!isGroupMessage(message)) {
      return message.reply(
        '⚠️ هذا الأمر يعمل داخل المجموعات فقط.'
      );
    }

    try {
      await groupContext(ctx);
    } catch (error) {
      return message.reply(error?.message || String(error));
    }

    const newName =
      ctx.args
        .join(' ')
        .trim();

    if (!newName) {
      return message.reply(
        '⚠️ اكتب اسم المجموعة الجديد.\n\nمثال:\n`.تغيير قروب حياة`'
      );
    }

    try {
      await sock.groupUpdateSubject(
        message.chatId,
        newName
      );

      return message.reply(
        `✅ تم تغيير اسم المجموعة إلى:\n*${newName}*`
      );

    } catch (error) {
      console.error(
        '[CHANGE GROUP NAME]',
        error
      );

      return message.reply(
        `❌ تعذر تغيير اسم المجموعة.\nالسبب: ${
          error?.message || error
        }`
      );
    }
  }
};


const changePictureCommand = {
  name: 'غير صوره',
  aliases: [],
  category: 'Tools',
  requiredRole: 'user',

  async execute(ctx) {
    const {
      message,
      sock
    } = ctx;

    if (!isGroupMessage(message)) {
      return message.reply(
        '⚠️ هذا الأمر يعمل داخل المجموعات فقط.'
      );
    }

    try {
      await groupContext(ctx);
    } catch (error) {
      return message.reply(error?.message || String(error));
    }

    const quoted =
      getQuotedMessage(message);

    if (!quoted) {
      return message.reply(
        '⚠️ اعمل Reply على الصورة الجديدة ثم اكتب:\n`.غير صوره`'
      );
    }

    try {
      const image =
        await downloadQuotedImage(
          sock,
          quoted
        );

      if (!image) {
        throw new Error(
          'تعذر تحميل الصورة.'
        );
      }

      await sock.updateProfilePicture(
        message.chatId,
        image
      );

      return message.reply(
        '✅ تم تغيير صورة المجموعة بنجاح.'
      );

    } catch (error) {
      console.error(
        '[CHANGE GROUP PICTURE]',
        error
      );

      return message.reply(
        `❌ تعذر تغيير صورة المجموعة.\nالسبب: ${
          error?.message || error
        }`
      );
    }
  }
};


export default {
  commands: [
    changeNameCommand,
    changePictureCommand
  ]
};
