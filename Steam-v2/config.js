const developers = ['201104625895'];

export default {
  name: 'STEAM BOT V2',
  version: '2.0.0',
  prefix: '.',
  sessionDir: './session',
  dataDir: './data',
  developers,
  behaviour: { autoRead: false },
  pairing: { phoneNumber: process.env.PHONE_NUMBER || '' },
  console: { enabled: true },
  database: { saveInterval: 10000 },
  testChannel: 'https://whatsapp.com/channel/0029Vb82GRL0AgW61X3c3d0M'
};
