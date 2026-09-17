import { getContentType, jidNormalizedUser } from '@whiskeysockets/baileys';
import { register } from '../security/identity.js';

function unwrapMessage(message) {
  let current = message || {};
  for (let i = 0; i < 6; i++) {
    const type = getContentType(current);
    if (type === 'ephemeralMessage') current = current.ephemeralMessage?.message || current;
    else if (type === 'viewOnceMessage') current = current.viewOnceMessage?.message || current;
    else if (type === 'viewOnceMessageV2') current = current.viewOnceMessageV2?.message || current;
    else if (type === 'documentWithCaptionMessage') current = current.documentWithCaptionMessage?.message || current;
    else break;
  }
  return current;
}

export function text(raw) {
  const m = unwrapMessage(raw?.message);
  const interactive = m.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
  let interactiveId = '';
  if (interactive) {
    try {
      const parsed = JSON.parse(interactive);
      interactiveId = parsed?.id || parsed?.selectedRowId || parsed?.selected_id || '';
    } catch {}
  }

  return m.conversation
    || m.extendedTextMessage?.text
    || m.imageMessage?.caption
    || m.videoMessage?.caption
    || m.documentMessage?.caption
    || m.buttonsResponseMessage?.selectedButtonId
    || m.listResponseMessage?.singleSelectReply?.selectedRowId
    || m.templateButtonReplyMessage?.selectedId
    || interactiveId
    || '';
}

export function quoted(raw) {
  const root = unwrapMessage(raw?.message);
  const c = root?.extendedTextMessage?.contextInfo
    || root?.imageMessage?.contextInfo
    || root?.videoMessage?.contextInfo
    || root?.documentMessage?.contextInfo
    || root?.audioMessage?.contextInfo;

  if (!c?.quotedMessage) return null;

  return {
    message: c.quotedMessage,
    participant: c.participant ? jidNormalizedUser(c.participant) : null,
    participantAlt: c.participantAlt ? String(c.participantAlt) : null,
    id: c.stanzaId || null,
    chatId: raw?.key?.remoteJid || null,
    remoteJid: raw?.key?.remoteJid || null,
    fromMe: Boolean(c.fromMe),
    key: {
      remoteJid: raw?.key?.remoteJid || null,
      id: c.stanzaId || null,
      participant: c.participant || null,
      participantAlt: c.participantAlt || null,
      fromMe: Boolean(c.fromMe)
    }
  };
}

export function mentions(raw) {
  const root = unwrapMessage(raw?.message);
  const c = root?.extendedTextMessage?.contextInfo
    || root?.imageMessage?.contextInfo
    || root?.videoMessage?.contextInfo
    || root?.documentMessage?.contextInfo;
  return c?.mentionedJid || [];
}

export function normalize(raw, sock) {
  if (raw?.key?.participant && raw?.key?.participantAlt) {
    register(
      raw.key.participant,
      raw.key.participantAlt
    );
  }

  const chatId = raw.key.remoteJid;
  const isGroup = chatId?.endsWith('@g.us');
  const sender = isGroup
    ? jidNormalizedUser(raw.key.participant || raw.key.participantAlt || chatId)
    : jidNormalizedUser(chatId);

  return {
    raw,
    id: raw.key.id,
    chatId,
    isGroup,
    sender,
    text: text(raw),
    quoted: quoted(raw),
    mentions: mentions(raw),
    type: getContentType(raw.message) || 'unknown',
    fromMe: !!raw.key.fromMe,
    async reply(content, opts = {}) {
      return sock.sendMessage(
        chatId,
        typeof content === 'string' ? { text: content } : content,
        { quoted: raw, ...opts }
      );
    },
    async react(emoji) {
      return sock.sendMessage(chatId, {
        react: { text: emoji, key: raw.key }
      });
    }
  };
}
