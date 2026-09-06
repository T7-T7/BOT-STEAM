const https = require('https');

function measureLatency() {
    return new Promise((resolve) => {
        const start = Date.now();

        const request = https.get(
            'https://www.google.com/generate_204',
            {
                timeout: 5000
            },
            (response) => {
                response.resume();

                response.on('end', () => {
                    resolve(Date.now() - start);
                });
            }
        );

        request.on('error', () => {
            resolve(null);
        });

        request.on('timeout', () => {
            request.destroy();
            resolve(null);
        });
    });
}

function analyzeLatency(latency) {
    if (latency === null) {
        return {
            quality: 'تعذر القياس 📡',
            speed: '🔴🔴🔴🔴🔴'
        };
    }

    if (latency <= 100) {
        return {
            quality: 'ممتازة 🚀',
            speed: '🟢🟢🟢🟢🟢'
        };
    }

    if (latency <= 200) {
        return {
            quality: 'سريعة ⚡',
            speed: '🟢🟢🟢🟢⚪'
        };
    }

    if (latency <= 350) {
        return {
            quality: 'مستقرة 🛰️',
            speed: '🟢🟢🟢⚪⚪'
        };
    }

    if (latency <= 500) {
        return {
            quality: 'مقبولة 📡',
            speed: '🟢🟢⚪⚪⚪'
        };
    }

    if (latency <= 800) {
        return {
            quality: 'تحتاج تحسين 🐢',
            speed: '🟢⚪⚪⚪⚪'
        };
    }

    return {
        quality: 'بطيئة 🐌',
        speed: '🔴🔴🔴🔴🔴'
    };
}

async function execute({
    sock,
    message,
    chatId
}) {
    const latency =
        await measureLatency();

    const analysis =
        analyzeLatency(latency);

    const response =
        latency === null
            ? 'غير متاح'
            : `${latency} ms`;

    const text =
`⚜️ 𝐁𝐎𝐓 𝐅𝐈𝐗
~*⊹‏⊱≼━━━⌬〔⚜️〕⌬━━━≽⊰⊹*~
🏓 𝐏𝐈𝐍𝐆
  ⊱ ───────────── ⊰
⏱️ 𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞 : ${response}
📶 𝐐𝐮𝐚𝐥𝐢𝐭𝐲 : ${analysis.quality}
📊 𝐒𝐩𝐞𝐞𝐝 :${analysis.speed}
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

    return {
        latency
    };
}

module.exports = {
    name: 'ping',
    aliases: ['بنق'],

    description:
        'قياس سرعة استجابة البوت',

    usage:
        '.ping',

    category:
        'public',

    execute
};
