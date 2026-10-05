تمام، هذا ملف README.md كامل — عربي بالكامل، بدون إيموجي، مع مخططات ملوّنة تفاعلية.

انسخه في ملف جديد اسمه README-ARCH.md في المشروع.

---

```markdown
# مخطط مشروع صندوق الأكواد

> شرح بصري كامل لبنية المشروع، الطبقات، تدفّق البيانات، ونقاط الأمان.
> كل الرسوم البيانية مرسومة بألوان تفاعلية وتظهر تلقائياً على منصة الاستضافة.

---

## الفهرس

1. النظرة العامة
2. الطبقات الأربع
3. رحلة الطلب الواحد
4. قاعدة البيانات
5. رحلة التسجيل والدخول
6. طبقات الحماية
7. متغيّرات البيئة
8. الملفات التي لا تُشارَك
9. قائمة المراجعة النهائية
```
---

## 1. النظرة العامة

المشروع يتكوّن من أربع كتل رئيسية:

- الواجهة الأمامية : كل ما يراه الزائر في المتصفّح
- الخدمة الخلفية : العقل الذي يعالج الطلبات
- قاعدة البيانات : مستودع خاص يستضيفه موقع الاستضافة
- الخدمات الخارجية : تخزين الصور وإرسال البريد الإلكتروني

```mermaid
graph TB
    A["المتصفّح<br/>الواجهة الأمامية"]
    B["الخدمة الخلفية<br/>على منصة الاستضافة"]
    C["قاعدة البيانات<br/>مستودع خاص"]
    D["خدمة الصور"]
    E["خدمة البريد"]

    A -->|"طلبات المحتوى"| B
    B -->|"قراءة وكتابة"| C
    B -->|"رفع وحذف"| D
    B -->|"إرسال رسائل"| E

    style A fill:#1e3a8a,stroke:#3b82f6,stroke-width:3px,color:#ffffff
    style B fill:#7c2d12,stroke:#ea580c,stroke-width:3px,color:#ffffff
    style C fill:#14532d,stroke:#22c55e,stroke-width:3px,color:#ffffff
    style D fill:#581c87,stroke:#a855f7,stroke-width:3px,color:#ffffff
    style E fill:#7f1d1d,stroke:#ef4444,stroke-width:3px,color:#ffffff
```

---

2. الطبقات الأربع

الخدمة الخلفية مقسّمة إلى أربع طبقات، كل طبقة لها مسؤولية واحدة فقط:

```mermaid
graph LR
    R["الموجّه<br/>يستقبل الطلبات"]
    M["الطبقات الوسطى<br/>تحمي وتتحقق"]
    H["المعالجات<br/>تنفّذ المنطق"]
    S["الخدمات<br/>تتصل بالخارج"]
    C["النواة<br/>الإعدادات والأدوات"]

    R --> M
    M --> H
    H --> S
    H --> C
    S --> C

    style R fill:#0c4a6e,stroke:#0ea5e9,stroke-width:3px,color:#ffffff
    style M fill:#701a75,stroke:#d946ef,stroke-width:3px,color:#ffffff
    style H fill:#7c2d12,stroke:#f97316,stroke-width:3px,color:#ffffff
    style S fill:#14532d,stroke:#22c55e,stroke-width:3px,color:#ffffff
    style C fill:#1e293b,stroke:#64748b,stroke-width:3px,color:#ffffff
```

شرح الطبقات

الموجّه : نقطة الدخول الوحيدة، يستقبل كل الطلبات ويعرف إلى أي معالج يوجّهها.

الطبقات الوسطى : ثلاث طبقات تعمل قبل المعالج:

· المصادقة : تتحقق من هوية صاحب الطلب
· الأخطاء : توحّد شكل كل الأخطاء
· حد الطلبات : تمنع الإغراق

المعالجات : سبع مجموعات، كل مجموعة تتعامل مع نطاق محدد:

```mermaid
graph TD
    H["المعالجات"]
    H1["المصادقة"]
    H2["المستخدمون"]
    H3["القوالب"]
    H4["التعليقات"]
    H5["الرفع"]
    H6["الإعدادات"]
    
    H --> H1
    H --> H2
    H --> H3
    H --> H4
    H --> H5
    H --> H6

    style H fill:#7c2d12,stroke:#f97316,stroke-width:3px,color:#ffffff
    style H1 fill:#7f1d1d,stroke:#ef4444,color:#ffffff
    style H2 fill:#7f1d1d,stroke:#ef4444,color:#ffffff
    style H3 fill:#7f1d1d,stroke:#ef4444,color:#ffffff
    style H4 fill:#7f1d1d,stroke:#ef4444,color:#ffffff
    style H5 fill:#7f1d1d,stroke:#ef4444,color:#ffffff
    style H6 fill:#7f1d1d,stroke:#ef4444,color:#ffffff
```

الخدمات : ثلاث خدمات خارجية، كل واحدة تتصل بجهة مستقلة.

النواة : إعدادات وأدوات مشتركة يستخدمها كل شيء.

---

3. رحلة الطلب الواحد

هذه رحلة أي طلب من لحظة ضغط المستخدم حتى وصول الرد:

```mermaid
sequenceDiagram
    participant الزائر
    participant المتصفّح
    participant الموجّه
    participant الحماية
    participant المعالج
    participant القاعدة

    الزائر->>المتصفّح: يضغط زراً
    المتصفّح->>الموجّه: يرسل الطلب
    الموجّه->>الحماية: يمرّر الطلب
    الحماية->>الحماية: التحقق من الهوية
    الحماية->>الحماية: فحص حد الطلبات
    الحماية->>المعالج: يمرّر الطلب
    المعالج->>القاعدة: يقرأ أو يكتب
    القاعدة-->>المعالج: البيانات
    المعالج-->>المتصفّح: الرد
    المتصفّح-->>الزائر: يعرض النتيجة
```

التوقيتات التقريبية لكل خطوة:

الخطوة الزمن التقريبي
الاتصال بالشبكة 20 إلى 80 مللي ثانية
فحص الحماية أقل من 5 مللي ثانية
قراءة من القاعدة 200 إلى 800 مللي ثانية
كتابة في القاعدة 400 إلى 1500 مللي ثانية
الرد الكامل 300 إلى 2000 مللي ثانية

القراءة والكتابة من القاعدة هي الأبطأ لأنهما تمرّان عبر خدمة خارجية.

---

4. قاعدة البيانات

قاعدة البيانات هي مستودع خاص على منصة الاستضافة. داخله مجلدات منظّمة:

```mermaid
graph TD
    Root["المستودع الخاص"]
    U["مجلد المستخدمين"]
    P["مجلد القوالب"]
    C["مجلد التعليقات"]
    M["ملف الفهرس"]

    Root --> U
    Root --> P
    Root --> C
    Root --> M

    U --> U1["ملف المستخدم الأول"]
    U --> U2["ملف المستخدم الثاني"]
    U --> U3["وهكذا"]

    P --> P1["قالب بصيغة صفحة"]
    P --> P2["قالب بصيغة أجزاء"]
    P --> P3["وهكذا"]

    C --> C1["تعليقات القالب الأول"]
    C --> C2["تعليقات القالب الثاني"]

    M --> M1["قائمة بكل القوالب"]

    style Root fill:#14532d,stroke:#22c55e,stroke-width:4px,color:#ffffff
    style U fill:#1e3a8a,stroke:#3b82f6,stroke-width:3px,color:#ffffff
    style P fill:#7c2d12,stroke:#f97316,stroke-width:3px,color:#ffffff
    style C fill:#581c87,stroke:#a855f7,stroke-width:3px,color:#ffffff
    style M fill:#0c4a6e,stroke:#0ea5e9,stroke-width:3px,color:#ffffff
```

شكل ملف المستخدم

كل ملف مستخدم يحتوي على ثلاثة أقسام:

```mermaid
graph LR
    F["ملف المستخدم"]
    S1["قسم الحساب"]
    S2["قسم الملف الشخصي"]
    S3["قسم الإعدادات"]

    F --> S1
    F --> S2
    F --> S3

    S1 --> A1["البريد"]
    S1 --> A2["كلمة المرور المشفّرة"]
    S1 --> A3["المعرّف الفريد"]
    S1 --> A4["رمز الجلسة"]

    S2 --> B1["الاسم الكامل"]
    S2 --> B2["اسم المستخدم"]
    S2 --> B3["قائمة المتابعين"]
    S2 --> B4["قائمة المتابَعين"]

    S3 --> C1["المظهر"]
    S3 --> C2["الإشعارات"]
    S3 --> C3["الخصوصية"]

    style F fill:#1e293b,stroke:#64748b,stroke-width:3px,color:#ffffff
    style S1 fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#ffffff
    style S2 fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#ffffff
    style S3 fill:#581c87,stroke:#a855f7,stroke-width:2px,color:#ffffff
```

شكل المعرّف الفريد

كل مستخدم يحصل على معرّف من ثلاثة عشر رقماً يبدأ بالرقم سبعة.

· الطول : ثلاثة عشر رقماً بالضبط
· البداية : الرقم سبعة دائماً
· التوليد : عشوائي آمناً
· الاستخدام : داخلي فقط، لا يراه المستخدم
· الغرض : استحالة تخمينه

---

5. رحلة التسجيل والدخول

رحلة التسجيل

```mermaid
flowchart TD
    Start["المستخدم يملأ الاستمارة"]
    Check["فحص صحة البيانات"]
    Hash["تشفير كلمة المرور"]
    GenId["توليد المعرّف الفريد"]
    GenCode["توليد رمز التحقق"]
    Save["حفظ في القاعدة"]
    Send["إرسال الرمز بالبريد"]
    Wait["انتظار المستخدم"]
    Verify["التحقق من الرمز"]
    Done["إنشاء جلسة"]

    Start --> Check
    Check --> Hash
    Hash --> GenId
    GenId --> GenCode
    GenCode --> Save
    Save --> Send
    Send --> Wait
    Wait --> Verify
    Verify --> Done

    style Start fill:#1e3a8a,stroke:#3b82f6,stroke-width:3px,color:#ffffff
    style Check fill:#7c2d12,stroke:#f97316,stroke-width:3px,color:#ffffff
    style Hash fill:#7f1d1d,stroke:#ef4444,stroke-width:3px,color:#ffffff
    style GenId fill:#581c87,stroke:#a855f7,stroke-width:3px,color:#ffffff
    style GenCode fill:#581c87,stroke:#a855f7,stroke-width:3px,color:#ffffff
    style Save fill:#14532d,stroke:#22c55e,stroke-width:3px,color:#ffffff
    style Send fill:#0c4a6e,stroke:#0ea5e9,stroke-width:3px,color:#ffffff
    style Wait fill:#1e293b,stroke:#64748b,stroke-width:3px,color:#ffffff
    style Verify fill:#7c2d12,stroke:#f97316,stroke-width:3px,color:#ffffff
    style Done fill:#14532d,stroke:#22c55e,stroke-width:4px,color:#ffffff
```

خصائص رمز التحقق:

· الطول : ستة أرقام
· مدة الصلاحية : عشر دقائق
· عدد المحاولات : خمس فقط
· الاستخدام : مرة واحدة فقط

رحلة الدخول

```mermaid
flowchart LR
    A["إدخال البريد وكلمة المرور"]
    B["البحث عن المستخدم"]
    C["مقارنة كلمة المرور"]
    D["إنشاء رمز الجلسة"]
    E["حفظ الكعكة"]
    F["الدخول"]

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F

    style A fill:#1e3a8a,stroke:#3b82f6,stroke-width:3px,color:#ffffff
    style B fill:#7c2d12,stroke:#f97316,stroke-width:3px,color:#ffffff
    style C fill:#7f1d1d,stroke:#ef4444,stroke-width:3px,color:#ffffff
    style D fill:#581c87,stroke:#a855f7,stroke-width:3px,color:#ffffff
    style E fill:#14532d,stroke:#22c55e,stroke-width:3px,color:#ffffff
    style F fill:#0c4a6e,stroke:#0ea5e9,stroke-width:4px,color:#ffffff
```

رمز الجلسة

· النوع : رمز موقّع رقمياً
· المدة : ثلاثون يوماً
· التخزين : كعكة محمية + ذاكرة المتصفّح
· ميزة إضافية : رقم إصدار يتغيّر عند تسجيل الخروج من كل الأجهزة

---

6. طبقات الحماية

المشروع يستخدم عشر طبقات حماية متتالية، كل طبقة تصدّ نوعاً من الهجمات:

```mermaid
graph TD
    L1["الطبقة الأولى<br/>تشفير كلمة المرور"]
    L2["الطبقة الثانية<br/>رمز الجلسة الموقّع"]
    L3["الطبقة الثالثة<br/>رقم إصدار الجلسة"]
    L4["الطبقة الرابعة<br/>الكعكة المحمية"]
    L5["الطبقة الخامسة<br/>حد الطلبات"]
    L6["الطبقة السادسة<br/>قائمة المصادر المسموحة"]
    L7["الطبقة السابعة<br/>المعرّف غير القابل للتخمين"]
    L8["الطبقة الثامنة<br/>رمز التحقق بالبريد"]
    L9["الطبقة التاسعة<br/>رسائل الأخطاء العامة"]
    L10["الطبقة العاشرة<br/>تنظيف المدخلات"]

    L1 --> L2 --> L3 --> L4 --> L5
    L5 --> L6 --> L7 --> L8 --> L9 --> L10

    style L1 fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#ffffff
    style L2 fill:#7c2d12,stroke:#f97316,stroke-width:2px,color:#ffffff
    style L3 fill:#78350f,stroke:#eab308,stroke-width:2px,color:#ffffff
    style L4 fill:#14532d,stroke:#22c55e,stroke-width:2px,color:#ffffff
    style L5 fill:#0c4a6e,stroke:#0ea5e9,stroke-width:2px,color:#ffffff
    style L6 fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#ffffff
    style L7 fill:#581c87,stroke:#a855f7,stroke-width:2px,color:#ffffff
    style L8 fill:#701a75,stroke:#d946ef,stroke-width:2px,color:#ffffff
    style L9 fill:#831843,stroke:#ec4899,stroke-width:2px,color:#ffffff
    style L10 fill:#1e293b,stroke:#64748b,stroke-width:2px,color:#ffffff
```

شرح كل طبقة

الطبقة الوظيفة الهدف
الأولى تحويل كلمة المرور إلى رمز غير قابل للعكس حتى لو تسرّبت القاعدة، الكلمات محمية
الثانية توقيع رقمي للمعلومات منع التلاعب ببيانات الجلسة
الثالثة رقم يتغيّر عند الحاجة إبطال كل الأجهزة فوراً
الرابعة كعكة لا يقرأها الجافاسكربت حماية من سرقة الجلسة
الخامسة عدّاد طلبات لكل زائر منع الإغراق والتخريب
السادسة قائمة بعناوين مسموحة منع المواقع الخارجية
السابعة معرّف عشوائي طويل استحالة تخمين بيانات الغير
الثامنة رمز يصل للبريد فقط تأكيد ملكية البريد
التاسعة رسائل غامضة لا تكشف شيئاً عن النظام
العاشرة تنقية النصوص المدخلة منع حقن الأكواد الخبيثة

---

7. متغيّرات البيئة

المشروع يحتاج مجموعة من الإعدادات، تُخزَّن خارج الكود في ملف خاص اسمه .env.

هذا الملف لا يُشارَك أبداً. بدلاً منه، يُشارَك ملف نموذج باسم .env.example يحتوي على أسماء المتغيّرات بدون قيمها الحقيقية.

تصنيف المتغيّرات

```mermaid
graph TD
    Env["الإعدادات"]
    Sec["إعدادات الأمان"]
    Db["إعدادات القاعدة"]
    Img["إعدادات الصور"]
    Mail["إعدادات البريد"]
    App["إعدادات التطبيق"]

    Env --> Sec
    Env --> Db
    Env --> Img
    Env --> Mail
    Env --> App

    style Env fill:#1e293b,stroke:#64748b,stroke-width:4px,color:#ffffff
    style Sec fill:#7f1d1d,stroke:#ef4444,stroke-width:3px,color:#ffffff
    style Db fill:#14532d,stroke:#22c55e,stroke-width:3px,color:#ffffff
    style Img fill:#581c87,stroke:#a855f7,stroke-width:3px,color:#ffffff
    style Mail fill:#0c4a6e,stroke:#0ea5e9,stroke-width:3px,color:#ffffff
    style App fill:#78350f,stroke:#eab308,stroke-width:3px,color:#ffffff
```

جدول المتغيّرات الكامل

التصنيف اسم المتغيّر القيمة الافتراضية حساس؟
الأمان مفتاح التوقيع يجب تغييره نعم جداً
الأمان بريد المدير فارغ نعم
الأمان المصادر المسموحة فارغ نعم
الأمان حد الطلبات ستون لا
القاعدة اسم المالك فارغ نعم
القاعدة اسم المستودع فارغ نعم
القاعدة الفرع الرئيسي لا
القاعدة رمز الوصول فارغ نعم جداً
القاعدة مسار البيانات مسار المستخدمين لا
الصور مفتاح الخدمة فارغ نعم
الصور رابط الرفع رابط ثابت لا
البريد الخادم خادم البريد لا
البريد المنفذ أربعمائة وخمسة وستون لا
البريد الاتصال الآمن مفعّل لا
البريد البريد المرسل فارغ نعم
البريد كلمة مرور التطبيق فارغة نعم جداً
التطبيق رابط الموقع فارغ لا
التطبيق بيئة التشغيل إنتاج لا
التطبيق مدة الذاكرة المؤقتة ثلاثون دقيقة لا

---

8. الملفات التي لا تُشارَك

قبل مشاركة المشروع مع أي شخص، تأكد من استثناء هذه الملفات والمجلدات:

```mermaid
graph TD
    No["لا تُشارَك أبداً"]
    F1["ملف الإعدادات الحقيقية"]
    F2["مجلد إعدادات الاستضافة"]
    F3["مجلد المكتبات"]
    F4["ملفات السجلات"]
    F5["مجلدات بيئة العمل"]

    No --> F1
    No --> F2
    No --> F3
    No --> F4
    No --> F5

    style No fill:#7f1d1d,stroke:#ef4444,stroke-width:4px,color:#ffffff
    style F1 fill:#7c2d12,stroke:#f97316,stroke-width:3px,color:#ffffff
    style F2 fill:#7c2d12,stroke:#f97316,stroke-width:3px,color:#ffffff
    style F3 fill:#7c2d12,stroke:#f97316,stroke-width:3px,color:#ffffff
    style F4 fill:#7c2d12,stroke:#f97316,stroke-width:3px,color:#ffffff
    style F5 fill:#7c2d12,stroke:#f97316,stroke-width:3px,color:#ffffff
```

الملفات الآمنة للمشاركة

```mermaid
graph TD
    Yes["آمن للمشاركة"]
    Y1["ملف المكتبات"]
    Y2["ملف الوصف"]
    Y3["ملف الاستضافة"]
    Y4["مجلد الخدمة الخلفية"]
    Y5["مجلد المصدر"]
    Y6["ملفات الصفحات"]
    Y7["ملف الأنماط"]
    Y8["مجلد البرمجة"]
    Y9["ملف التجاهل"]
    Y10["ملف النموذج"]

    Yes --> Y1
    Yes --> Y2
    Yes --> Y3
    Yes --> Y4
    Yes --> Y5
    Yes --> Y6
    Yes --> Y7
    Yes --> Y8
    Yes --> Y9
    Yes --> Y10

    style Yes fill:#14532d,stroke:#22c55e,stroke-width:4px,color:#ffffff
    style Y1 fill:#166534,stroke:#4ade80,stroke-width:2px,color:#ffffff
    style Y2 fill:#166534,stroke:#4ade80,stroke-width:2px,color:#ffffff
    style Y3 fill:#166534,stroke:#4ade80,stroke-width:2px,color:#ffffff
    style Y4 fill:#166534,stroke:#4ade80,stroke-width:2px,color:#ffffff
    style Y5 fill:#166534,stroke:#4ade80,stroke-width:2px,color:#ffffff
    style Y6 fill:#166534,stroke:#4ade80,stroke-width:2px,color:#ffffff
    style Y7 fill:#166534,stroke:#4ade80,stroke-width:2px,color:#ffffff
    style Y8 fill:#166534,stroke:#4ade80,stroke-width:2px,color:#ffffff
    style Y9 fill:#166534,stroke:#4ade80,stroke-width:2px,color:#ffffff
    style Y10 fill:#166534,stroke:#4ade80,stroke-width:2px,color:#ffffff
```

---

9. قائمة المراجعة النهائية

قبل مشاركة المشروع، اتبع هذه القائمة بالترتيب:

```mermaid
flowchart TD
    S["ابدأ المراجعة"]
    C1["تأكد من عدم وجود ملف الإعدادات"]
    C2["ابحث عن أي كلمات سرية في الكود"]
    C3["تأكد من أن المستودع خاص"]
    C4["غيّر مفتاح التوقيع"]
    C5["تأكد من كلمة مرور التطبيق"]
    C6["راجع صلاحيات رمز الوصول"]
    C7["احذف رسائل الطباعة الحساسة"]
    C8["شغّل فحص المكتبات"]
    C9["راجع قائمة المصادر"]
    C10["جرب التسجيل بإيميل وهمي"]
    E["جاهز للمشاركة"]

    S --> C1 --> C2 --> C3 --> C4 --> C5
    C5 --> C6 --> C7 --> C8 --> C9 --> C10 --> E

    style S fill:#1e3a8a,stroke:#3b82f6,stroke-width:3px,color:#ffffff
    style C1 fill:#7c2d12,stroke:#f97316,stroke-width:2px,color:#ffffff
    style C2 fill:#7c2d12,stroke:#f97316,stroke-width:2px,color:#ffffff
    style C3 fill:#7c2d12,stroke:#f97316,stroke-width:2px,color:#ffffff
    style C4 fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#ffffff
    style C5 fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#ffffff
    style C6 fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#ffffff
    style C7 fill:#78350f,stroke:#eab308,stroke-width:2px,color:#ffffff
    style C8 fill:#78350f,stroke:#eab308,stroke-width:2px,color:#ffffff
    style C9 fill:#0c4a6e,stroke:#0ea5e9,stroke-width:2px,color:#ffffff
    style C10 fill:#581c87,stroke:#a855f7,stroke-width:2px,color:#ffffff
    style E fill:#14532d,stroke:#22c55e,stroke-width:4px,color:#ffffff
```

تفاصيل كل خطوة

الخطوة الأولى : تأكد من عدم وجود ملف الإعدادات الحقيقية في المشروع.

الخطوة الثانية : ابحث عن أي كلمات قد تكون سرية: رموز الوصول، كلمات المرور، عناوين البريد.

الخطوة الثالثة : تأكد من أن مستودع البيانات خاص وغير عام.

الخطوة الرابعة : غيّر مفتاح توقيع الجلسة إلى قيمة عشوائية طويلة.

الخطوة الخامسة : تأكد من استخدام كلمة مرور التطبيق وليس كلمة مرور الحساب الأصلية.

الخطوة السادسة : راجع صلاحيات رمز الوصول، يجب أن تكون محدودة بأقل قدر ممكن.

الخطوة السابعة : احذف أي رسائل طباعة تحتوي على معلومات حساسة.

الخطوة الثامنة : شغّل فحص المكتبات للتحقق من عدم وجود ثغرات معروفة.

الخطوة التاسعة : راجع قائمة المصادر المسموحة، واجعلها محدّدة بدقة.

الخطوة العاشرة : جرّب عملية تسجيل كاملة بإيميل وهمي للتأكد من سلامة كل شيء.

---

بيانات إضافية

حالة المشروع

```mermaid
pie showData
    title توزيع ملفات المشروع
    "واجهات المستخدم" : 14
    "ملفات البرمجة" : 5
    "خدمات الخلفية" : 12
    "ملفات الأنماط" : 1
```

مستويات الخطورة

```mermaid
graph LR
    A["آمن"] --> B["متوسط"] --> C["حساس"] --> D["خطر"]

    style A fill:#14532d,stroke:#22c55e,stroke-width:3px,color:#ffffff
    style B fill:#78350f,stroke:#eab308,stroke-width:3px,color:#ffffff
    style C fill:#7c2d12,stroke:#f97316,stroke-width:3px,color:#ffffff
    style D fill:#7f1d1d,stroke:#ef4444,stroke-width:3px,color:#ffffff
```

---

خاتمة

هذا المخطط يعطي صورة كاملة عن بنية المشروع من الداخل.

النقاط الجوهرية التي يجب تذكّرها دائماً:

· ملف الإعدادات الحقيقية لا يُشارَك أبداً
· مستودع البيانات يجب أن يبقى خاصاً
· كل كلمة سر أو مفتاح يُخزَّن في متغيّرات البيئة
· قبل أي مشاركة، اتبع قائمة المراجعة بالترتيب
· عند الشك في أي ملف، اسأل قبل المشاركة
