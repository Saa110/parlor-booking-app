const express = require('express');
const { Service } = require('../models');
const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const { category, isActive } = req.query;
    const whereClause = {};
    
    if (category) whereClause.category = category;
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';

    const services = await Service.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });

    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// Create new service
router.post('/', async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      duration,
      price,
      category,
      imageUrl
    } = req.body;

    // Validate required fields
    if (!name || !slug || !duration || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if slug already exists
    const existingService = await Service.findOne({ where: { slug } });
    if (existingService) {
      return res.status(409).json({ error: 'Service with this slug already exists' });
    }

    const service = await Service.create({
      name,
      slug,
      description,
      duration,
      price,
      category,
      imageUrl,
      isActive: true
    });

    res.status(201).json({
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Update service
router.put('/:id', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const updateData = req.body;
    
    // If updating slug, check for conflicts
    if (updateData.slug && updateData.slug !== service.slug) {
      const existingService = await Service.findOne({ where: { slug: updateData.slug } });
      if (existingService) {
        return res.status(409).json({ error: 'Service with this slug already exists' });
      }
    }

    await service.update(updateData);

    res.json({
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Delete service
router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    await service.destroy();

    res.json({
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Get service categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Service.findAll({
      attributes: ['category'],
      where: {
        category: {
          [require('sequelize').Op.not]: null
        }
      },
      group: ['category']
    });

    const categoryList = categories.map(cat => cat.category).filter(Boolean);
    
    res.json(categoryList);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router; 