const fs = require('fs');
const path = require('path');

const COMMANDS_DIR = path.join(
    __dirname,
    '..',
    'commands'
);

function getCommandFiles() {
    const files = [];

    function scan(directory) {
        if (!fs.existsSync(directory)) {
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
                entry.name.startsWith('.')
            ) {
                continue;
            }

            const fullPath =
                path.join(
                    directory,
                    entry.name
                );

            if (entry.isDirectory()) {
                scan(fullPath);
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
    }

    scan(COMMANDS_DIR);

    return files.sort(
        (first, second) =>
            first.localeCompare(
                second,
                'en'
            )
    );
}

function getCommandFileList() {
    return getCommandFiles().map(
        (filePath, index) => ({
            number: index + 1,

            fileName:
                path.basename(
                    filePath
                ),

            filePath,

            relativePath:
                path.relative(
                    COMMANDS_DIR,
                    filePath
                )
        })
    );
}

function getCommandFileByNumber(
    number
) {
    const value =
        Number(number);

    if (
        !Number.isInteger(value) ||
        value < 1
    ) {
        return null;
    }

    const files =
        getCommandFileList();

    return (
        files[value - 1] ||
        null
    );
}

function isInsideCommands(
    filePath
) {
    const commandsRoot =
        path.resolve(
            COMMANDS_DIR
        );

    const target =
        path.resolve(
            filePath
        );

    return (
        target === commandsRoot ||
        target.startsWith(
            `${commandsRoot}${path.sep}`
        )
    );
}

module.exports = {
    COMMANDS_DIR,
    getCommandFiles,
    getCommandFileList,
    getCommandFileByNumber,
    isInsideCommands
};
