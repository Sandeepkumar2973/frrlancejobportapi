import mongoose from 'mongoose';
// const NotificationSchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     message: String,
//     read: { type: Boolean, default: false },
//     timestamp: { type: Date, default: Date.now },
// });

// const Notification = mongoose.model('Notification', NotificationSchema);

// export default Notification;



const notificationSchema = new mongoose.Schema({
    to: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'toModel'
    },
    toModel: {
        type: String,
        required: true,
        enum: ['User', 'Admin']
    },
    type: String, // e.g., "job_application", "status_update"
    title: String,
    message: String,
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;