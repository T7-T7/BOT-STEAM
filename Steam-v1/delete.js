const {
    getQuotedMessageId
} = require('../../core/messages');

const {
    softDeleteCommand
} = require('../../core/deleted-commands');

const {
    reloadCommands
} = require('../../core/command-loader');

function formatDeleteResponse(record) {
    return (
        `⚜️ *𝐁𝐎𝐓 𝐅𝐈𝐗*\n` +
        `  ⊱ ───────────── ⊰\n` +
        `🖥 *الأمر:* \`.${record.commandName}\`\n` +
        `📄 *الملف:* \`${record.fileName}\`\n` +
        `📊 *الحالة:* محذوف مؤقتًا\n` +
        `⏳ *الحذف النهائي:* \`بعد 24 ساعة\`\n` +
        `📂 *المسار للعودة:* \`${record.originalRelativePath}\`\n` +
        `🗄 *الإسترجاع:* \`.استرجاع-.${record.commandName}\`\n` +
        `  ⊱ ───────────── ⊰`
    );
}

async function execute({
    sock,
    message,
    chatId,
    commands,
    getTrackedCommandMessage,
    removeTrackedCommandMessage
}) {
    const quotedMessageId =
        getQuotedMessageId(message);

    if (!quotedMessageId) {
        await sock.sendMessage(
            chatId,
            {
                text:
                    '⚠️ *طريقة الاستخدام:*\n\n' +
                    'قم بالرد على رسالة ناتجة من أمر البوت ثم أرسل:\n' +
                    '`.حذف`'
            },
            {
                quoted: message
            }
        );

        return {
            success: false,
            reason: 'reply_required'
        };
    }

    const tracked =
        getTrackedCommandMessage(
            chatId,
            quotedMessageId
        );

    if (!tracked) {
        await sock.sendMessage(
            chatId,
            {
                text:
                    '❌ *تعذر تحديد الأمر.*\n\n' +
                    'الرسالة التي تم الرد عليها ليست مسجلة كرسالة ناتجة من أمر البوت.'
            },
            {
                quoted: message
            }
        );

        return {
            success: false,
            reason: 'message_not_tracked'
        };
    }

    const result =
        softDeleteCommand({
            commandName:
                tracked.commandName,

            aliases:
                tracked.aliases || [],

            filePath:
                tracked.filePath
        });

    if (!result.success) {
        let text =
            '❌ *تعذر حذف الأمر.*';

        if (
            result.reason ===
            'already_deleted'
        ) {
            text =
                '⚠️ *هذا الأمر محذوف مؤقتًا بالفعل.*';
        }

        if (
            result.reason ===
            'file_not_found'
        ) {
            text =
                '❌ *ملف الأمر غير موجود.*';
        }

        if (
            result.reason ===
            'invalid_path'
        ) {
            text =
                '❌ *مسار ملف الأمر غير صالح.*';
        }

        if (
            result.reason ===
            'move_failed'
        ) {
            text =
                '❌ *تعذر نقل ملف الأمر إلى سلة الحذف.*';
        }

        await sock.sendMessage(
            chatId,
            {
                text
            },
            {
                quoted: message
            }
        );

        return result;
    }

    /*
     * تحديث قائمة الأوامر فورًا
     * بدون إعادة تشغيل البوت.
     */
    try {
        reloadCommands(commands);
    } catch (error) {
        console.error(
            '⚠️ تعذر تحديث قائمة الأوامر:',
            error?.message ||
            error
        );
    }

    await sock.sendMessage(
        chatId,
        {
            text:
                formatDeleteResponse(
                    result.record
                )
        },
        {
            quoted: message
        }
    );

    /*
     * إزالة رسالة الأمر من سجل التتبع
     * بعد نجاح عملية الحذف.
     */
    if (
        typeof removeTrackedCommandMessage ===
        'function'
    ) {
        removeTrackedCommandMessage(
            chatId,
            quotedMessageId
        );
    }

    return {
        success: true,
        record:
            result.record
    };
}

module.exports = {
    name: 'حذف',

    aliases: [
        'delete'
    ],

    description:
        'حذف أمر مؤقتًا لمدة 24 ساعة',

    usage:
        '.حذف',

    category:
        'public',

    execute
};
