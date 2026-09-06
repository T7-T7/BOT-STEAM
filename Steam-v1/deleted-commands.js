const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const COMMANDS_DIR = path.join(
    __dirname,
    '..',
    'commands'
);

const DATA_FILE = path.join(
    __dirname,
    '..',
    'data',
    'deleted-commands.json'
);

const TRASH_DIR = path.join(
    __dirname,
    '..',
    'data',
    'deleted-commands'
);

/*
 * مدة الحذف المؤقت:
 * 24 ساعة كاملة = 86,400,000 ملي ثانية.
 */
const DELETE_DELAY =
    24 * 60 * 60 * 1000;

function ensureStorage() {
    const dataDir =
        path.dirname(DATA_FILE);

    fs.mkdirSync(
        dataDir,
        {
            recursive: true
        }
    );

    fs.mkdirSync(
        TRASH_DIR,
        {
            recursive: true
        }
    );

    if (
        !fs.existsSync(DATA_FILE)
    ) {
        writeData({
            deleted: []
        });
    }
}

function readData() {
    ensureStorage();

    try {
        const content =
            fs.readFileSync(
                DATA_FILE,
                'utf8'
            );

        const data =
            JSON.parse(content);

        if (
            !data ||
            !Array.isArray(
                data.deleted
            )
        ) {
            return {
                deleted: []
            };
        }

        return data;
    } catch {
        return {
            deleted: []
        };
    }
}

function writeData(data) {
    ensureStorage();

    fs.writeFileSync(
        DATA_FILE,
        `${JSON.stringify(
            data,
            null,
            4
        )}\n`,
        'utf8'
    );
}

function normalizeCommandName(
    commandName
) {
    return String(
        commandName || ''
    )
        .trim()
        .replace(
            /^\./,
            ''
        )
        .toLowerCase();
}

function isSafeCommandPath(
    filePath
) {
    const root =
        path.resolve(
            COMMANDS_DIR
        );

    const target =
        path.resolve(
            filePath
        );

    return (
        target !== root &&
        target.startsWith(
            `${root}${path.sep}`
        )
    );
}

/*
 * حساب الوقت المتبقي من وقت الانتهاء
 * المحفوظ داخل السجل.
 */
function getRemainingMs(
    expiresAt
) {
    const expiry =
        Number(expiresAt);

    if (
        !Number.isFinite(expiry)
    ) {
        return 0;
    }

    return Math.max(
        0,
        expiry - Date.now()
    );
}

function formatRemainingTime(
    milliseconds
) {
    const totalMinutes =
        Math.ceil(
            Math.max(
                0,
                milliseconds
            ) /
            (60 * 1000)
        );

    if (
        totalMinutes <= 0
    ) {
        return 'انتهى';
    }

    const hours =
        Math.floor(
            totalMinutes / 60
        );

    const minutes =
        totalMinutes % 60;

    if (
        hours > 0 &&
        minutes > 0
    ) {
        return (
            `${hours} ساعة و` +
            `${minutes} دقيقة`
        );
    }

    if (
        hours > 0
    ) {
        return `${hours} ساعة`;
    }

    return `${minutes} دقيقة`;
}

/*
 * تنظيف الأوامر التي انتهت مدة الـ24 ساعة.
 *
 * القرار مبني على الوقت الحقيقي:
 *
 * Date.now() >= expiresAt
 *
 * وليس على مدة تشغيل Termux.
 */
function cleanupExpiredCommands() {
    const data =
        readData();

    const active = [];

    const now =
        Date.now();

    for (
        const record
        of data.deleted
    ) {
        const expiresAt =
            Number(
                record.expiresAt
            );

        if (
            !Number.isFinite(
                expiresAt
            )
        ) {
            /*
             * سجل غير صالح.
             * لا يمكن الاعتماد عليه بأمان.
             */
            continue;
        }

        /*
         * ما زال داخل فترة الـ24 ساعة.
         */
        if (
            now < expiresAt
        ) {
            active.push(
                record
            );

            continue;
        }

        /*
         * انتهت الـ24 ساعة.
         * نحاول حذف الملف من سلة الحذف نهائيًا.
         */
        try {
            if (
                record.trashPath &&
                fs.existsSync(
                    record.trashPath
                )
            ) {
                fs.unlinkSync(
                    record.trashPath
                );
            }
        } catch (error) {
            console.error(
                '⚠️ تعذر حذف ملف من سلة المهملات:',
                error?.message ||
                error
            );

            /*
             * إذا فشل الحذف الفعلي،
             * نحتفظ بالسجل حتى المحاولة القادمة.
             */
            active.push(
                record
            );
        }
    }

    data.deleted =
        active;

    writeData(
        data
    );

    return active;
}

function findDeletedCommand(
    commandName
) {
    const normalized =
        normalizeCommandName(
            commandName
        );

    if (!normalized) {
        return null;
    }

    const data =
        readData();

    return (
        data.deleted.find(
            record =>
                normalizeCommandName(
                    record.commandName
                ) === normalized ||
                (
                    Array.isArray(
                        record.aliases
                    ) &&
                    record.aliases.some(
                        alias =>
                            normalizeCommandName(
                                alias
                            ) === normalized
                    )
                )
        ) || null
    );
}

function getCommandFileInfo(
    filePath
) {
    const relativePath =
        path.relative(
            COMMANDS_DIR,
            filePath
        );

    return {
        relativePath,
        fileName:
            path.basename(
                filePath
            )
    };
}

function softDeleteCommand({
    commandName,
    aliases = [],
    filePath
}) {
    /*
     * تنظيف أي أوامر انتهت قبل بدء عملية الحذف الجديدة.
     */
    cleanupExpiredCommands();

    if (
        !filePath ||
        !isSafeCommandPath(
            filePath
        )
    ) {
        return {
            success: false,
            reason:
                'invalid_path'
        };
    }

    if (
        !fs.existsSync(
            filePath
        )
    ) {
        return {
            success: false,
            reason:
                'file_not_found'
        };
    }

    const existing =
        findDeletedCommand(
            commandName
        );

    if (existing) {
        return {
            success: false,
            reason:
                'already_deleted',
            record:
                existing
        };
    }

    const info =
        getCommandFileInfo(
            filePath
        );

    const token =
        `${Date.now()}-${crypto.randomUUID()}`;

    const trashPath =
        path.join(
            TRASH_DIR,
            `${token}-${info.fileName}`
        );

    fs.mkdirSync(
        TRASH_DIR,
        {
            recursive: true
        }
    );

    /*
     * نقل الملف أولًا.
     *
     * بعد نجاح النقل فقط نعتبر
     * الأمر محذوفًا فعليًا.
     */
    try {
        fs.renameSync(
            filePath,
            trashPath
        );
    } catch {
        try {
            fs.copyFileSync(
                filePath,
                trashPath
            );

            fs.unlinkSync(
                filePath
            );
        } catch (error) {
            return {
                success: false,
                reason:
                    'move_failed',
                error
            };
        }
    }

    /*
     * هذه هي لحظة تسجيل الحذف الفعلية:
     * بعد نجاح نقل الملف من مكانه الأصلي.
     */
    const deletedAt =
        Date.now();

    /*
     * 24 ساعة كاملة من deletedAt.
     */
    const expiresAt =
        deletedAt +
        DELETE_DELAY;

    const record = {
        id: token,

        commandName:
            normalizeCommandName(
                commandName
            ),

        aliases: [
            ...new Set(
                aliases
                    .map(
                        normalizeCommandName
                    )
                    .filter(Boolean)
            )
        ],

        fileName:
            info.fileName,

        originalPath:
            filePath,

        originalRelativePath:
            info.relativePath,

        trashPath,

        deletedAt,

        expiresAt
    };

    const data =
        readData();

    data.deleted.push(
        record
    );

    writeData(
        data
    );

    return {
        success: true,
        record
    };
}

function restoreCommand(
    commandName
) {
    /*
     * مهم:
     * لا ننظف السجلات أولًا.
     *
     * نحتاج أولًا معرفة هل الأمر
     * انتهت مدته بالفعل حتى نرجع
     * reason = expired بدل not_found.
     */
    const record =
        findDeletedCommand(
            commandName
        );

    if (!record) {
        /*
         * قد يكون الأمر انتهى بالفعل
         * وتم تنظيفه في محاولة سابقة.
         */
        cleanupExpiredCommands();

        return {
            success: false,
            reason:
                'not_found'
        };
    }

    const expiresAt =
        Number(
            record.expiresAt
        );

    /*
     * تحقق صريح من انتهاء الـ24 ساعة.
     */
    if (
        !Number.isFinite(
            expiresAt
        )
    ) {
        return {
            success: false,
            reason:
                'invalid_expiry',
            record
        };
    }

    /*
     * إذا وصل الوقت الحالي إلى expiresAt
     * أو تجاوزه، فالاسترجاع ممنوع.
     */
    if (
        Date.now() >=
        expiresAt
    ) {
        /*
         * الآن فقط ننظف الملف المنتهي.
         */
        cleanupExpiredCommands();

        return {
            success: false,
            reason:
                'expired',
            record
        };
    }

    const originalPath =
        path.join(
            COMMANDS_DIR,
            record.originalRelativePath
        );

    /*
     * حماية إضافية للمسار الأصلي.
     */
    if (
        !isSafeCommandPath(
            originalPath
        )
    ) {
        return {
            success: false,
            reason:
                'invalid_path',
            record
        };
    }

    if (
        fs.existsSync(
            originalPath
        )
    ) {
        return {
            success: false,
            reason:
                'original_path_exists',
            record
        };
    }

    if (
        !record.trashPath ||
        !fs.existsSync(
            record.trashPath
        )
    ) {
        return {
            success: false,
            reason:
                'trash_missing',
            record
        };
    }

    /*
     * إعادة الملف.
     */
    try {
        fs.mkdirSync(
            path.dirname(
                originalPath
            ),
            {
                recursive: true
            }
        );

        fs.renameSync(
            record.trashPath,
            originalPath
        );
    } catch {
        try {
            fs.copyFileSync(
                record.trashPath,
                originalPath
            );

            fs.unlinkSync(
                record.trashPath
            );
        } catch (error) {
            return {
                success: false,
                reason:
                    'restore_failed',
                error,
                record
            };
        }
    }

    /*
     * بعد نجاح الاسترجاع نحذف السجل.
     */
    const data =
        readData();

    data.deleted =
        data.deleted.filter(
            item =>
                item.id !==
                record.id
        );

    writeData(
        data
    );

    return {
        success: true,
        record
    };
}

function searchCommand(
    commandName
) {
    /*
     * تنظيف المنتهي أولًا.
     */
    cleanupExpiredCommands();

    const normalized =
        normalizeCommandName(
            commandName
        );

    if (!normalized) {
        return {
            status:
                'invalid'
        };
    }

    const deleted =
        findDeletedCommand(
            normalized
        );

    if (deleted) {
        const remainingMs =
            getRemainingMs(
                deleted.expiresAt
            );

        /*
         * حماية إضافية:
         * لو انتهت المدة بين التنظيف
         * والبحث، لا نعرضه كأنه صالح.
         */
        if (
            remainingMs <= 0
        ) {
            cleanupExpiredCommands();

            return {
                status:
                    'expired'
            };
        }

        return {
            status:
                'deleted',

            record:
                deleted,

            remainingMs
        };
    }

    return {
        status:
            'not_deleted'
    };
}

module.exports = {
    COMMANDS_DIR,

    TRASH_DIR,

    DELETE_DELAY,

    readData,

    writeData,

    normalizeCommandName,

    formatRemainingTime,

    cleanupExpiredCommands,

    findDeletedCommand,

    softDeleteCommand,

    restoreCommand,

    searchCommand
};
