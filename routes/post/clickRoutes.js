// routes/clickRoutes.js
import express from 'express';
import { handleButtonClick, getClickCount } from '../../controllers/clickController.js';

const router = express.Router();

router.post('/click', handleButtonClick); // زيادة العداد
router.get('/click/:buttonId', getClickCount); // جلب العداد

export default router;
