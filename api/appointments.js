const express = require('express');
const { Op } = require('sequelize');
const { Customer, Service, Appointment } = require('../models');
const router = express.Router();

// Get all appointments with customer and service details
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (status) whereClause.status = status;
    if (date) whereClause.appointmentDate = date;

    const appointments = await Appointment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'duration', 'price']
        }
      ],
      order: [['appointmentDate', 'ASC'], ['startTime', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      appointments: appointments.rows,
      total: appointments.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(appointments.count / limit)
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone', 'address']
        },
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'description', 'duration', 'price']
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// Create new appointment
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      serviceId,
      appointmentDate,
      startTime,
      specialRequests
    } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !serviceId || !appointmentDate || !startTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find or create customer
    let customer = await Customer.findOne({ where: { email: customerEmail } });
    if (!customer) {
      customer = await Customer.create({
        name: customerName,
        email: customerEmail,
        phone: customerPhone
      });
    }

    // Get service details
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Calculate end time
    const startDateTime = new Date(`${appointmentDate}T${startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + service.duration * 60000);
    const endTime = endDateTime.toTimeString().slice(0, 5);

    // Check for conflicts
    const conflictingAppointment = await Appointment.findOne({
      where: {
        appointmentDate,
        startTime: {
          [Op.lt]: endTime
        },
        endTime: {
          [Op.gt]: startTime
        },
        status: {
          [Op.notIn]: ['cancelled']
        }
      }
    });

    if (conflictingAppointment) {
      return res.status(409).json({ error: 'Time slot conflicts with existing appointment' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      customerId: customer.id,
      serviceId: service.id,
      appointmentDate,
      startTime,
      endTime,
      totalPrice: service.price,
      specialRequests,
      status: 'confirmed'
    });

    // Fetch the created appointment with associations
    const createdAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'duration', 'price']
        }
      ]
    });

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: createdAppointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Update appointment
router.put('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const updateData = req.body;
    
    // If updating time/date, check for conflicts
    if (updateData.appointmentDate || updateData.startTime) {
      const newDate = updateData.appointmentDate || appointment.appointmentDate;
      const newStartTime = updateData.startTime || appointment.startTime;
      
      // Get service for duration calculation
      const service = await Service.findByPk(appointment.serviceId);
      const startDateTime = new Date(`${newDate}T${newStartTime}`);
      const endDateTime = new Date(startDateTime.getTime() + service.duration * 60000);
      const newEndTime = endDateTime.toTimeString().slice(0, 5);

      const conflictingAppointment = await Appointment.findOne({
        where: {
          id: { [Op.ne]: appointment.id },
          appointmentDate: newDate,
          startTime: {
            [Op.lt]: newEndTime
          },
          endTime: {
            [Op.gt]: newStartTime
          },
          status: {
            [Op.notIn]: ['cancelled']
          }
        }
      });

      if (conflictingAppointment) {
        return res.status(409).json({ error: 'Time slot conflicts with existing appointment' });
      }

      updateData.endTime = newEndTime;
    }

    await appointment.update(updateData);

    // Fetch updated appointment with associations
    const updatedAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'duration', 'price']
        }
      ]
    });

    res.json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Cancel appointment
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await appointment.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: req.body.cancelledBy || 'system'
    });

    res.json({
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// Get available time slots for a date
router.get('/availability/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { serviceId } = req.query;

    if (!serviceId) {
      return res.status(400).json({ error: 'Service ID is required' });
    }

    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Business hours: 9 AM to 7 PM
    const businessHours = {
      start: '09:00',
      end: '19:00'
    };

    // Get all appointments for the date
    const appointments = await Appointment.findAll({
      where: {
        appointmentDate: date,
        status: {
          [Op.notIn]: ['cancelled']
        }
      },
      order: [['startTime', 'ASC']]
    });

    // Generate available time slots
    const timeSlots = [];
    const slotDuration = 30; // 30-minute slots
    const serviceDuration = service.duration;

    let currentTime = new Date(`2000-01-01T${businessHours.start}`);
    const endTime = new Date(`2000-01-01T${businessHours.end}`);

    while (currentTime < endTime) {
      const slotStart = currentTime.toTimeString().slice(0, 5);
      const slotEnd = new Date(currentTime.getTime() + serviceDuration * 60000).toTimeString().slice(0, 5);

      // Check if this slot conflicts with any existing appointments
      const isAvailable = !appointments.some(appointment => {
        const appointmentStart = appointment.startTime;
        const appointmentEnd = appointment.endTime;
        
        return (slotStart < appointmentEnd && slotEnd > appointmentStart);
      });

      if (isAvailable && slotEnd <= businessHours.end) {
        timeSlots.push({
          startTime: slotStart,
          endTime: slotEnd,
          available: true
        });
      }

      currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
    }

    res.json({
      date,
      service: {
        id: service.id,
        name: service.name,
        duration: service.duration
      },
      availableSlots: timeSlots
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

module.exports = router; 