const fs = require('fs');
const path = require('path');

const {
    resolveMessageIdentity
} = require('./identity');

const {
    ROLES,
    getUserRole,
    canUseCommand,
    addDeveloper,
    removeDeveloper,
    addElite,
    removeElite,
    setCommandRole
} = require('./permissions');

const DATA_PATH =
    path.join(
        __dirname,
        '..',
        'data'
    );

const SETTINGS_FILE =
    path.join(
        DATA_PATH,
        'settings.json'
    );

const MODES = Object.freeze({
    PUBLIC: 'public',
    DEVELOPERS: 'developers'
});

function ensureSettingsStorage() {
    fs.mkdirSync(
        DATA_PATH,
        {
            recursive: true
        }
    );

    if (
        !fs.existsSync(
            SETTINGS_FILE
        )
    ) {
        writeSettings({
            mode: MODES.PUBLIC,
            console: 'all'
        });
    }
}

function readSettings() {
    ensureSettingsStorage();

    try {
        const content =
            fs.readFileSync(
                SETTINGS_FILE,
                'utf8'
            );

        if (!content.trim()) {
            return {
                mode: MODES.PUBLIC,
                console: 'all'
            };
        }

        const data =
            JSON.parse(
                content
            );

        return {
            mode:
                data?.mode ===
                MODES.DEVELOPERS
                    ? MODES.DEVELOPERS
                    : MODES.PUBLIC,

            console:
                typeof data?.console === 'string'
                    ? data.console
                    : 'all'
        };
    } catch {
        return {
            mode: MODES.PUBLIC,
            console: 'all'
        };
    }
}

function writeSettings(
    settings
) {
    fs.mkdirSync(
        DATA_PATH,
        {
            recursive: true
        }
    );

    fs.writeFileSync(
        SETTINGS_FILE,
        `${JSON.stringify(
            settings,
            null,
            4
        )}\n`,
        'utf8'
    );
}

function getBotMode() {
    return readSettings().mode;
}

function setBotMode(
    mode
) {
    const normalized =
        String(
            mode || ''
        )
            .trim()
            .toLowerCase();

    if (
        !Object.values(
            MODES
        ).includes(
            normalized
        )
    ) {
        return false;
    }

    const settings =
        readSettings();

    settings.mode =
        normalized;

    writeSettings(
        settings
    );

    return true;
}

function getConsoleMode() {
    return readSettings().console;
}

function setConsoleMode(
    consoleMode
) {
    if (
        typeof consoleMode !==
        'string'
    ) {
        return false;
    }

    const normalized =
        consoleMode
            .trim()
            .toLowerCase();

    if (!normalized) {
        return false;
    }

    const settings =
        readSettings();

    settings.console =
        normalized;

    writeSettings(
        settings
    );

    return true;
}

async function getAccessContext(
    sock,
    message
) {
    const identity =
        await resolveMessageIdentity(
            sock,
            message
        );

    const role =
        await getUserRole(
            sock,
            identity.jid ||
            identity.pn ||
            identity.lid
        );

    return Object.freeze({
        identity,
        role,
        mode:
            getBotMode()
    });
}

async function checkCommandAccess(
    sock,
    message,
    commandName
) {
    const context =
        await getAccessContext(
            sock,
            message
        );

    /*
     * ========================================
     * وضع المطورين
     * ========================================
     *
     * في هذا الوضع:
     *
     * PUBLIC
     * DEVELOPER
     * DEVELOPER_ELITE
     *
     * كلها محجوبة عن المستخدم العادي.
     *
     * فقط Developer / Elite
     * يستطيعان الوصول للأوامر.
     */
    if (
        context.mode ===
        MODES.DEVELOPERS
    ) {
        const privilegedUser =
            context.role ===
            ROLES.DEVELOPER ||
            context.role ===
            ROLES.DEVELOPER_ELITE;

        if (!privilegedUser) {
            return Object.freeze({
                ...context,
                command:
                    commandName,
                allowed: false,
                reason:
                    'developers_mode'
            });
        }
    }

    /*
     * بعد تجاوز قفل المود،
     * نرجع لنظام صلاحيات الأوامر
     * الأساسي.
     */
    const allowed =
        await canUseCommand(
            sock,
            context.identity.jid ||
            context.identity.pn ||
            context.identity.lid,
            commandName
        );

    return Object.freeze({
        ...context,
        command:
            commandName,
        allowed
    });
}

async function addEliteFromMessage(
    sock,
    message
) {
    const identity =
        await resolveMessageIdentity(
            sock,
            message
        );

    if (!identity.pn) {
        return false;
    }

    return addElite(
        identity.pn
    );
}

async function removeEliteFromMessage(
    sock,
    message
) {
    const identity =
        await resolveMessageIdentity(
            sock,
            message
        );

    if (!identity.pn) {
        return false;
    }

    return removeElite(
        identity.pn
    );
}

async function addDeveloperFromMessage(
    sock,
    message
) {
    const identity =
        await resolveMessageIdentity(
            sock,
            message
        );

    if (!identity.pn) {
        return false;
    }

    return addDeveloper(
        identity.pn
    );
}

async function removeDeveloperFromMessage(
    sock,
    message
) {
    const identity =
        await resolveMessageIdentity(
            sock,
            message
        );

    if (!identity.pn) {
        return false;
    }

    return removeDeveloper(
        identity.pn
    );
}

function changeCommandPermission(
    commandName,
    role
) {
    return setCommandRole(
        commandName,
        role
    );
}

module.exports = {
    getAccessContext,
    checkCommandAccess,

    addEliteFromMessage,
    removeEliteFromMessage,

    addDeveloperFromMessage,
    removeDeveloperFromMessage,

    changeCommandPermission,

    getBotMode,
    setBotMode,

    getConsoleMode,
    setConsoleMode,

    MODES,
    ROLES
};
