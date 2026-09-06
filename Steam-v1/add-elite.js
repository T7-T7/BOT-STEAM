const {
    getMentionedIds,
    getQuotedSenderId,
    phoneNumberToPn
} = require('../../core/messages');

const {
    resolveIdentity
} = require('../../core/identity');

const {
    addElite
} = require('../../core/permissions');

async function getTargetPn(
    sock,
    message,
    args
) {
    /*
     * 1. الرد على رسالة الشخص
     */
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

    /*
     * 2. المنشن
     */
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

    /*
     * 3. الرقم المكتوب
     */
    const number =
        String(
            args?.[0] || ''
        )
            .trim();

    const pn =
        phoneNumberToPn(
            number
        );

    if (pn) {
        return pn;
    }

    return null;
}

async function execute({
    sock,
    message,
    chatId,
    args
}) {
    const targetPn =
        await getTargetPn(
            sock,
            message,
            args
        );

    if (!targetPn) {
        await sock.sendMessage(
            chatId,
            {
                text:
`⚠️ *لم أتمكن من تحديد الشخص.*

يمكنك استخدام إحدى الطرق:

↩️ *رد على رسالة الشخص*
مثال:
\`.اضف\`

👤 *منشن الشخص*
مثال:
\`.اضف @رقم\`

📱 *إرسال الرقم*
مثال:
\`.اضف 201000000000\``
            },
            {
                quoted: message
            }
        );

        return;
    }

    const added =
        addElite(
            targetPn
        );

    const displayNumber =
        targetPn
            .replace(
                '@s.whatsapp.net',
                ''
            )
            .replace(
                /\D/g,
                ''
            );

    if (!added) {
        await sock.sendMessage(
            chatId,
            {
                text:
`ℹ️ *العضو موجود بالفعل في قائمة النخبة.*

🏓 𝐄𝐋𝐈𝐓𝐄 : *${displayNumber}*

🛡️ الصلاحية الحالية:
*DEVELOPER_ELITE*`
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
`👑 *تمت إضافة العضو إلى النخبة بنجاح*

🏓 𝐄𝐋𝐈𝐓𝐄 : *${displayNumber}*

🔐 الصلاحية :
*DEVELOPER_ELITE*

✅ أصبح بإمكانه استخدام:
• الأوامر العامة
• أوامر المطور
• أوامر DEVELOPER_ELITE`
        },
        {
            quoted: message
        }
    );
}

module.exports = {
    name: 'اضف',

    aliases: [
        'اضف-نخبة'
    ],

    description:
        'إضافة شخص إلى قائمة النخبة بالرد أو المنشن أو الرقم',

    usage:
        '.اضف',

    category:
        'developer',

    execute
};
