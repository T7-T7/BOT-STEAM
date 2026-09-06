const chalk = require('chalk');
const cfonts = require('cfonts');

const {
    getConsoleMode
} = require('./access');

const CONSOLE_MODES = Object.freeze({
    NONE: 'none',
    COMMANDS: 'commands',
    ALL: 'all',
    ERRORS: 'errors',
    COMMANDS_ERRORS: 'commands_errors'
});

const BOX_WIDTH = 60;
const INNER_WIDTH = BOX_WIDTH - 2;

/* =========================================================
 * Console Visibility
 * ========================================================= */

function shouldShow(type) {
    const mode = getConsoleMode();

    switch (mode) {
        case CONSOLE_MODES.NONE:
            return false;

        case CONSOLE_MODES.COMMANDS:
            return type === 'command';

        case CONSOLE_MODES.ALL:
            return true;

        case CONSOLE_MODES.ERRORS:
            return type === 'error';

        case CONSOLE_MODES.COMMANDS_ERRORS:
            return (
                type === 'command' ||
                type === 'error'
            );

        default:
            return true;
    }
}

/* =========================================================
 * Terminal Width Helpers
 * ========================================================= */

function visibleWidth(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return 0;
    }

    const text =
        String(value)
            .replace(
                /\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g,
                ''
            );

    let width = 0;

    for (const char of text) {
        const code =
            char.codePointAt(0);

        if (!code) {
            continue;
        }

        if (
            code >= 0x1f300 ||
            code === 0xfe0f ||
            code === 0x200d
        ) {
            width += 2;
        } else {
            width += 1;
        }
    }

    return width;
}

function fitText(
    value,
    width
) {
    let text =
        String(value ?? '');

    if (
        visibleWidth(text) <= width
    ) {
        return text;
    }

    let result = '';

    for (const char of text) {
        const next =
            result + char;

        if (
            visibleWidth(
                next + '…'
            ) > width
        ) {
            break;
        }

        result = next;
    }

    return result + '…';
}

function padText(
    value,
    width
) {
    const text =
        fitText(
            value,
            width
        );

    const missing =
        Math.max(
            0,
            width -
                visibleWidth(text)
        );

    return (
        text +
        ' '.repeat(missing)
    );
}

function border(
    char = '─'
) {
    return char.repeat(
        BOX_WIDTH
    );
}

/* =========================================================
 * Gradient
 * ========================================================= */

function gradientText(text) {
    const colors = [
        chalk.hex('#8B0000'),
        chalk.red,
        chalk.hex('#FF3333'),
        chalk.white,
        chalk.hex('#FF3333'),
        chalk.red,
        chalk.hex('#8B0000')
    ];

    const chars =
        [...String(text)];

    if (!chars.length) {
        return '';
    }

    let output = '';

    for (
        let index = 0;
        index < chars.length;
        index++
    ) {
        const ratio =
            chars.length === 1
                ? 0
                : index /
                    (chars.length - 1);

        const colorIndex =
            Math.min(
                colors.length - 1,
                Math.floor(
                    ratio *
                    colors.length
                )
            );

        output +=
            colors[colorIndex](
                chars[index]
            );
    }

    return output;
}

/* =========================================================
 * Box
 * ========================================================= */

function printBox(
    title,
    rows = []
) {
    const safeTitle =
        fitText(
            title,
            INNER_WIDTH - 2
        );

    const titleWidth =
        visibleWidth(
            safeTitle
        );

    const left =
        Math.max(
            0,
            Math.floor(
                (
                    BOX_WIDTH -
                    titleWidth -
                    6
                ) / 2
            )
        );

    const right =
        Math.max(
            0,
            BOX_WIDTH -
            titleWidth -
            6 -
            left
        );

    console.log('');

    console.log(
        chalk.red('╭') +
        chalk.red(
            '─'.repeat(left)
        ) +
        ' ' +
        chalk.white.bold(
            safeTitle
        ) +
        ' ' +
        chalk.red(
            '─'.repeat(right)
        ) +
        chalk.red('╮')
    );

    for (
        const row of rows
    ) {
        const text =
            padText(
                row,
                INNER_WIDTH
            );

        console.log(
            chalk.red('│') +
            ' ' +
            text +
            ' ' +
            chalk.red('│')
        );
    }

    console.log(
        chalk.red('╰') +
        chalk.red(
            '─'.repeat(
                INNER_WIDTH
            )
        ) +
        chalk.red('╯')
    );

    console.log('');
}

/* =========================================================
 * Time
 * ========================================================= */

function getTime() {
    return new Date()
        .toLocaleTimeString(
            'ar-EG',
            {
                hour12: false
            }
        );
}

/* =========================================================
 * Banner
 * ========================================================= */

function banner() {
    console.log('');

    try {
        cfonts.say(
            'FIX BOT',
            {
                font: 'block',
                align: 'center',
                colors: [
                    'red',
                    'white',
                    'red'
                ],
                background:
                    'transparent',
                letterSpacing: 1,
                space: true
            }
        );
    } catch {
        console.log(
            gradientText(
                'FIX BOT'
            )
        );
    }

    console.log(
        chalk.red(
            border('━')
        )
    );

    console.log(
        chalk.white.bold(
            '                    OFFICIAL BOT'
        )
    );

    console.log(
        chalk.red(
            border('━')
        )
    );

    console.log('');
}

/* =========================================================
 * Startup
 * ========================================================= */

function startup() {
    banner();

    printBox(
        'FIX • SYSTEM',
        [
            `Status     : ${chalk.green(
                'Starting'
            )}`,
            `Time       : ${getTime()}`
        ]
    );
}

/* =========================================================
 * Commands Loaded
 * ========================================================= */

function commandsLoaded(
    count
) {
    if (
        !shouldShow('command')
    ) {
        return;
    }

    printBox(
        'FIX • COMMANDS',
        [
            `Loaded     : ${count}`,
            `Status     : ${chalk.green(
                'Ready'
            )}`
        ]
    );
}

/* =========================================================
 * Connection
 * ========================================================= */

function connection(
    status,
    detail = ''
) {
    if (
        !shouldShow('all')
    ) {
        return;
    }

    const rows = [
        `Status     : ${status}`
    ];

    if (detail) {
        rows.push(
            `Detail     : ${detail}`
        );
    }

    printBox(
        'FIX • CONNECTION',
        rows
    );
}

/* =========================================================
 * Bot Identity
 * ========================================================= */

function botIdentity(
    identity = {}
) {
    if (
        !shouldShow('all')
    ) {
        return;
    }

    const rows = [];

    if (identity.jid) {
        rows.push(
            `JID        : ${identity.jid}`
        );
    }

    if (identity.jidType) {
        rows.push(
            `JID Type   : ${identity.jidType}`
        );
    }

    if (identity.pn) {
        rows.push(
            `PN         : ${identity.pn}`
        );
    }

    if (identity.lid) {
        rows.push(
            `LID        : ${identity.lid}`
        );
    }

    if (!rows.length) {
        rows.push(
            'Identity   : Unknown'
        );
    }

    printBox(
        'FIX • BOT IDENTITY',
        rows
    );
}

/* =========================================================
 * Permissions
 * ========================================================= */

function permissionSystem() {
    if (
        !shouldShow('all')
    ) {
        return;
    }

    printBox(
        'FIX • PERMISSIONS',
        [
            'PUBLIC',
            'DEVELOPER',
            'DEVELOPER_ELITE'
        ]
    );
}

/* =========================================================
 * Incoming Message
 * ========================================================= */

function incomingMessage({
    chatId,
    senderId,
    type,
    content
} = {}) {
    if (
        !shouldShow('all')
    ) {
        return;
    }

    printBox(
        'FIX • MESSAGE',
        [
            `Chat       : ${
                chatId || 'Unknown'
            }`,
            `Sender     : ${
                senderId || 'Unknown'
            }`,
            `Type       : ${
                type || 'Unknown'
            }`,
            `Content    : ${
                content || 'Empty'
            }`
        ]
    );
}

/* =========================================================
 * Command
 * ========================================================= */

function command({
    name,
    senderId,
    chatId,
    args = []
} = {}) {
    if (
        !shouldShow('command')
    ) {
        return;
    }

    printBox(
        'FIX • COMMAND',
        [
            `Name       : .${
                name || 'Unknown'
            }`,
            `Sender     : ${
                senderId || 'Unknown'
            }`,
            `Chat       : ${
                chatId || 'Unknown'
            }`,
            `Args       : ${
                args.length
                    ? args.join(' ')
                    : 'None'
            }`
        ]
    );
}

/* =========================================================
 * Command Result
 * ========================================================= */

function commandResult({
    name,
    status = 'Executed'
} = {}) {
    if (
        !shouldShow('command')
    ) {
        return;
    }

    console.log(
        chalk.red('◆') +
        chalk.white(
            ` .${
                name || 'Unknown'
            }`
        ) +
        chalk.gray(
            ` → ${status}`
        )
    );

    console.log('');
}

/* =========================================================
 * Error
 * ========================================================= */

function error(
    context,
    err
) {
    if (
        !shouldShow('error')
    ) {
        return;
    }

    const message =
        err?.message ||
        err ||
        'Unknown error';

    printBox(
        'FIX • ERROR',
        [
            `Context    : ${
                context || 'Unknown'
            }`,
            `Message    : ${message}`
        ]
    );

    if (err?.stack) {
        console.error(
            chalk.red(
                err.stack
            )
        );
    }
}

/* =========================================================
 * Warning
 * ========================================================= */

function warning(
    context,
    message
) {
    if (
        !shouldShow('all')
    ) {
        return;
    }

    printBox(
        'FIX • WARNING',
        [
            `Context    : ${
                context || 'Unknown'
            }`,
            `Message    : ${
                message || 'Unknown'
            }`
        ]
    );
}

/* =========================================================
 * Reconnect
 * ========================================================= */

function reconnect() {
    if (
        !shouldShow('all')
    ) {
        return;
    }

    printBox(
        'FIX • CONNECTION',
        [
            'Status     : Reconnecting',
            'Delay      : 3000 ms'
        ]
    );
}

/* =========================================================
 * Logged Out
 * ========================================================= */

function loggedOut() {
    if (
        !shouldShow('all')
    ) {
        return;
    }

    printBox(
        'FIX • CONNECTION',
        [
            'Status     : Logged out'
        ]
    );
}

/* =========================================================
 * Exports
 * ========================================================= */

module.exports = {
    CONSOLE_MODES,
    shouldShow,
    banner,
    startup,
    commandsLoaded,
    connection,
    botIdentity,
    permissionSystem,
    incomingMessage,
    command,
    commandResult,
    error,
    warning,
    reconnect,
    loggedOut
};
