import UserRequest from '../models/UserRequest.js';

const GETusers  = async (req, res) => {
    try {
      const users = await UserRequest.find()
        .sort({ createdAt: 1 })
        .select("fullName phone agreement");
  
      res.json(users);
    } catch (error) {
      console.error("❌ خطأ في جلب المستخدمين:", error);
      res.status(500).json({ error: "فشل في تحميل البيانات" });
    }
  };



  const GETuserById = async (req, res) => {
    const { id } = req.clonedParams;
  
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
  };

  export {GETusers , GETuserById};
  