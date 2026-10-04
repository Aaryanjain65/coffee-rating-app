# CoffeeRate

CoffeeRate is a web-based coffee discovery and rating application where users can explore different coffee varieties, search and filter coffee records, and rate their favorite coffees.

## Features

- User Registration and Login
- Login protection for the main application
- User profile with dynamic initials
- Coffee discovery section
- 60 coffee records
- Coffee bean images
- Star-based rating system
- Rating limited to 5 stars
- Search coffee by name
- Sort and filter coffee records
- Vote/rating functionality
- Responsive and modern user interface
- SQLite database for storing application data
- Express.js REST API
- Password hashing using bcryptjs

## Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- SQLite

### Authentication
- bcryptjs
- Local Storage based login session handling

### Development Tools
- Visual Studio Code
- Git
- GitHub

## Project Structure

```text
coffee-rating-app/
│
├── database/
│   ├── database.js
│   └── coffee.db
│
├── models/
│   └── Coffee.js
│
├── routes/
│   └── coffeeRoutes.js
│
├── public/
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   ├── auth.html
│   └── auth.js
│
├── coffee_rating_seed.json
├── server.js
├── package.json
├── package-lock.json
└── README.md
## Live Demo

[CoffeeRate Live Demo](https://coffee-rating-app-woqg.onrender.com)

## GitHub Repository

[CoffeeRate GitHub Repository](https://github.com/Aaryanjain65/coffee-rating-app)