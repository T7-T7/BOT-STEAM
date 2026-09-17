import { groupContext, targetFromMessage, findParticipant, participantJid, participantNumber } from '../services/group.js';
import { setGroupMetadata } from '../services/group-cache.js';

export default {
  name: 'طرد',
  category: 'إدارة',
  requiredRole: 'user',

  async execute(ctx) {
    const { message, sock } = ctx;

    try {
      const { metadata } = await groupContext(ctx);
      let target = targetFromMessage(message);

      if (!target) {
        const text = (ctx.args || []).join(' ').trim();
        const number = text.replace(/\D/g, '');
        if (number) target = `${number}@s.whatsapp.net`;
      }

      if (!target) {
        return message.reply(
          '⚠️ حدد الشخص المراد طرده.\n\n' +
          '1️⃣ رد على رسالة الشخص ثم اكتب `.طرد`\n' +
          '2️⃣ منشن الشخص: `.طرد @الشخص`\n' +
          '3️⃣ اكتب رقمه: `.طرد +201002646522`'
        );
      }

      const participant = findParticipant(metadata, target);
      if (!participant) {
        return message.reply('❌ لم أستطع تحديد العضو داخل المجموعة.');
      }

      const targetJid = participantJid(participant);
      const targetNumber = participantNumber(participant);
      const botIds = [sock.user?.id, sock.user?.lid, sock.user?.phoneNumber].filter(Boolean);

      if (botIds.some(id => String(id).split('@')[0].split(':')[0] === String(targetJid).split('@')[0].split(':')[0])) {
        return message.reply('⚠️ لا يمكنني طرد نفسي من المجموعة.');
      }

      const result = await sock.groupParticipantsUpdate(
        message.chatId,
        [targetJid],
        'remove'
      );

      const failed = result?.find?.(x => String(x.status) !== '200');
      if (failed) throw new Error(`تعذر تنفيذ الطرد (HTTP ${failed.status}).`);

      setGroupMetadata({
        ...metadata,
        participants: metadata.participants.filter(p => participantJid(p) !== targetJid)
      });

      return message.reply(`✅ تم طرد العضو @${targetNumber}`);
    } catch (error) {
      console.error('[KICK ERROR]', error);
      return message.reply(`❌ تعذر طرد العضو.\nالسبب: ${error?.message || error}`);
    }
  }
};
