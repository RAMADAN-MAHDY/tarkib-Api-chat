import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';

const securityMiddleware = (app) =>{

    // Data sanitization against NoSQL query injection
    app.use(mongoSanitize());

    // Set security HTTP headers
    app.use(helmet());

    // Prevent XSS attacks
    app.use(xss());         

    // Rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs

    })
    app.use(limiter);
}
export default securityMiddleware;