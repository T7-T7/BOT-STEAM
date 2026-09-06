const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const {
    getCommandFileList,
    getCommandFileByNumber
} = require('../../core/file-manager');

const PROJECT_ROOT =
    path.join(
        __dirname,
        '..',
        '..'
    );

const ZIP_PATH =
    path.join(
        PROJECT_ROOT,
        'FIX-BOT-V1.zip'
    );

const EXCLUDED_NAMES = new Set([
    'node_modules',
    'session',
    '.git',
    '.cache',
    '.npm',
    '.env',
    'test-identity.js',
    'FIX-BOT-V1.zip'
]);

const EXCLUDED_EXTENSIONS = new Set([
    '.log'
]);

function buildFileList() {
    const files =
        getCommandFileList();

    if (files.length === 0) {
        return {
            files,
            text:
`📂 *قائمة ملفات الأوامر فارغة.*

لم يتم العثور على ملفات داخل مجلد الأوامر.`
        };
    }

    const rows =
        files
            .map(
                file =>
                    `🏓 #${file.number} - ${file.fileName}`
            )
            .join('\n');

    const text =
`📂 *قائمة ملفات الأوامر (داخل الفولدرات):*
~*⊹‏⊱≼━━━⌬〔⚜️〕⌬━━━≽⊰⊹*~
${rows}


💡 *استخدم الأمر متبوعاً برقم الملف لإرسال الملف (مثال: .باتش 1).*

📦 *أرسل .باتش فور لإرسال نسخة ZIP نظيفة وجاهزة للنشر.*
~*⊹‏⊱≼━━━⌬〔⚜️〕⌬━━━≽⊰⊹*~`;

    return {
        files,
        text
    };
}

async function sendCommandFile({
    sock,
    message,
    chatId,
    number
}) {
    const file =
        getCommandFileByNumber(
            number
        );

    if (!file) {
        await sock.sendMessage(
            chatId,
            {
                text:
`❌ *رقم الملف غير صحيح.*

📊 عدد الملفات الحالي:
*${getCommandFileList().length}*`
            },
            {
                quoted: message
            }
        );

        return;
    }

    if (
        !fs.existsSync(
            file.filePath
        )
    ) {
        await sock.sendMessage(
            chatId,
            {
                text:
                    '❌ *تعذر العثور على الملف المطلوب.*'
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
            document:
                fs.readFileSync(
                    file.filePath
                ),

            mimetype:
                'application/javascript',

            fileName:
                file.fileName,

            caption:
`📄 *إليك ملف رقم-${file.number}:* ${file.fileName}`
        },
        {
            quoted: message
        }
    );
}

function shouldExclude(name) {
    if (
        EXCLUDED_NAMES.has(
            name
        )
    ) {
        return true;
    }

    const extension =
        path.extname(
            name
        ).toLowerCase();

    if (
        EXCLUDED_EXTENSIONS.has(
            extension
        )
    ) {
        return true;
    }

    return false;
}

function addDirectoryToZip(
    zip,
    directory,
    relativeDirectory = ''
) {
    if (
        !fs.existsSync(
            directory
        )
    ) {
        return;
    }

    const entries =
        fs.readdirSync(
            directory,
            {
                withFileTypes: true
            }
        );

    for (const entry of entries) {
        if (
            shouldExclude(
                entry.name
            )
        ) {
            continue;
        }

        const fullPath =
            path.join(
                directory,
                entry.name
            );

        const relativePath =
            path.join(
                relativeDirectory,
                entry.name
            );

        if (
            entry.isDirectory()
        ) {
            addDirectoryToZip(
                zip,
                fullPath,
                relativePath
            );

            continue;
        }

        if (
            entry.isFile()
        ) {
            zip.addLocalFile(
                fullPath,
                path.dirname(
                    relativePath
                )
            );
        }
    }
}

function createProjectZip() {
    if (
        fs.existsSync(
            ZIP_PATH
        )
    ) {
        try {
            fs.unlinkSync(
                ZIP_PATH
            );
        } catch (error) {
            throw new Error(
                `تعذر حذف ZIP القديمة: ${
                    error?.message ||
                    error
                }`
            );
        }
    }

    const zip =
        new AdmZip();

    addDirectoryToZip(
        zip,
        PROJECT_ROOT
    );

    zip.writeZip(
        ZIP_PATH
    );

    return ZIP_PATH;
}

async function sendFullZip({
    sock,
    message,
    chatId
}) {
    const zipPath =
        createProjectZip();

    if (
        !fs.existsSync(
            zipPath
        )
    ) {
        throw new Error(
            'ZIP file was not created.'
        );
    }

    try {
        await sock.sendMessage(
            chatId,
            {
                document:
                    fs.readFileSync(
                        zipPath
                    ),

                mimetype:
                    'application/zip',

                fileName:
                    'FIX-BOT-V1.zip',

                caption:
`📦 *FIX BOT V1 — RELEASE*

✅ نسخة نظيفة وجاهزة للنشر.

📁 تحتوي على ملفات المشروع الأساسية.
📦 تحتوي على package.json و package-lock.json.
🚫 بدون node_modules.
🚫 بدون session.
🚫 بدون ملفات البيئة أو الاختبارات.

⚙️ بعد فك الضغط:
1️⃣ npm install
2️⃣ npm start`
            },
            {
                quoted: message
            }
        );
    } finally {
        try {
            fs.unlinkSync(
                zipPath
            );
        } catch {
            // لا نوقف البوت إذا تعذر حذف الملف المؤقت.
        }
    }
}

async function execute({
    sock,
    message,
    chatId,
    args
}) {
    const firstArg =
        String(
            args?.[0] || ''
        )
            .trim()
            .toLowerCase();

    /*
     * .باتش
     */
    if (!firstArg) {
        const result =
            buildFileList();

        await sock.sendMessage(
            chatId,
            {
                text:
                    result.text
            },
            {
                quoted: message
            }
        );

        return;
    }

    /*
     * .باتش فور
     */
    if (
        firstArg === 'فور'
    ) {
        await sock.sendMessage(
            chatId,
            {
                text:
                    '📦 *جاري تجهيز نسخة ZIP نظيفة...*'
            },
            {
                quoted: message
            }
        );

        try {
            await sendFullZip({
                sock,
                message,
                chatId
            });
        } catch (error) {
            console.error(
                '❌ ZIP creation error:',
                error?.stack ||
                error?.message ||
                error
            );

            await sock.sendMessage(
                chatId,
                {
                    text:
                        '❌ *حدث خطأ أثناء تجهيز نسخة ZIP.*'
                },
                {
                    quoted: message
                }
            );
        }

        return;
    }

    /*
     * .باتش-1
     *
     * parser يحولها إلى:
     *
     * command = باتش
     * args = ["1"]
     */
    if (
        /^\d+$/.test(
            firstArg
        )
    ) {
        await sendCommandFile({
            sock,
            message,
            chatId,
            number:
                Number(firstArg)
        });

        return;
    }

    await sock.sendMessage(
        chatId,
        {
            text:
`⚠️ *طريقة الاستخدام غير صحيحة.*

استخدم:

📂 \`.باتش\`
📄 \`.باتش 1\`
📦 \`.باتش فور\``
        },
        {
            quoted: message
        }
    );
}

module.exports = {
    name: 'باتش',

    aliases: [
        'patch'
    ],

    description:
        'عرض وإرسال ملفات أوامر البوت وإنشاء نسخة ZIP نظيفة للنشر',

    usage:
        '.باتش',

    category:
        'developer',

    execute
};
