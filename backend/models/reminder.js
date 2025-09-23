const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    medicineName: {
        type: String,
        required: true,
        trim: true
    },
    dosage: {
        type: String,
        trim: true
    },
    medicineForm: {
        type: String,
        enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Inhaler', 'Other'],
        trim: true
    },
    // frequency is implied by the length of the `times` array
    times: {
        type: [String], // e.g., ['09:00', '21:00']
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    takenLog: {
        type: Map,
        of: [String], // Key: 'YYYY-MM-DD', Value: ['09:00', '21:05']
        default: {}
    },
    // For Google Calendar integration
    calendarEventIds: {
        type: [String],
        default: []
    },
}, { timestamps: true });

// Index for efficient querying by user and date
ReminderSchema.index({ userId: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Reminder', ReminderSchema);