import express from "express";
import OpenAI from "openai";
import UserRequest from "../models/UserRequest.js";
import { verifyToken } from "../utils/jwt.js";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  const authHeader = req.headers.authorization;
  let sessionId, token;

  // ✅ تحقق من التوكن
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const incomingToken = authHeader.split(" ")[1];
    try {
      const decoded = verifyToken(incomingToken);
      sessionId = decoded.sessionId;
      token = incomingToken;
    } catch (err) {
      return res.status(401).json({ error: "توكن غير صالح" });
    }
  } else {
    return res.status(400).json({
      message: "منفضلك ادخل البيانات قبل الاتفاق",
      error: "لم يتم التعرف على التوكن",
    });
  }

  const userSession = await UserRequest.findOne({ sessionId });
  if (!userSession) {
    return res.status(400).json({ error: "لا توجد محادثة بهذا sessionId" });
  }

  const chatHistory = userSession.chatHistory || [];

  const formattedChat = chatHistory
    .map((m) => `${m.role === "user" ? "العميل" : "المساعد"}: ${m.content}`)
    .join("\n");

  // ✅ البرومبت المحدّث باللهجة السعودية ويمنع التثبيت
  const prompt = `
📌 اقرأ المحادثة اللي تحت واستخرج منها المعلومات التالية إذا لقيتها:

- نوع الخدمة المطلوبة
- التاريخ  
- الوقت
- الموقع
- اسم العميل
- رقم الجوال

📌 إذا لقيت **فقط رقم الجوال** بدون باقي البيانات، رجّع ردك بصيغة JSON كذا (كمثال):

مثال فقط:
{
  "phone": "هنا الرقم"
}

📌 وإذا لقيت **كل البيانات**، رجّعها بصيغة JSON بهالشكل (مثال توضيحي فقط):

مثال فقط:
{
  "service": "تنظيف شقق",
  "date": "2025-07-20",  // (سجل التاريخ زي ماليوزر كاتبه بالظبط)
  "time": "3 العصر",
  "location": "الدمام - حي الفيصلية",
  "customer_name": "محمد العتيبي",
  "phone": "0501234567"
}

📌 إذا ما لقيت **رقم الجوال** نهائيًا، رجّع كذا:

{ "agreement": false }

❗ ملاحظة مهمة جدًا:
– لا تنسخ البيانات من الأمثلة.
– استخرج البيانات الحقيقية من المحادثة نفسها فقط.
– لا تشرح، لا تعلق، رجّع فقط JSON.

المحادثة:
===
${formattedChat}
===
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "أنت مساعد تستخرج بيانات الحجز من المحادثة بصيغة JSON فقط.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const aiResponse = completion.choices[0].message.content.trim();
    const cleaned = aiResponse.replace(/```json|```/g, "");

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(400).json({ error: "رد AI غير صالح", raw: aiResponse });
    }

    // ✅ حفظ البيانات في الجلسة إذا ما تم الاتفاق قبل كذا
    if (!userSession.agreement) {
      if (parsed.phone) {
        userSession.phone = parsed.phone;
        userSession.fullName = parsed.customer_name || "";
        userSession.service = parsed.service || "";
        userSession.date = parsed.date || "";
        userSession.time = parsed.time || "";
        userSession.location = parsed.location || "";
        userSession.agreement = true;
        await userSession.save();

        return res.json({
          agreement: true,
          saved: true,
          data: parsed,
          reply: "✅ تم الاتفاق، وراح يتم التواصل معك قريب إن شاء الله 📞"
        });
      } else {
        return res.json({ agreement: false });
      }
    }

    return res.json({ agreement: true, saved: true, data: parsed });
  } catch (error) {
    console.error("❌ خطأ أثناء تحليل المحادثة:", error);
    res.status(500).json({ error: "حدث خطأ أثناء تحليل المحادثة" });
  }
});

export default router;
