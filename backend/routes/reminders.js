const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Reminder = require('../models/reminder');
const { google } = require('googleapis');
const { ObjectId } = require('mongodb');

// --- Google Calendar Helper ---
async function createCalendarEvents(userId, reminder) {
    const db = mongoose.connection.db;
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    if (!user || !user.googleRefreshToken) {
        console.error(`[Calendar] Attempted to create event for user ${userId} without a Google refresh token.`);
        throw new Error('Google Calendar not connected. Please connect your account on the Reminders page.');
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        // The redirect URI is not needed when using a refresh token for API calls.
        // Removing it makes this consistent with the working sendConfirmationEmail function.
    );
    oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
        const eventIds = [];

        // Helper to format a date-only and time into 'YYYY-MM-DDTHH:MM:SS' (no timezone designator)
        const formatLocalDateTime = (dateOnly, hour, minute) => {
            const d = new Date(dateOnly);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hh = String(parseInt(hour, 10)).padStart(2, '0');
            const mm = String(parseInt(minute, 10)).padStart(2, '0');
            return `${y}-${m}-${day}T${hh}:${mm}:00`;
        };

        // Recurrence end date in UTC-less local format 'YYYYMMDDT000000Z'
        const untilDate = reminder.endDate
            ? new Date(reminder.endDate).toISOString().replace(/[-:.]/g, '').slice(0, 8) + 'T000000Z'
            : null;

        for (const time of reminder.times) {
            const [hour, minute] = String(time).split(':');
            const startLocal = formatLocalDateTime(reminder.startDate, hour, minute);

            // Compute end time as +30 minutes based on a Date for convenience, then format back without timezone designator
            const endDateObj = new Date(`${startLocal}:00Z`); // temporary baseline; value will be overridden by explicit timeZone below
            endDateObj.setMinutes(endDateObj.getMinutes() + 30);
            const endLocal = `${startLocal.slice(0, 14)}${String(parseInt(startLocal.slice(14, 16), 10)).padStart(2, '0')}:00`;
            // The above keeps minutes; but better compute from endDateObj components
            const endY = endDateObj.getUTCFullYear();
            const endM = String(endDateObj.getUTCMonth() + 1).padStart(2, '0');
            const endD = String(endDateObj.getUTCDate()).padStart(2, '0');
            const endH = String(endDateObj.getUTCHours()).padStart(2, '0');
            const endMin = String(endDateObj.getUTCMinutes()).padStart(2, '0');
            const endLocalFixed = `${endY}-${endM}-${endD}T${endH}:${endMin}:00`;

            const event = {
                summary: `Take: ${reminder.medicineName}`,
                description: `Dosage: ${reminder.dosage || 'N/A'}\nNotes: ${reminder.notes || 'None'}`,
                start: { dateTime: startLocal, timeZone: 'Asia/Kolkata' },
                end: { dateTime: endLocalFixed, timeZone: 'Asia/Kolkata' },
                recurrence: [`RRULE:FREQ=DAILY${untilDate ? `;UNTIL=${untilDate}` : ''}`],
                reminders: { useDefault: true },
            };

            const createdEvent = await calendar.events.insert({ calendarId: 'primary', requestBody: event });
            eventIds.push(createdEvent.data.id);
        }
        return eventIds;
    } catch (error) {
        const errorMessage = error.message || String(error);
        // Self-healing: If the token is invalid, clear it from the database.
        if (errorMessage.includes('invalid_grant')) {
            console.log(`[Calendar] Invalidating Google token for user ${userId} due to: ${errorMessage}`);
            try {
                await db.collection('users').updateOne(
                    { _id: new ObjectId(userId) },
                    { $set: { isGoogleConnected: false }, $unset: { googleRefreshToken: "" } }
                );
            } catch (dbError) {
                console.error(`[Calendar] Failed to invalidate token in DB for user ${userId}:`, dbError);
            }
        }
        // Re-throw the original error to be caught by the route handler.
        throw error;
    }
}
// @route   POST /api/reminders (and /api/reminders/user)
// @desc    Create a new medicine reminder
// @access  Private (token checked in server.js)
router.post(['/', '/user'], async (req, res) => {
    console.log('[POST /api/reminders] - Request received.');
    const {
        medicineName,
        dosage,
        medicineForm,
        times,
        startDate,
        endDate,
        notes,
        addToCalendar,
        googleEmail // Corrected from calendarEmail
    } = req.body;

    if (!medicineName || !times || !startDate) {
        console.error('[POST /api/reminders] - Validation failed: Missing required fields.');
        return res.status(400).json({ success: false, error: 'Missing required fields.' });
    }

    try {
        console.log(`[POST /api/reminders] - Received request for user:`, req.user);
        if (!req.user || !req.user.id) {
            console.error('[POST /api/reminders] - Authentication error: req.user.id is missing.');
            return res.status(401).json({ success: false, error: 'User not properly authenticated.' });
        }

        const reminderData = {
            userId: new mongoose.Types.ObjectId(req.user.id),
            medicineName, dosage, medicineForm, times, startDate,
            endDate: endDate || null, notes, calendarEventIds: []
        };

        // 1. Save the reminder to the database first.
        const savedReminder = await new Reminder(reminderData).save();
        console.log(`[POST /api/reminders] - Reminder saved successfully with _id: ${savedReminder._id}`);

        let calendarSyncStatus = 'not_requested';
        let finalReminder = savedReminder;

        // 2. If calendar sync is requested, attempt it as a separate, non-blocking step.
        if (addToCalendar) {
            try {
                const eventIds = await createCalendarEvents(req.user.id, savedReminder);
                // 3. If successful, update the reminder with the event IDs.
                savedReminder.calendarEventIds = eventIds;
                finalReminder = await savedReminder.save(); // Save again to persist event IDs
                console.log(`[Calendar] Synced reminder ${savedReminder._id} with event(s): ${eventIds.join(', ')}`);
                calendarSyncStatus = 'success';
            } catch (calendarError) {
                // 4. If it fails, log it but don't fail the whole request.
                console.error(`[Calendar] Failed to sync reminder ${savedReminder._id} for user ${req.user.id}. Reason: ${calendarError.message}`);
                calendarSyncStatus = `failed: ${calendarError.message}`;
            }
        }

        // 5. Respond with success, including the saved reminder and calendar status.
        res.status(201).json({
            success: true,
            reminder: finalReminder,
            calendarSyncStatus: calendarSyncStatus
        });

    } catch (error) {
        console.error('[POST /api/reminders] - Detailed error creating reminder:', error);
        res.status(500).json({ success: false, error: 'An error occurred on the server while saving the reminder.' });
    }
});

// @route   GET /api/reminders
// @desc    Get all active reminders for a user
// @access  Private (token checked in server.js)
// Support both / and /user for frontend compatibility
router.get(['/', '/user'], async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to the beginning of today to include all of today

        // Find reminders that are active and have not ended yet.
        const reminders = await Reminder.find({
            userId: userId,
            isActive: true,
            $or: [
                { endDate: { $gte: today } }, // The end date is today or in the future
                { endDate: null }             // Or there is no end date (it runs indefinitely)
            ]
        }).sort({ startDate: 1, 'times.0': 1 }); // Sort by start date, then by first time
        res.json({ success: true, reminders });
    } catch (error) {
        console.error('Error fetching reminders:', error.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/reminders/today
// @desc    Get reminders for the current day for a user
// @access  Private (token checked in server.js)
router.get('/today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const reminders = await Reminder.find({
            userId: new mongoose.Types.ObjectId(req.user.id), // Ensure it's an ObjectId
            isActive: true,
            startDate: { $lte: tomorrow }, // Started on or before today
            $or: [
                { endDate: { $gte: today } }, // Ends on or after today
                { endDate: null } // Or doesn't have an end date
            ]
        }).sort({ 'times.0': 1 }); // Sort by the first time of the day

        res.json({ success: true, reminders });
    } catch (error) {
        console.error('Error fetching today\'s reminders:', error.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});


// @route   DELETE /api/reminders/:id
// @desc    Delete a reminder
// @access  Private (token checked in server.js)
// Support both /:id and /user/:id for frontend compatibility
router.delete(['/:id', '/user/:id'], async (req, res) => {
    try {
        const reminder = await Reminder.findById(req.params.id);

        if (!reminder) {
            return res.status(404).json({ success: false, error: 'Reminder not found' });
        }

        // Ensure user owns the reminder
        if (reminder.userId.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        // If reminder has calendar events, delete them from Google Calendar
        if (reminder.calendarEventIds && reminder.calendarEventIds.length > 0) {
            const db = mongoose.connection.db;
            const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });

            if (user && user.googleRefreshToken) {
                const oauth2Client = new google.auth.OAuth2(
                    process.env.GOOGLE_CLIENT_ID,
                    process.env.GOOGLE_CLIENT_SECRET,
                    process.env.GOOGLE_REDIRECT_URI
                );
                oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });
                const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

                for (const eventId of reminder.calendarEventIds) {
                    try {
                        await calendar.events.delete({ calendarId: 'primary', eventId: eventId });
                        console.log(`[Calendar] Deleted event ${eventId}`);
                    } catch (calendarError) {
                        // If event is already deleted or not found, Google API returns 410 or 404. We can ignore it.
                        if (calendarError.code !== 410 && calendarError.code !== 404) {
                            console.error(`[Calendar] Error deleting event ${eventId}:`, calendarError);
                        }
                    }
                }
            }
        }

        await reminder.deleteOne();

        res.json({ success: true, message: 'Reminder removed' });
    } catch (error) {
        console.error('Error deleting reminder:', error.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;