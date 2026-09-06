const fs = require('fs');
const path = require('path');

const PACKAGE_PATH =
    path.join(
        __dirname,
        '..',
        '..',
        'package.json'
    );

function getDependencies() {
    if (!fs.existsSync(PACKAGE_PATH)) {
        return [];
    }

    try {
        const packageData =
            JSON.parse(
                fs.readFileSync(
                    PACKAGE_PATH,
                    'utf8'
                )
            );

        const dependencies =
            packageData.dependencies || {};

        return Object.keys(
            dependencies
        ).sort(
            (a, b) =>
                a.localeCompare(
                    b
                )
        );

    } catch {
        return [];
    }
}

async function execute({
    sock,
    message,
    chatId
}) {
    /*
     * الرسالة الأولى
     */
    await sock.sendMessage(
        chatId,
        {
            text:
                '💻 *جاري عثور علي مكتبات...!*'
        },
        {
            quoted: message
        }
    );

    const libraries =
        getDependencies();

    if (libraries.length === 0) {
        await sock.sendMessage(
            chatId,
            {
                text:
                    '❌ *لم أتمكن من العثور على مكتبات البوت.*'
            },
            {
                quoted: message
            }
        );

        return;
    }

    const rows =
        libraries
            .map(
                (library, index) =>
                    `${index + 1}📂 : npm install ${library}`
            )
            .join('\n');

    const text =
`⚜️ 𝐁𝐎𝐓 𝐋𝐈𝐁𝐑𝐀𝐑𝐈𝐄𝐒
~*⊹‏⊱≼━━━⌬〔⚜️〕⌬━━━≽⊰⊹*~
${rows}
~*⊹‏⊱≼━━━⌬〔⚜️〕⌬━━━≽⊰⊹*~`;

    await sock.sendMessage(
        chatId,
        {
            text
        },
        {
            quoted: message
        }
    );
}

module.exports = {
    name: 'مكتبات',

    aliases: [
        'libraries',
        'lib'
    ],

    description:
        'عرض مكتبات البوت المستخدمة',

    usage:
        '.مكتبات',

    category:
        'developer',

    execute
};
