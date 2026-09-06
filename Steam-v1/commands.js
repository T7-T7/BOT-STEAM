const {
    getCommandList
} = require('../../core/command-loader');

const {
    getCommandRole,
    ROLES
} = require('../../core/permissions');

async function execute({
    sock,
    chatId,
    commands
}) {
    const publicCommands =
        getCommandList(commands)
            .filter(command =>
                getCommandRole(command.name) ===
                ROLES.PUBLIC
            );

    const commandLines =
        publicCommands.map(
            (command, index) =>
                `*${index + 1} - [.${command.name}]*`
        );

    const text =
        '🏓 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒\n' +
        '~*⊹‏⊱≼━━━⌬〔⚜️〕⌬━━━≽⊰⊹*~\n' +
        commandLines.join('\n') +
        '\n' +
        '~*⊹‏⊱≼━━━⌬〔⚜️〕⌬━━━≽⊰⊹*~';

    await sock.sendMessage(
        chatId,
        {
            text
        }
    );
}

module.exports = {
    name: 'اوامر',

    aliases: [
        'أوامر',
        'commands'
    ],

    description:
        'عرض قائمة أوامر البوت',

    usage:
        '.اوامر',

    category:
        'public',

    execute
};
