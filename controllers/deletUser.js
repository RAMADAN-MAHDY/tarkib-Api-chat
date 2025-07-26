import UserRequest from '../models/UserRequest.js';

 const HandleDeleteUsere = async (req, res) => {
    const { id } = req.params;
  
    try {
      const deleted = await UserRequest.findByIdAndDelete(id);
  
      if (!deleted) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }
  
      res.json({ message: "✅ تم حذف المستخدم بنجاح" });
    } catch (error) {
      console.error("❌ خطأ أثناء الحذف:", error);
      res.status(500).json({ error: "فشل في حذف المستخدم" });
    }
  };

  export default HandleDeleteUsere;