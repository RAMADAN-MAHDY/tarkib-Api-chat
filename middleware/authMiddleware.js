// middleware/authMiddleware.js
import { verifyToken } from "../utils/jwt.js";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "غير مصرح" });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "توكن غير صالح" });
  }

  req.user = decoded; // عشان تستخدم بيانات المستخدم بعدين
  next();
};
