# Parlor Booking Web Application

A modern, responsive web application for beauty parlor appointment booking with Google Calendar integration.

## 🎯 Features

### Core Functionality
- **Service Display**: Browse available beauty services with pricing and duration
- **Appointment Booking**: Easy-to-use booking form with date/time selection
- **Appointment Management**: View, reschedule, and cancel appointments
- **Google Calendar Integration**: Automatic sync with Google Calendar (simulated)
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

### Services Offered
- Hair Styling ($45 - $120)
- Makeup ($60 - $150)
- Facial Treatment ($35 - $80)
- Manicure & Pedicure ($25 - $60)
- Waxing ($20 - $50)
- Bridal Package ($200 - $350)

### Technical Features
- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Form Validation**: Real-time validation for all input fields
- **Local Storage**: Appointments stored locally in browser
- **Conflict Detection**: Prevents double-booking of time slots
- **Business Hours**: Automatic time slot generation based on business hours
- **Mobile-First**: Responsive design optimized for all devices

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server setup required - runs entirely in the browser

### Installation
1. Clone or download the project files
2. Open `index.html` in your web browser
3. Start booking appointments!

### File Structure
```
parlor-booking-app/
├── index.html          # Main application file
├── styles.css          # Custom CSS styles
├── script.js           # JavaScript functionality
└── README.md           # This documentation
```

## 📱 Usage Guide

### Booking an Appointment
1. **Navigate to Services**: Browse available services and their details
2. **Click "Book Now"**: Scroll to the booking section
3. **Select Service**: Choose from the dropdown menu
4. **Pick Date & Time**: Select your preferred appointment slot
5. **Fill Contact Details**: Enter your name, phone, and email
6. **Add Special Requests**: Optional notes for your appointment
7. **Submit Booking**: Click "Book Appointment" to confirm

### Managing Appointments
1. **Find Your Appointments**: Go to "My Appointments" section
2. **Search by Email**: Enter your email address to find bookings
3. **View Details**: See appointment details, status, and booking ID
4. **Reschedule/Cancel**: Use the action buttons to modify bookings

### Business Hours
- **Monday - Friday**: 9:00 AM - 7:00 PM
- **Saturday**: 9:00 AM - 6:00 PM
- **Sunday**: 10:00 AM - 4:00 PM

## 🛠️ Technical Implementation

### Frontend Technologies
- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with TailwindCSS
- **JavaScript (ES6+)**: Interactive functionality
- **Local Storage**: Client-side data persistence

### Key Features Implementation

#### Form Validation
```javascript
// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(data.customerEmail)) {
    return false;
}
```

#### Conflict Detection
```javascript
// Check for booking conflicts
function hasBookingConflict(newBooking) {
    return appointments.some(apt => 
        apt.date === newBooking.date && 
        apt.time === newBooking.time &&
        apt.status !== 'cancelled'
    );
}
```

#### Google Calendar Integration (Simulated)
```javascript
// Simulate Google Calendar API call
async function integrateWithGoogleCalendar(bookingData) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Integrating with Google Calendar:', bookingData);
    return true;
}
```

## 🎨 Design Features

### Color Scheme
- **Primary**: Pink (#ec4899) - Represents beauty and elegance
- **Secondary**: Purple (#8b5cf6) - Complementary accent color
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Headings**: Bold, modern sans-serif fonts
- **Body Text**: Clean, readable typography
- **Icons**: Font Awesome for consistent iconography

### Responsive Design
- **Mobile**: Single-column layout with touch-friendly buttons
- **Tablet**: Two-column grid for services
- **Desktop**: Full three-column layout with hover effects

## 🔧 Customization

### Adding New Services
1. Edit the services section in `index.html`
2. Add new service options to the booking form
3. Update the service mapping in `script.js`

### Modifying Business Hours
```javascript
// Update in script.js
let startHour = 9;
let endHour = 17;
if (dayOfWeek === 6) { // Saturday
    endHour = 18;
}
```

### Styling Changes
- Modify `styles.css` for custom styling
- Update TailwindCSS classes in `index.html`
- Customize color scheme in CSS variables

## 📊 Data Management

### Local Storage Structure
```javascript
// Appointment object structure
{
    id: "BK1234567890ABC",
    service: "hair-styling",
    date: "2024-01-15",
    time: "14:00",
    customerName: "John Doe",
    customerPhone: "1234567890",
    customerEmail: "john@example.com",
    specialRequests: "Hair coloring",
    status: "confirmed",
    createdAt: "2024-01-10T10:30:00.000Z"
}
```

### Data Persistence
- All appointments stored in browser's localStorage
- Data persists between browser sessions
- No server required for basic functionality

## 🔒 Security Considerations

### Client-Side Security
- Form validation prevents invalid data
- XSS protection through proper HTML escaping
- Input sanitization for user data

### Privacy
- All data stored locally in user's browser
- No external data transmission
- User controls their own appointment data

## 🚀 Deployment

### Static Hosting
This application can be deployed to any static hosting service:

1. **GitHub Pages**: Upload files to a GitHub repository
2. **Netlify**: Drag and drop the folder to Netlify
3. **Vercel**: Connect your repository for automatic deployment
4. **Firebase Hosting**: Use Firebase for hosting

### Production Considerations
- Enable HTTPS for security
- Set up proper caching headers
- Consider CDN for faster loading
- Implement analytics tracking

## 🔮 Future Enhancements

### Planned Features
- **Real Google Calendar Integration**: Actual API implementation
- **Email Notifications**: Confirmation and reminder emails
- **Admin Panel**: Staff management interface
- **Payment Integration**: Online payment processing
- **SMS Notifications**: Text message reminders
- **Multi-location Support**: Multiple parlor locations

### Technical Improvements
- **Backend API**: Node.js/Express server
- **Database**: MongoDB or PostgreSQL
- **Authentication**: User accounts and login
- **Real-time Updates**: WebSocket integration
- **PWA Support**: Progressive Web App features

## 📞 Support

### Contact Information
- **Email**: info@parlorbeauty.com
- **Phone**: (555) 123-4567
- **Address**: 123 Beauty St, City, State

### Business Hours
- **Monday - Friday**: 9:00 AM - 7:00 PM
- **Saturday**: 9:00 AM - 6:00 PM
- **Sunday**: 10:00 AM - 4:00 PM

## 📄 License

This project is developed for educational and commercial use. All rights reserved.

---

**Built with ❤️ for the beauty industry** 