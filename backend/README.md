# Cosmic Wisdom - Backend API

Node.js + Express + MongoDB backend for the Cosmic Wisdom astrology website.

## Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 📅 **Booking System** - Complete booking management with CRUD operations
- 💳 **Payment Verification** - GPay screenshot upload with admin approval
- ☁️ **Cloudinary Integration** - Secure image storage for payment screenshots
- 🎫 **Coupon System** - Discount codes with percentage and flat options
- 👤 **User Management** - Profile updates, password changes
- 🔒 **Role-based Access** - User, Astrologer, and Admin roles
- 📊 **Admin Dashboard** - Booking statistics and payment approval management

## Prerequisites

- Node.js v18+ 
- MongoDB (local or Atlas)
- Cloudinary account (free tier available)
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following in `.env`:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure random string for JWT signing
- `FRONTEND_URL` - Your frontend URL for CORS
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

### 3. Set up Cloudinary

1. Create a free account at [Cloudinary](https://cloudinary.com)
2. Go to your Dashboard to find your credentials
3. Add them to your `.env` file

### 4. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas:**
Update `MONGODB_URI` in `.env` with your Atlas connection string.

### 4. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/api/auth/verify` | Verify JWT token | Yes |
| PUT | `/api/auth/updatedetails` | Update user profile | Yes |
| PUT | `/api/auth/updatepassword` | Change password | Yes |

### Bookings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/bookings` | Create booking | Yes |
| GET | `/api/bookings` | Get user's bookings | Yes |
| GET | `/api/bookings/:id` | Get single booking | Yes |
| GET | `/api/bookings/ref/:bookingId` | Get by booking ID | Yes |
| PUT | `/api/bookings/:id/cancel` | Cancel booking | Yes |
| PUT | `/api/bookings/:id/reschedule` | Reschedule booking | Yes |
| PUT | `/api/bookings/:id/feedback` | Add feedback | Yes |
| POST | `/api/bookings/validate-coupon` | Validate coupon | Yes |
| GET | `/api/bookings/slots/:date` | Get available slots | No |

### Admin Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/bookings/admin/all` | Get all bookings | Admin |
| PUT | `/api/bookings/admin/:id/status` | Update booking status | Admin |

## Request/Response Examples

### Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+91 98765 43210",
  "password": "password123"
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Create Booking

```bash
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "serviceId": "birth-chart",
  "consultationMode": "video",
  "scheduledDate": "2024-01-15",
  "scheduledTime": "10:00 AM",
  "personalDetails": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+91 98765 43210",
    "dateOfBirth": "1990-05-15",
    "placeOfBirth": "Mumbai"
  },
  "couponCode": "FIRST10",
  "paymentMethod": "upi"
}
```

## Available Services

| ID | Name | Price | Duration |
|----|------|-------|----------|
| birth-chart | Birth Chart Analysis | ₹1,500 | 45 min |
| marriage-matching | Marriage Matching | ₹2,500 | 60 min |
| career-guidance | Career Guidance | ₹1,500 | 45 min |
| health-astrology | Health Astrology | ₹1,500 | 45 min |
| tarot-reading | Tarot Reading | ₹1,000 | 30 min |
| numerology | Numerology Report | ₹1,200 | 40 min |

## Coupon Codes (Demo)

| Code | Discount |
|------|----------|
| FIRST10 | 10% off |
| COSMIC20 | 20% off |
| FLAT100 | ₹100 off |
| WELCOME | 15% off |

## Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   ├── authController.js  # Authentication logic
│   └── bookingController.js # Booking logic
├── middleware/
│   ├── auth.js            # JWT verification
│   └── errorHandler.js    # Error handling
├── models/
│   ├── User.js            # User schema
│   └── Booking.js         # Booking schema
├── routes/
│   ├── auth.js            # Auth routes
│   └── bookings.js        # Booking routes
├── .env                   # Environment variables
├── .env.example           # Example env file
├── package.json           # Dependencies
├── server.js              # Entry point
└── README.md              # This file
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation with express-validator
- CORS configuration
- HTTP-only cookies option

## License

MIT
