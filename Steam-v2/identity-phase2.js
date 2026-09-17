import assert from 'node:assert/strict';
import { register, number, resolve, lidOf } from '../security/identity.js';

register('201234567890', '123456789@lid');
assert.equal(number('201234567890'), '201234567890');
assert.equal(number('123456789@lid'), '201234567890');
assert.equal(resolve('123456789@lid'), '201234567890@s.whatsapp.net');
assert.equal(lidOf('201234567890'), '123456789@lid');

register('987654321@lid', '201234567890@s.whatsapp.net');
assert.equal(number('987654321@lid'), '201234567890');

console.log('STEAM V2 identity phase 2 tests: PASS');
