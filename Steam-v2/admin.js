import { botIsDeveloper } from '../security/permissions.js';

const promoteAdmin = {
  name: 'رفع ادمن',
  aliases: ['رفع-ادمن', 'رفع_ادمن'],
  category: 'إدارة المجموعات',
  requiredRole: 'developer',

  async execute(ctx) {
    if (!(await botIsDeveloper())) {
      return ctx.message.reply('⚠️ البوت ليس في وضع المطور. فعّل `.اعداد بوت مطور` أولًا.');
    }

    const { updateAdmin } = await import('../services/group-admin.js');
    return updateAdmin(ctx, 'promote');
  }
};

const demoteAdmin = {
  name: 'ازل ادمن',
  aliases: ['إزل ادمن', 'ازل-ادمن', 'ازل_ادمن'],
  category: 'إدارة المجموعات',
  requiredRole: 'developer',

  async execute(ctx) {
    if (!(await botIsDeveloper())) {
      return ctx.message.reply('⚠️ البوت ليس في وضع المطور. فعّل `.اعداد بوت مطور` أولًا.');
    }

    const { updateAdmin } = await import('../services/group-admin.js');
    return updateAdmin(ctx, 'demote');
  }
};

export default {
  commands: [promoteAdmin, demoteAdmin]
};
