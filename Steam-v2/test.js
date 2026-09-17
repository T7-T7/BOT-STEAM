import { sendInteractive, urlButton } from '../services/interactive.js';
import config from '../config.js';

export default {
  name: 'تست',
  aliases: ['test'],
  category: 'عام',
  requiredRole: 'user',

  async execute({ message, sock }) {
    const started = Date.now();
    await message.react('⚡').catch(() => {});
    const elapsed = Date.now() - started;

    try {
      await sendInteractive(sock, message.chatId, {
        text:
          `⚜️ *S T E A M B O T ♖*\n\n` +
          `✅ النظام يعمل بنجاح\n` +
          `┊⌔⏱️︙ الاستجابة : *${elapsed}ms*\n` +
          `𓂃 ࣪˖ ִֶָ⚜️ 𝑺𝑻𝑬𝑨𝑴 𝑩𝑶𝑻 ♖ ִֶָ ˖ ࣪`,
        title: '⎋ STEAM V2',
        footer: '',
        buttons: [
          urlButton('𝐂𝐇𝐀𝐍𝐍𝐄𝐋', config.testChannel)
        ],
        quoted: message.raw
      });
    } catch {
      await message.reply(
        `⚜️ *S T E A M B O T ♖*\n\n` +
        `✅ النظام يعمل بنجاح\n` +
        `┊⌔⏱️︙ الاستجابة : *${elapsed}ms*\n` +
        `𓂃 ࣪˖ ִֶָ⚜️ 𝑺𝑻𝑬𝑨𝑴 𝑩𝑶𝑻 ♖ ִֶָ ˖ ࣪`
      );
    }
  }
};
