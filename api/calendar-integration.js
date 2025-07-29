// Google Calendar Integration API Example
// This is a demonstration of how the real Google Calendar integration would work

const { google } = require('googleapis');
require('dotenv').config();

// Google Calendar API configuration
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CREDENTIALS_PATH = './credentials.json';

class GoogleCalendarService {
    constructor() {
        this.auth = null;
        this.calendar = null;
    }

    // Initialize Google Calendar API
    async initialize() {
        try {
            const credentials = require(CREDENTIALS_PATH);
            this.auth = new google.auth.GoogleAuth({
                credentials,
                scopes: SCOPES,
            });

            this.calendar = google.calendar({ version: 'v3', auth: this.auth });
            console.log('Google Calendar API initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Google Calendar API:', error);
            throw error;
        }
    }

    // Create calendar event for appointment
    async createAppointmentEvent(appointmentData) {
        try {
            const event = {
                summary: `Parlor Appointment - ${appointmentData.service}`,
                description: `
                    Customer: ${appointmentData.customerName}
                    Phone: ${appointmentData.customerPhone}
                    Email: ${appointmentData.customerEmail}
                    Special Requests: ${appointmentData.specialRequests || 'None'}
                    Booking ID: ${appointmentData.id}
                `,
                start: {
                    dateTime: `${appointmentData.date}T${appointmentData.time}:00`,
                    timeZone: 'America/New_York',
                },
                end: {
                    dateTime: this.calculateEndTime(appointmentData.date, appointmentData.time, appointmentData.service),
                    timeZone: 'America/New_York',
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 24 * 60 }, // 1 day before
                        { method: 'popup', minutes: 60 }, // 1 hour before
                    ],
                },
                attendees: [
                    { email: appointmentData.customerEmail },
                    { email: 'parlor@beauty.com' }, // Parlor email
                ],
            };

            const response = await this.calendar.events.insert({
                calendarId: 'primary',
                resource: event,
                sendUpdates: 'all',
            });

            console.log('Calendar event created:', response.data.htmlLink);
            return response.data;
        } catch (error) {
            console.error('Failed to create calendar event:', error);
            throw error;
        }
    }

    // Update calendar event for rescheduling
    async updateAppointmentEvent(appointmentData, eventId) {
        try {
            const event = {
                summary: `Parlor Appointment - ${appointmentData.service} (RESCHEDULED)`,
                description: `
                    Customer: ${appointmentData.customerName}
                    Phone: ${appointmentData.customerPhone}
                    Email: ${appointmentData.customerEmail}
                    Special Requests: ${appointmentData.specialRequests || 'None'}
                    Booking ID: ${appointmentData.id}
                    Status: Rescheduled
                `,
                start: {
                    dateTime: `${appointmentData.date}T${appointmentData.time}:00`,
                    timeZone: 'America/New_York',
                },
                end: {
                    dateTime: this.calculateEndTime(appointmentData.date, appointmentData.time, appointmentData.service),
                    timeZone: 'America/New_York',
                },
            };

            const response = await this.calendar.events.update({
                calendarId: 'primary',
                eventId: eventId,
                resource: event,
                sendUpdates: 'all',
            });

            console.log('Calendar event updated:', response.data.htmlLink);
            return response.data;
        } catch (error) {
            console.error('Failed to update calendar event:', error);
            throw error;
        }
    }

    // Cancel calendar event
    async cancelAppointmentEvent(eventId) {
        try {
            const response = await this.calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId,
                sendUpdates: 'all',
            });

            console.log('Calendar event cancelled');
            return response.data;
        } catch (error) {
            console.error('Failed to cancel calendar event:', error);
            throw error;
        }
    }

    // Calculate end time based on service duration
    calculateEndTime(date, startTime, service) {
        const serviceDurations = {
            'hair-styling': 90, // 90 minutes
            'makeup': 120, // 120 minutes
            'facial': 60, // 60 minutes
            'manicure-pedicure': 90, // 90 minutes
            'waxing': 45, // 45 minutes
            'bridal-package': 240, // 4 hours
        };

        const duration = serviceDurations[service] || 60;
        const startDateTime = new Date(`${date}T${startTime}:00`);
        const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

        return endDateTime.toISOString();
    }

    // Check calendar availability
    async checkAvailability(date, time, duration = 60) {
        try {
            const startDateTime = new Date(`${date}T${time}:00`);
            const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

            const response = await this.calendar.freebusy.query({
                resource: {
                    timeMin: startDateTime.toISOString(),
                    timeMax: endDateTime.toISOString(),
                    items: [{ id: 'primary' }],
                },
            });

            const busy = response.data.calendars.primary.busy;
            return busy.length === 0; // Available if no busy periods
        } catch (error) {
            console.error('Failed to check calendar availability:', error);
            throw error;
        }
    }
}

// Express.js API endpoints example
const express = require('express');
const router = express.Router();
const calendarService = new GoogleCalendarService();

// Initialize calendar service
calendarService.initialize().catch(console.error);

// Create appointment endpoint
router.post('/appointments', async (req, res) => {
    try {
        const appointmentData = req.body;
        
        // Validate appointment data
        if (!validateAppointmentData(appointmentData)) {
            return res.status(400).json({ error: 'Invalid appointment data' });
        }

        // Check availability
        const isAvailable = await calendarService.checkAvailability(
            appointmentData.date,
            appointmentData.time,
            getServiceDuration(appointmentData.service)
        );

        if (!isAvailable) {
            return res.status(409).json({ error: 'Time slot not available' });
        }

        // Create calendar event
        const calendarEvent = await calendarService.createAppointmentEvent(appointmentData);

        // Save to database (simulated)
        const savedAppointment = {
            ...appointmentData,
            calendarEventId: calendarEvent.id,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
        };

        res.status(201).json({
            message: 'Appointment created successfully',
            appointment: savedAppointment,
            calendarEvent: calendarEvent,
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ error: 'Failed to create appointment' });
    }
});

// Update appointment endpoint
router.put('/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Get existing appointment (simulated)
        const existingAppointment = getAppointmentById(id);
        if (!existingAppointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Update calendar event
        const updatedEvent = await calendarService.updateAppointmentEvent(
            { ...existingAppointment, ...updateData },
            existingAppointment.calendarEventId
        );

        // Update appointment in database (simulated)
        const updatedAppointment = {
            ...existingAppointment,
            ...updateData,
            updatedAt: new Date().toISOString(),
        };

        res.json({
            message: 'Appointment updated successfully',
            appointment: updatedAppointment,
            calendarEvent: updatedEvent,
        });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ error: 'Failed to update appointment' });
    }
});

// Cancel appointment endpoint
router.delete('/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get existing appointment (simulated)
        const existingAppointment = getAppointmentById(id);
        if (!existingAppointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Cancel calendar event
        await calendarService.cancelAppointmentEvent(existingAppointment.calendarEventId);

        // Update appointment status in database (simulated)
        const cancelledAppointment = {
            ...existingAppointment,
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
        };

        res.json({
            message: 'Appointment cancelled successfully',
            appointment: cancelledAppointment,
        });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ error: 'Failed to cancel appointment' });
    }
});

// Helper functions
function validateAppointmentData(data) {
    const required = ['service', 'date', 'time', 'customerName', 'customerPhone', 'customerEmail'];
    return required.every(field => data[field] && data[field].trim() !== '');
}

function getServiceDuration(service) {
    const durations = {
        'hair-styling': 90,
        'makeup': 120,
        'facial': 60,
        'manicure-pedicure': 90,
        'waxing': 45,
        'bridal-package': 240,
    };
    return durations[service] || 60;
}

function getAppointmentById(id) {
    // Simulated database lookup
    return null; // Replace with actual database query
}

module.exports = router; 