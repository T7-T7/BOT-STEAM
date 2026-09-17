#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

say() { printf '%s\n' "$1"; }

say '⎋ STEAM V2 • SETUP'
say '━━━━━━━━━━━━━━━━━━━━'

if command -v pkg >/dev/null 2>&1; then
  say '📦 تحديث مستودعات Termux...'
  pkg update -y

  say '🧰 تثبيت الأدوات الأساسية...'
  if ! command -v node >/dev/null 2>&1; then
    pkg install -y nodejs-lts 2>/dev/null || pkg install -y nodejs
  fi
  pkg install -y python ffmpeg zip unzip git
else
  say 'ℹ️ Termux غير مكتشف؛ سيتم استخدام الأدوات المثبتة في النظام.'
fi

command -v node >/dev/null 2>&1 || { say '❌ Node.js غير مثبت.'; exit 1; }
command -v npm >/dev/null 2>&1 || { say '❌ npm غير مثبت.'; exit 1; }
command -v python >/dev/null 2>&1 || { say '❌ Python غير مثبت.'; exit 1; }
command -v ffmpeg >/dev/null 2>&1 || { say '❌ FFmpeg غير مثبت.'; exit 1; }

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 20 ]; then
  say "❌ STEAM يحتاج Node.js 20 أو أحدث. الموجود: $(node -v)"
  exit 1
fi

say '🐍 تثبيت yt-dlp...' 
if ! command -v yt-dlp >/dev/null 2>&1; then
  python -m pip install -U yt-dlp --break-system-packages || \
  python -m pip install -U yt-dlp || \
  pip install -U yt-dlp --break-system-packages || \
  pip install -U yt-dlp
fi
command -v yt-dlp >/dev/null 2>&1 || { say '❌ فشل تثبيت yt-dlp.'; exit 1; }

say '📦 تثبيت مكتبات JavaScript...' 
if [ -f package-lock.json ]; then
  npm ci --omit=dev
else
  npm install --omit=dev
fi

mkdir -p data/archives session

say '🧪 فحص ملفات JavaScript...' 
find commands console services security database heart whatsapp -type f -name '*.js' -print0 |
while IFS= read -r -d '' file; do
  node --check "$file" >/dev/null
done

say '━━━━━━━━━━━━━━━━━━━━'
say '✅ اكتمل تثبيت كل متطلبات STEAM.'
say '▶️ تشغيل STEAM...'
exec npm start
