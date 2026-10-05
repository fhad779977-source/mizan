# أرقام كرة القدم — مولّد مقاطع تيك توك

يحوّل ملف حلقة بسيط (`episodes/*.json`) إلى فيديو عمودي 1080×1920 مدته دقيقة:
عنوان أصفر، رسوم متحركة للأرقام، ترجمة عربية كبيرة، شعار، وشريط تقدّم.

## التشغيل

```bash
cd football-shorts
npm install
node scripts/render.mjs episodes/day01-haaland-record.json --preview   # صور معاينة سريعة
node scripts/render.mjs episodes/day01-haaland-record.json             # الفيديو الكامل → out/
node scripts/render.mjs episodes/day01-haaland-record.json --audio voice.mp3   # مع الصوت
```

يتطلب `ffmpeg`.

## مع الصوت (ElevenLabs)

1. انسخ نص `spoken` من `narration` في ملف الحلقة، وولّد الصوت من موقع ElevenLabs.
2. ضع الملف في `voices/<id>.mp3`.
3. اضبط التوقيت ثم صدّر:

```bash
node scripts/sync.mjs episodes/<id>.json voices/<id>.mp3   # يكتشف الوقفات ويوزّع الجمل والمشاهد
node scripts/render.mjs out/<id>.timed.json                 # فيديو بالصوت → out/<id>.mp4
```

## ملف الحلقة

- `scenes`: المشاهد بالترتيب مع وقت البداية والنهاية. الأنواع المتاحة:
  - `hook`: ملعب يُرسم مع عنوان جذاب.
  - `counter`: رقم كبير يعدّ (يدعم الكسور).
  - `bars`: أعمدة مقارنة.
  - `compare`: رقمان جنبًا إلى جنب.
  - `icons`: أيقونات كرة تظهر بالعدد.
- `subtitles`: نص التعليق مع التوقيت. وهو نفسه نص التعليق الصوتي.
- `**كلمة**` تلوّن الكلمة.
- `narration`: جمل التعليق بالترتيب: `text` للشاشة، `spoken` لما يُقرأ (الأرقام بالحروف)، `scene` رقم المشهد.
- `sources`: روابط مصادر الأرقام (إلزامية).

## الجدول

انظر [CALENDAR.md](CALENDAR.md).
