// routes/chatRoutes.js
import express from 'express';
import { deleteMessageById, getAllConversations, getMessages, getOrCreateConversation, sendMessage } from '../controller/chatController.js';

const router = express.Router();

// router.post('/conversation', getOrCreateConversation);
// router.post('/message', sendMessage);
// router.get('/:conversationId', getMessages);
// router.get('/conversations', getAllConversations); // Admin panel
// router.delete('/delete/:messageId', deleteMessageById)

export default router;
