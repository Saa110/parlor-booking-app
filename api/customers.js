const express = require('express');
const { Op } = require('sequelize');
const { Customer, Appointment } = require('../models');
const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const customers = await Customer.findAndCountAll({
      where: whereClause,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      customers: customers.rows,
      total: customers.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(customers.count / limit)
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [
        {
          model: Appointment,
          as: 'appointments',
          attributes: ['id', 'appointmentDate', 'startTime', 'status', 'totalPrice'],
          order: [['appointmentDate', 'DESC']],
          limit: 10
        }
      ]
    });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      preferences
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ where: { email } });
    if (existingCustomer) {
      return res.status(409).json({ error: 'Customer with this email already exists' });
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      address,
      preferences: preferences || {},
      isActive: true
    });

    res.status(201).json({
      message: 'Customer created successfully',
      customer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const updateData = req.body;
    
    // If updating email, check for conflicts
    if (updateData.email && updateData.email !== customer.email) {
      const existingCustomer = await Customer.findOne({ where: { email: updateData.email } });
      if (existingCustomer) {
        return res.status(409).json({ error: 'Customer with this email already exists' });
      }
    }

    await customer.update(updateData);

    res.json({
      message: 'Customer updated successfully',
      customer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if customer has active appointments
    const activeAppointments = await Appointment.count({
      where: {
        customerId: customer.id,
        status: {
          [Op.in]: ['pending', 'confirmed']
        }
      }
    });

    if (activeAppointments > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete customer with active appointments',
        activeAppointments 
      });
    }

    // Soft delete by setting isActive to false
    await customer.update({ isActive: false });

    res.json({
      message: 'Customer deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating customer:', error);
    res.status(500).json({ error: 'Failed to deactivate customer' });
  }
});

// Get customer appointments
router.get('/:id/appointments', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = { customerId: req.params.id };
    if (status) whereClause.status = status;

    const appointments = await Appointment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: require('../models/Service'),
          as: 'service',
          attributes: ['id', 'name', 'duration', 'price']
        }
      ],
      order: [['appointmentDate', 'DESC'], ['startTime', 'ASC']],
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
    console.error('Error fetching customer appointments:', error);
    res.status(500).json({ error: 'Failed to fetch customer appointments' });
  }
});

// Search customers
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    const customers = await Customer.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
          { phone: { [Op.iLike]: `%${query}%` } }
        ],
        isActive: true
      },
      order: [['name', 'ASC']],
      limit: parseInt(limit)
    });

    res.json(customers);
  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({ error: 'Failed to search customers' });
  }
});

module.exports = router; 