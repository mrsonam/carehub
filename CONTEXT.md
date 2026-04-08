🏥 Project Name

CareHub – Healthcare Appointment and Management System

1. Project Overview

CareHub is a web-based healthcare appointment system designed for small to medium-sized clinics. The goal is to replace manual appointment handling (phone calls, paper records, spreadsheets) with a centralised digital platform.

The system focuses on improving scheduling efficiency, reducing administrative workload, and enhancing patient experience through a simple and reliable interface.

This project is being developed as a Minimum Viable Product (MVP) within a 12-week academic timeframe.

2. Client Context

The client is a small healthcare clinic with:

3–5 doctors
1–2 administrative staff (not system users)
~30–60 appointments per day
Current System (As-Is)
Phone-based appointment booking
Paper or spreadsheet tracking
No real-time updates
No online booking
Problems
Double bookings
Missed appointments
High administrative workload
No centralised data
Poor patient experience

3. Target Users (Roles)

The system supports 3 user roles only:

👤 Patient

Patients are external users who manage their appointments.

Capabilities:

Register and log in
View available doctors and time slots
Book appointments
Reschedule or cancel appointments
View appointment history

👨‍⚕️ Doctor

Doctors manage their schedules and appointments.

Capabilities:

View daily and weekly appointments
Set availability (time slots)
View patient details (basic)
Update appointment status

🛠 Admin

Admin manages the system.

Capabilities:

Manage users (patients and doctors)
View all appointments
Monitor system activity
Manage doctor schedules

4. Core System Features

The system must include the following core modules:

Authentication
Secure login and registration
Role-based access control
Appointment Management
Book appointments
Reschedule appointments
Cancel appointments
Prevent double booking
Schedule Management
Doctors define availability
Time slots must be structured and validated
Dashboard System
Role-based dashboards:
Patient dashboard
Doctor dashboard
Admin dashboard
Data Management
Store user data (patients, doctors)
Store appointment data
Maintain relationships between users and appointments

5. Key Constraints
Must be completed within 12 weeks
Must use free-tier tools where possible
Must NOT use real patient data
Must remain simple and usable
Must be web-based only (no mobile app)

6. Out of Scope

The following features must NOT be implemented:

Payment integration
Telehealth/video consultation
Full medical records system (EMR)
Prescription system
External healthcare integrations (e.g., Medicare)
AI chatbot features

7. Technical Stack

Use the following technologies:

Frontend
Next.js (App Router preferred)
React
Tailwind CSS
Framer Motion

Backend / Database
Supabase:
Authentication
PostgreSQL database
Row Level Security (RLS)
Deployment
Vercel
Version Control
GitHub

8. Business Rules
A time slot cannot be double booked
Only patients can create appointments
Doctors can only manage their own schedules
Admin has full system visibility
Role-based access must be enforced at all levels

9. UX Expectations
Simple and clean UI
Minimal steps for booking (max 3–5 steps)
Responsive design (mobile + desktop)
Clear feedback for actions (loading, success, errors)
No confusing workflows

10. Performance Expectations
Fast page load times
Immediate UI response for user actions
Use optimistic UI where possible
Avoid blocking UI during operations

11. Security & Privacy
Role-based access control (RLS in Supabase)
No sensitive real-world patient data
Secure authentication
Protect routes based on user role

12. Development Approach

Follow an Agile-inspired approach:

Build MVP first
Develop features incrementally
Test continuously
Prioritise core functionality over extra features

13. Success Criteria

The system is successful if:

Patients can book appointments (easily)
No double bookings occur
Doctors can manage schedules clearly
Admin can monitor the system
The system is stable and usable