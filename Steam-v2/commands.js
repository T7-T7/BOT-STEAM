import { entries } from '../heart/registry.js';
import { sendInteractive, listButton } from '../services/interactive.js';
import { resolve } from '../security/index.js';

const menuCategories = [
  {
    key: 'Tools',
    icon: '🧰',
    sourceCategories: [
      'Tools',
      'وسائط',
      'أرشيف',
      'إدارة'
    ],

    /*
     * ترتيب أوامر الأدوات حسب الوظيفة.
     * لا يعتمد على ترتيب الملفات.
     */
    order: [
      'رفع ادمن',
      'ازل ادمن',

      'ارشيف',
      'اضف',

      'صوت',
      'بوست',

      'دليت',

      'تغيير',
      'غير صوره'
    ]
  },

  {
    key: 'Games',
    icon: '🏓',
    sourceCategories: [
      'ألعاب'
    ]
  },

  {
    key: 'Test',
    icon: '🧪',
    sourceCategories: [
      'عام'
    ],

    names: [
      'تست'
    ]
  },

  {
    key: 'Dorar',
    icon: '🌙',
    sourceCategories: [
      'Dorar',
      'دينية'
    ]
  }
];

/*
 * =========================================================
 * أدوات مساعدة
 * =========================================================
 */

function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function isDeveloperCommand(command) {
  return normalize(
    command?.requiredRole
  ) === 'developer';
}

/*
 * هل الأمر ينتمي لهذا القسم؟
 */
function belongsToCategory(
  command,
  category
) {
  if (
    !command ||
    isDeveloperCommand(command)
  ) {
    return false;
  }

  const commandCategory =
    String(
      command.category || ''
    ).trim();

  if (
    category.sourceCategories.includes(
      commandCategory
    )
  ) {
    return true;
  }

  if (
    Array.isArray(category.names) &&
    category.names.some(
      name =>
        normalize(name) ===
        normalize(command.name)
    )
  ) {
    return true;
  }

  return false;
}

/*
 * =========================================================
 * ترتيب الأوامر
 * =========================================================
 */

function sortCommands(
  commands,
  category
) {
  const list =
    Array.isArray(commands)
      ? [...commands]
      : [];

  /*
   * إذا كان للقسم ترتيب مخصص،
   * استخدمه.
   */
  if (
    Array.isArray(category.order) &&
    category.order.length
  ) {
    const orderMap =
      new Map(
        category.order.map(
          (name, index) => [
            normalize(name),
            index
          ]
        )
      );

    return list.sort(
      (a, b) => {
        const aName =
          normalize(a.name);

        const bName =
          normalize(b.name);

        const aIndex =
          orderMap.has(aName)
            ? orderMap.get(aName)
            : Number.MAX_SAFE_INTEGER;

        const bIndex =
          orderMap.has(bName)
            ? orderMap.get(bName)
            : Number.MAX_SAFE_INTEGER;

        /*
         * الأوامر المحددة في الترتيب
         * تأتي أولًا.
         */
        if (aIndex !== bIndex) {
          return aIndex - bIndex;
        }

        /*
         * أي أمر جديد غير موجود
         * في الترتيب يوضع بعدهم.
         */
        return aName.localeCompare(
          bName,
          'ar'
        );
      }
    );
  }

  return list;
}

/*
 * =========================================================
 * بناء الأقسام
 * =========================================================
 */

function buildGroups(
  allCommands
) {
  const groups =
    new Map();

  for (
    const category of menuCategories
  ) {
    const seen =
      new Set();

    const commands =
      allCommands.filter(
        command => {
          if (
            !belongsToCategory(
              command,
              category
            )
          ) {
            return false;
          }

          const name =
            normalize(
              command.name
            );

          /*
           * منع التكرار.
           */
          if (
            !name ||
            seen.has(name)
          ) {
            return false;
          }

          seen.add(name);

          return true;
        }
      );

    groups.set(
      category.key,
      sortCommands(
        commands,
        category
      )
    );
  }

  return groups;
}

/*
 * =========================================================
 * مدة التشغيل
 * =========================================================
 */

function formatUptime(
  seconds
) {
  const total =
    Math.floor(
      Number(seconds) || 0
    );

  const days =
    Math.floor(
      total / 86400
    );

  const hours =
    Math.floor(
      (total % 86400) / 3600
    );

  const minutes =
    Math.floor(
      (total % 3600) / 60
    );

  const secs =
    total % 60;

  const parts = [];

  if (days) {
    parts.push(
      `${days} يوم`
    );
  }

  if (hours) {
    parts.push(
      `${hours} ساعة`
    );
  }

  if (minutes) {
    parts.push(
      `${minutes} دقيقة`
    );
  }

  /*
   * إذا لم تمر دقيقة،
   * أظهر الثواني.
   */
  if (!parts.length) {
    parts.push(
      `${secs} ثانية`
    );
  }

  return parts.join(' ');
}

/*
 * =========================================================
 * التاريخ والوقت
 * =========================================================
 */

function getDateTime() {
  const now =
    new Date();

  return {
    date:
      new Intl.DateTimeFormat(
        'ar-EG',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }
      ).format(now),

    time:
      new Intl.DateTimeFormat(
        'ar-EG',
        {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }
      ).format(now)
  };
}

/*
 * =========================================================
 * رقم صاحب الأمر
 * =========================================================
 */

function getSenderNumber(
  message
) {
  const raw =
    message?.raw;

  const candidates = [
    raw?.key?.participantAlt,
    raw?.key?.participant,
    raw?.key?.remoteJidAlt,
    raw?.key?.remoteJid,
    message?.sender
  ];

  for (
    const value of candidates
  ) {
    if (!value) {
      continue;
    }

    const original =
      String(value).trim();

    try {
      const resolved =
        resolve(original);

      if (resolved) {
        const number =
          String(resolved)
            .split('@')[0]
            .replace(/\D/g, '');

        if (number) {
          return number;
        }
      }
    } catch {}

    const number =
      original
        .split('@')[0]
        .replace(/\D/g, '');

    if (number) {
      return number;
    }
  }

  return 'غير معروف';
}

/*
 * =========================================================
 * سطر القسم في القائمة الرئيسية
 * =========================================================
 */

function buildCategoryLine(
  category,
  commands
) {
  const count =
    Array.isArray(commands)
      ? commands.length
      : 0;

  return (
    `┊⌔${category.icon}︙ ` +
    `${category.key} • ${count} أمر`
  );
}

/*
 * =========================================================
 * البحث عن القسم
 * =========================================================
 */

function findSection(
  value
) {
  const wanted =
    normalize(value);

  return menuCategories.find(
    category =>
      normalize(
        category.key
      ) === wanted
  );
}

/*
 * =========================================================
 * زر SECTIONS
 * =========================================================
 */

function buildSections(
  groups
) {
  return [
    {
      title:
        '⚜️ أقسام STEAM BOT',

      rows:
        menuCategories.map(
          category => {
            const commands =
              groups.get(
                category.key
              ) || [];

            return {
              id:
                `.قسم_أوامر ${category.key}`,

              title:
                `${category.icon} ${category.key} • ${commands.length} أمر`,

              description:
                ''
            };
          }
        )
    }
  ];
}

/*
 * =========================================================
 * اسم الأمر داخل القسم
 * =========================================================
 */

function formatCommandName(
  command
) {
  return `♖//*.${command.name}*`;
}

/*
 * =========================================================
 * اسم القسم بالعربي
 * =========================================================
 */

function getSectionDisplayName(
  section
) {
  if (
    section.key === 'Tools'
  ) {
    return 'الأدوات';
  }

  if (
    section.key === 'Games'
  ) {
    return 'الألعاب';
  }

  if (
    section.key === 'Test'
  ) {
    return 'الاختبار';
  }

  if (
    section.key === 'Dorar'
  ) {
    return 'الدرر';
  }

  return section.key;
}

/*
 * =========================================================
 * رسالة القسم
 * =========================================================
 */

function buildCategoryMessage(
  section,
  commands
) {
  const lines = [
    `${section.icon} *${getSectionDisplayName(section)}*`,
    '━━━━━━━━━━━━━━━━━━━━'
  ];

  for (
    const command of commands
  ) {
    lines.push(
      formatCommandName(
        command
      )
    );
  }

  lines.push(
    '━━━━━━━━━━━━━━━━━━━━',
    '𓂃 ࣪˖ ִֶָ⚜️ 𝑺𝑻𝑬𝑨𝑴 𝑩𝑶𝑻 ♖ ִֶָ ˖ ࣪'
  );

  return lines.join('\n');
}

/*
 * =========================================================
 * الأمر الرئيسي
 * =========================================================
 */

export default {
  name: 'اوامر',

  aliases: [
    'أوامر',
    'commands',
    'قسم_أوامر'
  ],

  category: 'عام',

  requiredRole: 'user',

  async execute({
    message,
    sock,
    args
  }) {
    if (
      !message?.chatId ||
      !sock
    ) {
      return false;
    }

    /*
     * كل الأوامر ما عدا developer.
     */
    const allCommands =
      entries().filter(
        command =>
          !isDeveloperCommand(
            command
          )
      );

    /*
     * بناء وترتيب الأقسام.
     */
    const groups =
      buildGroups(
        allCommands
      );

    /*
     * =====================================================
     * عرض قسم محدد
     * =====================================================
     */

    if (
      Array.isArray(args) &&
      args.length
    ) {
      const selectedName =
        args.join(' ').trim();

      const section =
        findSection(
          selectedName
        );

      if (!section) {
        await message.reply(
          `⚠️ *القسم [ ${selectedName} ] غير موجود.*`
        );

        return true;
      }

      const commands =
        groups.get(
          section.key
        ) || [];

      if (!commands.length) {
        await message.reply(
          `⚠️ *القسم [ ${section.key} ] لا يحتوي على أوامر حاليًا.*`
        );

        return true;
      }

      await message.reply(
        buildCategoryMessage(
          section,
          commands
        )
      );

      return true;
    }

    /*
     * =====================================================
     * بيانات المستخدم
     * =====================================================
     */

    const senderNumber =
      getSenderNumber(
        message
      );

    const {
      date,
      time
    } =
      getDateTime();

    const uptime =
      formatUptime(
        process.uptime()
      );

    /*
     * =====================================================
     * القائمة الرئيسية
     * =====================================================
     */

    const text = [
      '⚜️ *S T E A M B O T ♖*',
      '',
      `┊⌔👤︙ الأسم : *@${senderNumber}*`,
      `┊⌔⏱️︙ التشغيل : *${uptime}*`,
      `┊⌔📅︙ التاريخ : *${date}*`,
      `┊⌔📟︙ الوقت : *${time}*`,
      '',
      buildCategoryLine(
        menuCategories[0],
        groups.get('Tools')
      ),
      buildCategoryLine(
        menuCategories[1],
        groups.get('Games')
      ),
      buildCategoryLine(
        menuCategories[2],
        groups.get('Test')
      ),
      buildCategoryLine(
        menuCategories[3],
        groups.get('Dorar')
      ),
      '',
      ' ࣪˖ ִֶָ⚜️ اختر القسم من الأسفل ♖ ִֶָ ˖ ࣪',
      '━━━━━━━━━━━━━━━━━━━━',
      '𓂃 ࣪˖ ִֶָ⚜️ 𝑺𝑻𝑬𝑨𝑴 𝑩𝑶𝑻 ♖ ִֶָ ˖ ࣪'
    ].join('\n');

    /*
     * =====================================================
     * إرسال القائمة التفاعلية
     * =====================================================
     */

    await sendInteractive(
      sock,
      message.chatId,
      {
        text,

        footer: '',

        buttons: [
          listButton(
            '𝐒𝐄𝐂𝐓𝐈𝐎𝐍𝐒',
            buildSections(
              groups
            )
          )
        ],

        quoted:
          message.raw
      }
    );

    return true;
  }
};
