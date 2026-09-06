const {
    getQuotedMessageInfo
} = require('../../core/messages');

const {
    changeCommandPermission
} = require('../../core/access');

const {
    getCommand
} = require('../../core/command-loader');

async function execute({
    sock,
    message,
    chatId,
    commands
}) {
    const quoted =
        getQuotedMessageInfo(
            message,
            '.'
        );

    if (!quoted.quotedMessage) {
        await sock.sendMessage(
            chatId,
            {
                text:
                    '⚠️ *استخدم الأمر بالرد على الرسالة التي تريد تغيير صلاحيتها.*\n\n' +
                    'مثال:\n' +
                    '↩️ رد على `.ping`\n' +
                    'ثم أرسل `.مطور`'
            },
            {
                quoted: message
            }
        );

        return;
    }

    if (
        !quoted.isCommand ||
        !quoted.command
    ) {
        await sock.sendMessage(
            chatId,
            {
                text:
                    '⚠️ *تعذر تحديد الأمر من الرسالة التي تم الرد عليها.*\n\n' +
                    'يمكنك الرد على:\n' +
                    '• `.ping`\n' +
                    '• أو رسالة تحتوي على الأمر.'
            },
            {
                quoted: message
            }
        );

        return;
    }

    const targetCommand =
        quoted.command;

    /*
     * التأكد من أن الأمر موجود
     * ضمن الأوامر المحملة فعليًا.
     */
    const command =
        getCommand(
            commands,
            targetCommand
        );

    if (!command) {
        await sock.sendMessage(
            chatId,
            {
                text:
                    '❌ *الأمر غير موجود في البوت.*\n\n' +
                    `⚡ الأمر : \`.${targetCommand}\``
            },
            {
                quoted: message
            }
        );

        return;
    }

    /*
     * منع تغيير أوامر الإدارة
     * الأساسية إلى صلاحيات غير مناسبة.
     *
     * هذه الأوامر تبقى للمطور.
     */
    const protectedCommands = [
        'مطور',
        'خارج',
        'اضف',
        'سحب',
        'مطور-نخبة',
        'نخبة-عرض'
    ];

    if (
        protectedCommands.includes(
            command.name
        )
    ) {
        await sock.sendMessage(
            chatId,
            {
                text:
                    '🛡️ *هذا الأمر محمي ولا يمكن تغيير صلاحيته.*\n\n' +
                    `⚡ الأمر : \`.${command.name}\``
            },
            {
                quoted: message
            }
        );

        return;
    }

    const changed =
        changeCommandPermission(
            command.name,
            'developer'
        );

    if (!changed) {
        await sock.sendMessage(
            chatId,
            {
                text:
                    '❌ *تعذر تغيير صلاحية الأمر.*\n\n' +
                    `⚡ الأمر : \`.${command.name}\``
            },
            {
                quoted: message
            }
        );

        return;
    }

    await sock.sendMessage(
        chatId,
        {
            text:
                '👑 *تم تغيير صلاحية الأمر*\n\n' +
                `⚡ الأمر : \`.${command.name}\`\n` +
                '🔐 الصلاحية : *DEVELOPER*\n\n' +
                '✅ أصبح الأمر متاحًا للمطورين فقط.'
        },
        {
            quoted: message
        }
    );
}

module.exports = {
    name: 'مطور',

    aliases: [],

    description:
        'تغيير صلاحية أمر إلى المطورين فقط',

    usage:
        '.مطور',

    category:
        'developer',

    execute
};
