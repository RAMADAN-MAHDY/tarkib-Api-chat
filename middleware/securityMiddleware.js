import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';

const securityMiddleware = (app) => {
    // ✅ نسخ البيانات دون التعديل على req.query مباشرة
    app.use((req, res, next) => {
        req.clonedQuery = mongoSanitize.sanitize({ ...req.query });
        req.clonedBody = mongoSanitize.sanitize({ ...req.body });
        req.clonedParams = mongoSanitize.sanitize({ ...req.params });
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
