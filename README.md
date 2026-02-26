# Society Management Platform

A comprehensive full-stack web application for managing Indian residential societies. Built with React, Node.js/Express, and MongoDB.

## Features

1. **Resident Management** – Digital resident directory, move-in/out tracking, tenant vs owner identification, emergency contacts, vehicle registration
2. **Financial Management** – Automated maintenance bill generation, online/offline payments (Razorpay), GST invoices, receipt generation, pending dues alerts
3. **Facility Booking** – Clubhouse, gym, party hall reservations, calendar-based slot management, booking charges, approval workflow
4. **Visitor Management** – Pre-approval system, visitor check-in/out, delivery tracking, visitor logs
5. **Communication Hub** – Announcements, emergency broadcasts, polls/surveys, event notifications
6. **Complaint & Request Management** – Ticket-based system, category routing, priority levels, status tracking, vendor assignment, comments
7. **Security Management** – Guard attendance tracking, patrol logs, incident reporting, gate entry/exit logs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, React Router v6, Lucide Icons |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Real-time | Socket.io |
| Payments | Razorpay |
| Auth | JWT (JSON Web Tokens) |

## Project Structure

```
Society-Management-Platform/
├── backend/                   # Node.js/Express API server
│   ├── middleware/auth.js     # JWT authentication middleware
│   ├── models/                # Mongoose data models
│   │   ├── User.js            # User accounts & roles
│   │   ├── Resident.js        # Resident profiles with family members
│   │   ├── Unit.js            # Apartment/flat units
│   │   ├── Vehicle.js         # Resident vehicles
│   │   ├── Bill.js            # Maintenance bills with GST
│   │   ├── Payment.js         # Payment records (Razorpay + manual)
│   │   ├── FacilityBooking.js # Facility reservations
│   │   ├── Visitor.js         # Visitor management
│   │   ├── Complaint.js       # Support tickets
│   │   ├── Announcement.js    # Notices, events, polls
│   │   └── SecurityLog.js     # Gate logs & incidents
│   ├── routes/                # REST API route handlers
│   └── server.js              # Express app with Socket.io
└── frontend/                  # React web app
    └── src/
        ├── context/AuthContext.js   # Authentication state
        ├── services/api.js          # Axios API client
        ├── components/
        │   ├── layout/Layout.js     # Sidebar navigation
        │   └── common/index.js      # Reusable UI components
        └── pages/
            ├── Login.js, Register.js, Dashboard.js
            ├── Residents.js, Financial.js, Facilities.js
            ├── Visitors.js, Communication.js, Complaints.js
            ├── Security.js, Vehicles.js
```

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Razorpay keys
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Environment Variables

**backend/.env**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/society_management
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

**frontend/.env** (optional)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## API Endpoints

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Residents | `GET/POST /api/residents`, `PUT /api/residents/:id`, `PUT /api/residents/:id/moveout` |
| Units | `GET/POST /api/units`, `PUT /api/units/:id` |
| Bills | `GET/POST /api/bills`, `POST /api/bills/generate`, `GET /api/bills/pending/dues` |
| Payments | `POST /api/payments/create-order`, `POST /api/payments/verify`, `POST /api/payments/cash` |
| Facilities | `GET/POST /api/facilities`, `PUT /api/facilities/:id/cancel`, `PUT /api/facilities/:id/checkin` |
| Visitors | `GET/POST /api/visitors`, `PUT /api/visitors/:id/checkin`, `PUT /api/visitors/:id/checkout` |
| Complaints | `GET/POST /api/complaints`, `PUT /api/complaints/:id/status`, `POST /api/complaints/:id/comments` |
| Announcements | `GET/POST /api/announcements`, `POST /api/announcements/:id/vote` |
| Security | `GET/POST /api/security`, `PUT /api/security/:id` |
| Vehicles | `GET/POST /api/vehicles`, `DELETE /api/vehicles/:id` |
| Dashboard | `GET /api/dashboard/stats` |

## User Roles

| Role | Permissions |
|------|------------|
| `admin` | Full access to all modules |
| `manager` | Can manage residents, bills, complaints, facilities |
| `resident` | Can view own data, submit complaints, book facilities, pre-approve visitors |
| `security` | Can manage visitor check-in/out, add security logs |
| `staff` | Can update complaint statuses |
