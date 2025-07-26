import express from "express";
import ChatController from '../controllers/chatController.js'
import { authOrGenerateMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router();

router.post("/", authOrGenerateMiddleware,ChatController);

export default router;
