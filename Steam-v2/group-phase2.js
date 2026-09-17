import assert from 'node:assert/strict';
import { targetFromMessage, findParticipant, participantNumber } from '../services/group.js';

const quoted = {
  participant: '201100000001@s.whatsapp.net',
  participantAlt: '12345@lid'
};
assert.equal(targetFromMessage({ quoted, mentions: ['201100000002@s.whatsapp.net'] }), quoted.participant);
assert.equal(targetFromMessage({ mentions: ['201100000002@s.whatsapp.net'] }), '201100000002@s.whatsapp.net');

const metadata = {
  id: '123@g.us',
  participants: [
    { id: '201100000001@s.whatsapp.net', lid: '12345@lid', phoneNumber: '201100000001@s.whatsapp.net' }
  ]
};
assert.equal(findParticipant(metadata, '12345@lid')?.id, '201100000001@s.whatsapp.net');
assert.equal(participantNumber(metadata.participants[0]), '201100000001');

console.log('STEAM V2 group phase 2 tests: PASS');
