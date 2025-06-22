// models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
    },
    sender: {
        type: String, // 'user' or 'admin'
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});
const Message = mongoose.model('Message', messageSchema);
export default Message;
