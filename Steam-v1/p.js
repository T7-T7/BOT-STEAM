const {
    getCommandList
} = require('../../core/command-loader');

const {
    getCommandRole,
    ROLES
} = require('../../core/permissions');

const {
    sendInteractiveMessage
} = require('baileys_helper');

function getDeveloperCommands(commands) {
    return getCommandList(commands).filter(
        command =>
            getCommandRole(
                command.name
            ) === ROLES.DEVELOPER
    );
}

function getEliteCommands(commands) {
    return getCommandList(commands).filter(
        command =>
            getCommandRole(
                command.name
            ) === ROLES.DEVELOPER_ELITE &&
            command.name !== 'p'
    );
}

function buildSections(commands) {
    const developerCommands =
        getDeveloperCommands(commands);

    const eliteCommands =
        getEliteCommands(commands);

    const sections = [];

    if (developerCommands.length) {
        sections.push({
            title:
                '𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑',

            rows:
                developerCommands.map(
                    command => ({
                        id:
                            `.${command.name}`,

                        title:
                            `.${command.name}`
                    })
                )
        });
    }

    if (eliteCommands.length) {
        sections.push({
            title:
                '𝐄𝐋𝐈𝐓𝐄-𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑',

            rows:
                eliteCommands.map(
                    command => ({
                        id:
                            `.${command.name}`,

                        title:
                            `.${command.name}`
                    })
                )
        });
    }

    return sections;
}

async function execute({
    sock,
    chatId,
    commands
}) {
    if (!sock) {
        throw new Error(
            'Developer menu requires an active socket.'
        );
    }

    if (!chatId) {
        throw new Error(
            'Developer menu requires a chat ID.'
        );
    }

    if (!commands) {
        throw new Error(
            'Developer menu requires loaded commands.'
        );
    }

    const sections =
        buildSections(
            commands
        );

    const interactiveButtons = [
        {
            name:
                'single_select',

            buttonParamsJson:
                JSON.stringify({
                    title:
                        '𝐄𝐋𝐈𝐓𝐄-𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑',

                    sections
                })
        }
    ];

    await sendInteractiveMessage(
        sock,
        chatId,
        {
            text:
                '𝐅𝐈𝐗 𝐁𝐎𝐓 𝐕𝟏\n' +
                '📂 *اوامر نخبة*\n\n' +
                '`اختر من القائمة:`',

            footer:
                '𝐅𝐈𝐗 𝐁𝐎𝐓 𝐕𝟏',

            title:
                '𝐅𝐈𝐗 𝐁𝐎𝐓 𝐕𝟏',

            interactiveButtons
        }
    );
}

module.exports = {
    name:
        'p',

    aliases: [],

    category:
        'developer',

    description:
        'قائمة أوامر المطور والنخبة.',

    usage:
        '.p',

    execute
};
