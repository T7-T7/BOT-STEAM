import {
  prepareWAMessageMedia
} from '@whiskeysockets/baileys';

function normalizeColor(value) {
  const hex = String(value || '#7B2CBF').replace('#', '').trim();
  const n = parseInt(hex.length === 6 ? `FF${hex}` : hex, 16);
  return Number.isFinite(n) ? n : 0xff7b2cbf;
}

function errorMessage(error) {
  const code = error?.cause?.code || error?.code;
  const message = String(error?.message || error || '');
  if (code === 'ECONNABORTED' || message === 'terminated') {
    return 'انقطع اتصال الوسائط أثناء الرفع إلى WhatsApp.';
  }
  if (message.includes('Media upload failed on all hosts')) {
    return 'تعذر رفع الوسائط إلى خوادم WhatsApp. أعد المحاولة.';
  }
  return message || 'تعذر نشر ستوري المجموعة.';
}

function textMessage(content) {
  const text = String(content?.text || '').trim();
  if (!text) throw new Error('نص الستوري فارغ.');

  // Keep the text path independent from media preparation.
  // This is the raw groupStatusMessageV2 shape used by working Baileys implementations.
  return {
    groupStatusMessageV2: {
      message: {
        conversation: text
      }
    }
  };
}

async function mediaMessage(sock, content) {
  let source;
  let key;

  if (content?.image) {
    source = { image: content.image };
    key = 'imageMessage';
  } else if (content?.video) {
    source = { video: content.video };
    key = 'videoMessage';
  } else {
    throw new Error('نوع الوسائط غير مدعوم.');
  }

  if (content.caption) source.caption = String(content.caption);
  if (content.mimetype) source.mimetype = String(content.mimetype);
  if (content.seconds != null && Number(content.seconds) > 0) {
    source.seconds = Number(content.seconds);
  }

  // IMPORTANT:
  // Do not wrap the prepared media in generateWAMessageFromContent().
  // The reference implementation relays the prepared imageMessage/videoMessage
  // directly as groupStatusMessageV2.message. This is materially different from
  // the previous STEAM implementation and avoids adding fields that rc14 may not
  // expect on this raw status path.
  const prepared = await prepareWAMessageMedia(source, {
    upload: sock.waUploadToServer
  });

  if (!prepared?.[key]) {
    throw new Error('تعذر تجهيز الوسائط لستوري المجموعة.');
  }

  return {
    groupStatusMessageV2: {
      message: prepared
    }
  };
}

export async function sendGroupStatus(sock, groupJid, content) {
  if (!sock?.waUploadToServer) {
    throw new Error('إصدار Baileys الحالي لا يوفر uploader المطلوب لستوري المجموعة.');
  }
  if (!groupJid?.endsWith('@g.us')) {
    throw new Error('ستوري المجموعة يحتاج إلى معرف مجموعة صالح.');
  }

  const payload = Object.prototype.hasOwnProperty.call(content || {}, 'text')
    ? textMessage(content)
    : await mediaMessage(sock, content);

  try {
    // Exactly one relay attempt. Retrying after relay is unsafe because it can
    // create duplicate statuses. Baileys handles its media upload host rotation.
    const message = await sock.relayMessage(groupJid, payload, {});
    return message;
  } catch (error) {
    throw new Error(errorMessage(error));
  }
}
