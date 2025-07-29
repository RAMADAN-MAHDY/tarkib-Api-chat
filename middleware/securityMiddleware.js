import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';

const securityMiddleware = (app) => {
    // ✅ نسخ الكائنات لجعلها قابلة للتعديل
    app.use((req, res, next) => {
        req.query = { ...req.query };
        req.body = req.body ? { ...req.body } : {};
        req.params = req.params ? { ...req.params } : {};
        next();
    });

    // 🛡️ منع هجمات NoSQL Injection
    app.use(mongoSanitize());

    // 🧱 ترويسات الحماية
    app.use(helmet());

    // ❌ منع XSS
    app.use(xss());

    // 🕓 تحديد عدد الطلبات
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
    });
    app.use(limiter);
};

export default securityMiddleware;
