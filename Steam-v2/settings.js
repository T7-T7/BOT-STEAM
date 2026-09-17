import { read, write } from '../database/index.js';
import { sendInteractive, listButton } from '../services/interactive.js';
import { setEnabled } from '../console/index.js';

const defaults = {
  mode: 'public',
  console: true,
  bot: 'user'
};

async function getSettings() {
  return {
    ...defaults,
    ...await read('settings.json', defaults)
  };
}

function sections(s) {
  return [
    {
      title: '🌐 الوضع',
      rows: [
        {
          id: '.اعداد مود عام',
          title: '🌍 الوضع العام',
          description:
            s.mode === 'public'
              ? 'مفعل حاليًا'
              : 'تفعيل الوضع العام'
        },
        {
          id: '.اعداد مود خاص',
          title: '🔒 وضع المطورين',
          description:
            s.mode === 'private'
              ? 'مفعل حاليًا'
              : 'تفعيل وضع المطورين'
        }
      ]
    },
    {
      title: '💻 الكونسول',
      rows: [
        {
          id: '.اعداد طباعة تشغيل',
          title: '📋 طباعة الأوامر',
          description: 'إظهار سجلات الكونسول'
        },
        {
          id: '.اعداد طباعة تعطيل',
          title: '🔇 تعطيل طباعة',
          description: 'إيقاف طباعة الكونسول'
        }
      ]
    },
    {
      title: '🤖 البوت',
      rows: [
        {
          id: '.اعداد بوت مطور',
          title: '🤖 البوت مطور',
          description: 'السماح بعمليات البوت الحساسة'
        },
        {
          id: '.اعداد بوت ليس مطور',
          title: '👤 البوت ليس مطور',
          description: 'تعطيل عمليات البوت الحساسة'
        }
      ]
    }
  ];
}

export default {
  name: 'اعداد',

  aliases: [
    'إعداد',
    'اعدادات',
    'إعدادات'
  ],

  category: 'إدارة',
  requiredRole: 'developer',

  async execute({
    message,
    sock,
    args
  }) {
    const s = await getSettings();

    const key =
      String(args[0] || '').toLowerCase();

    const value =
      args.slice(1).join(' ');

    if (key === 'مود') {
      s.mode =
        /خاص|private/i.test(value)
          ? 'private'
          : 'public';

    } else if (key === 'طباعة') {
      s.console =
        !/تعطيل|off|0/i.test(value);

    } else if (key === 'بوت') {
      s.bot =
        /مطور|developer/i.test(value)
          ? 'developer'
          : 'user';
    }

    if (
      ['مود', 'طباعة', 'بوت'].includes(key)
    ) {
      await write(
        'settings.json',
        s
      );

      if (key === 'طباعة') {
        setEnabled(
          s.console !== false
        );
      }
    }

    const mode =
      s.mode === 'public'
        ? 'الوضع العام'
        : 'وضع المطورين';

    const con =
      s.console
        ? 'طباعة الأوامر'
        : 'تعطيل طباعة';

    const bot =
      s.bot === 'developer'
        ? 'البوت مطور'
        : 'البوت ليس مطور';

    await sendInteractive(
      sock,
      message.chatId,
      {
        text:
          `⚜️ *S T E A M B O T ♖*\n` +
          `⚙️ *إعدادات BOT*\n\n` +
          `┊⌔🌐︙ الوضع : *${mode}*\n` +
          `┊⌔💻︙ الكونسول : *${con}*\n` +
          `┊⌔🤖︙ البوت : *${bot}*\n` +
          `𓂃 ࣪˖ ִֶָ⚜️ 𝑺𝑻𝑬𝑨𝑴 𝑩𝑶𝑻 ♖ ִֶָ ˖ ࣪`,

        title: '',

        footer: '',

        buttons: [
          listButton(
            '𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒',
            sections(s)
          )
        ],

        quoted: message.raw
      }
    );
  }
};
