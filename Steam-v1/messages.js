function getMessageText(message) {
    const content = message?.message;

    if (!content) {
        return '';
    }

    return (
        content.conversation ||
        content.extendedTextMessage?.text ||
        content.imageMessage?.caption ||
        content.videoMessage?.caption ||
        content.documentMessage?.caption ||
        ''
    ).trim();
}

function getChatId(message) {
    return message?.key?.remoteJid || null;
}

function getSenderId(message) {
    return (
        message?.key?.participant ||
        message?.participant ||
        message?.key?.remoteJid ||
        null
    );
}

function isFromMe(message) {
    return message?.key?.fromMe === true;
}

function isGroupMessage(message) {
    const jid = getChatId(message);

    return Boolean(
        jid &&
        jid.endsWith('@g.us')
    );
}

function getContextInfo(message) {
    const content = message?.message;

    if (!content) {
        return null;
    }

    return (
        content.extendedTextMessage?.contextInfo ||
        content.imageMessage?.contextInfo ||
        content.videoMessage?.contextInfo ||
        content.documentMessage?.contextInfo ||
        content.audioMessage?.contextInfo ||
        null
    );
}

function getMentionedIds(message) {
    const contextInfo =
        getContextInfo(message);

    if (!contextInfo) {
        return [];
    }

    const ids = [
        ...(Array.isArray(
            contextInfo.mentionedJid
        )
            ? contextInfo.mentionedJid
            : []),

        ...(Array.isArray(
            contextInfo.mentionedJidAlt
        )
            ? contextInfo.mentionedJidAlt
            : [])
    ];

    return [
        ...new Set(
            ids
                .filter(
                    id =>
                        typeof id === 'string' &&
                        id.trim()
                )
                .map(
                    id =>
                        id.trim()
                )
        )
    ];
}

function getPhoneNumberFromText(text) {
    if (
        !text ||
        typeof text !== 'string'
    ) {
        return null;
    }

    const value =
        text
            .trim()
            .replace(
                /^\+/,
                ''
            )
            .replace(
                /[\s()-]/g,
                ''
            );

    if (
        !/^\d{7,15}$/.test(
            value
        )
    ) {
        return null;
    }

    return value;
}

function phoneNumberToPn(number) {
    const normalized =
        getPhoneNumberFromText(
            number
        );

    if (!normalized) {
        return null;
    }

    return `${normalized}@s.whatsapp.net`;
}

/* =========================================================
 * تنظيف قيمة الاختيار من القائمة
 * ========================================================= */

function cleanInteractiveResponseId(value) {
    if (
        typeof value !== 'string'
    ) {
        return null;
    }

    const normalized =
        value
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .trim();

    if (!normalized) {
        return null;
    }

    const lines =
        normalized
            .split('\n')
            .map(
                line =>
                    line.trim()
            )
            .filter(
                line =>
                    line.length > 0
            );

    if (!lines.length) {
        return null;
    }

    return lines[0];
}

/* =========================================================
 * قراءة اختيار القائمة التفاعلية
 * ========================================================= */

function getInteractiveResponseId(message) {
    const content =
        message?.message;

    if (!content) {
        return null;
    }

    /*
     * ========================================
     * WhatsApp List Response
     * ========================================
     */

    const listResponse =
        content.listResponseMessage;

    const selectedRowId =
        listResponse
            ?.singleSelectReply
            ?.selectedRowId;

    if (selectedRowId) {
        const cleaned =
            cleanInteractiveResponseId(
                String(selectedRowId)
            );

        if (cleaned) {
            return cleaned;
        }
    }

    /*
     * ========================================
     * WhatsApp Buttons Response
     * ========================================
     */

    const buttonsResponse =
        content.buttonsResponseMessage;

    const selectedButtonId =
        buttonsResponse
            ?.selectedButtonId;

    if (selectedButtonId) {
        const cleaned =
            cleanInteractiveResponseId(
                String(selectedButtonId)
            );

        if (cleaned) {
            return cleaned;
        }
    }

    /*
     * ========================================
     * Interactive Response
     * ========================================
     */

    const interactiveResponse =
        content.interactiveResponseMessage;

    const nativeFlowResponse =
        interactiveResponse
            ?.nativeFlowResponseMessage;

    const paramsJson =
        nativeFlowResponse
            ?.paramsJson;

    if (paramsJson) {
        try {
            const params =
                JSON.parse(
                    paramsJson
                );

            const possibleIds = [
                params.id,
                params.selectedId,
                params.selectedRowId,
                params.button_id,
                params.buttonId,
                params.rowId
            ];

            const found =
                possibleIds.find(
                    value =>
                        typeof value === 'string' &&
                        value.trim()
                );

            if (found) {
                const cleaned =
                    cleanInteractiveResponseId(
                        String(found)
                    );

                if (cleaned) {
                    return cleaned;
                }
            }
        } catch {
            return null;
        }
    }

    return null;
}

/* =========================================================
 * استخراج أول أمر من نص القائمة
 * ========================================================= */

function extractFirstCommandLine(
    text,
    prefix = '.'
) {
    if (
        !text ||
        typeof text !== 'string'
    ) {
        return null;
    }

    const lines =
        text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .split('\n')
            .map(
                line =>
                    line.trim()
            )
            .filter(
                line =>
                    line.length > 0
            );

    if (!lines.length) {
        return null;
    }

    const firstLine =
        lines[0];

    if (
        !firstLine.startsWith(
            prefix
        )
    ) {
        return null;
    }

    /*
     * مثال:
     *
     * .ping
     * قياس سرعة استجابة البوت
     *
     * نأخذ:
     *
     * .ping
     *
     * فقط.
     */

    return firstLine;
}

/* =========================================================
 * تحديد النص الذي سيتم تحليله كأمر
 * ========================================================= */

function getMessageCommandText(message) {
    /*
     * الأولوية رقم 1:
     * الاختيار التفاعلي الحقيقي.
     */

    const interactiveId =
        getInteractiveResponseId(
            message
        );

    if (interactiveId) {
        return interactiveId;
    }

    /*
     * إذا لم يصل ID تفاعلي واضح،
     * نقرأ النص العادي.
     */

    const normalText =
        getMessageText(
            message
        );

    if (!normalText) {
        return '';
    }

    /*
     * حماية إضافية:
     *
     * إذا كان النص:
     *
     * .ping
     * وصف الأمر
     *
     * نستخدم أول سطر فقط.
     */

    const firstCommandLine =
        extractFirstCommandLine(
            normalText
                .trim(),
            '.'
        );

    if (firstCommandLine) {
        return firstCommandLine;
    }

    return normalText;
}

function createEmptyCommandResult(
    text = ''
) {
    return {
        isCommand: false,
        command: null,
        args: [],
        rawArgs: '',
        text
    };
}

/* =========================================================
 * تحليل الأمر
 * ========================================================= */

function parseCommand(
    text,
    prefix = '.'
) {
    if (
        !text ||
        typeof text !== 'string'
    ) {
        return createEmptyCommandResult();
    }

    const value =
        text.trim();

    if (
        !value.startsWith(
            prefix
        )
    ) {
        return createEmptyCommandResult(
            value
        );
    }

    const withoutPrefix =
        value
            .slice(prefix.length)
            .trim();

    if (!withoutPrefix) {
        return createEmptyCommandResult(
            value
        );
    }

    const parts =
        withoutPrefix.split(
            /\s+/
        );

    let command =
        parts
            .shift()
            .toLowerCase();

    /*
     * ========================================
     * الأوامر ذات الهدف
     * ========================================
     *
     * .بحث-.ping
     * .استرجاع-.ping
     */

    const dottedTarget =
        command.match(
            /^(.+)-\.(.+)$/
        );

    if (dottedTarget) {
        const baseCommand =
            dottedTarget[1];

        const targetCommand =
            dottedTarget[2];

        const dottedCommands = [
            'بحث',
            'استرجاع'
        ];

        if (
            dottedCommands.includes(
                baseCommand
            ) &&
            targetCommand
        ) {
            command =
                baseCommand;

            parts.unshift(
                `.${targetCommand}`
            );
        }
    }

    /*
     * ========================================
     * الأوامر ذات الرقم
     * ========================================
     *
     * .سحب-1
     * .باتش-1
     * .حذف-1
     */

    const indexedCommand =
        command.match(
            /^(.+)-(\d+)$/
        );

    if (indexedCommand) {
        const baseCommand =
            indexedCommand[1];

        const index =
            indexedCommand[2];

        const indexedCommands = [
            'سحب',
            'باتش',
            'حذف'
        ];

        if (
            indexedCommands.includes(
                baseCommand
            )
        ) {
            command =
                baseCommand;

            parts.unshift(
                index
            );
        }
    }

    const rawArgs =
        parts.join(' ');

    return {
        isCommand: true,
        command,
        args: parts,
        rawArgs,
        text: value
    };
}

/* =========================================================
 * البحث عن أمر داخل نص
 * ========================================================= */

function extractEmbeddedCommand(
    text,
    prefix = '.'
) {
    if (
        !text ||
        typeof text !== 'string'
    ) {
        return null;
    }

    const escapedPrefix =
        prefix.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
        );

    const pattern =
        new RegExp(
            `(?:^|[\\s\`"'()[\\]{}:：،,؛;])${escapedPrefix}([\\p{L}\\p{N}_-]+)`,
            'u'
        );

    const match =
        text.match(
            pattern
        );

    if (!match?.[1]) {
        return null;
    }

    return match[1].toLowerCase();
}

/* =========================================================
 * اكتشاف أمر من نتيجة البوت
 * ========================================================= */

function detectResultCommand(text) {
    if (
        !text ||
        typeof text !== 'string'
    ) {
        return null;
    }

    const normalized =
        text
            .replace(
                /[*_~`]/g,
                ''
            )
            .toLowerCase();

    if (
        normalized.includes(
            'ping'
        ) ||
        normalized.includes(
            '🏓'
        )
    ) {
        return 'ping';
    }

    return null;
}

/* =========================================================
 * تحليل أي شكل من أشكال الأوامر
 * ========================================================= */

function parseAnyCommand(
    text,
    prefix = '.'
) {
    const direct =
        parseCommand(
            text,
            prefix
        );

    if (direct.isCommand) {
        return direct;
    }

    const embeddedCommand =
        extractEmbeddedCommand(
            text,
            prefix
        );

    if (embeddedCommand) {
        return {
            isCommand: true,
            command:
                embeddedCommand,
            args: [],
            rawArgs: '',
            text:
                text.trim()
        };
    }

    const resultCommand =
        detectResultCommand(
            text
        );

    if (resultCommand) {
        return {
            isCommand: true,
            command:
                resultCommand,
            args: [],
            rawArgs: '',
            text:
                text.trim()
        };
    }

    return direct;
}

/* =========================================================
 * معلومات الرسالة
 * ========================================================= */

function getMessageInfo(
    message,
    prefix = '.'
) {
    const text =
        getMessageCommandText(
            message
        );

    const parsed =
        parseAnyCommand(
            text,
            prefix
        );

    return Object.freeze({
        message,

        text,

        chatId:
            getChatId(
                message
            ),

        senderId:
            getSenderId(
                message
            ),

        fromMe:
            isFromMe(
                message
            ),

        isGroup:
            isGroupMessage(
                message
            ),

        mentionedIds:
            getMentionedIds(
                message
            ),

        phoneNumber:
            parsed.args?.length === 1
                ? getPhoneNumberFromText(
                    parsed.args[0]
                )
                : null,

        ...parsed
    });
}

/* =========================================================
 * الرسالة المقتبس منها
 * ========================================================= */

function getQuotedMessage(
    message
) {
    const contextInfo =
        getContextInfo(
            message
        );

    return (
        contextInfo
            ?.quotedMessage ||
        null
    );
}

function getQuotedSenderId(
    message
) {
    const contextInfo =
        getContextInfo(
            message
        );

    return (
        contextInfo?.participant ||
        contextInfo?.participantAlt ||
        null
    );
}

function getQuotedMessageId(
    message
) {
    const contextInfo =
        getContextInfo(
            message
        );

    if (
        contextInfo?.stanzaId
    ) {
        return String(
            contextInfo.stanzaId
        ).trim();
    }

    return null;
}

function getQuotedMessageText(
    message
) {
    const quoted =
        getQuotedMessage(
            message
        );

    if (!quoted) {
        return '';
    }

    return (
        quoted.conversation ||
        quoted.extendedTextMessage?.text ||
        quoted.imageMessage?.caption ||
        quoted.videoMessage?.caption ||
        quoted.documentMessage?.caption ||
        ''
    ).trim();
}

function getQuotedMessageInfo(
    message,
    prefix = '.'
) {
    const quotedMessage =
        getQuotedMessage(
            message
        );

    const text =
        getQuotedMessageText(
            message
        );

    const parsed =
        parseAnyCommand(
            text,
            prefix
        );

    return Object.freeze({
        quotedMessage,

        quotedMessageId:
            getQuotedMessageId(
                message
            ),

        quotedSenderId:
            getQuotedSenderId(
                message
            ),

        text,

        ...parsed
    });
}

module.exports = {
    getMessageText,
    getChatId,
    getSenderId,
    isFromMe,
    isGroupMessage,
    getContextInfo,
    getMentionedIds,
    getPhoneNumberFromText,
    phoneNumberToPn,

    cleanInteractiveResponseId,
    getInteractiveResponseId,
    extractFirstCommandLine,
    getMessageCommandText,

    parseCommand,
    extractEmbeddedCommand,
    detectResultCommand,
    parseAnyCommand,
    getMessageInfo,

    getQuotedMessage,
    getQuotedSenderId,
    getQuotedMessageId,
    getQuotedMessageText,
    getQuotedMessageInfo
};
