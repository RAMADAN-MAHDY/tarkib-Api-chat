import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import sanitize from 'mongo-sanitize';

const securityMiddleware = (app) => {
  // ✅ Sanitizing manually without modifying read-only req.*
  app.use((req, res, next) => {
    req.clonedQuery = sanitize({ ...req.query });
    req.clonedBody = sanitize({ ...req.body });
    req.clonedParams = sanitize({ ...req.params });
    next();
  });

  // 🛡️ Secure headers
  app.use(helmet());

  // 🧼 Prevent XSS
  app.use(xss());

  // 📈 Rate limiting
  app.set('trust proxy', 1);
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });
  app.use(limiter);
};

export default securityMiddleware;
