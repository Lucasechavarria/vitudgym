# VIRTUD GYM - Functional Documentation

This document outlines the core functionalities of the VIRTUD GYM application.

## 1. User Management & Authentication

- **User Roles:** The system supports four distinct user roles:
    - `member`: A gym member who can book classes and manage their profile.
    - `coach`: A trainer who can manage their classes and assigned members.
    - `admin`: A staff member with broad permissions to manage the gym's operations.
    - `superadmin`: The highest-level administrator with full system access.
- **Authentication:** Users can sign up, log in, and reset their passwords. Authentication is handled by Supabase Auth.
- **Profile Management:** Each user has a profile that extends the standard authentication record. Profiles store personal information, membership details, and medical history. Users can view and update their own profiles.

## 2. Class & Activity Management

- **Activities:** The system allows for the creation and management of different types of activities, such as "Funcional", "Fuerza", "BJJ", and "Yoga". Each activity has a name, description, type, category, and other relevant details.
- **Class Scheduling:** Classes are scheduled instances of an activity. Each class has a designated coach, a day of the week, start and end times, and a maximum capacity.
- **Admin & Coach Controls:** Administrators and coaches can create, update, and manage classes. Coaches can only manage their own classes, while administrators have full control.

## 3. Booking & Attendance

- **Class Booking:** Members can view the class schedule and book their spot in a class.
- **Waitlist System:** If a class is full, members can join a waitlist. If a spot becomes available, the first person on the waitlist is automatically promoted to "confirmed".
- **Attendance Tracking:** The system tracks member attendance. Coaches or admins can check in members for a class.
- **Booking Statuses:** Bookings can have the following statuses: `confirmed`, `cancelled`, `waitlist`, `attended`, `no_show`.

## 4. Membership & Payments

- **Membership Status:** Member profiles include a membership status (`active`, `inactive`, `suspended`, `expired`) and membership start/end dates.
- **Payment Tracking:** The system records payments made by users. Payments can be for memberships or other concepts.
- **Payment Methods:** The system supports various payment methods, including cash, card, transfer, and MercadoPago.
- **Admin Controls:** Administrators can manage all payments, including approving manual payments.

## 5. Workout Routines & Exercises

- **Personalized Routines:** Coaches can create personalized workout routines for members. Each routine has a name, description, goal, and duration.
- **Exercise Library:** Routines are composed of exercises. Each exercise includes details like name, description, muscle group, sets, reps, and a video URL.
- **AI-Generated Routines:** The system has a feature for generating routines using AI. It stores the AI prompt used for generation.

## 6. Dashboards & User Interface

- **Student Dashboard:** This is the main view for members. It displays:
    - Key stats (weight, body fat, muscle mass, attendance).
    - Charts showing progress over time.
    - A preview of the current workout routine.
    - Gamification elements and achievements.
    - Membership status and expiration warnings.
- **Role-Based Views:** The application provides different views and functionalities based on the user's role (admin, coach, member).
- **Admin Dashboard:** Provides tools for managing users, classes, payments, and other administrative tasks.
- **Coach Dashboard:** Allows coaches to view their schedule, manage their classes, and interact with their assigned members.

## 7. Technical Features

- **Database:** The application uses a PostgreSQL database managed by Supabase.
- **Row Level Security (RLS):** RLS is implemented to ensure that users can only access the data they are authorized to see.
- **Database Views:** The database uses views (`classes_with_availability`, `user_bookings_detailed`, `active_memberships`) to simplify common queries.
- **Database Triggers & Functions:** The database uses triggers and functions to automate tasks like creating a user profile on signup and updating class capacity when a booking is made.
- **Error Tracking:** The application is integrated with Sentry for error monitoring.
- **Email Notifications:** The application uses Resend to send emails.
- **Progressive Web App (PWA):** The project is configured to be a PWA, allowing it to be "installed" on user devices.
