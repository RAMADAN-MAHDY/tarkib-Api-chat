import express from "express";
import {GETuserById ,GETusers} from '../../controllers/GETuser.js'
const router = express.Router();

// GET / => جلب الاسم ورقم الهاتف مرتبين حسب تاريخ الإنشاء
router.get("/", GETusers);

// ✅ GET /:id => جلب كل التفاصيل الخاصة بيوزر معين باستخدام ID
router.get("/:id", GETuserById);

export default router;
