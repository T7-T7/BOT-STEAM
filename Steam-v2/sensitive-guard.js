const UI_GARBAGE = [
  'تسجيل الدخول', 'اختر نوع البحث', 'منهج العمل في الموسوعات', 'التعريف بالموقع',
  'روابط هامة', 'تثبيت خيارات البحث', 'البحث في الموسوعة', 'لجنة الإشراف العلمي'
];

function hasGarbage(value) {
  const text = String(value || '');
  return UI_GARBAGE.some(x => text.includes(x));
}

export function validHadith(row) {
  if (!row || !String(row.text || '').trim()) return false;
  if (hasGarbage(row.text) || hasGarbage(row.narrator) || hasGarbage(row.scholar)) return false;
  if (!String(row.url || '').startsWith('https://dorar.net/h/')) return false;
  return true;
}

export function validTafseer(row) {
  if (!row || !String(row.text || '').trim()) return false;
  if (hasGarbage(row.text)) return false;
  return true;
}
