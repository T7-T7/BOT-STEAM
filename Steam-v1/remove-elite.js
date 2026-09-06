const {
    getMentionedIds,
    getQuotedSenderId,
    phoneNumberToPn
} = require('../../core/messages');

const {
    resolveIdentity
} = require('../../core/identity');

const {
    getElite,
    removeElite
} = require('../../core/permissions');

async function resolveTargetPn(
    sock,
    message,
    args
) {
    const quotedId =
        getQuotedSenderId(
            message
        );

    if (quotedId) {
        const identity =
            await resolveIdentity(
                sock,
                quotedId
            );

        if (identity.pn) {
            return identity.pn;
        }
    }

    const mentionedIds =
        getMentionedIds(
            message
        );

    for (
        const mentionedId
        of mentionedIds
    ) {
        const identity =
            await resolveIdentity(
                sock,
                mentionedId
            );

        if (identity.pn) {
            return identity.pn;
        }
    }

    const number =
        String(
            args?.[0] || ''
        ).trim();

    const pn =
        phoneNumberToPn(
            number
        );

    if (pn) {
        return pn;
    }

    return null;
}

function formatNumber(jid) {
    return String(jid || '')
        .replace(
            '@s.whatsapp.net',
            ''
        )
        .replace(
            /\D/g,
            ''
        );
}

async function execute({
    sock,
    message,
    chatId,
    args,
    text
}) {
    const elite =
        getElite();

    if (elite.length === 0) {
        await sock.sendMessage(
            chatId,
            {
                text:
                    '📭 *قائمة النخبة فارغة.*'
            },
            {
                quoted: message
            }
        );

        return;
    }

    /*
     * نعتبره رقم عضو فقط إذا كان
     * بصيغة:
     *
     * .سحب-1
     * .سحب-2
     *
     * لأن parser يحولها إلى:
     *
     * command = سحب
     * args = ["1"]
     *
     * أما رقم الهاتف الطويل فلا
     * يتم اعتباره index.
     */
    const firstArg =
        String(
            args?.[0] || ''
        ).trim();

    const isShortIndex =
        /^\d{1,3}$/.test(
            firstArg
        );

    if (isShortIndex) {
        const index =
            Number(firstArg) - 1;

        /*
         * إذا كان الرقم ضمن القائمة،
         * نستخدمه كرقم عضو.
         */
        if (
            index >= 0 &&
            index < elite.length
        ) {
            const targetPn =
                elite[index];

            const removed =
                removeElite(
                    targetPn
                );

            if (!removed) {
                await sock.sendMessage(
                    chatId,
                    {
                        text:
                            '❌ *تعذر سحب العضو من قائمة النخبة.*'
                    },
                    {
                        quoted: message
                    }
                );

                return;
            }

            const remaining =
                getElite();

            await sock.sendMessage(
                chatId,
                {
                    text:
`📤 *تم سحب العضو من النخبة*

🏓 𝐄𝐋𝐈𝐓𝐄 : *${formatNumber(targetPn)}*
🔢 𝐍𝐮𝐦𝐛𝐞𝐫 : *${firstArg}*

✅ تم تحديث قائمة النخبة.
📊 الأعضاء المتبقون : *${remaining.length}*`
                },
                {
                    quoted: message
                }
            );

            return;
        }

        /*
         * إذا كان الرقم صغيرًا لكنه خارج
         * القائمة، نرسل خطأ بدل اعتباره
         * رقم هاتف.
         */
        if (
            firstArg.length <= 3
        ) {
            await sock.sendMessage(
                chatId,
                {
                    text:
                        `❌ *العضو رقم ${firstArg} غير موجود في قائمة النخبة.*\n\n` +
                        `📊 عدد الأعضاء الحالي : *${elite.length}*`
                },
                {
                    quoted: message
                }
            );

            return;
        }
    }

    /*
     * هنا يتم التعامل مع:
     *
     * .سحب 201xxxxxxxxx
     *
     * أو الرد على الشخص
     * أو منشن الشخص.
     */
    const targetPn =
        await resolveTargetPn(
            sock,
            message,
            args
        );

    if (!targetPn) {
        await sock.sendMessage(
            chatId,
            {
                text:
`⚠️ *لم أتمكن من تحديد عضو النخبة.*

يمكنك استخدام إحدى الطرق:

↩️ *الرد على رسالة الشخص*
\`.سحب\`

👤 *منشن الشخص*
\`.سحب @رقم\`

📱 *إرسال الرقم*
\`.سحب 201000000000\`

🔢 *أو استخدام رقم العضو من القائمة*
\`.سحب-1\``
            },
            {
                quoted: message
            }
        );

        return;
    }

    const normalizedTarget =
        targetPn.trim();

    const currentElite =
        getElite();

    const exists =
        currentElite.includes(
            normalizedTarget
        );

    if (!exists) {
        await sock.sendMessage(
            chatId,
            {
                text:
`❌ *هذا الشخص غير موجود في قائمة النخبة.*

🏓 𝐄𝐋𝐈𝐓𝐄 : *${formatNumber(normalizedTarget)}*`
            },
            {
                quoted: message
            }
        );

        return;
    }

    const removed =
        removeElite(
            normalizedTarget
        );

    if (!removed) {
        await sock.sendMessage(
            chatId,
            {
                text:
                    '❌ *تعذر سحب العضو من قائمة النخبة.*'
            },
            {
                quoted: message
            }
        );

        return;
    }

    const remaining =
        getElite();

    await sock.sendMessage(
        chatId,
        {
            text:
`📤 *تم سحب العضو من النخبة*

🏓 𝐄𝐋𝐈𝐓𝐄 : *${formatNumber(normalizedTarget)}*

🔐 تم إلغاء صلاحية:
*DEVELOPER_ELITE*

✅ تم تحديث قائمة النخبة.
📊 الأعضاء المتبقون : *${remaining.length}*`
        },
        {
            quoted: message
        }
    );
}

module.exports = {
    name: 'سحب',

    aliases: [
        'سحب-نخبة'
    ],

    description:
        'سحب عضو من قائمة النخبة بالرد أو المنشن أو الرقم',

    usage:
        '.سحب',

    category:
        'developer',

    execute
};
