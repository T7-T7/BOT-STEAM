import { search, forbidden, download } from '../services/youtube.js';

export default {
  name: 'صوت',
  category: 'وسائط',
  requiredRole: 'user',
  async execute(ctx) {
    const q = ctx.args.join(' ').trim();
    if (!q) return ctx.message.reply('⚠️ اكتب وصف الصوت.');
    if (forbidden(q)) return ctx.message.reply('🚫 هذا النوع من المحتوى الصوتي محظور.');

    try {
      const r = await search(q, 8);
      if (r.blocked) return ctx.message.reply('🚫 هذا النوع من المحتوى الصوتي محظور.');
      const v = r.results?.find(x => !forbidden(`${x.title} ${x.channel}`));
      if (!v) return ctx.message.reply('❌ لم أجد صوتًا مناسبًا.');

      const file = await download({
        url: v.url,
        type: 'audio',
        quality: '128',
        title: v.title,
        channel: v.channel
      });

      return ctx.message.reply({
        audio: file.buffer,
        mimetype: /\.mp3$/i.test(file.filename || '') ? 'audio/mpeg' : 'audio/mp4',
        fileName: file.filename
      });
    } catch (e) {
      return ctx.message.reply(
        `⚠️ تعذر تنفيذ أمر الصوت الآن.\nالسبب: ${e?.message || e}`
      );
    }
  }
};
