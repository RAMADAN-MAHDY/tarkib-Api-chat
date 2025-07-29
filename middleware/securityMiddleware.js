import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';

const securityMiddleware = (app) => {
    // ✅ نسخ البيانات دون التعديل على req.query مباشرة
    app.use((req, res, next) => {
        const clone = (obj) => obj && typeof obj === 'object' ? { ...obj } : {};
        Object.defineProperty(req, 'query', {
            value: clone(req.query),
            writable: true,
            configurable: true,
            enumerable: true
        });
        Object.defineProperty(req, 'body', {
            value: clone(req.body),
            writable: true,
            configurable: true,
            enumerable: true
        });
        Object.defineProperty(req, 'params', {
            value: clone(req.params),
            writable: true,
            configurable: true,
            enumerable: true
        });
        next();
    });

    // 🛡️ منع NoSQL injection
    app.use(mongoSanitize());

    // ترويسات الحماية
    app.use(helmet());

    // منع XSS
    app.use(xss());
    app.set('trust proxy', 1);
    // تحديد معدل الطلبات
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
    });
    app.use(limiter);
};

export default securityMiddleware;
