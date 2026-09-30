<div align="center">
  <img src="https://i.ibb.co/DfLDccbK/Termux-svg.png" width="420" style="border: 2px solid #D4AF37; border-radius: 12px;">
</div>

<div align="center">

# ⚡ STEAM BOT V3
### 📱 نسخة Termux

**شغّل بوت واتساب من موبايلك • بدون استضافة • بدون كمبيوتر**

![Termux](https://img.shields.io/badge/Termux-Android-000000?style=for-the-badge&logo=termux&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.6%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Baileys](https://img.shields.io/badge/Baileys-7.0.0--rc14-25D366?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-3.0.0-D4AF37?style=for-the-badge)
![Pairing](https://img.shields.io/badge/Login-Pairing%20Code-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)

[التشغيل السريع](#-التشغيل-السريع) · [المميزات](#-ليه-termux) · [التثبيت](#-التثبيت) · [الربط](#-الربط-بالواتساب) · [التشغيل الدائم](#-تشغيل-دائم) · [الأوامر](#-الأوامر) · [حل المشاكل](#-حل-المشاكل)

</div>

---

<div dir="rtl">

## ⚡ التشغيل السريع

انسخ الأوامر بالترتيب في Termux. يفترض أن ملف `STEAM-BOT-v3-6.zip` موجود في مجلد **Telegram** في الموبايل.

**1️⃣ تجهيز Termux والأدوات**

</div>

```bash
termux-setup-storage
pkg update -y && pkg install nodejs-lts -y
pkg install wget unzip -y
```

<div dir="rtl">

> `termux-setup-storage` تُنفَّذ مرة واحدة فقط، وستظهر رسالة طلب صلاحية الملفات، اضغط **سماح**.

**2️⃣ فك ضغط المشروع**

</div>

```bash
mkdir -p ~/bot
unzip ~/storage/downloads/Telegram/STEAM-BOT-v3-6.zip -d ~/bot/
cd ~/bot
```

<div dir="rtl">

> تأكد أنك داخل المجلد الصحيح بالأمر `ls`، يجب أن ترى `package.json` و`index.js`. لو ظهر مجلد واحد فقط، ادخل إليه بـ `cd` ثم كرّر `ls`.

**3️⃣ تثبيت المكتبات والاختبار**

</div>

```bash
pkg install nodejs-lts zip -y
npm ci
npm test
```

<div dir="rtl">

النتيجة المتوقعة من `npm test`:

</div>

```text
STEAM V3 smoke tests: PASS
```

<div dir="rtl">

> ظهور `PASS` يعني أن ملفات جافاسكربت سليمة والمشروع جاهز للتشغيل. لو لم تظهر، راجع قسم [حل المشاكل](#-حل-المشاكل) قبل المتابعة.

**4️⃣ ملف الإعدادات ثم التشغيل**

</div>

```bash
nano .env
```

```env
DEVELOPERS=201000000000
MAIN_OWNERS=201000000000
OWNERS=
PHONE_NUMBER=201000000000
```

```bash
npm start
```

<div dir="rtl">

> الحفظ في `nano`: `Ctrl + X` ثم `Y` ثم `Enter`. بعد `npm start` سيظهر كود الربط، وخطوات إدخاله في [قسم الربط](#-الربط-بالواتساب).

---

## 🔥 ليه Termux؟

| | الميزة | التفاصيل |
|:---:|---|---|
| 📦 | **مكتبات جافاسكربت صافية** | بدون تجميع (build) وبدون أخطاء `node-gyp`، كل شيء يتثبت بـ `npm install` |
| 🔗 | **ربط بكود** | تكتب كود من 8 حروف في واتساب، بدون QR وبدون جهاز ثاني |
| 🧰 | **أداة خارجية واحدة** | `zip` فقط، تستخدمها ميزات الأرشيف وتصدير المشروع |
| 🆓 | **مجاني بالكامل** | بدون سيرفر وبدون اشتراك |
| 🔌 | **كل مميزات V3** | صلاحيات، إضافات حية، قاعدة بيانات آمنة، طابور رسائل |

---

## 📋 المتطلبات

- تطبيق **Termux** من [F-Droid](https://f-droid.org/packages/com.termux/)، ونسخة بلاي ستور قديمة ولا تعمل بشكل صحيح
- **Node.js 20.6 أو أحدث**، لأن التشغيل يستخدم `--env-file`
- مساحة فاضية واتصال إنترنت ثابت وقت التثبيت

---

## 🚀 التثبيت

**1️⃣ حدّث الحزم**

</div>

```bash
pkg update -y && pkg upgrade -y
```

<div dir="rtl">

**2️⃣ ثبّت الأدوات المطلوبة**

</div>

```bash
pkg install -y nodejs-lts git zip unzip nano
```

<div dir="rtl">

**3️⃣ حمّل المشروع**

</div>

```bash
git clone https://github.com/T7-T7/BOT-STEAM
cd BOT-STEAM
```

<div dir="rtl">

> لو عندك المشروع كملف zip على الموبايل: نفّذ `termux-setup-storage` مرة واحدة، ثم فك الضغط:
> `unzip ~/storage/downloads/STEAM-BOT-v3.zip`

**4️⃣ ثبّت المكتبات وافحصها**

</div>

```bash
npm ci
npm test
```

<div dir="rtl">

**5️⃣ أنشئ ملف الإعدادات**

</div>

```bash
nano .env
```

```env
DEVELOPERS=201000000000
MAIN_OWNERS=201000000000
OWNERS=
PHONE_NUMBER=201000000000
```

<div dir="rtl">

> الحفظ في `nano`: اضغط `Ctrl + X` ثم `Y` ثم `Enter`.
> اكتب الأرقام بالصيغة الدولية بدون `+` وبدون مسافات، ويمكن وضع أكثر من رقم مفصولين بفاصلة.

**6️⃣ شغّل البوت**

</div>

```bash
npm start
```

<div dir="rtl">

---

## 🔗 الربط بالواتساب

| الخطوة | ماذا تفعل |
|:---:|---|
| 1️⃣ | بعد `npm start` سيظهر **كود ربط** في Termux |
| 2️⃣ | افتح واتساب ← **الأجهزة المرتبطة** ← **ربط جهاز** ← **ربط برقم الهاتف بدلًا من ذلك** |
| 3️⃣ | اكتب الكود ✅ |

> 💡 لو تركت `PHONE_NUMBER` فارغًا، البوت يسألك عن الرقم (بدون `+`) عند التشغيل.

---

## 🔋 تشغيل دائم

أندرويد يوقف التطبيقات في الخلفية، فاتبع الآتي ليبقى البوت شغال:

| الإجراء | الأمر أو المسار |
|---|---|
| منع النوم | `termux-wake-lock` |
| إيقاف توفير الطاقة | إعدادات الموبايل ← البطارية ← Termux ← **بدون قيود** |
| تشغيل داخل جلسة ثابتة | `tmux` (الشرح تحت) |

</div>

```bash
pkg install -y tmux
termux-wake-lock
tmux new -s steam
npm start
```

<div dir="rtl">

- **للخروج من الجلسة والبوت شغال:** `Ctrl + B` ثم `D`
- **للرجوع للجلسة:** `tmux attach -t steam`
- **لإيقاف البوت:** ارجع للجلسة واضغط `Ctrl + C`

</div>

<details>
<summary><b>🔄 تشغيل تلقائي عند فتح الموبايل (اختياري)</b></summary>

<br>

<div dir="rtl">

1. ثبّت تطبيق **Termux:Boot** من F-Droid وافتحه مرة واحدة.
2. أنشئ سكربت التشغيل:

</div>

```bash
mkdir -p ~/.termux/boot
cat > ~/.termux/boot/steam.sh << 'BOOT'
#!/data/data/com.termux/files/usr/bin/sh
termux-wake-lock
cd ~/BOT-STEAM
npm start
BOOT
chmod +x ~/.termux/boot/steam.sh
```

</details>

<div dir="rtl">

---

## 🎮 الأوامر

| القسم | الأوامر |
|---|---|
| 🕹️ **ألعاب** | `xo` · `شطرنج` · `اركيد` · `بنج` · `سنيك` |
| 🎬 **وسائط** | `بوست` · `سبوتي` · `ازالة خلفية` · `عرض` · `فيورا` |
| 👥 **جروبات** | `طرد` · `ادخل` · `رفع ادمن` · `تغيير` · `ق شات` · `ف شات` · `حذف` · `خروج` |
| 💾 **نسخ احتياطي** | `نسخ` · `لصق` · `حذف نسخة` |
| 📖 **إسلاميات** | `درر حديث` · `درر تفسير` |
| 🗂️ **أرشيف** | `ارشيف` · `اضافة` |
| ⚙️ **نظام** | `اوامر` · `سيستم` · `اعداد` · `نخبة` · `ضيف` · `بدل` · `تست` |

> اكتب `.اوامر` في واتساب لعرض القائمة الكاملة الحية.

---

## 🛡️ مستويات الصلاحيات

| المستوى | الدور | الصلاحية |
|:---:|---|---|
| 👑 | **مطوّر** | كل شيء، بما فيه النظام والإضافات |
| 🔱 | **مالك رئيسي** | صلاحيات المالك وإدارة النخبة |
| ⭐ | **مالك** | أوامر الجروبات والوسائط المتقدمة |
| 💎 | **نخبة** | أوامر خاصة يمنحها المطوّر |
| 👤 | **مستخدم** | الأوامر العامة |

أرقام المطورين والملاك تُضبط من `.env` ولا تُكتب داخل الكود.

---

## 📊 الحدود

| الحد | القيمة |
|---|---|
| رسائل الانتظار في الطابور | 128 |
| أقصى حجم وسائط | 64 MB |
| أقصى مدة صوت | 15 دقيقة |
| أقصى مدة فيديو | 30 دقيقة |

---

## 🔁 التحديث والنسخ الاحتياطي

</div>

```bash
# نسخة احتياطية قبل أي تحديث
cp -r data data.bak
cp -r session session.bak

# تحديث الملفات ثم المكتبات
git pull
npm install

# فحص سريع للمشروع
npm test
```

<div dir="rtl">

---

## 🔧 حل المشاكل

| المشكلة | الحل |
|---|---|
| `node: bad option: --env-file` | إصدار Node قديم، نفّذ `pkg install nodejs-lts` |
| `zip: not found` | نفّذ `pkg install zip` |
| لا يظهر كود الربط | تأكد أن `PHONE_NUMBER` صحيح بالصيغة الدولية بدون `+` |
| البوت خرج بعد تسجيل خروج من واتساب | احذف مجلد `session` وأعد الربط |
| البوت يقف بعد قفل الشاشة | فعّل `termux-wake-lock` وأوقف توفير الطاقة لـ Termux |
| خطأ غريب بعد التحديث | شغّل `npm install` ثم `npm test` |

---

## 🔒 الأمان

> ⚠️ لا تشارك ملف `.env` ولا مجلد `session` مع أي شخص، ولا ترفعهما على GitHub.
> من لديه مجلد `session` يستطيع التحكم في حساب الواتساب المرتبط.

</div>

---

## 📡 STEAM NETWORK

<div align="center">

[![WhatsApp](https://img.shields.io/badge/WhatsApp-Channel-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com/channel/0029Vb82GRL0AgW61X3c3d0M)

[![GitHub](https://img.shields.io/badge/GitHub-T7--T7-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/T7-T7/BOT-STEAM)

[![Telegram](https://img.shields.io/badge/Telegram-BotFix-229ED9?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/botfix1)

</div>

---

<div align="center">

### ⚡ STEAM BOT V3 • Termux

**صُنع للواتساب. وصُمم ليتطوّر.**

</div>
