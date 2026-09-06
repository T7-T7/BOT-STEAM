const {
    getElite
} = require('../../core/permissions');

function formatNumber(jid) {
    return String(jid || '')
        .replace(
            '@s.whatsapp.net',
            ''
        )
        .replace(
            /\D/g,
            ''
        );
}

async function execute({
    sock,
    message,
    chatId
}) {
    const elite =
        getElite();

    if (elite.length === 0) {
        await sock.sendMessage(
            chatId,
            {
                text:
`⚜️ *𝐁𝐎𝐓 𝐅𝐈𝐗*
~*⊹‏⊱≼━━━⌬〔⚜️〕⌬━━━≽⊰⊹*~
♟️ 𝐄𝐋𝐈𝐓𝐄
  ⊱ ───────────── ⊰
📭 *قائمة النخبة فارغة.*
~*⊹‏⊱≼━━━⌬〔⚜️〕⌬━━━≽⊰⊹*~`
            },
            {
                quoted: message
            }
        );

        return;
    }

    const rows =
        elite
            .map(
                (jid, index) =>
                    `𝟏-${index + 1}-𝐄𝐋𝐈𝐓𝐄 :*${formatNumber(jid)}*`
            )
            .join('\n');

    const text =
`⚜️ *𝐁𝐎𝐓 𝐅𝐈𝐗*
~*⊹‏⊱≼━━━⌬〔⚜️〕⌬━━━≽⊰⊹*~
♟️ 𝐄𝐋𝐈𝐓𝐄
  ⊱ ───────────── ⊰
${rows}
~*⊹‏⊱≼━━━⌬〔⚜️〕⌬━━━≽⊰⊹*~`;

    await sock.sendMessage(
        chatId,
        {
            text
        },
        {
            quoted: message
        }
    );
}

module.exports = {
    name: 'نخبة-عرض',

    aliases: [
        'نخبةعرض'
    ],

    description:
        'عرض قائمة أعضاء النخبة',

    usage:
        '.نخبة-عرض',

    category:
        'developer',

    execute
};
