<div align="center">

# ⚡ STEAM BOT V3

### `WhatsApp Bot • Modular • Secure • Plugin-Ready`

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Baileys](https://img.shields.io/badge/Baileys-7.0.0--rc14-25D366?style=for-the-badge)
![Modules](https://img.shields.io/badge/ES-Modules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Version](https://img.shields.io/badge/Version-3.0.0-D4AF37?style=for-the-badge)
![Commands](https://img.shields.io/badge/Commands-40%2B-8A2BE2?style=for-the-badge)

**Built for WhatsApp. Designed to evolve.**

[Features](#-features) · [Architecture](#-architecture) · [Commands](#-commands) · [Security](#-security-roles) · [Plugins](#-plugins) · [Quick Start](#-quick-start)

</div>

---

## 🔥 Features

| | Feature | Details |
|---|---|---|
| 🧩 | **Modular Core** | Every command is an isolated ES module, loaded by a dynamic registry |
| 🔐 | **Smart Identity** | PN ⇄ LID mapping in both directions, persisted and auto-learned from group messages |
| 🛡️ | **Role-Based Security** | Five permission levels checked on every command |
| 🔌 | **Live Plugins** | Add, reload and remove plugins at runtime, with load errors reported back |
| 🗄️ | **Safe Database** | Async debounced saves, per-key serialized writes |
| 📬 | **Bounded Queue** | Message backlog capped at 128 to stay stable under load |
| 🎬 | **Media Guard** | Size, duration and URL safety checks on every download |
| 📦 | **Clean Exports** | Project packs skip plugins, credentials and secret-like files |
| 🧪 | **Built-in Tests** | Smoke, identity and group-phase tests |

---

## 🧩 Architecture

```
STEAM BOT V3
├── commands/    → 40+ command modules
├── services/    → YouTube · Dorar · Archive · Group · Guards
├── security/    → Roles · Permissions · Owner & LID resolution
├── heart/       → Runtime · Registry · Bus · Queue
├── whatsapp/    → Connection & Message Engine
├── database/    → Persistent Store
├── console/     → Logger · Live Console
├── plugins/     → Drop-in Extensions
├── tests/       → Smoke & Identity Tests
├── assets/      → Static Media
└── index.js     → Entry Point
```

**Flow:** `WhatsApp → Message Engine → Queue → Registry → Security Check → Command → Service / Database`

---

## 🎮 Commands

| Category | Commands |
|---|---|
| 🕹️ **Games** | `xo` · `شطرنج` · `اركيد` · `بنج` · `سنيك` |
| 🎬 **Media** | `بوست` · `فيديو` · `بحث يوتيوب` · `سبوتي` · `فيس فيديو` · `ازالة خلفية` · `عرض` · `فيورا` |
| 👥 **Groups** | `طرد` · `ادخل` · `رفع ادمن` · `ازل ادمن` · `تغيير` · `غير صوره` · `ق شات` · `ف شات` |
| 💾 **Backup** | `نسخ` · `لصق` · `حذف نسخة` |
| 📖 **Islamic** | `درر حديث` · `درر تفسير` |
| 🗂️ **Archive** | `ارشيف` · `اضافة` |
| ⚙️ **System** | `اوامر` · `سيستم` · `نخبة` · `ضيف` · `بدل` · `رستر` · `تست` · `خروج` |

> Type `.اوامر` inside WhatsApp for the full live list.

---

## 🛡️ Security Roles

| Level | Role | Access |
|:---:|---|---|
| 👑 | **Developer** | Everything, including system and plugin control |
| 🔱 | **Main Owner** | Owner powers plus elite management |
| ⭐ | **Owner** | Advanced group and media commands |
| 💎 | **Elite** | Special commands granted by the developer |
| 👤 | **User** | Public commands |

Developer and owner numbers are set through `.env`, never hard-coded in source.

---

## 🔌 Plugins

Drop a file in `plugins/` or use `.ضيف` to install one live. The registry reloads without a restart, reports any load error, and avoids command-name collisions.

---

## 📊 Limits

| Limit | Value |
|---|---|
| Pending messages | 128 |
| Max media size | 64 MB |
| Max audio length | 15 min |
| Max video length | 30 min |

---

## ⚙️ Powered By

`Node.js` × `Baileys` × `ES Modules`

`Sharp` · `Pino` · `Axios` · `JSZip` · `yt-search`

`Dynamic Registry` · `Security Layer` · `Async Database` · `Plugin Loader`

---

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Create a .env file
DEVELOPERS=201000000000
MAIN_OWNERS=201000000000
OWNERS=
PHONE_NUMBER=201000000000

# 3. Run
npm start

# 4. Test
npm test
```

> ⚠️ Never commit `.env` or the `session/` folder.

---

## 📡 STEAM NETWORK

<div align="center">

[![WhatsApp](https://img.shields.io/badge/WhatsApp-Channel-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com/channel/0029Vb82GRL0AgW61X3c3d0M)

[![GitHub](https://img.shields.io/badge/GitHub-T7--T7-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/T7-T7/BOT-STEAM)

[![Telegram](https://img.shields.io/badge/Telegram-BotFix-229ED9?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/botfix1)

</div>

---

<div align="center">

### ⚡ STEAM BOT V3

**Faster. Safer. Modular. Ready to evolve.**

</div>
