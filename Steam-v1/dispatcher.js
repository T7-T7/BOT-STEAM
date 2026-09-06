const fs = require('fs');
const path = require('path');

const {
    getMessageInfo,
    getInteractiveResponseId,
    getMessageText
} = require('./messages');

const {
    checkCommandAccess,
    getAccessContext,
    setBotMode,
    setConsoleMode,
    MODES,
    ROLES
} = require('./access');

const {
    getCommand
} = require('./command-loader');

const consoleUI =
    require('./console');

const COMMAND_MESSAGES_FILE =
    path.join(
        __dirname,
        '..',
        'data',
        'command-messages.json'
    );

const MAX_TRACKED_MESSAGES = 500;

/* =========================================================
 * إعدادات القائمة التفاعلية
 * ========================================================= */

const SETTINGS_ACTIONS = Object.freeze({
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

function getConsoleLabel(
    consoleMode
) {
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

function getModeLabel(
    mode
) {
    if (
        mode === MODES.DEVELOPERS
    ) {
        return 'وضع المطورين';
    }

    return 'وضع العام';
}

/* =========================================================
 * معلومات الرسالة للكونسول
 * ========================================================= */

function getIncomingMessageType(
    message
) {
    const content =
        message?.message;

    if (!content) {
        return 'Unknown';
    }

    const types = {
        conversation:
            'Text',

        extendedTextMessage:
            'Text',

        imageMessage:
            'Image',

        videoMessage:
            'Video',

        audioMessage:
            'Audio',

        stickerMessage:
            'Sticker',

        documentMessage:
            'Document',

        contactMessage:
            'Contact',

        contactsArrayMessage:
            'Contacts',

        locationMessage:
            'Location',

        liveLocationMessage:
            'Live Location',

        listResponseMessage:
            'Interactive',

        buttonsResponseMessage:
            'Interactive',

        interactiveResponseMessage:
            'Interactive',

        reactionMessage:
            'Reaction',

        pollCreationMessage:
            'Poll',

        pollUpdateMessage:
            'Poll Response',

        protocolMessage:
            'Protocol',

        viewOnceMessage:
            'View Once',

        ephemeralMessage:
            'Ephemeral',

        viewOnceMessageV2:
            'View Once',

        viewOnceMessageV2Extension:
            'View Once'
    };

    for (
        const key of Object.keys(
            types
        )
    ) {
        if (
            content[key]
        ) {
            return types[key];
        }
    }

    return 'Unknown';
}

function getIncomingMessageContent(
    message
) {
    const interactiveId =
        getInteractiveResponseId(
            message
        );

    if (
        interactiveId
    ) {
        return interactiveId;
    }

    const text =
        getMessageText(
            message
        );

    if (text) {
        return text;
    }

    const type =
        getIncomingMessageType(
            message
        );

    return `[${type}]`;
}

function logIncomingMessage(
    message
) {
    const info =
        getMessageInfo(
            message,
            '.'
        );

    consoleUI.incomingMessage({
        chatId:
            info.chatId,

        senderId:
            info.senderId,

        type:
            getIncomingMessageType(
                message
            ),

        content:
            getIncomingMessageContent(
                message
            )
    });
}

/* =========================================================
 * معالجة اختيار إعدادات البوت
 * ========================================================= */

async function handleSettingsAction({
    sock,
    message,
    chatId,
    action
}) {
    if (
        !action ||
        !action.startsWith(
            'settings_'
        )
    ) {
        return false;
    }

    const access =
        await getAccessContext(
            sock,
            message
        );

    if (
        access.role !==
        ROLES.DEVELOPER
    ) {
        await sock.sendMessage(
            chatId,
            {
                text:
                    '❌ *هذا الإعداد متاح للمطور فقط.*'
            }
        );

        return true;
    }

    let changed = false;
    let title = '';
    let value = '';

    switch (action) {
        case SETTINGS_ACTIONS.MODE_PUBLIC:
            changed =
                setBotMode(
                    MODES.PUBLIC
                );

            title =
                '🌐 المود';

            value =
                getModeLabel(
                    MODES.PUBLIC
                );

            break;

        case SETTINGS_ACTIONS.MODE_DEVELOPERS:
            changed =
                setBotMode(
                    MODES.DEVELOPERS
                );

            title =
                '🌐 المود';

            value =
                getModeLabel(
                    MODES.DEVELOPERS
                );

            break;

        case SETTINGS_ACTIONS.CONSOLE_NONE:
            changed =
                setConsoleMode(
                    'none'
                );

            title =
                '💻 الكونسول';

            value =
                getConsoleLabel(
                    'none'
                );

            break;

        case SETTINGS_ACTIONS.CONSOLE_COMMANDS:
            changed =
                setConsoleMode(
                    'commands'
                );

            title =
                '💻 الكونسول';

            value =
                getConsoleLabel(
                    'commands'
                );

            break;

        case SETTINGS_ACTIONS.CONSOLE_ALL:
            changed =
                setConsoleMode(
                    'all'
                );

            title =
                '💻 الكونسول';

            value =
                getConsoleLabel(
                    'all'
                );

            break;

        case SETTINGS_ACTIONS.CONSOLE_ERRORS:
            changed =
                setConsoleMode(
                    'errors'
                );

            title =
                '💻 الكونسول';

            value =
                getConsoleLabel(
                    'errors'
                );

            break;

        case SETTINGS_ACTIONS.CONSOLE_COMMANDS_ERRORS:
            changed =
                setConsoleMode(
                    'commands_errors'
                );

            title =
                '💻 الكونسول';

            value =
                getConsoleLabel(
                    'commands_errors'
                );

            break;

        default:
            return false;
    }

    if (!changed) {
        await sock.sendMessage(
            chatId,
            {
                text:
                    '❌ *تعذر حفظ الإعداد.*'
            }
        );

        return true;
    }

    await sock.sendMessage(
        chatId,
        {
            text:
`✅ *تم تحديث الإعداد* ⚙️
${title} : \`${value}\``
        }
    );

    return true;
}

/* =========================================================
 * تخزين رسائل الأوامر
 * ========================================================= */

function ensureStorageDirectory() {
    fs.mkdirSync(
        path.dirname(
            COMMAND_MESSAGES_FILE
        ),
        {
            recursive: true
        }
    );
}

function ensureStorage() {
    ensureStorageDirectory();

    if (
        !fs.existsSync(
            COMMAND_MESSAGES_FILE
        )
    ) {
        writeStorage({
            messages: []
        });
    }
}

function readStorage() {
    ensureStorage();

    try {
        const content =
            fs.readFileSync(
                COMMAND_MESSAGES_FILE,
                'utf8'
            );

        const data =
            JSON.parse(
                content
            );

        if (
            !data ||
            !Array.isArray(
                data.messages
            )
        ) {
            return {
                messages: []
            };
        }

        return data;
    } catch {
        return {
            messages: []
        };
    }
}

function writeStorage(data) {
    ensureStorageDirectory();

    fs.writeFileSync(
        COMMAND_MESSAGES_FILE,
        `${JSON.stringify(
            data,
            null,
            4
        )}\n`,
        'utf8'
    );
}

function createMessageKey(
    chatId,
    messageId
) {
    if (
        !chatId ||
        !messageId
    ) {
        return null;
    }

    return `${chatId}:${messageId}`;
}

function loadTrackedMessages() {
    const data =
        readStorage();

    const messages =
        new Map();

    for (
        const item
        of data.messages
    ) {
        if (
            !item ||
            !item.chatId ||
            !item.messageId ||
            !item.filePath
        ) {
            continue;
        }

        const key =
            createMessageKey(
                item.chatId,
                item.messageId
            );

        if (!key) {
            continue;
        }

        messages.set(
            key,
            item
        );
    }

    return messages;
}

function saveTrackedMessages(
    commandMessages
) {
    const items =
        [
            ...commandMessages.values()
        ]
            .sort(
                (
                    first,
                    second
                ) =>
                    Number(
                        first.createdAt || 0
                    ) -
                    Number(
                        second.createdAt || 0
                    )
            )
            .slice(
                -MAX_TRACKED_MESSAGES
            );

    writeStorage({
        messages: items
    });
}

/* =========================================================
 * Socket التتبع
 * ========================================================= */

function createTrackedSocket(
    sock,
    command,
    tracker
) {
    return new Proxy(
        sock,
        {
            get(
                target,
                property
            ) {
                if (
                    property !==
                    'sendMessage'
                ) {
                    return Reflect.get(
                        target,
                        property,
                        target
                    );
                }

                return async function (
                    chatId,
                    content,
                    options
                ) {
                    const sentMessage =
                        await target.sendMessage(
                            chatId,
                            content,
                            options
                        );

                    try {
                        const messageId =
                            sentMessage
                                ?.key
                                ?.id;

                        const remoteJid =
                            sentMessage
                                ?.key
                                ?.remoteJid ||
                            chatId;

                        if (
                            messageId &&
                            remoteJid
                        ) {
                            tracker({
                                messageId,
                                chatId:
                                    remoteJid,
                                commandName:
                                    command.name,
                                aliases:
                                    command.aliases,
                                filePath:
                                    command.filePath
                            });
                        }
                    } catch (
                        trackingError
                    ) {
                        consoleUI.error(
                            'COMMAND MESSAGE TRACKING',
                            trackingError
                        );
                    }

                    return sentMessage;
                };
            }
        }
    );
}

/* =========================================================
 * Dispatcher
 * ========================================================= */

function createDispatcher(
    sock,
    commands,
    options = {}
) {
    const prefix =
        options.prefix || '.';

    const commandMessages =
        loadTrackedMessages();

    function trackCommandMessage(
        data
    ) {
        if (
            !data?.chatId ||
            !data?.messageId ||
            !data?.filePath
        ) {
            return;
        }

        const key =
            createMessageKey(
                data.chatId,
                data.messageId
            );

        if (!key) {
            return;
        }

        commandMessages.set(
            key,
            {
                messageId:
                    data.messageId,

                chatId:
                    data.chatId,

                commandName:
                    data.commandName,

                aliases:
                    Array.isArray(
                        data.aliases
                    )
                        ? [
                            ...data.aliases
                        ]
                        : [],

                filePath:
                    data.filePath,

                createdAt:
                    Date.now()
            }
        );

        while (
            commandMessages.size >
            MAX_TRACKED_MESSAGES
        ) {
            const firstKey =
                commandMessages
                    .keys()
                    .next()
                    .value;

            if (!firstKey) {
                break;
            }

            commandMessages.delete(
                firstKey
            );
        }

        try {
            saveTrackedMessages(
                commandMessages
            );
        } catch (error) {
            consoleUI.error(
                'COMMAND MESSAGE STORAGE',
                error
            );
        }
    }

    function getTrackedCommandMessage(
        chatId,
        messageId
    ) {
        const key =
            createMessageKey(
                chatId,
                messageId
            );

        if (!key) {
            return null;
        }

        return (
            commandMessages.get(
                key
            ) || null
        );
    }

    function removeTrackedCommandMessage(
        chatId,
        messageId
    ) {
        const key =
            createMessageKey(
                chatId,
                messageId
            );

        if (!key) {
            return false;
        }

        const removed =
            commandMessages.delete(
                key
            );

        if (removed) {
            try {
                saveTrackedMessages(
                    commandMessages
                );
            } catch (error) {
                consoleUI.error(
                    'COMMAND MESSAGE STORAGE',
                    error
                );
            }
        }

        return removed;
    }

    async function dispatch(
        message
    ) {
        try {
            /*
             * ========================================
             * تسجيل الرسالة الواردة
             * ========================================
             *
             * هذا مستقل تمامًا عن الأوامر.
             *
             * لذلك:
             *
             * هلا
             *
             * تظهر كـ MESSAGE فقط.
             *
             * أما:
             *
             * .ping
             *
             * فتظهر كـ MESSAGE ثم COMMAND.
             */
            logIncomingMessage(
                message
            );

            const info =
                getMessageInfo(
                    message,
                    prefix
                );

            const interactiveId =
                getInteractiveResponseId(
                    message
                );

            /*
             * ========================================
             * إعدادات البوت
             * ========================================
             */

            if (
                interactiveId &&
                interactiveId.startsWith(
                    'settings_'
                )
            ) {
                return {
                    handled:
                        await handleSettingsAction({
                            sock,
                            message,
                            chatId:
                                info.chatId,
                            action:
                                interactiveId
                        }),
                    type:
                        'settings'
                };
            }

            if (
                !info.isCommand
            ) {
                return {
                    handled: false,
                    reason:
                        'not_command'
                };
            }

            const command =
                getCommand(
                    commands,
                    info.command
                );

            if (!command) {
                consoleUI.command({
                    name:
                        info.command,

                    senderId:
                        info.senderId,

                    chatId:
                        info.chatId,

                    args:
                        info.args
                });

                consoleUI.commandResult({
                    name:
                        info.command,

                    status:
                        'Unknown command'
                });

                return {
                    handled: false,
                    reason:
                        'unknown_command',
                    command:
                        info.command
                };
            }

            consoleUI.command({
                name:
                    command.name,

                senderId:
                    info.senderId,

                chatId:
                    info.chatId,

                args:
                    info.args
            });

            const access =
                await checkCommandAccess(
                    sock,
                    message,
                    command.name
                );

            if (
                !access.allowed
            ) {
                consoleUI.commandResult({
                    name:
                        command.name,

                    status:
                        `Denied - ${access.role || 'Unknown'}`
                });

                return {
                    handled: false,
                    reason:
                        'no_permission',
                    command:
                        command.name,
                    role:
                        access.role
                };
            }

            const trackedSock =
                createTrackedSocket(
                    sock,
                    command,
                    trackCommandMessage
                );

            const context =
                Object.freeze({
                    sock:
                        trackedSock,

                    realSock:
                        sock,

                    message,

                    info,

                    command,

                    commands,

                    access,

                    args:
                        info.args,

                    text:
                        info.text,

                    rawArgs:
                        info.rawArgs,

                    chatId:
                        info.chatId,

                    senderId:
                        info.senderId,

                    isGroup:
                        info.isGroup,

                    fromMe:
                        info.fromMe,

                    getTrackedCommandMessage,

                    removeTrackedCommandMessage
                });

            const result =
                await command.execute(
                    context
                );

            consoleUI.commandResult({
                name:
                    command.name,

                status:
                    '✓ Executed'
            });

            return {
                handled: true,

                command:
                    command.name,

                result
            };
        } catch (error) {
            consoleUI.error(
                'COMMAND DISPATCHER',
                error
            );

            return {
                handled: false,

                reason:
                    'execution_error',

                error
            };
        }
    }

    return Object.freeze({
        dispatch,

        getTrackedCommandMessage,

        removeTrackedCommandMessage
    });
}

module.exports = {
    createDispatcher
};
