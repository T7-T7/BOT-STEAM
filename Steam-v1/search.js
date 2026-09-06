const path = require('path');

const {
    getCommand,
    normalizeCommandName
} = require('../../core/command-loader');

const {
    cleanupExpiredCommands,
    searchCommand
} = require('../../core/deleted-commands');

function cleanTarget(target) {
    let value = String(target || '').trim();

    if (value.startsWith('.')) {
        value = value.slice(1);
    }

    return normalizeCommandName(value);
}

function formatRemainingTime(milliseconds) {
    const totalMinutes = Math.max(
        1,
        Math.ceil(milliseconds / 60000)
    );

    const hours = Math.floor(
        totalMinutes / 60
    );

    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) {
        return `بعد ${hours} ساعة و${minutes} دقيقة`;
    }

    if (hours > 0) {
        return `بعد ${hours} ساعة`;
    }

    return `بعد ${minutes} دقيقة`;
}

function getRelativeCommandPath(filePath) {
    const commandsRoot = path.join(
        __dirname,
        '..',
        '..'
    );

    return path
        .relative(commandsRoot, filePath)
        .split(path.sep)
        .join('/');
}

function formatCurrentCommand(command) {
    const relativePath =
        getRelativeCommandPath(
            command.filePath
        );

    return (
        `📂 *𝐅𝐈𝐋𝐄*\n` +
        `  ⊱ ───────────── ⊰\n` +
        `🖥 *الأمر:* \`.${command.name}\`\n` +
        `📄 *الملف:* \`${path.basename(command.filePath)}\`\n` +
        `📂 *المسار في اللوحة:* \`${relativePath}\`\n` +
        `  ⊱ ───────────── ⊰`
    );
}

function formatDeletedCommand(record) {
    const remaining =
        formatRemainingTime(
            record.remainingMs
        );

    return (
        `⚜️ *𝐁𝐎𝐓 𝐅𝐈𝐗*\n` +
        `  ⊱ ───────────── ⊰\n` +
        `🖥 *الأمر:* \`.${record.commandName}\`\n` +
        `📄 *الملف:* \`${record.fileName}\`\n` +
        `💾 *الحذف النهائي:* \`${remaining}\`\n` +
        `📊 *الحالة:* محذوف مؤقتًا\n` +
        `📂 *المسار للعوده:* \`${record.originalRelativePath}\`\n` +
        `🗄 *الإسترجاع :* \`.استرجاع-.${record.commandName}\`\n` +
        `  ⊱ ───────────── ⊰`
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
                    `\`.بحث-.ping\`\n\n` +
                    `للبحث عن حالة الأمر.`
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

    /*
     * البحث داخل الأوامر الموجودة حاليًا.
     */
    const command =
        getCommand(
            commands,
            target
        );

    if (command) {
        await sock.sendMessage(
            chatId,
            {
                text:
                    formatCurrentCommand(
                        command
                    )
            },
            {
                quoted: message
            }
        );

        return {
            success: true,
            status: 'active',
            command
        };
    }

    /*
     * إذا لم يكن الأمر موجودًا،
     * نبحث داخل سجل الحذف المؤقت.
     */
    const result =
        searchCommand(target);

    if (
        result.status === 'deleted' &&
        result.record
    ) {
        await sock.sendMessage(
            chatId,
            {
                text:
                    formatDeletedCommand(
                        result.record
                    )
            },
            {
                quoted: message
            }
        );

        return {
            success: true,
            status: 'deleted',
            record: result.record
        };
    }

    await sock.sendMessage(
        chatId,
        {
            text:
                `❌ *الأمر غير موجود.*\n\n` +
                `لم يتم العثور على الأمر \`.${target}\` ` +
                `في الأوامر الحالية أو في سجل الحذف المؤقت.`
        },
        {
            quoted: message
        }
    );

    return {
        success: false,
        status: 'not_found'
    };
}

module.exports = {
    name: 'بحث',
    aliases: ['search'],
    description: 'البحث عن حالة ومعلومات أمر',
    usage: '.بحث-.ping',
    category: 'public',
    execute
};
