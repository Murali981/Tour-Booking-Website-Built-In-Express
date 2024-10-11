# Tours Booking application
A full-stack tour booking platform built with modern technologies: Node.js, Express, MongoDB, and Mongoose.

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [System Design](#system-design)
5. [API Endpoints](#api-endpoints)
6. [Models](#models)
7. [Installation](#installation)
8. [Usage](#usage)
9. [Environment Variables](#environment-variables)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Contributing](#contributing)
13. [License](#license)

## Overview
This application allows users to browse, book, and pay for exciting travel experiences. It features a robust backend API, user authentication, payment integration with Stripe, and more.

## Features
- User authentication and authorization
- Tour browsing and searching
- Booking system with Stripe payment integration
- User reviews and ratings
- Admin panel for tour management
- Responsive design for mobile and desktop

## Tech Stack
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose ODM
- Authentication: JSON Web Tokens (JWT)
- Payment Processing: Stripe
- Frontend Templating: Pug (if applicable)
- Mapping: Mapbox integration

## System Design

## API Endpoints
- GET /api/v1/tours - List all tours
- POST /api/v1/tours - Create a new tour (Admin only)
- GET /api/v1/tours/:id - Get a specific tour
- PATCH /api/v1/tours/:id - Update a tour (Admin only)
- DELETE /api/v1/tours/:id - Delete a tour (Admin only)
- POST /api/v1/bookings/checkout-session/:tourId - Create a Stripe checkout session
- [Add more endpoints as needed]

## Models
1. User Model
   - Fields: name, email, password, role, etc.
2. Tour Model
   - Fields: name, duration, maxGroupSize, difficulty, price, description, imageCover, images, startDates, etc.
3. Booking Model
   - Fields: tour, user, price, paid, etc.
4. Review Model
   - Fields: review, rating, tour, user, etc.

## Installation
git clone https://github.com/yourusername/tours-booking-app.git
cd tours-booking-app
npm install

## Running the application
 npm run

 ## Environment Variables
Create a .env file in the root directory and add:
NODE_ENV=development
PORT=3000
DATABASE=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
STRIPE_SECRET_KEY=your_stripe_secret_key

## Deployment
This application is deployed on Heroku. 
