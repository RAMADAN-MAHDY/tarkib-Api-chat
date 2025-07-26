import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import UserRequest from "../models/UserRequest.js";
import { generateToken, verifyToken } from "../utils/jwt.js";
import crypto from "crypto";

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  const { message } = req.body;
  const authHeader = req.headers.authorization;

  if (!message) {
    return res.status(400).json({ error: "الرسالة مطلوبة" });
  }

  let sessionId;
  let token;

  // ✅ التحقق من وجود التوكن وتحليله
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
    // ✅ لو مفيش توكن، نولّد واحد جديد
    sessionId = crypto.randomUUID();
    token = generateToken({ sessionId });
  }

  try {
    // البحث عن الجلسة بالتوكن (اللي فيه sessionId)
    let userSession = await UserRequest.findOne({ sessionId });

    if (!userSession) {
      userSession = await UserRequest.create({
        sessionId,
        chatHistory: [
          {
            role: "system",
            content: `
أنت مساعد ذكي لخدمات تنظيف المنازل والمكاتب، لديك المعلومات التالية:

- خدمات التنظيف:
1. تنظيف تكييفات
2. تنظيف غرف
3.تنظيف ركنيات وسجاد
4.مجالس
5.هي خدمة نظافه عامة 

- أوقات الحجز المتاحة: من 9 صباحًا إلى 12 صباحًا

- المناطق المتاحة: الخرج، الرياض

📌 هدفك هو:
- مساعدة العميل في اختيار نوع الخدمة
- تحديد التاريخ والوقت
- معرفة اسمه
- معرفة رقم جواله للتواصل

✅ لا تطلب من العميل الضغط على زر "تم" إلا إذا كان كتب:
- نوع الخدمة
- الموقع
- التاريخ
- الوقت
- اسمه
- رقم الجوال

🛑 لو العميل ما كتب رقم جواله، لا تطلب منه تأكيد الحجز، وبلّغه إن لازم يكتب رقم الجوال علشان نكمل.

💬 كن ودود وواضح، ورد باللهجة السعودية دائمًا، واستخدم إيموجيات مناسبة في ردودك.

-  اذ طلب اي شي مش موجود هنا قوله يتصل علي الرقم ده 0562790402

اذا تم تاكيد الحجز واستلمت كل البيانات قله يضغط على زر "تم الاتفاق" عشان يتم الحجز

💡📝 اكتب الرد بصيغة Markdown فقط، ولا تستخدم أي علامات ترقيم غير Markdown. 
- اجعل كل سطر يحتوي على سطر جديد (line break) 
- لا تدمج النقاط كلها في سطر واحد 
- اجعل كل فقرة واضحة ومقسمة بشكل سهل القراءة. 
`.trim(),
          },
        ],
      });

      // ✅ أول مرة فقط: ارجع رد ترحيبي ثابت بدون استدعاء GPT
      return res.json({
        reply: `هلا فيك! 😊  
وش نوع الخدمة اللي تبغاها؟  
عندي خدمات تنظيف للمكيفات  
الغرف  
الركنيات  
السجاد  
والمجالس  

🕘 الأوقات: من 9 صباحًا إلى 12 مساءً  
📍 المناطق: الرياض والخرج  

💬 اكتب لي نوع الخدمة أو استفسارك، وأنا حاضر أخدمك 😄`,
        token,
      });
    }

    // ✅ باقي الجلسات: نكمل التفاعل مع GPT
    userSession.chatHistory.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: userSession.chatHistory.slice(-20),
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ error: "ما قدرنا نرجع رد من المساعد" });
    }

    userSession.chatHistory.push({ role: "assistant", content: reply });
    await userSession.save();

    res.json({ reply, token });
  } catch (error) {
    console.error("❌ خطأ في استدعاء GPT:", error);
    res.status(500).json({ error: "حدث خطأ داخلي" });
  }
});

export default router;
