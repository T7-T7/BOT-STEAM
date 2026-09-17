import {
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  proto,
  downloadContentFromMessage
} from '@whiskeysockets/baileys';

const FIXED_TEXT_COLOR = 0xFF2196F3;

function getQuotedMedia(message) {
  const quoted = message?.quoted?.message;

  if (!quoted) {
    return { message: null, type: null };
  }

  if (quoted.imageMessage) {
    return { message: quoted.imageMessage, type: 'image' };
  }

  if (quoted.videoMessage) {
    return { message: quoted.videoMessage, type: 'video' };
  }

  return { message: null, type: null };
}

async function downloadQuotedMedia(mediaMessage, type) {
  const stream = await downloadContentFromMessage(mediaMessage, type);
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (!chunks.length) {
    throw new Error('تم العثور على الوسائط لكن تعذر تحميل بياناتها.');
  }

  return Buffer.concat(chunks);
}

function statusContext() {
  return {
    isGroupStatus: true,
    pairedMediaType: 'NOT_PAIRED_MEDIA',
    statusSourceType: 4,
    statusAttributions: [{ type: 10 }],
    featureEligibilities: {
      canBeReshared: true,
      canReceiveMultiReact: true
    },
    statusAudienceMetadata: {
      audienceType: 0
    }
  };
}

async function sendMediaPost({ sock, message, media, mediaType, caption }) {
  const downloaded = await downloadQuotedMedia(media, mediaType);

  const prepared = await prepareWAMessageMedia(
    { [mediaType]: downloaded },
    { upload: sock.waUploadToServer }
  );

  const messageKey = mediaType === 'image'
    ? 'imageMessage'
    : 'videoMessage';

  const contentMessage = {
    [messageKey]: {
      ...prepared[messageKey],
      caption: caption || '',
      contextInfo: statusContext()
    }
  };

  const webMessage = proto.Message.fromObject(contentMessage);

  const waMessage = generateWAMessageFromContent(
    message.chatId,
    webMessage,
    {
      userJid: sock.user?.id,
      quoted: message.raw
    }
  );

  await sock.relayMessage(
    message.chatId,
    waMessage.message,
    {
      messageId: waMessage.key.id,
      additionalNodes: [
        {
          tag: 'meta',
          attrs: { is_group_status: 'true' }
        }
      ]
    }
  );
}

async function sendTextPost({ sock, message, text }) {
  const messageId =
    sock.generateMessageTag?.() ||
    `steam-post-${Date.now()}`;

  await sock.relayMessage(
    message.chatId,
    {
      extendedTextMessage: {
        text,
        textArgb: 0xFFFFFFFF,
        backgroundArgb: FIXED_TEXT_COLOR,
        font: 5,
        previewType: 0,
        inviteLinkGroupTypeV2: 0,
        contextInfo: statusContext()
      }
    },
    {
      messageId,
      additionalNodes: [
        {
          tag: 'meta',
          attrs: { is_group_status: 'true' }
        }
      ]
    }
  );
}

export default {
  name: 'بوست',
  category: 'وسائط',
  requiredRole: 'user',

  async execute(ctx) {
    const { message, sock, args } = ctx;

    if (!message?.isGroup) {
      return message.reply(
        '⚠️ `.بوست` مخصص لستوري المجموعة. استخدمه داخل المجموعة.'
      );
    }

    const text = Array.isArray(args)
      ? args.join(' ').trim()
      : '';

    const media = getQuotedMedia(message);

    if (!text && !media.message) {
      return message.reply(
        '⚠️ اكتب النص بعد `.بوست` أو اعمل Reply على صورة/فيديو ثم اكتب `.بوست`.'
      );
    }

    try {
      if (media.message) {
        await sendMediaPost({
          sock,
          message,
          media: media.message,
          mediaType: media.type,
          caption: text
        });
      } else {
        await sendTextPost({
          sock,
          message,
          text
        });
      }

      await message.react?.('✅');
      return true;
    } catch (error) {
      console.error('[POST ERROR]', error);
      await message.react?.('❌');

      return message.reply(
        `❌ تعذر نشر البوست.\nالسبب: ${error?.message || error}`
      );
    }
  }
};
