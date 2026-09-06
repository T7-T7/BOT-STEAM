const fs = require('fs');
const path = require('path');

const COMMANDS_DIR = path.join(
    __dirname,
    '..',
    'commands'
);

function normalizeCommandName(name) {
    return String(name || '')
        .trim()
        .toLowerCase();
}

function getCommandFiles(directory) {
    if (!fs.existsSync(directory)) {
        return [];
    }

    const entries = fs.readdirSync(directory, {
        withFileTypes: true
    });

    const files = [];

    for (const entry of entries) {
        if (entry.name.startsWith('.')) {
            continue;
        }

        const fullPath = path.join(
            directory,
            entry.name
        );

        if (entry.isDirectory()) {
            files.push(
                ...getCommandFiles(fullPath)
            );

            continue;
        }

        if (
            entry.isFile() &&
            entry.name.endsWith('.js') &&
            !entry.name.startsWith('_')
        ) {
            files.push(fullPath);
        }
    }

    return files;
}

function getCategoryFromPath(filePath) {
    const relativePath = path.relative(
        COMMANDS_DIR,
        filePath
    );

    const parts = relativePath.split(
        path.sep
    );

    if (parts.length >= 2) {
        return parts[0].toLowerCase();
    }

    return 'system';
}

function validateCommand(
    command,
    filePath
) {
    if (
        !command ||
        typeof command !== 'object'
    ) {
        throw new Error(
            `Invalid command export: ${filePath}`
        );
    }

    if (
        typeof command.name !== 'string' ||
        !command.name.trim()
    ) {
        throw new Error(
            `Command name missing: ${filePath}`
        );
    }

    if (
        typeof command.execute !== 'function'
    ) {
        throw new Error(
            `Command execute() missing: ${filePath}`
        );
    }
}

function normalizeAliases(aliases) {
    if (!Array.isArray(aliases)) {
        return [];
    }

    return [
        ...new Set(
            aliases
                .filter(
                    alias =>
                        typeof alias === 'string'
                )
                .map(normalizeCommandName)
                .filter(Boolean)
        )
    ];
}

function createCommandMetadata(
    command,
    filePath
) {
    const name =
        normalizeCommandName(
            command.name
        );

    const aliases =
        normalizeAliases(
            command.aliases
        ).filter(
            alias =>
                alias !== name
        );

    const category =
        typeof command.category === 'string' &&
        command.category.trim()
            ? command.category
                .trim()
                .toLowerCase()
            : getCategoryFromPath(
                filePath
            );

    const description =
        typeof command.description === 'string'
            ? command.description.trim()
            : '';

    const usage =
        typeof command.usage === 'string'
            ? command.usage.trim()
            : `.${name}`;

    return Object.freeze({
        name,
        aliases,
        description,
        usage,
        category,
        filePath,
        execute: command.execute
    });
}

function loadCommands() {
    const files =
        getCommandFiles(
            COMMANDS_DIR
        );

    const commands =
        new Map();

    for (const filePath of files) {
        delete require.cache[
            require.resolve(filePath)
        ];

        const command =
            require(filePath);

        validateCommand(
            command,
            filePath
        );

        const metadata =
            createCommandMetadata(
                command,
                filePath
            );

        const names = [
            metadata.name,
            ...metadata.aliases
        ];

        for (const name of names) {
            if (commands.has(name)) {
                const existing =
                    commands.get(name);

                throw new Error(
                    `Duplicate command "${name}" detected between:\n` +
                    `${existing.filePath}\n` +
                    `${filePath}`
                );
            }

            commands.set(
                name,
                metadata
            );
        }
    }

    return commands;
}

/*
 * إعادة تحميل الأوامر داخل الـ Map
 * الموجودة أصلًا في الـ Dispatcher.
 *
 * بهذا الشكل:
 *
 * حذف ملف
 *   ↓
 * reloadCommands()
 *   ↓
 * الأمر يختفي فورًا
 *
 * استرجاع ملف
 *   ↓
 * reloadCommands()
 *   ↓
 * الأمر يعود فورًا
 *
 * بدون إعادة تشغيل البوت.
 */
function reloadCommands(
    targetCommands
) {
    if (
        !targetCommands ||
        typeof targetCommands.clear !== 'function' ||
        typeof targetCommands.set !== 'function'
    ) {
        throw new Error(
            'reloadCommands requires a valid command Map.'
        );
    }

    const freshCommands =
        loadCommands();

    targetCommands.clear();

    for (
        const [
            name,
            command
        ] of freshCommands
    ) {
        targetCommands.set(
            name,
            command
        );
    }

    return targetCommands;
}

function getCommand(
    commands,
    name
) {
    const normalized =
        normalizeCommandName(
            name
        );

    if (!normalized) {
        return null;
    }

    return (
        commands.get(
            normalized
        ) || null
    );
}

function getCommandList(
    commands
) {
    const unique =
        new Map();

    for (
        const command
        of commands.values()
    ) {
        unique.set(
            command.name,
            command
        );
    }

    return [
        ...unique.values()
    ];
}

function getCommandsByCategory(
    commands,
    category
) {
    const normalizedCategory =
        normalizeCommandName(
            category
        );

    return getCommandList(
        commands
    ).filter(
        command =>
            command.category ===
            normalizedCategory
    );
}

module.exports = {
    loadCommands,
    reloadCommands,
    getCommand,
    getCommandList,
    getCommandsByCategory,
    normalizeCommandName
};
