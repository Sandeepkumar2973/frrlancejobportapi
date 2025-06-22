// models/Conversation.js
import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: false, // Admin may not be assigned initially
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
