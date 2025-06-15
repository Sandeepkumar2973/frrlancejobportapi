import mongoose from 'mongoose';
const NotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
