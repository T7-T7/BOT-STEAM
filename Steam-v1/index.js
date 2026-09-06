/*
 * =========================================================
 * FIX BOT V1
 * Silent Interactive Helper Debug
 * =========================================================
 *
 * يمنع السطر التشخيصي الخاص بـ baileys_helper:
 *
 * Interactive send: { ... }
 *
 * بدون التأثير على كونسول FIX BOT.
 */

const {
    installSilentInteractiveLog
} = require('./core/silent-helper');

installSilentInteractiveLog();

const config = require('./config');

const {
    createConnection,
    isLoggedOut,
    watchConnection,
    getBotIdentity
} = require('./core/connection');

const {
    loadCommands,
    getCommandList
} = require('./core/command-loader');

const {
    createDispatcher
} = require('./core/dispatcher');

const {
    cleanupExpiredCommands
} = require('./core/deleted-commands');

const consoleUI =
    require('./core/console');

let reconnecting = false;

async function startBot() {
    consoleUI.startup();

    try {
        /*
         * تنظيف الأوامر التي تجاوزت مدة الـ24 ساعة.
         */
        try {
            const cleanupResult =
                cleanupExpiredCommands();

            if (
                cleanupResult?.deleted > 0
            ) {
                consoleUI.warning(
                    'COMMAND CLEANUP',
                    `Permanent cleanup: ${cleanupResult.deleted} command(s) removed.`
                );
            }
        } catch (error) {
            consoleUI.error(
                'Expired Commands Cleanup',
                error
            );
        }

        const {
            sock
        } = await createConnection();

        const commands =
            loadCommands();

        consoleUI.commandsLoaded(
            getCommandList(
                commands
            ).length
        );

        const dispatcher =
            createDispatcher(
                sock,
                commands,
                {
                    prefix:
                        config.prefix
                }
            );

        sock.ev.on(
            'messages.upsert',
            async ({
                messages,
                type
            }) => {
                if (
                    type !== 'notify' ||
                    !Array.isArray(
                        messages
                    )
                ) {
                    return;
                }

                for (
                    const message
                    of messages
                ) {
                    try {
                        if (
                            !message?.message
                        ) {
                            continue;
                        }

                        await dispatcher.dispatch(
                            message
                        );
                    } catch (error) {
                        consoleUI.error(
                            'Message Handler',
                            error
                        );
                    }
                }
            }
        );

        watchConnection(
            sock,
            {
                onOpen:
                    async () => {
                        reconnecting =
                            false;

                        consoleUI.connection(
                            'Connected',
                            'WhatsApp session is active.'
                        );

                        const identity =
                            await getBotIdentity(
                                sock
                            );

                        consoleUI.botIdentity(
                            identity
                        );

                        consoleUI.permissionSystem();
                    },

                onClose:
                    async (
                        lastDisconnect
                    ) => {
                        if (
                            isLoggedOut(
                                lastDisconnect
                            )
                        ) {
                            consoleUI.loggedOut();

                            return;
                        }

                        if (
                            reconnecting
                        ) {
                            return;
                        }

                        reconnecting =
                            true;

                        consoleUI.reconnect();

                        setTimeout(
                            () => {
                                startBot()
                                    .catch(
                                        (
                                            error
                                        ) => {
                                            reconnecting =
                                                false;

                                            consoleUI.error(
                                                'Restart',
                                                error
                                            );
                                        }
                                    );
                            },
                            3000
                        );
                    }
            }
        );

    } catch (error) {
        consoleUI.error(
            'Bot Startup',
            error
        );

        if (
            !reconnecting
        ) {
            reconnecting =
                true;

            setTimeout(
                () => {
                    reconnecting =
                        false;

                    startBot()
                        .catch(
                            (
                                restartError
                            ) => {
                                consoleUI.error(
                                    'Restart',
                                    restartError
                                );
                            }
                        );
                },
                5000
            );
        }
    }
}

startBot();
