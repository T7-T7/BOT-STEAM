const {
    getCommandList
} = require('../core/command-loader');

const {
    getCommandRole,
    ROLES
} = require('../core/permissions');

const {
    sendInteractiveMessage
} = require('baileys_helper');

function getVisibleCommands({ commands }) {
    const commandList = getCommandList(commands);

    return commandList.filter(command => {
        const role = getCommandRole(command.name);
        return role === ROLES.PUBLIC;
    });
}

function buildSections(commandList) {
    return [
        {
            title: '𝐅𝐈𝐗 𝐁𝐎𝐓 𝐕𝟏',
            rows: commandList.map(command => ({
                id: `.${command.name}`,
                title: `.${command.name}`,
                description: command.description || 'تنفيذ الأمر'
            }))
        }
    ];
}

async function sendCommandMenu({
    sock,
    message,
    chatId,
    commands
}) {
    if (!sock) {
        throw new Error('Command menu requires an active socket.');
    }

    if (!chatId) {
        throw new Error('Command menu requires a chat ID.');
    }

    if (!commands) {
        throw new Error('Command menu requires loaded commands.');
    }

    const visibleCommands = getVisibleCommands({
        commands
    });

    const sections = buildSections(visibleCommands);

    const interactiveButtons = [
        {
            name: 'single_select',

            buttonParamsJson: JSON.stringify({
                title: '𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒',
                sections
            })
        }
    ];

    await sendInteractiveMessage(
        sock,
        chatId,
        {
            text:
                `📂 *${visibleCommands.length} أوامر متاحة*\n\n` +
                '`اختر من القائمة:`',

            footer: '𝐅𝐈𝐗 𝐁𝐎𝐓 𝐕𝟏',

            title: '𝐅𝐈𝐗 𝐁𝐎𝐓 𝐕𝟏',

            interactiveButtons
        }
    );

    return {
        type: 'single_select',
        commandCount: visibleCommands.length
    };
}

module.exports = {
    getVisibleCommands,
    buildSections,
    sendCommandMenu
};
