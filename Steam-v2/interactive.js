import { proto, generateWAMessageFromContent } from '@whiskeysockets/baileys';

function nativeButton(button) {
  return proto.Message.InteractiveMessage.NativeFlowMessage.NativeFlowButton.create({
    name: String(button?.name || ''),
    buttonParamsJson: String(button?.buttonParamsJson || '{}')
  });
}

function buildBizNode() {
  return {
    tag: 'biz',
    attrs: {
      actual_actors: '2',
      host_storage: '2',
      privacy_mode_ts: String(Math.floor(Date.now() / 1000))
    },
    content: [
      {
        tag: 'interactive',
        attrs: {
          type: 'native_flow',
          v: '1'
        },
        content: [
          {
            tag: 'native_flow',
            attrs: {
              v: '9',
              name: 'mixed'
            }
          }
        ]
      }
    ]
  };
}

export async function sendInteractive(sock, chatId, {
  text = '',
  title = '',
  footer = '',
  buttons = [],
  quoted = null
}) {
  if (!sock?.relayMessage) {
    throw new Error('اتصال WhatsApp غير متاح.');
  }

  const nativeFlowButtons =
    (Array.isArray(buttons) ? buttons : [])
      .map(nativeButton)
      .filter(button => button.name);

  const interactiveMessage =
    proto.Message.InteractiveMessage.create({
      body:
        proto.Message.InteractiveMessage.Body.create({
          text: String(text || '')
        }),

      footer:
        proto.Message.InteractiveMessage.Footer.create({
          text: String(footer || '')
        }),

      header:
        proto.Message.InteractiveMessage.Header.create({
          title: String(title || ''),
          hasMediaAttachment: false
        }),

      nativeFlowMessage:
        proto.Message.InteractiveMessage.NativeFlowMessage.create({
          buttons: nativeFlowButtons,
          messageParamsJson: '{}',
          messageVersion: 1
        })
    });

  const message =
    generateWAMessageFromContent(
      chatId,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },

            interactiveMessage
          }
        }
      },
      {
        userJid: sock.user?.id,
        quoted
      }
    );

  const additionalNodes = [
    buildBizNode()
  ];

  if (!chatId.endsWith('@g.us')) {
    additionalNodes.unshift({
      tag: 'bot',
      attrs: {
        biz_bot: '1'
      }
    });
  }

  await sock.relayMessage(
    chatId,
    message.message,
    {
      messageId: message.key.id,
      additionalNodes
    }
  );

  return message;
}

export function urlButton(displayText, url) {
  return {
    name: 'cta_url',

    buttonParamsJson:
      JSON.stringify({
        display_text: displayText,
        url,
        merchant_url: url
      })
  };
}

export function listButton(title, sections) {
  return {
    name: 'single_select',

    buttonParamsJson:
      JSON.stringify({
        title,
        sections
      })
  };
}

export function quickReply(displayText, id) {
  return {
    name: 'quick_reply',

    buttonParamsJson:
      JSON.stringify({
        display_text: displayText,
        id
      })
  };
}
