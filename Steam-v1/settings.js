const {
    sendInteractiveMessage
} = require('baileys_helper');

const {
    getBotMode,
    getConsoleMode,
    MODES
} = require('../../core/access');

const ACTIONS = Object.freeze({
    MODE_PUBLIC:
        'settings_mode_public',

    MODE_DEVELOPERS:
        'settings_mode_developers',

    CONSOLE_NONE:
        'settings_console_none',

    CONSOLE_COMMANDS:
        'settings_console_commands',

    CONSOLE_ALL:
        'settings_console_all',

    CONSOLE_ERRORS:
        'settings_console_errors',

    CONSOLE_COMMANDS_ERRORS:
        'settings_console_commands_errors'
});

function getModeLabel(mode) {
    if (mode === MODES.DEVELOPERS) {
        return 'وضع المطورين';
    }

    return 'وضع العام';
}

function getConsoleLabel(consoleMode) {
    const labels = {
        none:
            'بدون',

        commands:
            'الأوامر فقط',

        all:
            'كل الرسائل',

        errors:
            'الأخطاء فقط',

        commands_errors:
            'الأوامر والأخطاء'
    };

    return (
        labels[consoleMode] ||
        'كل الرسائل'
    );
}

function buildSections() {
    return [
        {
            title: '🌐 المود',

            rows: [
                {
                    id:
                        ACTIONS.MODE_PUBLIC,

                    title:
                        'وضع العام'
                },

                {
                    id:
                        ACTIONS.MODE_DEVELOPERS,

                    title:
                        'وضع المطورين'
                }
            ]
        },

        {
            title: '💻 الكونسول',

            rows: [
                {
                    id:
                        ACTIONS.CONSOLE_NONE,

                    title:
                        'بدون'
                },

                {
                    id:
                        ACTIONS.CONSOLE_COMMANDS,

                    title:
                        'الأوامر فقط'
                },

                {
                    id:
                        ACTIONS.CONSOLE_ALL,

                    title:
                        'كل الرسائل'
                },

                {
                    id:
                        ACTIONS.CONSOLE_ERRORS,

                    title:
                        'الأخطاء فقط'
                },

                {
                    id:
                        ACTIONS.CONSOLE_COMMANDS_ERRORS,

                    title:
                        'الأوامر والأخطاء'
                }
            ]
        }
    ];
}

async function execute({
    sock,
    chatId
}) {
    if (!sock) {
        throw new Error(
            'Settings menu requires an active socket.'
        );
    }

    if (!chatId) {
        throw new Error(
            'Settings menu requires a chat ID.'
        );
    }

    const currentMode =
        getBotMode();

    const currentConsole =
        getConsoleMode();

    const modeLabel =
        getModeLabel(
            currentMode
        );

    const consoleLabel =
        getConsoleLabel(
            currentConsole
        );

    const sections =
        buildSections();

    const interactiveButtons = [
        {
            name:
                'single_select',

            buttonParamsJson:
                JSON.stringify({
                    title:
                        '𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒',

                    sections
                })
        }
    ];

    const text =
        '𝐅𝐈𝐗 𝐁𝐎𝐓 𝐕𝟏\n' +
        '⚙️ إعدادات البوت\n' +
        '👑 أنت مطور - اختر الإعداد للتغيير\n\n' +
        `🌐 المود: \`${modeLabel}\`\n` +
        `💻 الكونسول: \`${consoleLabel}\`\n` +
        '𝐅𝐈𝐗 𝐁𝐎𝐓 𝐕𝟏';

    await sendInteractiveMessage(
        sock,
        chatId,
        {
            text,

            interactiveButtons
        }
    );
}

module.exports = {
    name:
        'اعدادات',

    aliases: [
        'settings'
    ],

    category:
        'developer',

    description:
        'إدارة وضع البوت وإعدادات الكونسول.',

    usage:
        '.اعدادات',

    execute
};
