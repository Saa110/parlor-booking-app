// Parlor Booking Application JavaScript

// Global variables
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
let currentUser = null;

// DOM elements
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const bookingForm = document.getElementById('booking-form');
const successModal = document.getElementById('success-modal');
const appointmentsList = document.getElementById('appointments-list');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setMinDate();
});

// Initialize application
function initializeApp() {
    console.log('Parlor Booking App initialized');
    
    // Add service card hover effects
    const serviceCards = document.querySelectorAll('.bg-white.rounded-lg.shadow-lg');
    serviceCards.forEach(card => {
        card.classList.add('service-card');
    });
    
    // Add form input classes
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.classList.add('form-input');
    });
    
    // Add button classes
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (button.classList.contains('bg-pink-500')) {
            button.classList.add('btn-primary');
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Booking form submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmission);
    }
    
    // Service selection
    const serviceSelect = document.getElementById('service-select');
    if (serviceSelect) {
        serviceSelect.addEventListener('change', handleServiceSelection);
    }
    
    // Date selection
    const appointmentDate = document.getElementById('appointment-date');
    if (appointmentDate) {
        appointmentDate.addEventListener('change', handleDateSelection);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === successModal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && !successModal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

// Mobile menu functionality
function toggleMobileMenu() {
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('show');
}

// Set minimum date to today
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('appointment-date');
    if (dateInput) {
        dateInput.min = today;
    }
}

// Handle service selection
function handleServiceSelection(event) {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    const duration = selectedOption.getAttribute('data-duration');
    
    if (price && duration) {
        showToast(`Selected service: ${selectedOption.text} (${duration} mins)`, 'info');
    }
}

// Handle date selection
function handleDateSelection(event) {
    const selectedDate = new Date(event.target.value);
    const today = new Date();
    
    // Check if date is in the past
    if (selectedDate < today) {
        showToast('Please select a future date', 'error');
        event.target.value = '';
        return;
    }
    
    // Check if it's Sunday (assuming Sunday is closed)
    if (selectedDate.getDay() === 0) {
        showToast('We are closed on Sundays. Please select another day.', 'error');
        event.target.value = '';
        return;
    }
    
    updateAvailableTimeSlots(selectedDate);
}

// Update available time slots based on selected date
function updateAvailableTimeSlots(selectedDate) {
    const timeSelect = document.getElementById('appointment-time');
    const dayOfWeek = selectedDate.getDay();
    
    // Clear existing options
    timeSelect.innerHTML = '<option value="">Select time...</option>';
    
    // Define business hours
    let startHour = 9;
    let endHour = 17;
    
    // Adjust hours for weekends
    if (dayOfWeek === 6) { // Saturday
        endHour = 18;
    }
    
    // Generate time slots
    for (let hour = startHour; hour <= endHour; hour++) {
        const timeString = hour.toString().padStart(2, '0') + ':00';
        const displayTime = hour <= 12 ? `${hour}:00 ${hour === 12 ? 'PM' : 'AM'}` : `${hour - 12}:00 PM`;
        
        const option = document.createElement('option');
        option.value = timeString;
        option.textContent = displayTime;
        
        // Check if slot is available
        if (isTimeSlotAvailable(selectedDate, timeString)) {
            timeSelect.appendChild(option);
        }
    }
}

// Check if time slot is available
function isTimeSlotAvailable(date, time) {
    const dateTimeString = `${date}T${time}`;
    const existingAppointments = appointments.filter(apt => 
        apt.date === date && apt.time === time
    );
    
    return existingAppointments.length === 0;
}

// Handle booking form submission
async function handleBookingSubmission(event) {
    event.preventDefault();
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Booking...';
    submitButton.disabled = true;
    
    try {
        // Get form data
        const formData = new FormData(event.target);
        const bookingData = {
            id: generateBookingId(),
            service: formData.get('service-select') || document.getElementById('service-select').value,
            date: formData.get('appointment-date') || document.getElementById('appointment-date').value,
            time: formData.get('appointment-time') || document.getElementById('appointment-time').value,
            customerName: formData.get('customer-name') || document.getElementById('customer-name').value,
            customerPhone: formData.get('customer-phone') || document.getElementById('customer-phone').value,
            customerEmail: formData.get('customer-email') || document.getElementById('customer-email').value,
            specialRequests: formData.get('special-requests') || document.getElementById('special-requests').value,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };
        
        // Validate form data
        if (!validateBookingData(bookingData)) {
            throw new Error('Please fill in all required fields');
        }
        
        // Check for conflicts
        if (hasBookingConflict(bookingData)) {
            throw new Error('This time slot is already booked. Please select another time.');
        }
        
        // Save appointment
        appointments.push(bookingData);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        // Integrate with Google Calendar (simulated)
        await integrateWithGoogleCalendar(bookingData);
        
        // Show success message
        showSuccessModal();
        
        // Reset form
        event.target.reset();
        
        // Update appointments list if on appointments page
        if (window.location.hash === '#appointments') {
            searchAppointments();
        }
        
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Validate booking data
function validateBookingData(data) {
    const requiredFields = ['service', 'date', 'time', 'customerName', 'customerPhone', 'customerEmail'];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            return false;
        }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.customerEmail)) {
        return false;
    }
    
    // Validate phone format
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(data.customerPhone.replace(/\s/g, ''))) {
        return false;
    }
    
    return true;
}

// Check for booking conflicts
function hasBookingConflict(newBooking) {
    return appointments.some(apt => 
        apt.date === newBooking.date && 
        apt.time === newBooking.time &&
        apt.status !== 'cancelled'
    );
}

// Generate unique booking ID
function generateBookingId() {
    return 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// Integrate with Google Calendar (simulated)
async function integrateWithGoogleCalendar(bookingData) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would make an API call to Google Calendar
    console.log('Integrating with Google Calendar:', bookingData);
    
    // Simulate success
    return true;
}

// Search appointments by email
function searchAppointments() {
    const email = document.getElementById('search-email').value.trim();
    
    if (!email) {
        showToast('Please enter an email address', 'error');
        return;
    }
    
    const userAppointments = appointments.filter(apt => 
        apt.customerEmail.toLowerCase() === email.toLowerCase()
    );
    
    displayAppointments(userAppointments);
}

// Display appointments
function displayAppointments(appointmentsToShow) {
    const container = document.getElementById('appointments-list');
    
    if (!container) return;
    
    if (appointmentsToShow.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-calendar-times text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-600">No appointments found for this email address.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appointmentsToShow.map(apt => `
        <div class="appointment-card bg-white rounded-lg shadow-lg p-6 mb-4">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-semibold text-gray-800">${getServiceDisplayName(apt.service)}</h3>
                    <p class="text-gray-600">${formatDate(apt.date)} at ${formatTime(apt.time)}</p>
                </div>
                <span class="status-${apt.status} px-3 py-1 rounded-full text-sm font-semibold">
                    ${apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                </span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <p class="text-sm text-gray-500">Customer</p>
                    <p class="font-semibold">${apt.customerName}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Contact</p>
                    <p class="font-semibold">${apt.customerPhone}</p>
                </div>
            </div>
            ${apt.specialRequests ? `
                <div class="mb-4">
                    <p class="text-sm text-gray-500">Special Requests</p>
                    <p class="text-gray-700">${apt.specialRequests}</p>
                </div>
            ` : ''}
            <div class="flex justify-between items-center">
                <p class="text-sm text-gray-500">Booking ID: ${apt.id}</p>
                <div class="space-x-2">
                    <button onclick="rescheduleAppointment('${apt.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                        Reschedule
                    </button>
                    <button onclick="cancelAppointment('${apt.id}')" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Get service display name
function getServiceDisplayName(serviceKey) {
    const serviceMap = {
        'hair-styling': 'Hair Styling',
        'makeup': 'Makeup',
        'facial': 'Facial Treatment',
        'manicure-pedicure': 'Manicure & Pedicure',
        'waxing': 'Waxing',
        'bridal-package': 'Bridal Package'
    };
    return serviceMap[serviceKey] || serviceKey;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format time for display
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Reschedule appointment
function rescheduleAppointment(bookingId) {
    const appointment = appointments.find(apt => apt.id === bookingId);
    if (!appointment) {
        showToast('Appointment not found', 'error');
        return;
    }
    
    // In a real implementation, this would open a rescheduling modal
    showToast('Rescheduling feature will be implemented soon', 'info');
}

// Cancel appointment
function cancelAppointment(bookingId) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        const appointmentIndex = appointments.findIndex(apt => apt.id === bookingId);
        if (appointmentIndex !== -1) {
            appointments[appointmentIndex].status = 'cancelled';
            localStorage.setItem('appointments', JSON.stringify(appointments));
            showToast('Appointment cancelled successfully', 'success');
            
            // Refresh appointments list
            searchAppointments();
        }
    }
}

// Show success modal
function showSuccessModal() {
    successModal.classList.remove('hidden');
    successModal.classList.add('flex');
}

// Close modal
function closeModal() {
    successModal.classList.add('hidden');
    successModal.classList.remove('flex');
}

// Show toast notification
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Export functions for global access
window.searchAppointments = searchAppointments;
window.rescheduleAppointment = rescheduleAppointment;
window.cancelAppointment = cancelAppointment;
window.closeModal = closeModal;
window.scrollToSection = scrollToSection; 