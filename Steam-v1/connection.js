const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require('@whiskeysockets/baileys');

const P = require('pino');
const readline = require('readline');

const {
    resolveIdentity
} = require('./identity');

const consoleUI =
    require('./console');

const SESSION_PATH =
    './session';


function ask(question) {
    return new Promise((resolve) => {
        const rl =
            readline.createInterface({
                input:
                    process.stdin,

                output:
                    process.stdout
            });

        rl.question(
            question,
            (answer) => {
                rl.close();

                resolve(
                    answer.trim()
                );
            }
        );
    });
}


function normalizePhoneNumber(input) {
    return String(
        input || ''
    ).replace(
        /\D/g,
        ''
    );
}


async function createConnection() {
    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(
        SESSION_PATH
    );

    const sock =
        makeWASocket({
            auth:
                state,

            logger:
                P({
                    level:
                        'silent'
                }),

            printQRInTerminal:
                false
        });

    sock.ev.on(
        'creds.update',
        saveCreds
    );

    if (
        !state.creds.registered
    ) {
        const phoneNumber =
            normalizePhoneNumber(
                await ask(
                    '📱 أدخل رقم واتساب مع كود الدولة: '
                )
            );

        if (
            !phoneNumber
        ) {
            throw new Error(
                'رقم الهاتف غير صالح.'
            );
        }

        try {
            const code =
                await sock.requestPairingCode(
                    phoneNumber
                );

            console.log('');
            console.log(
                '╔══════════════════════════╗'
            );
            console.log(
                '║   🔗 FIX BOT V1 LINK     ║'
            );
            console.log(
                '╠══════════════════════════╣'
            );
            console.log(
                `║   CODE: ${code}`
            );
            console.log(
                '╚══════════════════════════╝'
            );
            console.log('');
            console.log(
                'افتح واتساب ← الأجهزة المرتبطة'
            );
            console.log(
                'ثم اختر الربط باستخدام رقم الهاتف'
            );
            console.log(
                'وأدخل الكود الظاهر أعلاه.'
            );
            console.log('');

        } catch (error) {
            consoleUI.error(
                'PAIRING CODE',
                error
            );

            throw error;
        }
    }

    return {
        sock,
        state
    };
}


function isLoggedOut(
    lastDisconnect
) {
    const code =
        lastDisconnect
            ?.error
            ?.output
            ?.statusCode;

    return (
        code ===
        DisconnectReason.loggedOut
    );
}


function watchConnection(
    sock,
    callbacks = {}
) {
    if (
        !sock?.ev
    ) {
        return;
    }

    sock.ev.on(
        'connection.update',
        (update) => {
            const {
                connection,
                lastDisconnect
            } = update;

            if (
                connection ===
                'open'
            ) {
                callbacks.onOpen?.(
                    update
                );

                return;
            }

            if (
                connection ===
                'close'
            ) {
                callbacks.onClose?.(
                    lastDisconnect,
                    update
                );

                return;
            }
        }
    );
}


async function getBotIdentity(
    sock
) {
    const jid =
        sock?.user?.id ||
        null;

    if (!jid) {
        return null;
    }

    return resolveIdentity(
        sock,
        jid
    );
}


module.exports = {
    createConnection,
    isLoggedOut,
    watchConnection,
    getBotIdentity
};
