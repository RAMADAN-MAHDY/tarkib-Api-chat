import express from 'express';
import { registerAdmin, loginAdmin, verifyAdmin, refreshAdminToken, logoutAdmin } from '../controllers/adminController.js';
const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/verify', verifyAdmin, (req, res) => {
    res.status(200).json({ message: 'Admin verified', admin: req.admin });
});
router.post('/refresh-token', refreshAdminToken);
router.post('/logout', logoutAdmin);

export default router;
