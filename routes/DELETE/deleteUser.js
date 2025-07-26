import express from "express";
import HandleDeleteUsere from '../../controllers/deletUser.js'
const router = express.Router();

// DELETE /users/:id => حذف مستخدم بالتحديد
router.delete("/:id", HandleDeleteUsere );

export default router;
