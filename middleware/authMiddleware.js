import { verifyToken , generateToken} from "../utils/jwt.js";
import crypto from "crypto";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(400).json({
      message: "منفضلك ادخل البيانات قبل الاتفاق",
      error: "لم يتم التعرف على التوكن",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.sessionId = decoded.sessionId;
    req.token = token;
    next(); // السماح للروتر بالمتابعة
  } catch (err) {
    return res.status(401).json({ error: "توكن غير صالح" });
  }
};

export const authOrGenerateMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    let sessionId, token;
  
    // لو فيه توكن في الهيدر
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
      // لو مفيش توكن، نولّد واحد جديد
      sessionId = crypto.randomUUID();
      token = generateToken({ sessionId });
    }
  
    req.sessionId = sessionId;
    req.token = token;
    next();
  };