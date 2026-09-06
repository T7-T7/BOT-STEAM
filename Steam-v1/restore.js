const path = require('path');

const {
    reloadCommands
} = require('../../core/command-loader');

const {
    cleanupExpiredCommands,
    restoreCommand
} = require('../../core/deleted-commands');

function cleanTarget(target) {
    let value = String(target || '').trim();

    if (value.startsWith('.')) {
        value = value.slice(1);
    }

    return value
        .trim()
        .toLowerCase();
}

function getRelativeCommandPath(filePath) {
    const commandsRoot = path.join(
        __dirname,
        '..',
        '..'
    );

    return path
        .relative(
            commandsRoot,
            filePath
        )
        .split(path.sep)
        .join('/');
}

function formatRestoreResponse(record) {
    const relativePath =
        record.originalRelativePath ||
        getRelativeCommandPath(
            record.originalPath
        );

    return (
        `🗄 *𝐑𝐄𝐓𝐔𝐑𝐍*\n` +
        `~*⊹‏⊱≼━━━⌬〔⚜️〕⌬━━━≽⊰⊹*~\n` +
        `💻 *أسم الأمر:* \`.${record.commandName}\`\n` +
        `📄 *أسم الملف:* \`${record.fileName}\`\n` +
        `📂 *المسار في اللوحة:* \`${relativePath}\`\n` +
        `📊 *الحالة:* تم الإسترجاع بنجاح!\n` +
        `⊱ ─────────────── ⊰\n` +
        `💡 *يمكنك تجربة في الشات الآن فوراً، باستخدام [.${record.commandName}]*\n` +
        `~*⊹‏⊱≼━━━⌬〔⚜️〕⌬━━━≽⊰⊹*~`
    );
}

async function execute({
    sock,
    message,
    chatId,
    args,
    commands
}) {
    cleanupExpiredCommands();

    const target =
        cleanTarget(args?.[0]);

    if (!target) {
        await sock.sendMessage(
            chatId,
            {
                text:
                    `⚠️ *طريقة الاستخدام:*\n\n` +
                    `قم بإرسال:\n` +
                    `\`.استرجاع-.ping\`\n\n` +
                    `لاسترجاع أمر محذوف مؤقتًا.`
            },
            {
                quoted: message
            }
        );

        return {
            success: false,
            reason: 'target_required'
        };
    }

    const result =
        restoreCommand(target);

    if (!result.success) {
        let text =
            `❌ *تعذر استرجاع الأمر.*`;

        if (
            result.reason ===
            'not_deleted'
        ) {
            text =
                `⚠️ *الأمر غير موجود في سجل الحذف المؤقت.*\n\n` +
                `الأمر \`.${target}\` إما موجود بالفعل أو لم يتم حذفه بواسطة النظام.`;
        }

        if (
            result.reason ===
            'expired'
        ) {
            text =
                `⏳ *انتهت مدة الاسترجاع.*\n\n` +
                `الأمر \`.${target}\` تجاوز مدة الـ24 ساعة وتم حذفه نهائيًا.`;
        }

        if (
            result.reason ===
            'original_path_exists'
        ) {
            text =
                `⚠️ *تعذر الاسترجاع.*\n\n` +
                `يوجد ملف بالفعل في المسار الأصلي للأمر.`;
        }

        if (
            result.reason ===
            'restore_failed'
        ) {
            text =
                `❌ *فشل استرجاع ملف الأمر.*\n\n` +
                `لم يتمكن النظام من إعادة الملف إلى مكانه الأصلي.`;
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

    try {
        reloadCommands(
            commands
        );
    } catch (error) {
        console.error(
            '⚠️ تعذر تحديث قائمة الأوامر بعد الاسترجاع:',
            error?.message ||
            error
        );

        await sock.sendMessage(
            chatId,
            {
                text:
                    `⚠️ *تمت إعادة الملف، لكن تعذر تحديث قائمة الأوامر تلقائيًا.*\n\n` +
                    `جرّب إعادة تشغيل البوت.`
            },
            {
                quoted: message
            }
        );

        return {
            success: false,
            reason: 'reload_failed',
            record: result.record
        };
    }

    await sock.sendMessage(
        chatId,
        {
            text:
                formatRestoreResponse(
                    result.record
                )
        },
        {
            quoted: message
        }
    );

    return {
        success: true,
        record:
            result.record
    };
}

module.exports = {
    name: 'استرجاع',
    aliases: ['restore'],
    description: 'استرجاع أمر محذوف خلال 24 ساعة',
    usage: '.استرجاع-.ping',
    category: 'public',
    execute
};
