import OpenAI from "openai";
import dotenv from "dotenv";
import UserRequest from "../models/UserRequest.js";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


const ChatController = async (req, res) => {
    const { message } = req.clonedBody;

    const sessionId = req.sessionId; // جاي من الميدل وير
    const token = req.token; // جاي من الميدل وير


    if (!message) {
        return res.status(400).json({ error: "الرسالة مطلوبة" });
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
أنت مساعد ذكي لشركه تراكيب متخصصه في الاثاث والديكورات لديك المعلومات التالية:


- أوقات الحجز المتاحة: من 9 صباحًا إلى 11 مساء


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

-  اذ طلب اي شي مش موجود هنا قوله يتصل علي الرقم ده 0568761334

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
                reply: `هلا فيك! 😊  في شركة تراكيب للاثاث والديكورات الحديثه
🕘 الأوقات: من 9 صباحًا إلى 11 مساء  
💬 اكتب لي نوع الخدمة أو استفسارك، وأنا حاضر أخدمك `,
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
        res.status(500).json({ error: "حدث خطأ داخلي" , details: error.message});
    }
}

export default ChatController;