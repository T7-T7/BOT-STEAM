const {
    jidNormalizedUser,
    isPnUser,
    isLidUser
} = require('@whiskeysockets/baileys');

/**
 * توحيد JID بدون تحويل LID إلى رقم هاتف بالتخمين.
 */
function normalizeJid(jid) {
    if (!jid || typeof jid !== 'string') {
        return null;
    }

    try {
        return jidNormalizedUser(jid);
    } catch {
        return jid.trim();
    }
}

/**
 * معرفة نوع الهوية.
 */
function getJidType(jid) {
    const normalized = normalizeJid(jid);

    if (!normalized) {
        return null;
    }

    if (isLidUser(normalized)) {
        return 'lid';
    }

    if (isPnUser(normalized)) {
        return 'pn';
    }

    return 'unknown';
}

/**
 * استخراج رقم الهاتف من PN فقط.
 *
 * مهم:
 * لا تستخدم هذه الدالة مع LID.
 */
function extractNumberFromPn(jid) {
    const normalized = normalizeJid(jid);

    if (!normalized || !isPnUser(normalized)) {
        return null;
    }

    return normalized
        .split('@')[0]
        .split(':')[0];
}

/**
 * تحويل JID إلى PN باستخدام
 * Baileys LID Mapping الحقيقي.
 */
async function resolvePn(sock, jid) {
    const normalized = normalizeJid(jid);

    if (!normalized) {
        return null;
    }

    // إذا كانت الهوية PN بالفعل، لا نحتاج Mapping.
    if (isPnUser(normalized)) {
        return normalized;
    }

    // LID يحتاج إلى Mapping حقيقي.
    if (!isLidUser(normalized)) {
        return null;
    }

    const lidMapping = sock?.signalRepository?.lidMapping;

    if (!lidMapping ||
        typeof lidMapping.getPNForLID !== 'function') {
        return null;
    }

    try {
        const pn = await lidMapping.getPNForLID(normalized);

        if (!pn) {
            return null;
        }

        const normalizedPn = normalizeJid(pn);

        if (!normalizedPn || !isPnUser(normalizedPn)) {
            return null;
        }

        return normalizedPn;
    } catch {
        return null;
    }
}

/**
 * تحويل PN إلى LID باستخدام
 * Baileys LID Mapping الحقيقي.
 */
async function resolveLid(sock, jid) {
    const normalized = normalizeJid(jid);

    if (!normalized) {
        return null;
    }

    // إذا كانت الهوية LID بالفعل.
    if (isLidUser(normalized)) {
        return normalized;
    }

    // PN يحتاج إلى Mapping.
    if (!isPnUser(normalized)) {
        return null;
    }

    const lidMapping = sock?.signalRepository?.lidMapping;

    if (!lidMapping ||
        typeof lidMapping.getLIDForPN !== 'function') {
        return null;
    }

    try {
        const lid = await lidMapping.getLIDForPN(normalized);

        if (!lid) {
            return null;
        }

        const normalizedLid = normalizeJid(lid);

        if (!normalizedLid || !isLidUser(normalizedLid)) {
            return null;
        }

        return normalizedLid;
    } catch {
        return null;
    }
}

/**
 * إنشاء هوية أساسية من القيم المعروفة.
 */
function createIdentity(input = {}) {
    const jid = normalizeJid(input.jid);
    const lid = normalizeJid(input.lid);
    const pn = normalizeJid(input.pn);

    return Object.freeze({
        jid,
        lid,
        pn,
        jidType: getJidType(jid),
        pnNumber: extractNumberFromPn(pn)
    });
}

/**
 * حل هوية موحدة من JID.
 *
 * النتيجة الأساسية التي سنعتمد عليها
 * في نظام المطورين والنخبة هي PN.
 */
async function resolveIdentity(sock, jid) {
    const normalized = normalizeJid(jid);

    if (!normalized) {
        return createIdentity();
    }

    const type = getJidType(normalized);

    // PN معروف مباشرة.
    if (type === 'pn') {
        const lid = await resolveLid(sock, normalized);

        return createIdentity({
            jid: normalized,
            pn: normalized,
            lid
        });
    }

    // LID يحتاج إلى تحويل حقيقي إلى PN.
    if (type === 'lid') {
        const pn = await resolvePn(sock, normalized);

        return createIdentity({
            jid: normalized,
            lid: normalized,
            pn
        });
    }

    return createIdentity({
        jid: normalized
    });
}

/**
 * حل هوية رسالة WhatsApp.
 *
 * يدعم:
 * - participant
 * - participantAlt
 * - remoteJid
 * - remoteJidAlt
 *
 * ويجمع الهوية بدون افتراض أن الـLID هو رقم الهاتف.
 */
async function resolveMessageIdentity(sock, message) {
    const key = message?.key || {};

    const candidates = [
        key.participant,
        key.participantAlt,
        key.remoteJid,
        key.remoteJidAlt
    ].filter(Boolean);

    const identities = [];

    for (const candidate of candidates) {
        const identity = await resolveIdentity(sock, candidate);

        if (identity.jid ||
            identity.pn ||
            identity.lid) {
            identities.push(identity);
        }
    }

    const pnIdentity =
        identities.find(identity => identity.pn);

    const lidIdentity =
        identities.find(identity => identity.lid);

    const jidIdentity =
        identities.find(identity => identity.jid);

    return createIdentity({
        jid: jidIdentity?.jid || null,
        pn: pnIdentity?.pn || null,
        lid: lidIdentity?.lid || null
    });
}

/**
 * مقارنة هويتين باستخدام الـPN عندما يكون متاحًا.
 *
 * لا نعتبر LID وPN متساويين إلا بعد
 * إثبات العلاقة عن طريق Mapping.
 */
async function areSameIdentity(sock, first, second) {
    const firstIdentity =
        await resolveIdentity(sock, first);

    const secondIdentity =
        await resolveIdentity(sock, second);

    if (!firstIdentity.pn ||
        !secondIdentity.pn) {
        return false;
    }

    return firstIdentity.pn === secondIdentity.pn;
}

module.exports = {
    normalizeJid,
    getJidType,
    extractNumberFromPn,
    resolvePn,
    resolveLid,
    createIdentity,
    resolveIdentity,
    resolveMessageIdentity,
    areSameIdentity
};
