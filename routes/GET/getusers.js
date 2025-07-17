import express from "express";
import UserRequest from "../../models/UserRequest.js";

const router = express.Router();

// GET / => جلب الاسم ورقم الهاتف مرتبين حسب تاريخ الإنشاء
router.get("/", async (req, res) => {
  try {
    const users = await UserRequest.find()
      .sort({ createdAt: 1 })
      .select("fullName phone agreement");

    res.json(users);
  } catch (error) {
    console.error("❌ خطأ في جلب المستخدمين:", error);
    res.status(500).json({ error: "فشل في تحميل البيانات" });
  }
});

// ✅ GET /:id => جلب كل التفاصيل الخاصة بيوزر معين باستخدام ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await UserRequest.findById(id);

    if (!user) {
      return res.status(404).json({ error: "المستخدم غير موجود" });
    }

    res.json(user);
  } catch (error) {
    console.error("❌ خطأ في جلب تفاصيل المستخدم:", error);
    res.status(500).json({ error: "فشل في تحميل بيانات المستخدم" });
  }
});

export default router;
