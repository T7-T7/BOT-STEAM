import { botIsDeveloper } from '../security/permissions.js';

export default {
  name: 'خروج',
  category: 'إدارة',
  requiredRole: 'developer',

  async execute(ctx) {
    const { message, sock } = ctx;

    if (!(await botIsDeveloper())) {
      return message.reply('⚠️ البوت ليس في وضع المطور. فعّل `.اعداد بوت مطور` أولًا.');
    }

    if (!message?.isGroup) {
      return message.reply(
        '⚠️ أمر `.خروج` يعمل داخل المجموعات فقط.'
      );
    }

    if (!sock?.groupLeave) {
      return message.reply(
        '❌ وظيفة خروج البوت غير متاحة.'
      );
    }

    try {
      // 🫡 تفاعل على رسالة الأمر قبل الخروج
      await message.react?.('🫡');

      // 🚪 خروج البوت من المجموعة
      await sock.groupLeave(message.chatId);

      return true;
    } catch (error) {
      console.error('[LEAVE ERROR]', error);

      return message.reply(
        `❌ تعذر خروج البوت من المجموعة.\nالسبب: ${error?.message || error}`
      );
    }
  }
};
