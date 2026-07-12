# نجوم التداول — دليل الإضافة

الملفات المضافة في المجلد extension/ توفر هيكلًا أوليًا لإضافة Chrome تدمج content.js الذي لديك:

- manifest.json — إعداد الإضافة (MV3)
- background.js — service worker يستقبل رسائل من content.js ويخزن الحزم في chrome.storage.local. كما يوفّر واجهة لصفحة popup لإرسال أوامر START/READ_ONCE/STOP.
- popup.html, popup.js, popup.css — واجهة بسيطة للتحكم (بدء المراقبة، قراءة مرة واحدة، إيقاف)

ما قمت به الآن:
- إنشاء فرع najoom-extension ودفع الملفات المذكورة.

الخطوات المقترحة التالية:
1. اختبار محلي: ثبت الإضافة كـ "unpacked extension" في وضع المطوّر وجرّبها على صفحة screener (stock-screener).
2. ربط خدمة Python محليّة: إذا أردت، سأضيف مثال FastAPI يستقبل POST /ingest ويخزن في sqlite.
3. تحسينات أمنية: تأكد ألا يتم تضمين بيانات الاعتماد في أي ملف موزّع.

أخبرني أي خيار تريده الآن: اختبار الإضافة، إضافة خدمة Python، أو تعديل content.js ليدعم إرسال مباشر عبر HTTP/WS.
