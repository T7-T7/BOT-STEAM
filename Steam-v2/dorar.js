import {
  exactHadith,
  parseExactVerseQuery,
  parseExactSurahQuery,
  exactTafseerVerse,
  exactTafseerSurah
} from '../services/dorar.js';

import {
  validHadith,
  validTafseer
} from '../services/sensitive-guard.js';

function safeText(value, max = 7000) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
    .trim();
}

function splitForWhatsApp(value, max = 6500) {
  const text = String(value || '').trim();

  if (text.length <= max) {
    return [text];
  }

  const out = [];
  let rest = text;

  while (rest.length > max) {
    let cut = rest.lastIndexOf('\n', max);

    if (cut < max * 0.55) {
      cut = rest.lastIndexOf(' ', max);
    }

    if (cut < max * 0.55) {
      cut = max;
    }

    out.push(
      rest.slice(0, cut).trim()
    );

    rest = rest
      .slice(cut)
      .trimStart();
  }

  if (rest) {
    out.push(rest);
  }

  return out;
}

function hadithText(row, query) {
  return (
    `📚 *الدرر السنية — حديث*\n\n` +
    `🔎 البحث: *${safeText(query, 500)}*\n` +
    `⏱️ زمن البحث: *${Number(row.elapsedSeconds || 0).toFixed(3)} ثانية*\n\n` +
    `*⎋ - ${safeText(row.text, 6000)}*\n\n` +
    `⚖️ خلاصة حكم المحدث: *${safeText(row.grade, 600).replace(/[\[\]]/g, '')}*\n` +
    `👤 الراوي: *${safeText(row.narrator, 600).replace(/[\[\]]/g, '')}*\n` +
    `📚 المحدث: *${safeText(row.scholar, 600).replace(/[\[\]]/g, '')}*\n` +
    `📖 المصدر: *${safeText(row.source, 600).replace(/[\[\]]/g, '')}*\n` +
    `📄 الصفحة أو الرقم: *${safeText(row.page, 300).replace(/[\[\]]/g, '')}*\n` +
    `📂 التخريج: *${safeText(row.takhrij, 1800).replace(/[\[\]]/g, '') || 'غير مذكور في الصفحة المستلمة'}*\n\n` +
    `🔗 *عرض الحديث والتحقق:*\n` +
    `${row.url || 'https://dorar.net/hadith/search?q=' + encodeURIComponent(query)}`
  );
}

function tafseerHeader(ref, query, elapsed) {
  return (
    `📚 *الدرر السنية — تفسير*\n\n` +
    `🔎 البحث: *${safeText(query, 400)}*\n` +
    `📖 السورة: *${ref.surahName}*\n` +
    `⏱️ زمن البحث: *${Number(elapsed || 0).toFixed(3)} ثانية*\n\n`
  );
}

/*
 * ─────────────────────────────────────────────
 * أمر: درر حديث
 * ─────────────────────────────────────────────
 *
 * مثال:
 *
 * .درر حديث صوم
 *
 * "درر حديث" أصبح اسم أمر مستقل.
 */
const hadithCommand = {
  name: 'درر حديث',

  aliases: [
    'درر-حديث',
    'درر_حديث'
  ],

  category: 'Dorar',

  requiredRole: 'user',

  async execute(ctx) {
    const raw =
      ctx.args
        .join(' ')
        .trim();

    if (!raw) {
      return ctx.message.reply(
        '⚠️ اكتب نص الحديث بعد `.درر حديث` بوضوح.'
      );
    }

    const r =
      await exactHadith(raw);

    if (r.requiresQuotes) {
      return ctx.message.reply(
        '⚠️ اكتب نص الحديث بعد `.درر حديث` بوضوح.'
      );
    }

    const row =
      r.results?.[0];

    if (!row) {
      return ctx.message.reply(
        `❌ لم أجد حديثًا مطابقًا بدرجة تحقق كافية للبحث: *${safeText(raw, 500)}*\n` +
        'جرّب جزءًا أوضح من نص الحديث.'
      );
    }

    if (!validHadith(row)) {
      return ctx.message.reply(
        '❌ وصلت نتيجة حديث، لكن تعذر التحقق من مصدرها بشكل آمن؛ لذلك لم يتم إرسالها.'
      );
    }

    return ctx.message.reply(
      hadithText(
        {
          ...row,
          elapsedSeconds:
            r.elapsedSeconds
        },
        raw
      )
    );
  }
};

/*
 * ─────────────────────────────────────────────
 * أمر: درر تفسير
 * ─────────────────────────────────────────────
 *
 * أمثلة:
 *
 * .درر تفسير آية الكرسي
 * .درر تفسير سورة الفاتحة
 * .درر تفسير سورة البقرة 255
 */
const tafseerCommand = {
  name: 'درر تفسير',

  aliases: [
    'درر-تفسير',
    'درر_تفسير'
  ],

  category: 'Dorar',

  requiredRole: 'user',

  async execute(ctx) {
    const raw =
      ctx.args
        .join(' ')
        .trim();

    if (!raw) {
      return ctx.message.reply(
        '⚠️ حدد المطلوب بوضوح:\n\n' +
        '• سورة كاملة: `.درر تفسير سورة الفاتحة`\n' +
        '• سورة + آية: `.درر تفسير سورة الفاتحة 2`\n' +
        '• آية مشهورة: `.درر تفسير آية الكرسي`'
      );
    }

    /*
     * أولًا: تفسير آية محددة.
     */
    const verse =
      parseExactVerseQuery(raw);

    if (verse) {
      const r =
        await exactTafseerVerse(
          verse
        );

      const body =
        r.results?.[0]?.text;

      if (!body) {
        return ctx.message.reply(
          '❌ لم أجد صفحة التفسير للآية المطلوبة: ' +
          safeText(raw, 400) +
          '\nجرّب كتابة اسم السورة ورقم الآية، مثل: `.درر تفسير سورة البقرة 255`.'
        );
      }

      if (
        !validTafseer(
          r.results[0]
        )
      ) {
        return ctx.message.reply(
          '❌ وصلت صفحة تفسير، لكن تعذر التحقق من نص التفسير بشكل آمن؛ لذلك لم يتم إرسالها.'
        );
      }

      const text =
        tafseerHeader(
          verse,
          raw,
          r.elapsedSeconds
        ) +
        `*⎋ - ${safeText(body, 6000)}*\n\n` +
        `🔗 ${r.url}`;

      return ctx.message.reply(
        text
      );
    }

    /*
     * ثانيًا: تفسير سورة كاملة.
     */
    const surah =
      parseExactSurahQuery(raw);

    if (surah) {
      const r =
        await exactTafseerSurah(
          surah
        );

      if (!r.results?.length) {
        return ctx.message.reply(
          '❌ لم أجد تفسير السورة المطلوبة.'
        );
      }

      const cleanResults =
        r.results.filter(
          validTafseer
        );

      if (!cleanResults.length) {
        return ctx.message.reply(
          '❌ نتائج التفسير غير صالحة؛ تم منع إرسال نص غير موثوق.'
        );
      }

      const blocks =
        cleanResults
          .map(
            x =>
              `*⎋ الآية ${x.index}*\n${safeText(x.text, 6000)}`
          )
          .join('\n\n');

      const messages =
        splitForWhatsApp(
          tafseerHeader(
            surah,
            raw,
            r.elapsedSeconds
          ) +
          blocks +
          `\n\n🔗 ${r.url}`,
          6500
        );

      for (
        let i = 0;
        i < messages.length;
        i++
      ) {
        await ctx.message.reply(
          i === 0
            ? messages[i]
            : `📚 *الدرر السنية — تفسير سورة ${surah.surahName}*\n\n${messages[i]}`
        );
      }

      return;
    }

    if (
      /(?:آية|اية|ايه|الآية|الاية|الايه)\s*\d+/u
        .test(raw)
    ) {
      return ctx.message.reply(
        '⚠️ رقم الآية موجود، لكن اسم السورة غير محدد.\n' +
        'اكتب مثلًا: `.درر تفسير سورة البقرة 255`'
      );
    }

    return ctx.message.reply(
      '⚠️ حدد المطلوب بوضوح:\n\n' +
      '• سورة كاملة: `.درر تفسير سورة الفاتحة`\n' +
      '• سورة + آية: `.درر تفسير سورة الفاتحة 2`\n' +
      '• آية مشهورة: `.درر تفسير آية الكرسي`\n\n' +
      'الآية بدون اسم السورة لا يمكنني تخمينها.'
    );
  }
};

/*
 * ملف واحد ← أمران مستقلان.
 */
export default {
  commands: [
    hadithCommand,
    tafseerCommand
  ]
};
