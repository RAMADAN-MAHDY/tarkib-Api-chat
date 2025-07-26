import express from "express";
import analizeController from '../controllers/analizeController.js'
import {authMiddleware} from '../middleware/authMiddleware.js'
const router = express.Router();


router.post("/", authMiddleware, analizeController);

export default router;
