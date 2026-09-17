import readline from 'readline';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  Browsers
} from '@whiskeysockets/baileys';
import config from '../config.js';
import { register } from '../security/index.js';
import { getCachedGroupMetadata, setGroupMetadata, mergeGroupUpdate, invalidateGroup } from '../services/group-cache.js';
import * as ui from '../console/index.js';

const logger = pino({ level: 'silent' });
const ask = q => new Promise(resolve => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question(q, answer => { rl.close(); resolve(answer.trim()); });
});

let reconnectTimer = null;
let reconnecting = false;
let downtimeStarted = null;
let socketGeneration = 0;

export async function connect(onSocket) {
  if (reconnecting) return;
  reconnecting = true;

  try {
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionDir);
    const { version } = await fetchLatestBaileysVersion();
    const generation = ++socketGeneration;

    const sock = makeWASocket({
      version,
      logger,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger)
      },
      browser: Browsers.ubuntu('Chrome'),
      printQRInTerminal: false,
      markOnlineOnConnect: false,
      syncFullHistory: false,
      cachedGroupMetadata: async jid => getCachedGroupMetadata(jid)
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('groups.upsert', groups => {
      for (const group of groups || []) setGroupMetadata(group);
    });

    sock.ev.on('groups.update', updates => {
      for (const update of updates || []) mergeGroupUpdate(update);
    });

    sock.ev.on('group-participants.update', event => {
      if (event?.id) invalidateGroup(event.id);
    });

    let requestedPairing = false;
    let opened = false;

    sock.ev.on('connection.update', async u => {
      try {
        if (u.connection === 'connecting') {
          reconnecting = false;
          ui.connection('connecting', 'جاري إنشاء اتصال واتساب...');
        }

        // pairing code يجب أن يطلب بعد دخول socket مرحلة الاتصال/ظهور QR.
        if ((u.connection === 'connecting' || u.qr) && !state.creds.registered && !requestedPairing) {
          requestedPairing = true;
          try {
            let phone = config.pairing.phoneNumber || await ask('📱 رقم الهاتف بدون +: ');
            phone = phone.replace(/\D/g, '');
            if (!phone) throw new Error('رقم الهاتف غير صالح');
            const code = await sock.requestPairingCode(phone);
            ui.connection('pairing', `كود الربط: ${code.match(/.{1,4}/g)?.join('-') || code}`);
          } catch (e) {
            requestedPairing = false;
            ui.error('PAIRING', e);
          }
        }

        if (u.connection === 'open' && generation === socketGeneration) {
          reconnecting = false;
          opened = true;
          const elapsed = downtimeStarted ? Date.now() - downtimeStarted : 0;
          downtimeStarted = null;
          if (sock.user?.id && sock.user?.lid) {
            register(sock.user.id, sock.user.lid);
          }
          ui.connection('open', `تم الاتصال: ${sock.user?.id || ''}\nزمن استعادة الاتصال: ${elapsed}ms`);
          onSocket?.(sock);
        }

        if (u.connection === 'close' && generation === socketGeneration) {
          const statusCode = u.lastDisconnect?.error?.output?.statusCode
            ?? (u.lastDisconnect?.error instanceof Boom ? u.lastDisconnect.error.output.statusCode : undefined);

          if (statusCode === DisconnectReason.loggedOut) {
            reconnecting = false;
            ui.connection('close', 'تم تسجيل الخروج. احذف مجلد session لإعادة الربط.');
            return;
          }

          if (!downtimeStarted) downtimeStarted = Date.now();
          if (reconnectTimer) return;

          const reason = statusCode ? `رمز الانقطاع: ${statusCode}` : 'الاتصال انقطع';
          ui.connection('reconnecting', `${reason}\nجاري إعادة الاتصال...`);

          reconnectTimer = setTimeout(async () => {
            reconnectTimer = null;
            reconnecting = false;
            try {
              await connect(onSocket);
            } catch (e) {
              reconnecting = false;
              ui.error('RECONNECT', e);
            }
          }, 1200);
        }
      } catch (e) {
        ui.error('CONNECTION UPDATE', e);
      }
    });

    // لا نُبقي المتغير opened فقط للوضوح؛ socket event هو مصدر الحقيقة.
    void opened;
  } catch (e) {
    reconnecting = false;
    ui.error('CONNECT', e);
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect(onSocket).catch(err => ui.error('RECONNECT', err));
      }, 1500);
    }
  }
}
