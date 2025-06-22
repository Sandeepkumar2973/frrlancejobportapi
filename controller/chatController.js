// controllers/chatController.js
import ConversationModel from '../models/ConversationModel.js';
import MessageModel from '../models/messageModel.js';

// Create or get conversation
export const getOrCreateConversation = async (req, res) => {
    const { userId } = req.body;

    try {
        let conversation = await ConversationModel.findOne({ userId });

        if (!conversation) {
            conversation = await ConversationModel.create({ userId });
        }

        res.status(200).json(conversation);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get/create conversation' });
    }
};

// Send a message (user or admin)
export const sendMessage = async (req, res) => {
    const { conversationId, sender, text } = req.body;

    try {
        const message = await MessageModel.create({ conversationId, sender, text });
        res.status(200).json(message);
    } catch (err) {
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// Get all messages in a conversation
export const getMessages = async (req, res) => {
    const { conversationId } = req.params;
    try {
        const messages = await MessageModel.find({ conversationId }).sort({ timestamp: 1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

// Get all conversations (Admin purpose)
export const getAllConversations = async (req, res) => {
    try {
        const conversations = await ConversationModel.find().populate('userId');
        res.status(200).json(conversations);
    } catch (err) {
        console.error(err); // Debug the actual error
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
};



export const deleteMessageById = async (req, res) => {
    const { messageId } = req.params;
    try {
        const deletedMessage = await MessageModel.findByIdAndDelete(messageId);
        if (!deletedMessage) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete message' });
    }
};
