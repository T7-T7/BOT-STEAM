import { groupContext, targetFromMessage, findParticipant, participantJid, isParticipantAdmin } from './group.js';
import { setGroupMetadata } from './group-cache.js';

export async function updateAdmin(ctx, action) {
  const { message, sock } = ctx;
  const { metadata } = await groupContext(ctx);
  const target = targetFromMessage(message);

  if (!target) {
    throw new Error('⚠️ اعمل منشن للشخص أو رد على رسالته.');
  }

  const participant = findParticipant(metadata, target);
  if (!participant) {
    throw new Error('❌ لم أستطع تحديد العضو داخل المجموعة.');
  }

  const admin = isParticipantAdmin(participant);
  if (action === 'promote' && admin) return message.reply('ℹ️ الشخص مشرف بالفعل.');
  if (action === 'demote' && !admin) return message.reply('ℹ️ الشخص ليس مشرفًا أصلًا.');

  const targetJid = participantJid(participant);
  if (!targetJid) throw new Error('❌ تعذر تحديد هوية العضو.');

  const result = await sock.groupParticipantsUpdate(
    message.chatId,
    [targetJid],
    action
  );

  const failed = result?.find?.(x => String(x.status) !== '200');
  if (failed) throw new Error(`تعذر تنفيذ العملية على العضو (HTTP ${failed.status}).`);

  setGroupMetadata({
    ...metadata,
    participants: metadata.participants.map(p =>
      participantJid(p) === targetJid
        ? { ...p, admin: action === 'promote' ? 'admin' : null, isAdmin: action === 'promote', isSuperAdmin: false }
        : p
    )
  });

  return message.reply(
    action === 'promote'
      ? '✅ تم رفع العضو إلى مشرف.'
      : '✅ تم إزالة إشراف العضو.'
  );
}
