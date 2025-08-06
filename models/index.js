const { sequelize } = require('../config/database');
const Customer = require('./Customer');
const Service = require('./Service');
const Appointment = require('./Appointment');

// Define associations
Customer.hasMany(Appointment, {
  foreignKey: 'customerId',
  sourceKey: 'id',
  as: 'appointments'
});

Appointment.belongsTo(Customer, {
  foreignKey: 'customerId',
  targetKey: 'id',
  as: 'customer'
});

Service.hasMany(Appointment, {
  foreignKey: 'serviceId',
  sourceKey: 'id',
  as: 'appointments'
});

Appointment.belongsTo(Service, {
  foreignKey: 'serviceId',
  targetKey: 'id',
  as: 'service'
});

// Database initialization function
const initializeDatabase = async () => {
  try {
    // Sync all models with database (without altering existing tables)
    await sequelize.sync({ force: false });
    console.log('✅ Database models synchronized successfully.');
    
    // Check if we need to seed initial data
    const serviceCount = await Service.count();
    if (serviceCount === 0) {
      await seedInitialData();
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Seed initial data
const seedInitialData = async () => {
  try {
    const services = [
      {
        name: 'Hair Styling',
        slug: 'hair-styling',
        description: 'Professional hair styling and cutting services',
        duration: 90,
        price: 75.00,
        category: 'hair',
        isActive: true
      },
      {
        name: 'Makeup Application',
        slug: 'makeup',
        description: 'Professional makeup application for all occasions',
        duration: 120,
        price: 95.00,
        category: 'makeup',
        isActive: true
      },
      {
        name: 'Facial Treatment',
        slug: 'facial',
        description: 'Rejuvenating facial treatments for healthy skin',
        duration: 60,
        price: 65.00,
        category: 'skincare',
        isActive: true
      },
      {
        name: 'Manicure & Pedicure',
        slug: 'manicure-pedicure',
        description: 'Complete nail care and grooming services',
        duration: 90,
        price: 55.00,
        category: 'nails',
        isActive: true
      },
      {
        name: 'Waxing Services',
        slug: 'waxing',
        description: 'Professional waxing for smooth skin',
        duration: 45,
        price: 35.00,
        category: 'hair-removal',
        isActive: true
      },
      {
        name: 'Bridal Package',
        slug: 'bridal-package',
        description: 'Complete bridal package including hair, makeup, and styling',
        duration: 240,
        price: 250.00,
        category: 'bridal',
        isActive: true
      }
    ];

    await Service.bulkCreate(services);
    console.log('✅ Initial services seeded successfully.');
  } catch (error) {
    console.error('❌ Failed to seed initial data:', error);
  }
};

module.exports = {
  sequelize,
  Customer,
  Service,
  Appointment,
  initializeDatabase
}; 