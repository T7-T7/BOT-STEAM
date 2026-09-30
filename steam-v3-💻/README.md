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

انسخ الأوامر بالترتيب في Termux. يفترض أن ملف `STEAM-BOT-v3-6.zip` موجود في مجلد **Downloads** في الموبايل.

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
unzip ~/storage/downloads/STEAM-BOT-v3-6.zip -d ~/bot/
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
| ⚙️ **نظام** |  `فنش` · `زرف`  `اوامر` · `سيستم` · `اعداد` · `نخبة` · `ضيف` · `بدل` · `تست` |

> اكتب `.اوامر` في واتساب لعرض القائمة الكاملة الحية.

---

## 🛡️ مستويات الصلاحيات

| المستوى | الدور | الصلاحية |
|:---:|---|---|
| 👑 | **مطوّر** | كل شيء، بما فيه النظام والإضافات |
| 💎 | **نخبة** | أوامر خاصة يمنحها المطوّر |
| 👤 | **مستخدم** | الأوامر العامة |

اكتب رقمك في ملف `env` ليعرفك بوت ك مطور

---

## 📊 الحدود

| الحد | القيمة |
|---|---|
| رسائل الانتظار في الطابور | 128 |
| أقصى حجم وسائط | 64 MB |
| أقصى مدة صوت | 15 دقيقة |
| أقصى مدة فيديو | 30 دقيقة |

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
