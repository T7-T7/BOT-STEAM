const fs = require('fs');
const path = require('path');

const {
    resolvePn
} = require('./identity');

const ROLES = Object.freeze({
    PUBLIC: 'public',
    DEVELOPER: 'developer',
    DEVELOPER_ELITE: 'developer_elite'
});

const DATA_PATH = path.join(
    __dirname,
    '..',
    'data'
);

const DEVELOPERS_FILE = path.join(
    DATA_PATH,
    'developers.json'
);

const ELITE_FILE = path.join(
    DATA_PATH,
    'elite.json'
);

const COMMANDS_FILE = path.join(
    DATA_PATH,
    'commands.json'
);

function normalizeRole(role) {
    if (!role) {
        return ROLES.PUBLIC;
    }

    const value =
        String(role)
            .toLowerCase()
            .trim();

    const validRoles =
        Object.values(ROLES);

    return validRoles.includes(value)
        ? value
        : ROLES.PUBLIC;
}

function normalizePn(pn) {
    if (
        !pn ||
        typeof pn !== 'string'
    ) {
        return null;
    }

    const value =
        pn.trim();

    if (
        !value ||
        !value.endsWith(
            '@s.whatsapp.net'
        )
    ) {
        return null;
    }

    return value;
}

function readJson(
    filePath,
    fallback
) {
    try {
        if (
            !fs.existsSync(
                filePath
            )
        ) {
            return fallback;
        }

        const content =
            fs.readFileSync(
                filePath,
                'utf8'
            );

        if (!content.trim()) {
            return fallback;
        }

        const data =
            JSON.parse(
                content
            );

        return data ?? fallback;

    } catch {
        return fallback;
    }
}

function writeJson(
    filePath,
    data
) {
    const content =
        JSON.stringify(
            data,
            null,
            4
        );

    fs.writeFileSync(
        filePath,
        `${content}\n`,
        'utf8'
    );
}

function getDevelopers() {
    const data =
        readJson(
            DEVELOPERS_FILE,
            {
                developers: []
            }
        );

    if (
        !Array.isArray(
            data.developers
        )
    ) {
        return [];
    }

    return data.developers
        .map(normalizePn)
        .filter(Boolean);
}

function getElite() {
    const data =
        readJson(
            ELITE_FILE,
            {
                elite: []
            }
        );

    if (
        !Array.isArray(
            data.elite
        )
    ) {
        return [];
    }

    return data.elite
        .map(normalizePn)
        .filter(Boolean);
}

function getCommandRole(
    commandName
) {
    if (!commandName) {
        return ROLES.PUBLIC;
    }

    const command =
        String(commandName)
            .toLowerCase()
            .trim()
            .replace(
                /^\./,
                ''
            );

    const data =
        readJson(
            COMMANDS_FILE,
            {}
        );

    return normalizeRole(
        data[command]
    );
}

function isDeveloper(pn) {
    const normalizedPn =
        normalizePn(pn);

    if (!normalizedPn) {
        return false;
    }

    return getDevelopers()
        .includes(
            normalizedPn
        );
}

function isElite(pn) {
    const normalizedPn =
        normalizePn(pn);

    if (!normalizedPn) {
        return false;
    }

    return getElite()
        .includes(
            normalizedPn
        );
}

/*
 * ========================================
 * تحديد رتبة المستخدم
 * ========================================
 *
 * PUBLIC
 *      مستخدم عادي
 *
 * DEVELOPER
 *      موجود في developers.json
 *
 * DEVELOPER_ELITE
 *      موجود في elite.json
 *
 * ملاحظة:
 * لا توجد صلاحية ELITE مستقلة.
 *
 * النخبة لها رتبة DEVELOPER_ELITE
 * حتى تتمكن من استخدام الأوامر المشتركة
 * بين المطور والنخبة.
 */
function resolveRole(
    isDeveloperUser,
    isEliteUser
) {
    if (
        isDeveloperUser &&
        isEliteUser
    ) {
        return ROLES.DEVELOPER_ELITE;
    }

    if (isDeveloperUser) {
        return ROLES.DEVELOPER;
    }

    if (isEliteUser) {
        return ROLES.DEVELOPER_ELITE;
    }

    return ROLES.PUBLIC;
}

/*
 * ========================================
 * نظام الوصول
 * ========================================
 *
 * PUBLIC
 * → الجميع
 *
 * DEVELOPER
 * → المطور فقط
 *
 * DEVELOPER_ELITE
 * → المطور + النخبة
 *
 * ========================================
 */
function hasPermission(
    role,
    requiredRole
) {
    const userRole =
        normalizeRole(
            role
        );

    const commandRole =
        normalizeRole(
            requiredRole
        );

    /*
     * الأمر العام:
     * الجميع يستطيع استخدامه.
     */
    if (
        commandRole ===
        ROLES.PUBLIC
    ) {
        return true;
    }

    /*
     * أمر المطور:
     * المطور فقط.
     *
     * النخبة لا تدخل هنا.
     */
    if (
        commandRole ===
        ROLES.DEVELOPER
    ) {
        return (
            userRole ===
            ROLES.DEVELOPER
        );
    }

    /*
     * أمر المطور + النخبة:
     * المطور يستطيع استخدامه.
     * النخبة تستطيع استخدامه.
     * المستخدم العادي لا يستطيع.
     */
    if (
        commandRole ===
        ROLES.DEVELOPER_ELITE
    ) {
        return (
            userRole ===
            ROLES.DEVELOPER ||
            userRole ===
            ROLES.DEVELOPER_ELITE
        );
    }

    return false;
}

async function getUserRole(
    sock,
    jid
) {
    if (!jid) {
        return ROLES.PUBLIC;
    }

    const pn =
        await resolvePn(
            sock,
            jid
        );

    if (!pn) {
        return ROLES.PUBLIC;
    }

    const developer =
        isDeveloper(
            pn
        );

    const elite =
        isElite(
            pn
        );

    return resolveRole(
        developer,
        elite
    );
}

async function canUseCommand(
    sock,
    jid,
    commandName
) {
    const userRole =
        await getUserRole(
            sock,
            jid
        );

    const requiredRole =
        getCommandRole(
            commandName
        );

    return hasPermission(
        userRole,
        requiredRole
    );
}

function addDeveloper(pn) {
    const normalizedPn =
        normalizePn(pn);

    if (!normalizedPn) {
        return false;
    }

    const developers =
        getDevelopers();

    if (
        developers.includes(
            normalizedPn
        )
    ) {
        return false;
    }

    developers.push(
        normalizedPn
    );

    writeJson(
        DEVELOPERS_FILE,
        {
            developers
        }
    );

    return true;
}

function removeDeveloper(pn) {
    const normalizedPn =
        normalizePn(pn);

    if (!normalizedPn) {
        return false;
    }

    const developers =
        getDevelopers();

    const filtered =
        developers.filter(
            item =>
                item !==
                normalizedPn
        );

    if (
        filtered.length ===
        developers.length
    ) {
        return false;
    }

    writeJson(
        DEVELOPERS_FILE,
        {
            developers:
                filtered
        }
    );

    return true;
}

function addElite(pn) {
    const normalizedPn =
        normalizePn(pn);

    if (!normalizedPn) {
        return false;
    }

    const elite =
        getElite();

    if (
        elite.includes(
            normalizedPn
        )
    ) {
        return false;
    }

    elite.push(
        normalizedPn
    );

    writeJson(
        ELITE_FILE,
        {
            elite
        }
    );

    return true;
}

function removeElite(pn) {
    const normalizedPn =
        normalizePn(pn);

    if (!normalizedPn) {
        return false;
    }

    const elite =
        getElite();

    const filtered =
        elite.filter(
            item =>
                item !==
                normalizedPn
        );

    if (
        filtered.length ===
        elite.length
    ) {
        return false;
    }

    writeJson(
        ELITE_FILE,
        {
            elite:
                filtered
        }
    );

    return true;
}

function setCommandRole(
    commandName,
    role
) {
    if (!commandName) {
        return false;
    }

    const normalizedCommand =
        String(commandName)
            .toLowerCase()
            .trim()
            .replace(
                /^\./,
                ''
            );

    if (!normalizedCommand) {
        return false;
    }

    const normalizedRole =
        normalizeRole(
            role
        );

    const data =
        readJson(
            COMMANDS_FILE,
            {}
        );

    data[
        normalizedCommand
    ] = normalizedRole;

    writeJson(
        COMMANDS_FILE,
        data
    );

    return true;
}

/*
 * حذف صلاحية أمر من commands.json.
 *
 * نستخدمها عندما يتم حذف ملف الأمر،
 * حتى لا تبقى صلاحية قديمة مرتبطة
 * بأمر لم يعد موجودًا.
 */
function deleteCommandRole(
    commandName
) {
    if (!commandName) {
        return false;
    }

    const normalizedCommand =
        String(commandName)
            .toLowerCase()
            .trim()
            .replace(
                /^\./,
                ''
            );

    if (!normalizedCommand) {
        return false;
    }

    const data =
        readJson(
            COMMANDS_FILE,
            {}
        );

    if (
        !Object.prototype.hasOwnProperty.call(
            data,
            normalizedCommand
        )
    ) {
        return false;
    }

    delete data[
        normalizedCommand
    ];

    writeJson(
        COMMANDS_FILE,
        data
    );

    return true;
}

module.exports = {
    ROLES,

    normalizeRole,
    normalizePn,

    getDevelopers,
    getElite,
    getCommandRole,

    isDeveloper,
    isElite,

    resolveRole,
    hasPermission,

    getUserRole,
    canUseCommand,

    addDeveloper,
    removeDeveloper,

    addElite,
    removeElite,

    setCommandRole,
    deleteCommandRole
};
