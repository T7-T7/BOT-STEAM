const {
    getCommandList
} = require('../../core/command-loader');

const config = require('../../config');

async function execute({
    sock,
    message,
    chatId,
    commands
}) {
    const commandList =
        getCommandList(commands);

    const commandCount =
        commandList.length;

    const text =
`⚜️ *𝐃𝐀𝐓𝐀 𝐁𝐎𝐓*
~*⊹‏⊱≼━━━⌬〔⚜️〕⌬━━━≽⊰⊹*~
🖥️ 𝐁𝐨𝐭 : *𝐅𝐈𝐗*
📈 𝐕𝐞𝐫𝐬𝐢𝐨𝐧 :*${config.version}*
⚡ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 : *${commandCount}*
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
    name: 'داتا',
    aliases: ['data'],

    description:
        'عرض معلومات البوت الأساسية',

    usage:
        '.داتا',

    category:
        'public',

    execute
};
