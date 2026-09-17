import assert from 'node:assert/strict';
import { parseExactSurahQuery, parseExactVerseQuery } from '../services/dorar.js';
import { parseDurationIntent, forbidden } from '../services/youtube.js';

assert.deepEqual(parseExactSurahQuery('سورة الفاتحة'), { surahId: 1, surahName: 'الفاتحة' });
assert.equal(parseExactVerseQuery('سورة الفاتحة 2')?.ayah, 2);
assert.equal(parseExactVerseQuery('سورة البقرة آية 255')?.ayah, 255);
assert.equal(parseExactVerseQuery('آية الكرسي')?.ayah, 255);
assert.equal(parseExactVerseQuery('آية 255'), null);
assert.equal(parseExactVerseQuery('سورة الفرقان 11')?.surahId, 25);

assert.deepEqual(parseDurationIntent('رونالدو 10 ثواني'), { seconds: 10, query: 'رونالدو' });
assert.deepEqual(parseDurationIntent('اديـت ميسي 25 ثانيه'), { seconds: 25, query: 'اديـت ميسي' });
assert.equal(forbidden('اغنية عمرو دياب'), true);
assert.equal(forbidden('سورة الفاتحة المنشاوي'), false);

console.log('STEAM V2 smoke tests: PASS');
