/* Orbit — Translations (Arabic ↔ English) */
(function () {
  'use strict';

  const I18N = {
    ar: {
      'brand.tagline': '· ارفع مشروعك إلى السحابة',
      'tab.setup': 'الإعداد', 'tab.upload': 'الرفع', 'tab.remote': 'التحكم',
      'tab.drafts': 'مسودات', 'tab.pulls': 'طلبات', 'tab.issues': 'بلاغات',
      'tab.releases': 'إصدارات', 'tab.stats': 'إحصائيات', 'tab.logs': 'أحداث',
      'badge.ready': 'جاهز',
      'settings.title': 'الإعدادات',

      'setup.title': 'الإعداد',
      'setup.desc': 'هيّئ مفتاح الوصول واختر مستودعك.',
      'setup.tokenTitle': 'مفتاح الوصول',
      'setup.verify': 'تحقق',
      'setup.savedBanner': 'تم استرجاع المفتاح المحفوظ',
      'setup.flashInfo': 'المفتاح يبقى في ذاكرة المتصفح فقط افتراضيًا — لا يُخزَّن إلا بموافقتك الصريحة.',
      'setup.tokenLabel': 'GitHub Personal Access Token',
      'setup.tokenHint1': 'أنشئ مفتاحًا من',
      'setup.tokenHint2': '— الصلاحية:',
      'setup.rememberTitle': 'تذكّر المفتاح لمدة 30 يومًا',
      'setup.rememberDesc': 'سيُحفظ المفتاح في تخزين المتصفح. فعّله فقط على الأجهزة الموثوقة.',
      'setup.rememberWarnTitle': 'تحذير أمني:',
      'setup.rememberWarnBody': 'سيُحفظ المفتاح في تخزين المتصفح. استخدم Fine-grained Token مقيّد بمستودع واحد.',
      'setup.reposTitle': 'المستودعات',
      'setup.refresh': 'تحديث',
      'setup.newRepo': 'مستودع جديد',
      'setup.reposInfo': 'بعد التحقق من التوكن، سيتم تحميل قائمة كل مستودعاتك تلقائيًا.',
      'setup.activeRepo': 'المستودع النشط',
      'setup.notLoaded': 'لم يتم التحميل بعد',
      'setup.visibility': 'الخصوصية (للمستودعات الجديدة)',
      'setup.private': 'خاص', 'setup.public': 'عام',
      'setup.commitMsg': 'رسالة الـ Commit',

      'upload.title': 'رفع الملفات',
      'upload.desc': 'اختر ملفات أو مجلدًا — يمكنك تحديد الكل بضغطة واحدة.',
      'upload.pickTitle': 'اختيار الملفات',
      'upload.selectAll': 'تحديد الكل', 'upload.deselectAll': 'إلغاء التحديد',
      'upload.pickFiles': 'اختر ملفات', 'upload.pickFolder': 'اختر مجلد',
      'upload.pathWarnTitle': 'المسارات نسبية لجذر المستودع.',
      'upload.pathWarnBody': 'اكتب فقط المجلد الفرعي (مثل css/).',
      'upload.keepRoot': 'احتفظ باسم المجلد الأصلي',
      'upload.pathPrefix': 'مسار نسبي (اختياري)',
      'upload.pathPreview': 'سيتم الرفع إلى',
      'upload.emptyTitle': 'لم يتم اختيار ملفات',
      'upload.emptyDesc': 'اضغط «اختر ملفات» أو «اختر مجلد» للبدء.',
      'upload.finalTitle': 'الرفع النهائي',
      'upload.smartUpload': 'رفع ذكي — تجاهل الملفات المتطابقة (hash)',
      'upload.startUpload': 'ابدأ الرفع',
      'upload.waiting': 'في الانتظار',
      'upload.done': 'تم الرفع بنجاح',

      'remote.title': 'التحكم بالمستودع',
      'remote.desc': 'تصفّح، عدّل، انسخ، انقل، وأنشئ ملفات.',
      'remote.refreshAll': 'تحديث',
      'remote.branchesTitle': 'الفروع',
      'remote.currentBranch': 'الفرع الحالي',
      'remote.newBranch': 'فرع جديد',
      'remote.contentsTitle': 'محتوى المستودع',
      'remote.load': 'تحميل', 'remote.newFile': 'ملف جديد',
      'remote.notLoadedTitle': 'لم يتم التحميل بعد',
      'remote.notLoadedDesc': 'اختر مستودعًا من الإعداد ثم اضغط «تحميل».',

      'drafts.title': 'المسودات',
      'drafts.desc': 'احفظ تغييراتك محليًا قبل الرفع، ثم استرجعها وقتما تريد.',
      'drafts.newDraft': 'مسودة جديدة',
      'drafts.empty': 'لا توجد مسودات',
      'drafts.emptyDesc': 'اضغط «مسودة جديدة» لإنشاء واحدة.',

      'pulls.title': 'طلبات السحب',
      'pulls.desc': 'أنشئ، راجع، ادمج أو أغلق Pull Requests.',
      'pulls.open': 'مفتوحة', 'pulls.closed': 'مغلقة', 'pulls.all': 'الكل',
      'pulls.newPR': 'طلب جديد',
      'pulls.emptyTitle': 'لم يتم تحميل الطلبات',
      'pulls.emptyDesc': 'اضغط «تحميل» لعرض القائمة.',

      'issues.title': 'البلاغات',
      'issues.desc': 'أنشئ وأدر Issues في المستودع.',
      'issues.newIssue': 'بلاغ جديد',
      'issues.emptyTitle': 'لم يتم تحميل البلاغات',
      'issues.emptyDesc': 'اضغط «تحميل» لعرض القائمة.',

      'releases.title': 'الإصدارات',
      'releases.desc': 'أنشئ وأدر إصدارات المستودع.',
      'releases.newRelease': 'إصدار جديد',
      'releases.emptyTitle': 'لم يتم تحميل الإصدارات',
      'releases.emptyDesc': 'اضغط «تحميل» لعرض القائمة.',

      'stats.title': 'الإحصائيات',
      'stats.desc': 'نظرة سريعة على المستودع والنشاط.',
      'stats.repoTitle': 'المستودع',
      'stats.localTitle': 'النشاط المحلي',
      'stats.noStats': 'لا توجد إحصائيات بعد',
      'stats.noStatsDesc': 'اضغط «تحديث» لتحميل الإحصائيات.',
      'stats.noActivity': 'لا يوجد نشاط بعد',
      'stats.noActivityDesc': 'ستظهر الإحصائيات هنا بعد رفع أو تعديل.',

      'logs.title': 'سجل الأحداث',
      'logs.desc': 'عرض مباشر لكل إجراء في هذه الجلسة.',
      'logs.download': 'تنزيل', 'logs.clear': 'مسح',

      'editor.newFile': 'ملف جديد',
      'editor.cancel': 'إلغاء',
      'editor.save': 'حفظ التغييرات',
      'editor.commitPlaceholder': 'رسالة الـ Commit',

      'drawer.theme': 'المظهر (نهاري / ليلي)',
      'drawer.dark': 'ليلي (داكن)', 'drawer.light': 'نهاري (فاتح)',
      'drawer.lang': 'اللغة',
      'drawer.webhook': 'الإشعارات (Webhook)',
      'drawer.webhookInfo': 'أرسل إشعارًا إلى Discord أو Telegram بعد كل عملية ناجحة.',
      'drawer.webhookEnable': 'تفعيل الإشعارات',
      'drawer.save': 'حفظ',
      'drawer.archive': 'السجل — كل العمليات',
      'drawer.exportJson': 'تصدير JSON',
      'drawer.clearAll': 'مسح الكل',
      'drawer.guide': 'كيف تستخدم Orbit',
      'drawer.privacy': 'سياسة الخصوصية',
      'drawer.terms': 'الأحكام والشروط',
      'drawer.faq': 'الأسئلة الشائعة',
      'drawer.shortcuts': 'اختصارات لوحة المفاتيح',
      'drawer.about': 'عن التطبيق',
      'drawer.close': 'إغلاق',

      'common.close': 'إغلاق', 'common.cancel': 'إلغاء',
      'common.confirm': 'تأكيد', 'common.create': 'إنشاء',
      'common.delete': 'حذف', 'common.add': 'إضافة',

      'upload.pathPrefixPh': 'css/ (فارغ = الجذر)',
'setup.commitMsgPh': 'Initial commit',
'drafts.nameLabel': 'اسم المسودة',
'drafts.namePh': 'مسودة رقم 1',
'drafts.contentLabel': 'محتوى المسودة (JSON)',
'drafts.contentPh': '{"key": "value"}',
'modal.title': 'العنوان',
'modal.titlePh': 'عنوان مختصر',
'modal.description': 'الوصف',
'modal.descriptionPh': 'اشرح بالتفصيل…',
'modal.labels': 'التصنيفات',
'modal.labelsPh': 'bug, enhancement',
'modal.headBranch': 'من فرع',
'modal.baseBranch': 'إلى فرع',
'modal.branchName': 'اسم الفرع',
'modal.branchFrom': 'من الفرع',
'modal.releaseTag': 'Tag',
'modal.releaseName': 'اسم الإصدار',
'modal.releaseNamePh': 'الإصدار 1.0.0',
'modal.releaseNotes': 'ملاحظات',
'modal.releaseNotesPh': 'ماذا تغيّر في هذا الإصدار؟',
'modal.prereleaseLabel': 'إصدار تجريبي',
'modal.draftLabel': 'مسودة',

      'guide.html':
        '<div class="guide-card"><div class="guide-card-head"><div class="guide-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><use href="#i-settings"/></svg></div><div class="guide-card-title">تبويب الإعداد</div></div><div class="guide-card-desc">أدخل التوكن → تحقق → سيتم تحميل كل مستودعاتك. اختر واحدًا للبدء.</div></div>' +
        '<div class="guide-card"><div class="guide-card-head"><div class="guide-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><use href="#i-upload"/></svg></div><div class="guide-card-title">تبويب الرفع</div></div><div class="guide-card-desc">اختر ملفات أو مجلد. حدد الكل بضغطة. اضغط «ابدأ الرفع» — 4 ملفات بالتوازي.</div></div>' +
        '<div class="guide-card"><div class="guide-card-head"><div class="guide-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><use href="#i-lightning"/></svg></div><div class="guide-card-title">تبويب التحكم</div></div><div class="guide-card-desc">تصفح شجرة الملفات. كل ملف: تعديل، نسخ، نقل، حذف. زر «توليد README» لتحليل المشروع.</div></div>' +
        '<div class="guide-card"><div class="guide-card-head"><div class="guide-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><use href="#i-bookmark"/></svg></div><div class="guide-card-title">تبويب المسودات</div></div><div class="guide-card-desc">احفظ ملفات محليًا قبل الرفع. استرجعها لاحقًا.</div></div>' +
        '<div class="guide-card"><div class="guide-card-head"><div class="guide-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><use href="#i-pr"/></svg></div><div class="guide-card-title">PRs / Issues / Releases</div></div><div class="guide-card-desc">إدارة كاملة من نفس الصفحة — إنشاء، دمج، إغلاق، تفاصيل.</div></div>' +
        '<div class="guide-card"><div class="guide-card-head"><div class="guide-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><use href="#i-trending-up"/></svg></div><div class="guide-card-title">تبويب الإحصائيات</div></div><div class="guide-card-desc">حجم المستودع، اللغات، آخر نشاط، إحصائيات محلية.</div></div>',

      'privacy.html':
        '<div class="policy-text">' +
          '<h4><svg class="ic"><use href="#i-shield"/></svg> لا نجمع بياناتك</h4>' +
          '<ul><li><strong>لا يوجد سيرفر.</strong> يعمل بالكامل في متصفحك.</li>' +
          '<li><strong>لا تحليلات.</strong> لا Google Analytics ولا تتبع خارجي.</li>' +
          '<li><strong>لا كوكيز تتبع.</strong> فقط <code>localStorage</code> لمتصفحك.</li></ul>' +
          '<h4><svg class="ic"><use href="#i-key"/></svg> التوكن</h4>' +
          '<ul><li>يبقى في <strong>ذاكرة المتصفح</strong> افتراضيًا.</li>' +
          '<li>لا يُرسل إلا إلى <code>api.github.com</code>.</li>' +
          '<li>عند "تذكرني" يُشفّر محليًا في <code>localStorage</code>.</li></ul>' +
          '<h4><svg class="ic"><use href="#i-package"/></svg> بيانات المستودع</h4>' +
          '<ul><li>كل شيء يذهب إلى GitHub مباشرة.</li>' +
          '<li>السجل المحلي يمكنك مسحه في أي وقت.</li></ul>' +
          '<h4><svg class="ic"><use href="#i-x-circle"/></svg> ما لا نفعله</h4>' +
          '<ul><li>لا نشارك بياناتك مع طرف ثالث.</li>' +
          '<li>لا إعلانات. لا تتبع. لا نسخ من مشاريعك.</li></ul>' +
        '</div>',

      'terms.html':
        '<div class="policy-text">' +
          '<h4><svg class="ic"><use href="#i-file-text"/></svg> الترخيص</h4>' +
          '<p>Orbit مفتوح المصدر تحت رخصة <strong>MIT</strong>.</p>' +
          '<h4><svg class="ic"><use href="#i-user"/></svg> مسؤولياتك</h4>' +
          '<ul><li>أنت المسؤول عن المحتوى المرفوع إلى GitHub.</li>' +
          '<li>أنت المسؤول عن سرية التوكن.</li>' +
          '<li>الالتزام بشروط GitHub.</li></ul>' +
          '<h4><svg class="ic"><use href="#i-alert"/></svg> حدود المسؤولية</h4>' +
          '<ul><li>البرنامج يُقدَّم <strong>"كما هو"</strong> بدون ضمانات.</li>' +
          '<li>لا نتحمل مسؤولية فقدان بيانات أو مشاكل المستودع.</li></ul>' +
          '<h4><svg class="ic"><use href="#i-clock"/></svg> التحديثات</h4>' +
          '<p>قد تُحدَّث الشروط مستقبلًا. آخر تحديث 2026.</p>' +
        '</div>',

      'faq.html':
        '<div class="faq-section-title"><svg class="ic"><use href="#i-settings"/></svg> الإعداد</div>' +
        '<div class="faq-item"><div class="faq-q">كيف أحصل على التوكن؟</div><div class="faq-a">اذهب إلى <strong>github.com/settings/tokens</strong> → <em>Generate new token</em> → اختر <code>repo</code> → انسخ والصق.</div></div>' +
        '<div class="faq-item"><div class="faq-q">لماذا لا أرى مستودعاتي؟</div><div class="faq-a">بعد التحقق، يتم جلب <strong>كل مستودعاتك</strong> تلقائيًا. اضغط «تحديث» إن لم تظهر.</div></div>' +
        '<div class="faq-section-title"><svg class="ic"><use href="#i-upload"/></svg> الرفع</div>' +
        '<div class="faq-item"><div class="faq-q">كيف أرفع مشروعًا كاملًا؟</div><div class="faq-a"><ul><li>اختر مستودعًا من الإعداد.</li><li>تبويب الرفع → «اختر مجلد».</li><li>اترك المسار النسبي فارغًا للجذر.</li><li>اضغط «ابدأ الرفع».</li></ul></div></div>' +
        '<div class="faq-item"><div class="faq-q">كيف أحدد عشرات الملفات بضغطة؟</div><div class="faq-a">في منتقي الملفات، اضغط <strong>تحديد الكل</strong> أو «Select All» → ثم «اختيار».</div></div>' +
        '<div class="faq-item"><div class="faq-q">ما هو "الرفع الذكي"؟</div><div class="faq-a">يحسب hash لكل ملف ويقارنه بالنسخة السحابية. الملفات المتطابقة تُتجاهل تلقائيًا.</div></div>' +
        '<div class="faq-section-title"><svg class="ic"><use href="#i-lightning"/></svg> التحكم</div>' +
        '<div class="faq-item"><div class="faq-q">ما الذي يقدمه قسم التحكم؟</div><div class="faq-a"><ul><li><strong>تصفح</strong> كل الملفات على شكل شجرة.</li><li><strong>تعديل</strong> أي ملف بمحرر بألوان.</li><li><strong>إنشاء، حذف، نسخ، نقل</strong> ملفات — بدون git.</li><li><strong>إنشاء فروع</strong> من نفس الصفحة.</li></ul></div></div>' +
        '<div class="faq-item"><div class="faq-q">كيف أنقل ملفًا لمجلد آخر؟</div><div class="faq-a">اضغط زر "نقل" على أي ملف → نافذة جديدة → تنقّل بين المجلدات → اضغط <strong>"إفلات هنا"</strong>.</div></div>' +
        '<div class="faq-section-title"><svg class="ic"><use href="#i-star"/></svg> ما يميز Orbit</div>' +
        '<div class="faq-item"><div class="faq-q">لماذا أستخدم Orbit بدلًا من موقع GitHub؟</div><div class="faq-a"><ul><li><strong>رفع مجلد كامل بضغطة</strong>.</li><li><strong>لا git، لا terminal</strong>.</li><li><strong>محرر مدمج</strong> بكل اللغات.</li><li><strong>نسخ/نقل ملفات وفولدرات</strong>.</li><li><strong>توليد README تلقائي</strong>.</li><li><strong>إشعارات Discord/Telegram</strong>.</li><li><strong>إحصائيات مفصلة</strong>.</li></ul></div></div>',

      'shortcuts.html':
        '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-subtle);font-size:12.5px"><span>فتح الإعدادات</span><kbd style="padding:2px 6px;border-radius:4px;background:var(--bg-elevated);border:1px solid var(--border-default);font-family:var(--mono);font-size:10.5px">Ctrl+K</kbd></div>' +
        '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-subtle);font-size:12.5px"><span>التبديل بين التبويبات</span><kbd style="padding:2px 6px;border-radius:4px;background:var(--bg-elevated);border:1px solid var(--border-default);font-family:var(--mono);font-size:10.5px">Alt+1-9</kbd></div>' +
        '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-subtle);font-size:12.5px"><span>حفظ في المحرر</span><kbd style="padding:2px 6px;border-radius:4px;background:var(--bg-elevated);border:1px solid var(--border-default);font-family:var(--mono);font-size:10.5px">Ctrl+S</kbd></div>' +
        '<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:12.5px"><span>إغلاق النوافذ</span><kbd style="padding:2px 6px;border-radius:4px;background:var(--bg-elevated);border:1px solid var(--border-default);font-family:var(--mono);font-size:10.5px">Esc</kbd></div>',

      'about.html':
        '<div class="policy-text">' +
          '<p><strong>Orbit v3.0.4</strong> — أداة رفع مشاريع إلى GitHub.</p>' +
          '<ul><li>ملف واحد · بدون سيرفر · بدون مكتبات.</li>' +
          '<li>مفتوح المصدر تحت رخصة <strong>MIT</strong>.</li>' +
          '<li>PWA-ready.</li></ul>' +
          '<p style="margin-top:10px"><strong>صُنع بواسطة Fix "Yousef"</strong></p>' +
        '</div>',
    },

    en: {
      'brand.tagline': '· Push your project to the cloud',
      'tab.setup': 'Setup', 'tab.upload': 'Upload', 'tab.remote': 'Control',
      'tab.drafts': 'Drafts', 'tab.pulls': 'PRs', 'tab.issues': 'Issues',
      'tab.releases': 'Releases', 'tab.stats': 'Stats', 'tab.logs': 'Logs',
      'badge.ready': 'Ready',
      'settings.title': 'Settings',

      'setup.title': 'Setup',
      'setup.desc': 'Configure your access token and select a repository.',
      'setup.tokenTitle': 'Access Token',
      'setup.verify': 'Verify',
      'setup.savedBanner': 'Saved token restored',
      'setup.flashInfo': 'Token stays in browser memory only — not stored unless you opt-in.',
      'setup.tokenLabel': 'GitHub Personal Access Token',
      'setup.tokenHint1': 'Create one at',
      'setup.tokenHint2': '— scope:',
      'setup.rememberTitle': 'Remember token for 30 days',
      'setup.rememberDesc': 'Token will be saved in browser storage. Enable only on trusted devices.',
      'setup.rememberWarnTitle': 'Security warning:',
      'setup.rememberWarnBody': 'Token will be saved in browser storage. Use a fine-grained token scoped to one repo.',
      'setup.reposTitle': 'Repositories',
      'setup.refresh': 'Refresh',
      'setup.newRepo': 'New repo',
      'setup.reposInfo': 'After verifying your token, all your repositories will be loaded automatically.',
      'setup.activeRepo': 'Active repository',
      'setup.notLoaded': 'Not loaded yet',
      'setup.visibility': 'Visibility (for new repos)',
      'setup.private': 'Private', 'setup.public': 'Public',
      'setup.commitMsg': 'Commit message',

      'upload.title': 'Upload Files',
      'upload.desc': 'Pick files or a folder — you can select all in one tap.',
      'upload.pickTitle': 'Pick Files',
      'upload.selectAll': 'Select all', 'upload.deselectAll': 'Deselect all',
      'upload.pickFiles': 'Pick files', 'upload.pickFolder': 'Pick folder',
      'upload.pathWarnTitle': 'Paths are relative to repo root.',
      'upload.pathWarnBody': 'Enter only the subfolder (e.g. css/).',
      'upload.keepRoot': 'Keep original folder name',
      'upload.pathPrefix': 'Relative path (optional)',
      'upload.pathPreview': 'Will upload to',
      'upload.emptyTitle': 'No files selected',
      'upload.emptyDesc': 'Click "Pick files" or "Pick folder" to start.',
      'upload.finalTitle': 'Final Upload',
      'upload.smartUpload': 'Smart upload — skip identical files (hash)',
      'upload.startUpload': 'Start upload',
      'upload.waiting': 'Waiting',
      'upload.done': 'Uploaded successfully',

      'remote.title': 'Repository Control',
      'remote.desc': 'Browse, edit, copy, move, and create files.',
      'remote.refreshAll': 'Refresh',
      'remote.branchesTitle': 'Branches',
      'remote.currentBranch': 'Current branch',
      'remote.newBranch': 'New branch',
      'remote.contentsTitle': 'Repository contents',
      'remote.load': 'Load', 'remote.newFile': 'New file',
      'remote.notLoadedTitle': 'Not loaded yet',
      'remote.notLoadedDesc': 'Pick a repo in Setup, then click Load.',

      'drafts.title': 'Drafts',
      'drafts.desc': 'Save your changes locally before uploading, then restore later.',
      'drafts.newDraft': 'New draft',
      'drafts.empty': 'No drafts',
      'drafts.emptyDesc': 'Click "New draft" to create one.',

      'pulls.title': 'Pull Requests',
      'pulls.desc': 'Create, review, merge, or close pull requests.',
      'pulls.open': 'Open', 'pulls.closed': 'Closed', 'pulls.all': 'All',
      'pulls.newPR': 'New PR',
      'pulls.emptyTitle': 'PRs not loaded',
      'pulls.emptyDesc': 'Click Load to fetch the list.',

      'issues.title': 'Issues',
      'issues.desc': 'Create and manage issues in the repository.',
      'issues.newIssue': 'New issue',
      'issues.emptyTitle': 'Issues not loaded',
      'issues.emptyDesc': 'Click Load to fetch the list.',

      'releases.title': 'Releases',
      'releases.desc': 'Create and manage releases.',
      'releases.newRelease': 'New release',
      'releases.emptyTitle': 'Releases not loaded',
      'releases.emptyDesc': 'Click Load to fetch the list.',

      'stats.title': 'Statistics',
      'stats.desc': 'Quick overview of the repository and activity.',
      'stats.repoTitle': 'Repository',
      'stats.localTitle': 'Local activity',
      'stats.noStats': 'No stats yet',
      'stats.noStatsDesc': 'Click Refresh to load statistics.',
      'stats.noActivity': 'No activity yet',
      'stats.noActivityDesc': 'Stats will appear here after upload or edit.',

      'logs.title': 'Session Logs',
      'logs.desc': 'Live view of all actions in this session.',
      'logs.download': 'Download', 'logs.clear': 'Clear',

      'editor.newFile': 'New file',
      'editor.cancel': 'Cancel',
      'editor.save': 'Commit changes',
      'editor.commitPlaceholder': 'Commit message',

      'drawer.theme': 'Theme (Light / Dark)',
      'drawer.dark': 'Dark', 'drawer.light': 'Light',
      'drawer.lang': 'Language',
      'drawer.webhook': 'Notifications (Webhook)',
      'drawer.webhookInfo': 'Send a notification to Discord or Telegram after each successful operation.',
      'drawer.webhookEnable': 'Enable notifications',
      'drawer.save': 'Save',
      'drawer.archive': 'History — all operations',
      'drawer.exportJson': 'Export JSON',
      'drawer.clearAll': 'Clear all',
      'drawer.guide': 'How to use Orbit',
      'drawer.privacy': 'Privacy Policy',
      'drawer.terms': 'Terms & Conditions',
      'drawer.faq': 'FAQ',
      'drawer.shortcuts': 'Keyboard shortcuts',
      'drawer.about': 'About',
      'drawer.close': 'Close',

      'common.close': 'Close', 'common.cancel': 'Cancel',
      'common.confirm': 'Confirm', 'common.create': 'Create',
      'common.delete': 'Delete', 'common.add': 'Add',

      'upload.pathPrefixPh': 'css/ (empty = root)',
'setup.commitMsgPh': 'Initial commit',
'drafts.nameLabel': 'Draft name',
'drafts.namePh': 'Draft 1',
'drafts.contentLabel': 'Content (JSON)',
'drafts.contentPh': '{"key": "value"}',
'modal.title': 'Title',
'modal.titlePh': 'Short title',
'modal.description': 'Description',
'modal.descriptionPh': 'Describe in detail…',
'modal.labels': 'Labels',
'modal.labelsPh': 'bug, enhancement',
'modal.headBranch': 'Head branch',
'modal.baseBranch': 'Base branch',
'modal.branchName': 'Branch name',
'modal.branchFrom': 'From branch',
'modal.releaseTag': 'Tag',
'modal.releaseName': 'Release name',
'modal.releaseNamePh': 'Release 1.0.0',
'modal.releaseNotes': 'Notes',
'modal.releaseNotesPh': 'What changed in this release?',
'modal.prereleaseLabel': 'Pre-release',
'modal.draftLabel': 'Draft',

      'guide.html':
        '<div class="guide-card"><div class="guide-card-head"><div class="guide-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><use href="#i-settings"/></svg></div><div class="guide-card-title">Setup Tab</div></div><div class="guide-card-desc">Enter your token → verify → all your repos load. Pick one to start.</div></div>' +
        '<div class="guide-card"><div class="guide-card-head"><div class="guide-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><use href="#i-upload"/></svg></div><div class="guide-card-title">Upload Tab</div></div><div class="guide-card-desc">Pick files or a folder. Select all in one tap. Click Start Upload — 4 files in parallel.</div></div>' +
        '<div class="guide-card"><div class="guide-card-head"><div class="guide-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><use href="#i-lightning"/></svg></div><div class="guide-card-title">Control Tab</div></div><div class="guide-card-desc">Browse the file tree. Each file: edit, copy, move, delete. Use "Generate README" to analyze the project.</div></div>' +
        '<div class="guide-card"><div class="guide-card-head"><div class="guide-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><use href="#i-bookmark"/></svg></div><div class="guide-card-title">Drafts Tab</div></div><div class="guide-card-desc">Save files locally before uploading. Restore them later.</div></div>' +
        '<div class="guide-card"><div class="guide-card-head"><div class="guide-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><use href="#i-pr"/></svg></div><div class="guide-card-title">PRs / Issues / Releases</div></div><div class="guide-card-desc">Full management from one page — create, merge, close, view details.</div></div>' +
        '<div class="guide-card"><div class="guide-card-head"><div class="guide-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><use href="#i-trending-up"/></svg></div><div class="guide-card-title">Stats Tab</div></div><div class="guide-card-desc">Repo size, languages, last activity, local stats.</div></div>',

      'privacy.html':
        '<div class="policy-text">' +
          '<h4><svg class="ic"><use href="#i-shield"/></svg> We don\'t collect your data</h4>' +
          '<ul><li><strong>No server.</strong> Everything runs in your browser.</li>' +
          '<li><strong>No analytics.</strong> No Google Analytics or external tracking.</li>' +
          '<li><strong>No tracking cookies.</strong> Only <code>localStorage</code> in your browser.</li></ul>' +
          '<h4><svg class="ic"><use href="#i-key"/></svg> The token</h4>' +
          '<ul><li>Stays in <strong>browser memory</strong> by default.</li>' +
          '<li>Only sent to <code>api.github.com</code>.</li>' +
          '<li>With "Remember me", it\'s encrypted locally in <code>localStorage</code>.</li></ul>' +
          '<h4><svg class="ic"><use href="#i-package"/></svg> Repository data</h4>' +
          '<ul><li>Everything goes directly to GitHub.</li>' +
          '<li>Local history can be cleared anytime.</li></ul>' +
          '<h4><svg class="ic"><use href="#i-x-circle"/></svg> What we don\'t do</h4>' +
          '<ul><li>No third-party data sharing.</li>' +
          '<li>No ads. No tracking. No copies of your projects.</li></ul>' +
        '</div>',

      'terms.html':
        '<div class="policy-text">' +
          '<h4><svg class="ic"><use href="#i-file-text"/></svg> License</h4>' +
          '<p>Orbit is open source under the <strong>MIT</strong> license.</p>' +
          '<h4><svg class="ic"><use href="#i-user"/></svg> Your responsibilities</h4>' +
          '<ul><li>You are responsible for content uploaded to GitHub.</li>' +
          '<li>You are responsible for keeping your token secret.</li>' +
          '<li>Comply with GitHub\'s terms of service.</li></ul>' +
          '<h4><svg class="ic"><use href="#i-alert"/></svg> Limitation of liability</h4>' +
          '<ul><li>The software is provided <strong>"as is"</strong> without warranties.</li>' +
          '<li>We are not liable for data loss or repository issues.</li></ul>' +
          '<h4><svg class="ic"><use href="#i-clock"/></svg> Updates</h4>' +
          '<p>Terms may be updated in the future. Last updated 2026.</p>' +
        '</div>',

      'faq.html':
        '<div class="faq-section-title"><svg class="ic"><use href="#i-settings"/></svg> Setup</div>' +
        '<div class="faq-item"><div class="faq-q">How do I get a token?</div><div class="faq-a">Go to <strong>github.com/settings/tokens</strong> → <em>Generate new token</em> → select <code>repo</code> → copy and paste.</div></div>' +
        '<div class="faq-item"><div class="faq-q">Why don\'t I see my repositories?</div><div class="faq-a">After verifying, <strong>all your repos</strong> are fetched automatically. Click "Refresh" if they don\'t appear.</div></div>' +
        '<div class="faq-section-title"><svg class="ic"><use href="#i-upload"/></svg> Upload</div>' +
        '<div class="faq-item"><div class="faq-q">How do I upload a whole project?</div><div class="faq-a"><ul><li>Pick a repo from Setup.</li><li>Upload tab → "Pick folder".</li><li>Leave the relative path empty for root.</li><li>Click "Start Upload".</li></ul></div></div>' +
        '<div class="faq-item"><div class="faq-q">How do I select dozens of files in one tap?</div><div class="faq-a">In the file picker, click <strong>Select All</strong> → then "Open".</div></div>' +
        '<div class="faq-item"><div class="faq-q">What is "Smart upload"?</div><div class="faq-a">It hashes each file and compares to the cloud version. Identical files are skipped automatically.</div></div>' +
        '<div class="faq-section-title"><svg class="ic"><use href="#i-lightning"/></svg> Control</div>' +
        '<div class="faq-item"><div class="faq-q">What does the Control tab offer?</div><div class="faq-a"><ul><li><strong>Browse</strong> all files as a tree.</li><li><strong>Edit</strong> any file with a colored editor.</li><li><strong>Create, delete, copy, move</strong> files — no git needed.</li><li><strong>Create branches</strong> from the same page.</li></ul></div></div>' +
        '<div class="faq-item"><div class="faq-q">How do I move a file to another folder?</div><div class="faq-a">Click the "Move" button on any file → a new window opens → navigate folders → click <strong>"Drop here"</strong>.</div></div>' +
        '<div class="faq-section-title"><svg class="ic"><use href="#i-star"/></svg> What makes Orbit special</div>' +
        '<div class="faq-item"><div class="faq-q">Why use Orbit instead of the GitHub website?</div><div class="faq-a"><ul><li><strong>Upload a whole folder in one tap</strong>.</li><li><strong>No git, no terminal</strong>.</li><li><strong>Built-in editor</strong> for all languages.</li><li><strong>Copy/move files and folders</strong>.</li><li><strong>Auto-generate README</strong>.</li><li><strong>Discord/Telegram notifications</strong>.</li><li><strong>Detailed statistics</strong>.</li></ul></div></div>',

      'shortcuts.html':
        '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-subtle);font-size:12.5px"><span>Open settings</span><kbd style="padding:2px 6px;border-radius:4px;background:var(--bg-elevated);border:1px solid var(--border-default);font-family:var(--mono);font-size:10.5px">Ctrl+K</kbd></div>' +
        '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-subtle);font-size:12.5px"><span>Switch tabs</span><kbd style="padding:2px 6px;border-radius:4px;background:var(--bg-elevated);border:1px solid var(--border-default);font-family:var(--mono);font-size:10.5px">Alt+1-9</kbd></div>' +
        '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-subtle);font-size:12.5px"><span>Save in editor</span><kbd style="padding:2px 6px;border-radius:4px;background:var(--bg-elevated);border:1px solid var(--border-default);font-family:var(--mono);font-size:10.5px">Ctrl+S</kbd></div>' +
        '<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:12.5px"><span>Close modals</span><kbd style="padding:2px 6px;border-radius:4px;background:var(--bg-elevated);border:1px solid var(--border-default);font-family:var(--mono);font-size:10.5px">Esc</kbd></div>',

      'about.html':
        '<div class="policy-text">' +
          '<p><strong>Orbit v3.0.4</strong> — GitHub project uploader.</p>' +
          '<ul><li>Single file · no server · no libraries.</li>' +
          '<li>Open source under the <strong>MIT</strong> license.</li>' +
          '<li>PWA-ready.</li></ul>' +
          '<p style="margin-top:10px"><strong>Made by Fix "Yousef"</strong></p>' +
        '</div>',
    },
  };

  /* ═══ Dynamic text keys used by JS ═══ */
  const DYN = {
    ar: {
      'log.noFiles': 'لم يُضف أي ملف',
      'log.filesAdded': 'أضيف {n} ملف',
      'log.filesAddedDup': ' ({n} مكرر)',
      'log.filesAddedSkip': ' ({n} مستثنى)',
      'log.pickerEmpty': 'لم يستقبل المنتقي أي ملفات',
      'log.selected': 'محدد',
      'log.file': 'ملف',
      'log.files': 'ملفات',
      'log.startingUpload': 'بدء الرفع…',
      'log.uploadComplete': 'اكتمل الرفع',
      'log.uploadFailed': 'فشل الرفع:',
      'log.loading': 'جاري التحميل…',
      'log.repo': 'المستودع',
      'log.loaded': 'تم تحميل',
      'log.loadFailed': 'فشل التحميل',
      'log.refreshingAll': 'تحديث كامل — repo + tree + branches',
      'log.deleting': 'جاري حذف:',
      'log.deleted': 'تم الحذف:',
      'log.deleteFailed': 'فشل الحذف:',
      'log.saveFailed': 'فشل الحفظ:',
      'log.saved': 'تم الحفظ:',
      'log.creatingFile': 'إنشاء ملف:',
      'log.editingFile': 'تعديل ملف:',
      'log.deleteFile': 'حذف ملف:',
      'log.creatingBranch': 'إنشاء فرع:',
      'log.branchCreated': 'تم إنشاء الفرع:',
      'log.branch': 'الفرع:',
      'log.readmeGenerating': 'بدء توليد README من تحليل المشروع…',
      'log.readmeDone': 'تم توليد README.md ورفعه',
      'log.readmeFailed': 'فشل توليد README:',
      'log.prsLoaded': 'تم تحميل {n} طلب',
      'log.issuesLoaded': 'تم تحميل {n} بلاغ',
      'log.releasesLoaded': 'تم تحميل {n} إصدار',
      'log.prCreated': 'تم إنشاء PR #{n}',
      'log.issueCreated': 'تم إنشاء بلاغ #{n}',
      'log.releaseCreated': 'تم إنشاء إصدار {tag}',
      'log.prMerged': 'تم دمج PR',
      'log.prClosed': 'تم إغلاق PR',
      'log.issueClosed': 'تم إغلاق البلاغ',
      'log.issueReopened': 'تم إعادة فتح البلاغ',
      'log.exported': 'تم تصدير السجل ({n} عملية).',
      'log.archiveCleared': 'تم مسح السجل بالكامل.',
      'log.opDeleted': 'تم حذف العملية من السجل.',
      'log.logsCleared': 'تم مسح السجل',

      'toast.pickRepo': 'اختر مستودعًا أولًا',
      'toast.pickRepoShort': 'اختر مستودعًا',
      'toast.noFiles': 'لم تختر ملفات',
      'toast.startingUpload': 'بدء رفع {n} ملف…',
      'toast.uploaded': 'تم رفع {n} ملف ({s} ث)',
      'toast.uploadFailed': 'فشل الرفع',
      'toast.allSelected': 'تم تحديد كل الملفات',
      'toast.refreshingAll': 'جاري تحديث الكل…',
      'toast.deleting': 'جاري الحذف…',
      'toast.deleted': 'تم حذف:',
      'toast.deleteFailed': 'فشل الحذف',
      'toast.saveFailed': 'فشل الحفظ',
      'toast.noContent': 'لا يوجد محتوى',
      'toast.saved': 'تم الحفظ',
      'toast.missingData': 'بيانات ناقصة',
      'toast.enterPath': 'أدخل المسار',
      'toast.editorFailed': 'فشل المحرر',
      'toast.themeChanged': 'تم تغيير المظهر',
      'toast.langChanged': 'تم التحويل للعربية',
      'toast.tokenCleared': 'تم المسح',
      'toast.tokenInvalid': 'التوكن غير صالح.',
      'toast.enterToken': 'أدخل التوكن أولًا',
      'toast.verifyFirst': 'تحقق من التوكن أولًا',
      'toast.reposLoaded': 'تم تحميل مستودعاتك',
      'toast.repoCreated': 'تم الإنشاء',
      'toast.writeName': 'اكتب الاسم',
      'toast.invalidName': 'اسم غير صالح',
      'toast.enterRepoName': 'اكتب اسم المستودع',
      'toast.prCreated': 'تم الإنشاء',
      'toast.writeTitle': 'اكتب العنوان',
      'toast.branchesMustDiffer': 'يجب أن يختلف الفرعان',
      'toast.writeTag': 'اكتب tag',
      'toast.writeDraftName': 'اكتب اسم المسودة',
      'toast.archiveEmpty': 'السجل فارغ',
      'toast.exported': 'تم التصدير',
      'toast.mergeFailed': 'فشل الدمج',
      'toast.merged': 'تم الدمج',
      'toast.closed': 'تم الإغلاق',
      'toast.reopened': 'تم إعادة الفتح',
      'toast.readmeGenerating': 'جاري تحليل المشروع…',
      'toast.readmeDone': 'تم توليد README.md',
      'toast.cleared': 'تم مسح السجل',
      'toast.logsCleared': 'تم مسح السجل',
      'toast.selectRepo': 'اختر مستودعًا',

      'confirm.deleteFile': 'حذف {path}؟',
      'confirm.clearArchive': 'مسح كل السجل؟',
      'confirm.mergePR': 'دمج PR #{n}؟',
      'confirm.closePR': 'إغلاق PR #{n}؟',
      'confirm.readme': 'توليد README.md من تحليل المشروع؟',

      'status.uploading': 'جاري الرفع…',
      'status.done': 'اكتمل',
      'status.ready': 'جاهز',
      'status.waiting': 'في الانتظار',
      'status.failed': 'فشل',

      'stats.files': 'ملفات:',
      'stats.folders': 'مجلدات:',
      'stats.selected': 'مختار:',
      'stats.size': 'الحجم:',
      'stats.ops': 'العمليات:',
      'stats.duration': 'المدة:',
      'stats.uploads': 'الرفع:',
      'stats.edits': 'التعديلات:',
      'stats.creates': 'الإنشاءات:',
      'stats.prs': 'PRs:',
      'stats.issues': 'البلاغات:',
      'stats.stars': 'النجوم:',
      'stats.forks': 'Forks:',
      'stats.lang': 'اللغة:',
      'stats.defaultBranch': 'الفرع:',
      'stats.updated': 'آخر تحديث:',
      'stats.visibility': 'الخصوصية:',
      'stats.owner': 'المالك:',
      'stats.private': 'خاص',
      'stats.public': 'عام',

      'ui.filesCount': '{n} ملف',
      'ui.dirsCount': '{n} مجلد',
      'ui.selectedCount': '{a}/{b}',
      'ui.noContent': 'لا يوجد محتوى',
      'ui.emptyFolder': 'مجلد فارغ',
      'ui.root': 'الجذر',
      'ui.copy': 'نسخ',
      'ui.move': 'نقل',
      'ui.copyHere': 'نسخ هنا',
      'ui.dropHere': 'إفلات هنا',
      'ui.copyFolder': 'نسخ الفولدر',
      'ui.moveFolder': 'نقل الفولدر',
      'ui.edit': 'تعديل',
      'ui.delete': 'حذف',
      'ui.alreadyHere': 'الملف بالفعل هنا',
      'ui.copied': 'تم النسخ',
      'ui.moved': 'تم النقل',
      'ui.copyFile': 'نسخ ملف',
      'ui.moveFile': 'نقل ملف',
      'ui.loading': 'جاري التحميل…',
      'ui.pickRepo': 'اختر مستودعًا',
      'ui.noRepos': 'لا مستودعات',
      'ui.pickTargetRepo': 'اختر المستودع الهدف',
      'ui.copyOp': 'نسخ',
      'ui.moveOp': 'نقل',

      'archive.op': 'عملية',
      'archive.uploadTitle': 'رفع {n} ملف ({size})',
      'archive.deleteTitle': 'حذف ملف: {name}',
      'archive.createTitle': 'إنشاء ملف: {name}',
      'archive.editTitle': 'تعديل ملف: {name}',
      'archive.readmeTitle': 'توليد README.md',
      'archive.branchTitle': 'إنشاء فرع: {name}',
      'archive.prTitle': 'إنشاء PR #{n}',
      'archive.issueTitle': 'إنشاء بلاغ #{n}',
      'archive.releaseTitle': 'إنشاء إصدار {tag}',
      'archive.noOps': 'لا توجد عمليات بعد',
      'archive.date': 'التاريخ',
      'archive.type': 'النوع',
      'archive.status': 'الحالة',
      'archive.repo': 'المستودع',
      'archive.branch': 'الفرع',
      'archive.duration': 'المدة',
      'archive.files': 'الملفات',
      'archive.ok': '✓ نجح',
      'archive.warn': '⚠ تحذير',
      'archive.err': '✕ فشل',
      'archive.more': '+{n} عملية أخرى',

      'drafts.emptyTitle': 'لا توجد مسودات',
      'drafts.draftLabel': 'مسودة:',
      'drafts.newDraft': 'مسودة جديدة',
      'drafts.nameLabel': 'اسم المسودة',

      'pr.detail.author': 'الكاتب',
      'pr.detail.status': 'الحالة',
      'pr.detail.head': 'من',
      'pr.detail.base': 'إلى',
      'pr.detail.created': 'تاريخ الإنشاء',
      'pr.detail.body': 'الوصف',
      'pr.detail.link': 'الرابط',
      'pr.state.open': 'مفتوح',
      'pr.state.closed': 'مغلق',
      'pr.state.merged': 'مدمج',
      'pr.merge': 'دمج',
      'pr.closePR': 'إغلاق الطلب',

      'issue.detail.author': 'الكاتب',
      'issue.detail.status': 'الحالة',
      'issue.detail.created': 'تاريخ الإنشاء',
      'issue.detail.labels': 'التصنيفات',
      'issue.detail.body': 'الوصف',
      'issue.detail.link': 'الرابط',
      'issue.close': 'إغلاق البلاغ',
      'issue.reopen': 'إعادة فتح',

      'release.state.draft': 'مسودة',
      'release.state.prerelease': 'تجريبي',
    },
    en: {
      'log.noFiles': 'No files added',
      'log.filesAdded': 'Added {n} file(s)',
      'log.filesAddedDup': ' ({n} dup)',
      'log.filesAddedSkip': ' ({n} skipped)',
      'log.pickerEmpty': 'Picker received no files',
      'log.selected': 'Selected',
      'log.file': 'file',
      'log.files': 'files',
      'log.startingUpload': 'starting upload…',
      'log.uploadComplete': 'Upload complete',
      'log.uploadFailed': 'Upload failed:',
      'log.loading': 'Loading…',
      'log.repo': 'Repo',
      'log.loaded': 'Loaded',
      'log.loadFailed': 'Load failed',
      'log.refreshingAll': 'Full refresh — repo + tree + branches',
      'log.deleting': 'Deleting:',
      'log.deleted': 'Deleted:',
      'log.deleteFailed': 'Delete failed:',
      'log.saveFailed': 'Save failed:',
      'log.saved': 'Saved:',
      'log.creatingFile': 'Create file:',
      'log.editingFile': 'Edit file:',
      'log.deleteFile': 'Delete file:',
      'log.creatingBranch': 'Create branch:',
      'log.branchCreated': 'Branch created:',
      'log.branch': 'Branch:',
      'log.readmeGenerating': 'Generating README from project analysis…',
      'log.readmeDone': 'README.md generated and pushed',
      'log.readmeFailed': 'README generation failed:',
      'log.prsLoaded': 'Loaded {n} PR(s)',
      'log.issuesLoaded': 'Loaded {n} issue(s)',
      'log.releasesLoaded': 'Loaded {n} release(s)',
      'log.prCreated': 'Created PR #{n}',
      'log.issueCreated': 'Created issue #{n}',
      'log.releaseCreated': 'Created release {tag}',
      'log.prMerged': 'PR merged',
      'log.prClosed': 'PR closed',
      'log.issueClosed': 'Issue closed',
      'log.issueReopened': 'Issue reopened',
      'log.exported': 'Archive exported ({n} operations).',
      'log.archiveCleared': 'Archive cleared.',
      'log.opDeleted': 'Operation deleted from archive.',
      'log.logsCleared': 'Logs cleared',

      'toast.pickRepo': 'Pick a repo first',
      'toast.pickRepoShort': 'Pick a repo',
      'toast.noFiles': 'No files selected',
      'toast.startingUpload': 'Starting upload of {n} file(s)…',
      'toast.uploaded': 'Uploaded {n} file(s) ({s}s)',
      'toast.uploadFailed': 'Upload failed',
      'toast.allSelected': 'Selected all files',
      'toast.refreshingAll': 'Refreshing all…',
      'toast.deleting': 'Deleting…',
      'toast.deleted': 'Deleted:',
      'toast.deleteFailed': 'Delete failed',
      'toast.saveFailed': 'Save failed',
      'toast.noContent': 'No content',
      'toast.saved': 'Saved',
      'toast.missingData': 'Missing data',
      'toast.enterPath': 'Enter path',
      'toast.editorFailed': 'Editor failed',
      'toast.themeChanged': 'Theme changed',
      'toast.langChanged': 'Switched to English',
      'toast.tokenCleared': 'Cleared',
      'toast.tokenInvalid': 'Invalid token.',
      'toast.enterToken': 'Enter token first',
      'toast.verifyFirst': 'Verify your token first',
      'toast.reposLoaded': 'Repositories loaded',
      'toast.repoCreated': 'Created',
      'toast.writeName': 'Enter a name',
      'toast.invalidName': 'Invalid name',
      'toast.enterRepoName': 'Enter repo name',
      'toast.prCreated': 'Created',
      'toast.writeTitle': 'Enter a title',
      'toast.branchesMustDiffer': 'Head and base must differ',
      'toast.writeTag': 'Enter a tag',
      'toast.writeDraftName': 'Enter draft name',
      'toast.archiveEmpty': 'Archive is empty',
      'toast.exported': 'Exported',
      'toast.mergeFailed': 'Merge failed',
      'toast.merged': 'Merged',
      'toast.closed': 'Closed',
      'toast.reopened': 'Reopened',
      'toast.readmeGenerating': 'Analyzing project…',
      'toast.readmeDone': 'README.md generated',
      'toast.cleared': 'Archive cleared',
      'toast.logsCleared': 'Logs cleared',
      'toast.selectRepo': 'Pick a repo',

      'confirm.deleteFile': 'Delete {path}?',
      'confirm.clearArchive': 'Clear the entire archive?',
      'confirm.mergePR': 'Merge PR #{n}?',
      'confirm.closePR': 'Close PR #{n}?',
      'confirm.readme': 'Generate README.md from project analysis?',

      'status.uploading': 'Uploading…',
      'status.done': 'Done',
      'status.ready': 'Ready',
      'status.waiting': 'Waiting',
      'status.failed': 'Failed',

      'stats.files': 'Files:',
      'stats.folders': 'Folders:',
      'stats.selected': 'Selected:',
      'stats.size': 'Size:',
      'stats.ops': 'Operations:',
      'stats.duration': 'Duration:',
      'stats.uploads': 'Uploads:',
      'stats.edits': 'Edits:',
      'stats.creates': 'Creates:',
      'stats.prs': 'PRs:',
      'stats.issues': 'Issues:',
      'stats.stars': 'Stars:',
      'stats.forks': 'Forks:',
      'stats.lang': 'Language:',
      'stats.defaultBranch': 'Branch:',
      'stats.updated': 'Updated:',
      'stats.visibility': 'Visibility:',
      'stats.owner': 'Owner:',
      'stats.private': 'Private',
      'stats.public': 'Public',

      'ui.filesCount': '{n} file(s)',
      'ui.dirsCount': '{n} folder(s)',
      'ui.selectedCount': '{a}/{b}',
      'ui.noContent': 'No content',
      'ui.emptyFolder': 'Empty folder',
      'ui.root': 'Root',
      'ui.copy': 'Copy',
      'ui.move': 'Move',
      'ui.copyHere': 'Copy here',
      'ui.dropHere': 'Drop here',
      'ui.copyFolder': 'Copy folder',
      'ui.moveFolder': 'Move folder',
      'ui.edit': 'Edit',
      'ui.delete': 'Delete',
      'ui.alreadyHere': 'File already here',
      'ui.copied': 'Copied',
      'ui.moved': 'Moved',
      'ui.copyFile': 'Copy file',
      'ui.moveFile': 'Move file',
      'ui.loading': 'Loading…',
      'ui.pickRepo': 'Pick a repo',
      'ui.noRepos': 'No repositories',
      'ui.pickTargetRepo': 'Pick target repository',
      'ui.copyOp': 'Copy',
      'ui.moveOp': 'Move',

      'archive.op': 'Operation',
      'archive.uploadTitle': 'Upload {n} file(s) ({size})',
      'archive.deleteTitle': 'Delete file: {name}',
      'archive.createTitle': 'Create file: {name}',
      'archive.editTitle': 'Edit file: {name}',
      'archive.readmeTitle': 'Generate README.md',
      'archive.branchTitle': 'Create branch: {name}',
      'archive.prTitle': 'Create PR #{n}',
      'archive.issueTitle': 'Create issue #{n}',
      'archive.releaseTitle': 'Create release {tag}',
      'archive.noOps': 'No operations yet',
      'archive.date': 'Date',
      'archive.type': 'Type',
      'archive.status': 'Status',
      'archive.repo': 'Repository',
      'archive.branch': 'Branch',
      'archive.duration': 'Duration',
      'archive.files': 'Files',
      'archive.ok': '✓ Success',
      'archive.warn': '⚠ Warning',
      'archive.err': '✕ Failed',
      'archive.more': '+{n} more operation(s)',

      'drafts.emptyTitle': 'No drafts',
      'drafts.draftLabel': 'Draft:',
      'drafts.newDraft': 'New draft',
      'drafts.nameLabel': 'Draft name',

      'pr.detail.author': 'Author',
      'pr.detail.status': 'Status',
      'pr.detail.head': 'Head',
      'pr.detail.base': 'Base',
      'pr.detail.created': 'Created',
      'pr.detail.body': 'Description',
      'pr.detail.link': 'Link',
      'pr.state.open': 'Open',
      'pr.state.closed': 'Closed',
      'pr.state.merged': 'Merged',
      'pr.merge': 'Merge',
      'pr.closePR': 'Close PR',

      'issue.detail.author': 'Author',
      'issue.detail.status': 'Status',
      'issue.detail.created': 'Created',
      'issue.detail.labels': 'Labels',
      'issue.detail.body': 'Description',
      'issue.detail.link': 'Link',
      'issue.close': 'Close issue',
      'issue.reopen': 'Reopen',

      'release.state.draft': 'Draft',
      'release.state.prerelease': 'Pre-release',
    },
  };

  let currentLang = 'ar';

  function t(key) {
    return (I18N[currentLang] && I18N[currentLang][key]) || key;
  }

  function tr(arText, enText) {
    return currentLang === 'en' ? enText : arText;
  }

  function trp(key, vars) {
    var dict = DYN[currentLang] || DYN.ar;
    var tpl = dict[key] || key;
    return tpl.replace(/\{(\w+)\}/g, function (_, k) {
      return (vars && vars[k] != null) ? vars[k] : '';
    });
  }

  function isEn() { return currentLang === 'en'; }

  function applyLang(lang) {
    if (!I18N[lang]) return;
    currentLang = lang;

    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      const val = t(key);
      if (val && val !== key) el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.dataset.i18nHtml;
      const val = t(key);
      if (val && val !== key) el.innerHTML = val;
    });

    document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
      const key = el.dataset.i18nPh;
      const val = t(key);
      if (val && val !== key) el.setAttribute('placeholder', val);
    });

    document.querySelectorAll('[data-lang-choice]').forEach((b) => {
      b.classList.toggle('active', b.dataset.langChoice === lang);
    });

    try { localStorage.setItem('orbit_lang_v3', lang); } catch (e) {}
  }

  function getLang() { return currentLang; }

  window.Orbit = window.Orbit || {};
  window.Orbit.i18n = { t, tr, trp, isEn, applyLang, getLang, dict: I18N, dyn: DYN };
})();